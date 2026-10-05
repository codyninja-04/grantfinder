import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { blockersFrom, eligibilityChecklist, rulesProfile } from '@/lib/eligibility';
import { jsonError, zodMessage } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import type { BusinessProfile, Grant } from '@/lib/types';

const bodySchema = z.object({ grant_ids: z.array(z.string().uuid()).min(1).max(50) });

/** Rules only eligibility check for one or more grants. No AI, no usage cost. */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(zodMessage(parsed.error));

  const [{ data: grants }, { data: profile }] = await Promise.all([
    supabase.from('grants').select('*').in('id', parsed.data.grant_ids),
    supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  const rules = rulesProfile(profile as BusinessProfile | null);
  const results = ((grants as Grant[] | null) ?? []).map((grant) => {
    const checklist = eligibilityChecklist(grant, rules);
    const blockers = blockersFrom(checklist);
    return { grant_id: grant.id, eligible: blockers.length === 0, blockers, checklist };
  });

  return NextResponse.json({ has_profile: !!profile, results });
}
