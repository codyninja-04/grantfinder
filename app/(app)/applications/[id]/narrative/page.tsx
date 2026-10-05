import Link from 'next/link';
import { notFound } from 'next/navigation';
import NarrativeDrafter from '@/components/applications/NarrativeDrafter';
import { IconArrowLeft } from '@/components/layout/icons';
import PageHeader from '@/components/layout/PageHeader';
import { requireUser } from '@/lib/session';
import type { Grant, GrantApplication } from '@/lib/types';
import { LIMITS, getTier, usedThisMonth } from '@/lib/usage';

export const metadata = { title: 'Narrative drafter' };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function NarrativePage({ params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) notFound();
  const { supabase, user } = await requireUser();

  const [{ data }, tier, used] = await Promise.all([
    supabase
      .from('grant_applications')
      .select('*, grant:grants(name, short_name)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle(),
    getTier(supabase, user.id),
    usedThisMonth(supabase, user.id, 'narrative_draft'),
  ]);
  if (!data) notFound();

  const app = data as GrantApplication & { grant: Pick<Grant, 'name' | 'short_name'> };

  return (
    <div className="space-y-6">
      <Link href={`/applications/${app.id}`} className="btn-ghost -ml-3 w-fit">
        <IconArrowLeft className="h-4 w-4" />
        Back to the application
      </Link>
      <PageHeader
        eyebrow={`${app.grant.name} · Narrative`}
        title={app.title || 'Application narrative'}
        description="Draft, edit and copy the written sections. Paste them into the official portal when you are happy."
      />
      <NarrativeDrafter
        applicationId={app.id}
        initialDraft={app.narrative_draft}
        draftedAt={app.narrative_drafted_at}
        hasProject={!!app.project_description?.trim()}
        remaining={Math.max(0, LIMITS[tier].draftsPerMonth - used)}
        tier={tier}
      />
    </div>
  );
}
