import Link from 'next/link';
import ApplicationTracker from '@/components/applications/ApplicationTracker';
import { IconArrowRight, IconFolder } from '@/components/layout/icons';
import PageHeader from '@/components/layout/PageHeader';
import { requireUser } from '@/lib/session';
import type { ApplicationWithGrant } from '@/lib/types';
import { LIMITS, getTier } from '@/lib/usage';

export const metadata = { title: 'Applications' };

export default async function ApplicationsPage() {
  const { supabase, user } = await requireUser();
  const [{ data }, tier] = await Promise.all([
    supabase
      .from('grant_applications')
      .select('*, grant:grants(id, name, short_name, provider, funding_percent, application_complexity)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    getTier(supabase, user.id),
  ]);

  const applications = (data as ApplicationWithGrant[] | null) ?? [];
  const open = applications.filter((a) => !['approved', 'rejected'].includes(a.status)).length;
  const limit = LIMITS[tier].trackedApplications;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tracker"
        title="Applications"
        description={
          Number.isFinite(limit)
            ? `${open} of ${limit} open applications on the free plan. Applications are submitted on the official portals, this is where you keep track.`
            : 'Everything you are working on, from first look to decision. Applications are submitted on the official portals.'
        }
        actions={
          <Link href="/dashboard" className="btn-secondary">
            Find a grant
          </Link>
        }
      />

      {applications.length === 0 ? (
        <div className="card flex flex-col items-start gap-5 p-8 sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <IconFolder className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Nothing tracked yet</h2>
            <p className="mt-2 max-w-lg leading-relaxed text-muted">
              Open any grant you match with and choose Start an application. You can then capture the project details and draft the
              narrative sections here.
            </p>
          </div>
          <Link href="/dashboard" className="btn-primary">
            See my matches
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ApplicationTracker applications={applications} />
      )}
    </div>
  );
}
