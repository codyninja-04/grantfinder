import Link from 'next/link';
import FundingPotentialCard, { type FundingRow } from '@/components/dashboard/FundingPotentialCard';
import GrantMatchCard from '@/components/dashboard/GrantMatchCard';
import RefreshMatchesButton from '@/components/dashboard/RefreshMatchesButton';
import { IconAlert, IconArrowRight, IconBuilding } from '@/components/layout/icons';
import PageHeader from '@/components/layout/PageHeader';
import { timeAgo } from '@/lib/format';
import { STAGES, labelFor } from '@/lib/options';
import { requireUser } from '@/lib/session';
import type { BusinessProfile, Grant, GrantMatch } from '@/lib/types';
import { LIMITS, getTier, usedThisMonth } from '@/lib/usage';

export const metadata = { title: 'Matches' };

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [{ data: profileRow }, { data: grantRows }, { data: matchRows }, { data: apps }, tier, aiUsed] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('grants').select('*'),
    supabase.from('grant_matches').select('*').eq('user_id', user.id).order('match_score', { ascending: false }),
    supabase.from('grant_applications').select('id, status, requested_amount').eq('user_id', user.id),
    getTier(supabase, user.id),
    usedThisMonth(supabase, user.id, 'ai_match'),
  ]);

  const profile = profileRow as BusinessProfile | null;
  const aiRemaining = Math.max(0, LIMITS[tier].aiMatchesPerMonth - aiUsed);

  if (!profile) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Matches" title="Let us find your grants" />
        <div className="card flex flex-col items-start gap-5 p-8 sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <IconBuilding className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Start with your business profile</h2>
            <p className="mt-2 max-w-lg leading-relaxed text-muted">
              Industry, size, ownership and what you are planning next. It takes about two minutes and decides which schemes you can
              realistically apply for.
            </p>
          </div>
          <Link href="/business-profile?welcome=1" className="btn-primary px-5 py-3">
            Set up my profile
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const grants = (grantRows as Grant[] | null) ?? [];
  const grantById = new Map(grants.map((g) => [g.id, g]));
  const matches = ((matchRows as GrantMatch[] | null) ?? []).filter((m) => grantById.has(m.grant_id));

  const subtitle = [labelFor(STAGES, profile.business_stage), profile.employee_count != null ? `${profile.employee_count} staff` : null]
    .filter(Boolean)
    .join(' · ');

  if (matches.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Matches" title={profile.company_name} description={subtitle || undefined} />
        <div className="card flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Ready when you are</h2>
            <p className="mt-2 max-w-lg leading-relaxed text-muted">
              We will check your profile against {grants.length} schemes, rule out the ones you cannot get, and rank the rest by fit.
            </p>
          </div>
          <RefreshMatchesButton firstRun aiRemaining={aiRemaining} />
        </div>
      </div>
    );
  }

  const eligible = matches.filter((m) => m.likely_eligible);
  const others = matches.filter((m) => !m.likely_eligible);
  const stale = profile.matched_at && new Date(profile.updated_at) > new Date(profile.matched_at);

  const capped: FundingRow[] = [];
  const uncapped: { name: string; percent: string | null }[] = [];
  for (const m of eligible) {
    const g = grantById.get(m.grant_id)!;
    if (g.funding_cap_sgd) capped.push({ name: g.name, short: g.short_name ?? g.name, cap: Number(g.funding_cap_sgd) });
    else uncapped.push({ name: g.short_name ?? g.name, percent: g.funding_percent });
  }
  capped.sort((a, b) => b.cap - a.cap);

  const activeApps = (apps ?? []).filter((a) => !['approved', 'rejected'].includes(a.status));
  const requestedTotal = activeApps.reduce((s, a) => s + Number(a.requested_amount ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Matches"
        title={profile.company_name}
        description={
          <>
            {subtitle && <>{subtitle} · </>}
            Last matched {timeAgo(profile.matched_at)}
          </>
        }
        actions={<RefreshMatchesButton aiRemaining={aiRemaining} />}
      />

      {stale && (
        <div className="flex items-start gap-3 rounded-2xl border border-caution/25 bg-caution-soft px-4 py-3 text-sm text-caution-ink">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Your profile changed since these matches were scored. Refresh to bring them up to date.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Likely eligible', value: eligible.length, hint: `of ${matches.length} schemes checked` },
          { label: 'Ruled out', value: others.filter((m) => m.blockers.length > 0).length, hint: 'hard rule not met' },
          { label: 'Applications in progress', value: activeApps.length, hint: 'in your tracker', href: '/applications' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-2 font-display text-4xl font-semibold tabular">{s.value}</p>
            <p className="mt-1 text-sm text-muted">
              {s.href ? (
                <Link href={s.href} className="hover:text-primary hover:underline">
                  {s.hint}
                </Link>
              ) : (
                s.hint
              )}
            </p>
          </div>
        ))}
      </div>

      {eligible.length > 0 && <FundingPotentialCard capped={capped} uncapped={uncapped} requestedTotal={requestedTotal} />}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Best fits for you</h2>
          <Link href="/grants" className="text-sm font-semibold text-primary hover:underline">
            Browse all
          </Link>
        </div>
        {eligible.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-semibold">No likely matches yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Adding what you plan to do in your{' '}
              <Link href="/business-profile" className="font-semibold text-primary hover:underline">
                business profile
              </Link>{' '}
              usually opens up more schemes.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {eligible.map((m, i) => (
              <GrantMatchCard key={m.grant_id} grant={grantById.get(m.grant_id)!} match={m} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {others.length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-hairline bg-surface px-5 py-4 hover:border-primary/30">
            <span>
              <span className="font-semibold">Not a fit right now</span>
              <span className="ml-2 text-sm text-muted">{others.length} schemes, with the reason why</span>
            </span>
            <IconArrowRight className="h-4 w-4 text-faint transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-3 grid gap-3">
            {others.map((m) => (
              <GrantMatchCard key={m.grant_id} grant={grantById.get(m.grant_id)!} match={m} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
