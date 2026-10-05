import Link from 'next/link';
import { notFound } from 'next/navigation';
import ApplicationEditor from '@/components/applications/ApplicationEditor';
import { ComplexityTag } from '@/components/grants/badges';
import { IconArrowLeft, IconArrowRight, IconExternal, IconPen } from '@/components/layout/icons';
import PageHeader from '@/components/layout/PageHeader';
import { timeAgo } from '@/lib/format';
import { requireUser } from '@/lib/session';
import type { Grant, GrantApplication } from '@/lib/types';

export const metadata = { title: 'Application' };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function ApplicationPage({ params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) notFound();
  const { supabase, user } = await requireUser();

  const { data } = await supabase
    .from('grant_applications')
    .select('*, grant:grants(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!data) notFound();

  const { grant, ...rest } = data as GrantApplication & { grant: Grant };
  const application = rest as GrantApplication;
  const ready = !!application.project_description?.trim();

  return (
    <div className="space-y-6">
      <Link href="/applications" className="btn-ghost -ml-3 w-fit">
        <IconArrowLeft className="h-4 w-4" />
        All applications
      </Link>

      <PageHeader
        eyebrow={grant.name}
        title={application.title || `${grant.short_name ?? grant.name} application`}
        description={`Created ${timeAgo(application.created_at)}. Capture the project here, then draft the narrative.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ApplicationEditor application={application} grantName={grant.short_name ?? grant.name} />

        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="bg-primary p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Narrative</p>
              <p className="mt-2 font-display text-2xl font-semibold leading-tight">
                {application.narrative_draft ? 'Draft ready to edit' : 'Draft the written sections'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                {application.narrative_draft
                  ? `Last drafted ${timeAgo(application.narrative_drafted_at)}.`
                  : 'Project justification, expected outcomes and implementation plan, written in the style assessors expect.'}
              </p>
            </div>
            <div className="p-5">
              {ready || application.narrative_draft ? (
                <Link href={`/applications/${application.id}/narrative`} className="btn-primary w-full">
                  <IconPen className="h-4 w-4" />
                  {application.narrative_draft ? 'Open the draft' : 'Start drafting'}
                </Link>
              ) : (
                <p className="text-sm leading-relaxed text-muted">
                  Describe the project on the left and save first. Rough notes are enough to get going.
                </p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <p className="eyebrow">{grant.provider}</p>
            <p className="mt-1.5 font-semibold">{grant.name}</p>
            <p className="mt-1 text-sm text-muted">{grant.funding_percent}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ComplexityTag complexity={grant.application_complexity} />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link href={`/grants/${grant.id}`} className="btn-secondary justify-between">
                Eligibility checklist
                <IconArrowRight className="h-4 w-4" />
              </Link>
              {grant.official_url && (
                <a href={grant.official_url} target="_blank" rel="noreferrer" className="btn-secondary justify-between">
                  Apply on the official portal
                  <IconExternal className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
