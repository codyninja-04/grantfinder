import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from './supabase/admin';
import type { Tier } from './types';

export const LIMITS: Record<Tier, { aiMatchesPerMonth: number; draftsPerMonth: number; trackedApplications: number }> = {
  free: { aiMatchesPerMonth: 3, draftsPerMonth: 1, trackedApplications: 3 },
  pro: { aiMatchesPerMonth: 200, draftsPerMonth: 100, trackedApplications: Infinity },
};

export const PRO_PRICE = 'S$25/month';

export async function getTier(supabase: SupabaseClient, userId: string): Promise<Tier> {
  const { data } = await supabase
    .from('subscriptions')
    .select('tier, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data || data.tier !== 'pro') return 'free';
  if (data.current_period_end && new Date(data.current_period_end) < new Date()) return 'free';
  return 'pro';
}

function startOfMonthISO() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function usedThisMonth(supabase: SupabaseClient, userId: string, kind: 'ai_match' | 'narrative_draft') {
  const { count } = await supabase
    .from('usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('kind', kind)
    .gte('created_at', startOfMonthISO());
  return count ?? 0;
}

export async function recordUsage(userId: string, kind: 'ai_match' | 'narrative_draft') {
  const admin = createAdminClient();
  const { error } = await admin.from('usage_events').insert({ user_id: userId, kind });
  if (error) console.error('Failed to record usage', error.message);
}
