import { NextResponse } from 'next/server';
import { eligibilityChecklist, rulesProfile } from '@/lib/eligibility';
import { jsonError } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import type { BusinessProfile, Grant } from '@/lib/types';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const { data: grant } = await supabase.from('grants').select('*').eq('id', params.id).maybeSingle();
  if (!grant) return jsonError('Grant not found', 404);

  const [{ data: profile }, { data: match }] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('grant_matches').select('*').eq('user_id', user.id).eq('grant_id', params.id).maybeSingle(),
  ]);

  return NextResponse.json({
    grant,
    match,
    checklist: eligibilityChecklist(grant as Grant, rulesProfile(profile as BusinessProfile | null)),
  });
}
