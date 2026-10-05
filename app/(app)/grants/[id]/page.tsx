import Link from 'next/link';
import { notFound } from 'next/navigation';
import EligibilityChecklist from '@/components/grants/EligibilityChecklist';
import GrantDetail from '@/components/grants/GrantDetail';
import TrackGrantButton from '@/components/grants/TrackGrantButton';
import { IconArrowLeft, IconArrowRight } from '@/components/layout/icons';
import { eligibilityChecklist, rulesProfile } from '@/lib/eligibility';
import { STATUSES, labelFor } from '@/lib/options';
import { requireUser } from '@/lib/session';
import type { BusinessProfile, Grant, GrantApplication, GrantMatch } from '@/lib/types';

const UUID = /^[0-9a-f-]{36}$/i;

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) return { title: 'Grant' };
  const { supabase } = await requireUser();
  const { data } = await supabase.from('grants').select('name').eq('id', params.id).maybeSingle();
  return { title: data?.name ?? 'Grant' };
}

export default async function GrantPage({ params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) notFound();
  const { supabase, user } = await requireUser();

  const [{ data: grant }, { data: profile }, { data: match }, { data: apps }] = await Promise.all([
    supabase.from('grants').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('grant_matches').select('*').eq('user_id', user.id).eq('grant_id', params.id).maybeSingle(),
    supabase.from('grant_applications').select('id, status, title, created_at').eq('user_id', user.id).eq('grant_id', params.id).order('created_at'),
  ]);

  if (!grant) notFound();

  const g = grant as Grant;
  const p = profile as BusinessProfile | null;
  const items = eligibilityChecklist(g, rulesProfile(p));
  const existing = (apps as Pick<GrantApplication, 'id' | 'status' | 'title' | 'created_at'>[] | null) ?? [];

  return (
    <div className="space-y-6">
      <Link href="/grants" className="btn-ghost -ml-3 w-fit">
        <IconArrowLeft className="h-4 w-4" />
        All grants
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <GrantDetail
          grant={g}
          match={(match as GrantMatch | null) ?? null}
          actions={<TrackGrantButton grantId={g.id} label={existing.length ? 'Start another application' : 'Start an application'} />}
        />
        <div className="space-y-5">
          {existing.length > 0 && (
            <div className="card p-5">
              <p className="eyebrow">You are tracking this</p>
              <ul className="mt-3 space-y-2">
                {existing.map((a) => (
                  <li key={a.id}>
                    <Link href={`/applications/${a.id}`} className="flex items-center justify-between rounded-xl bg-background px-3.5 py-2.5 text-sm hover:bg-primary-soft">
                      <span className="font-semibold">{a.title || g.short_name || g.name}</span>
                      <span className="flex items-center gap-2 text-muted">
                        {labelFor(STATUSES, a.status)}
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <EligibilityChecklist items={items} hasProfile={!!p} />
        </div>
      </div>
    </div>
  );
}
