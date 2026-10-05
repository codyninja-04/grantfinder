import type { SupabaseClient } from '@supabase/supabase-js';
import { matchGrants } from './claude/grant-matcher';
import { blockersFrom, eligibilityChecklist, ruleReasoning, ruleScore } from './eligibility';
import type { BusinessProfile, Grant, GrantMatch } from './types';

type MatchRow = Omit<GrantMatch, 'matched_at'> & { matched_at: string };

/**
 * Runs the rules engine over every grant, optionally asks Claude to score fit,
 * and writes the merged result. Our rules always have the final say on hard
 * blockers, Claude only adds judgement on top.
 */
export async function runMatching(
  supabase: SupabaseClient,
  profile: BusinessProfile,
  grants: Grant[],
  useAI: boolean
): Promise<{ rows: MatchRow[]; source: 'ai' | 'rules'; aiError?: string }> {
  const now = new Date().toISOString();

  const evaluated = grants.map((grant) => {
    const items = eligibilityChecklist(grant, profile);
    const blockers = blockersFrom(items);
    return { grant, items, blockers };
  });

  const rows: MatchRow[] = evaluated.map(({ grant, items, blockers }) => ({
    user_id: profile.user_id,
    grant_id: grant.id,
    matched_at: now,
    match_score: ruleScore(grant, profile, items),
    likely_eligible: blockers.length === 0,
    reasoning: ruleReasoning(grant, profile, items),
    blockers,
    source: 'rules',
  }));

  let source: 'ai' | 'rules' = 'rules';
  let aiError: string | undefined;

  if (useAI && process.env.ANTHROPIC_API_KEY) {
    try {
      const aiMatches = await matchGrants(
        {
          industry: profile.industry,
          business_stage: profile.business_stage,
          employee_count: profile.employee_count,
          years_operating: profile.years_operating,
          annual_revenue_range: profile.annual_revenue_range,
          planned_initiatives: profile.planned_initiatives ?? [],
          is_local_shareholding_30_percent: profile.is_local_shareholding_30_percent,
          project_notes: profile.project_notes,
        },
        evaluated.map(({ grant, blockers }) => ({
          id: grant.id,
          name: grant.name,
          provider: grant.provider,
          description: grant.description,
          eligible_business_stages: grant.eligible_business_stages,
          eligible_industries: grant.eligible_industries,
          eligible_initiatives: grant.eligible_initiatives,
          min_local_shareholding_percent: grant.min_local_shareholding_percent,
          application_complexity: grant.application_complexity,
          hard_blockers: blockers,
        }))
      );

      const byId = new Map(aiMatches.map((m) => [m.grant_id, m]));
      for (const row of rows) {
        const ai = byId.get(row.grant_id);
        if (!ai) continue;
        const blocked = row.blockers.length > 0;
        row.match_score = blocked ? Math.min(Math.round(ai.match_score), 20) : Math.round(ai.match_score);
        row.likely_eligible = !blocked && ai.likely_eligible;
        row.reasoning = ai.reasoning;
        row.source = 'ai';
      }
      source = 'ai';
    } catch (err) {
      aiError = err instanceof Error ? err.message : 'AI matching failed';
      console.error('AI matching failed, falling back to rules', aiError);
    }
  }

  rows.sort((a, b) => b.match_score - a.match_score);

  const { error } = await supabase.from('grant_matches').upsert(rows, { onConflict: 'user_id,grant_id' });
  if (error) throw new Error(error.message);

  await supabase.from('business_profiles').update({ matched_at: now }).eq('user_id', profile.user_id);

  return { rows, source, aiError };
}
