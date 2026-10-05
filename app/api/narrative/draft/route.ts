import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { draftGrantNarrative } from '@/lib/claude/narrative-writer';
import { jsonError, zodMessage } from '@/lib/http';
import { INDUSTRIES, INITIATIVES, REVENUE_RANGES, STAGES, labelFor } from '@/lib/options';
import { createClient } from '@/lib/supabase/server';
import type { BusinessProfile, Grant, GrantApplication } from '@/lib/types';
import { LIMITS, getTier, recordUsage, usedThisMonth } from '@/lib/usage';

export const maxDuration = 60;

const bodySchema = z.object({ application_id: z.string().uuid() });

function describeBusiness(p: BusinessProfile | null) {
  if (!p) return 'No business profile provided.';
  const parts = [
    p.company_name,
    p.industry ? `industry: ${labelFor(INDUSTRIES, p.industry)}` : null,
    p.business_stage ? `stage: ${labelFor(STAGES, p.business_stage)}` : null,
    p.years_operating != null ? `${p.years_operating} years operating` : null,
    p.employee_count != null ? `${p.employee_count} employees` : null,
    p.annual_revenue_range ? `annual revenue ${labelFor(REVENUE_RANGES, p.annual_revenue_range)}` : null,
    p.planned_initiatives?.length ? `planning: ${p.planned_initiatives.map((i) => labelFor(INITIATIVES, i)).join(', ')}` : null,
  ].filter(Boolean);
  return parts.join('; ') + (p.project_notes ? `. Owner notes: ${p.project_notes}` : '');
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(zodMessage(parsed.error));

  if (!process.env.ANTHROPIC_API_KEY) return jsonError('Narrative drafting is not configured on this server.', 503);

  const tier = await getTier(supabase, user.id);
  const used = await usedThisMonth(supabase, user.id, 'narrative_draft');
  const limit = LIMITS[tier].draftsPerMonth;
  if (used >= limit) {
    return jsonError(
      tier === 'free'
        ? 'You have used your free narrative draft this month. Pro includes drafting for every application.'
        : "You have hit this month's fair use limit for drafts.",
      402,
      { upgrade: tier === 'free' }
    );
  }

  const [{ data: app }, { data: profile }] = await Promise.all([
    supabase.from('grant_applications').select('*, grant:grants(*)').eq('id', parsed.data.application_id).eq('user_id', user.id).maybeSingle(),
    supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
  ]);
  if (!app) return jsonError('Application not found', 404);

  const application = app as GrantApplication & { grant: Grant };
  if (!application.project_description?.trim()) return jsonError('Describe the project first, rough notes are fine.');

  try {
    const draft = await draftGrantNarrative({
      grantName: application.grant.name,
      grantFocus: application.grant.narrative_focus,
      businessContext: describeBusiness(profile as BusinessProfile | null),
      projectSummary: `${application.title ? `${application.title}. ` : ''}${application.project_description}`,
      expectedOutcomes: application.expected_outcomes ?? '',
      requestedAmount: application.requested_amount != null ? Number(application.requested_amount) : null,
    });

    const draftedAt = new Date().toISOString();
    const { error } = await supabase
      .from('grant_applications')
      .update({
        narrative_draft: draft,
        narrative_drafted_at: draftedAt,
        updated_at: draftedAt,
        status: application.status === 'considering' ? 'preparing' : application.status,
      })
      .eq('id', application.id)
      .eq('user_id', user.id);
    if (error) return jsonError(error.message, 500);

    await recordUsage(user.id, 'narrative_draft');
    return NextResponse.json({ draft, drafted_at: draftedAt, remaining: Math.max(0, limit - used - 1) });
  } catch (err) {
    console.error('Narrative draft failed', err);
    return jsonError('The draft could not be generated right now. Please try again in a minute.', 502);
  }
}
