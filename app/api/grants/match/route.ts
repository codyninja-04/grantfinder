import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/http';
import { runMatching } from '@/lib/matching';
import { createClient } from '@/lib/supabase/server';
import type { BusinessProfile, Grant } from '@/lib/types';
import { LIMITS, getTier, recordUsage, usedThisMonth } from '@/lib/usage';

export const maxDuration = 60;

/**
 * Re-scores every grant for the signed in business. Rules always run. Claude
 * runs on top while the user has AI refreshes left this month, otherwise the
 * rules result is saved on its own and we say so.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const [{ data: profile }, { data: grants }, tier] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('grants').select('*'),
    getTier(supabase, user.id),
  ]);

  if (!profile) return jsonError('Fill in your business profile first', 400);
  if (!grants?.length) return jsonError('The grant catalogue is empty. Run the seed migration.', 500);

  const used = await usedThisMonth(supabase, user.id, 'ai_match');
  const limit = LIMITS[tier].aiMatchesPerMonth;
  const useAI = used < limit;

  try {
    const result = await runMatching(supabase, profile as BusinessProfile, grants as Grant[], useAI);
    if (result.source === 'ai') await recordUsage(user.id, 'ai_match');

    return NextResponse.json({
      source: result.source,
      matched: result.rows.length,
      eligible: result.rows.filter((r) => r.likely_eligible).length,
      ai_remaining: Math.max(0, limit - used - (result.source === 'ai' ? 1 : 0)),
      notice:
        result.source === 'rules'
          ? useAI
            ? 'AI scoring was unavailable, so these scores come from the eligibility rules only.'
            : "You have used this month's AI refreshes, so these scores come from the eligibility rules only."
          : null,
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Matching failed', 500);
  }
}
