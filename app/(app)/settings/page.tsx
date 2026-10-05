import PageHeader from '@/components/layout/PageHeader';
import { DISCLAIMER } from '@/lib/options';
import { requireUser } from '@/lib/session';
import { LIMITS, PRO_PRICE, getTier, usedThisMonth } from '@/lib/usage';

export const metadata = { title: 'Settings' };

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const finite = Number.isFinite(limit);
  const pct = finite ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs text-muted tabular">
          {used} / {finite ? limit : 'unlimited'}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-caution' : 'bg-primary'}`} style={{ width: `${finite ? pct : 4}%` }} />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const [tier, aiUsed, draftsUsed, { count: openApps }] = await Promise.all([
    getTier(supabase, user.id),
    usedThisMonth(supabase, user.id, 'ai_match'),
    usedThisMonth(supabase, user.id, 'narrative_draft'),
    supabase
      .from('grant_applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('status', 'in', '(approved,rejected)'),
  ]);
  const limits = LIMITS[tier];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Settings" title="Account and plan" />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">Account</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="eyebrow">Signed in as</dt>
              <dd className="mt-1 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="eyebrow">Sign in method</dt>
              <dd className="mt-1 font-medium">Google</dd>
            </div>
          </dl>
          <form action="/auth/signout" method="post" className="mt-6">
            <button type="submit" className="btn-secondary">
              Sign out
            </button>
          </form>
        </section>

        <section className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">Plan</h2>
              <p className="mt-1 text-sm text-muted">{tier === 'pro' ? 'Pro' : 'Free'} · usage resets on the 1st of each month</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tier === 'pro' ? 'bg-eligible-soft text-eligible-ink' : 'bg-background text-muted'}`}>
              {tier === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
          <div className="mt-6 space-y-5">
            <Meter label="AI match refreshes" used={aiUsed} limit={limits.aiMatchesPerMonth} />
            <Meter label="Narrative drafts" used={draftsUsed} limit={limits.draftsPerMonth} />
            <Meter label="Open applications" used={openApps ?? 0} limit={limits.trackedApplications} />
          </div>
          {tier === 'free' && (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary-soft/50 p-4">
              <p className="font-semibold text-primary-dark">Pro, {PRO_PRICE}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Narrative drafting for every application, an unlimited tracker and unlimited AI matching refreshes. Online upgrades are
                coming soon. Until then, reach out and we will switch your account over.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="card p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">About the matching</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Hard eligibility rules such as local shareholding, SME size, company age and industry are checked by fixed rules first, and a
          failed rule always marks a grant as not eligible. AI scoring then ranks the rest by how well they fit your plans. Scheme details
          change, so always confirm on the official page.
        </p>
        <p className="mt-4 max-w-3xl border-t border-hairline pt-4 text-xs leading-relaxed text-faint">{DISCLAIMER}</p>
      </section>
    </div>
  );
}
