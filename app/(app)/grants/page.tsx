import GrantBrowser from '@/components/grants/GrantBrowser';
import PageHeader from '@/components/layout/PageHeader';
import { requireUser } from '@/lib/session';
import type { Grant, GrantMatch } from '@/lib/types';

export const metadata = { title: 'All grants' };

export default async function GrantsPage() {
  const { supabase, user } = await requireUser();
  const [{ data: grants }, { data: matches }] = await Promise.all([
    supabase.from('grants').select('*').order('name'),
    supabase.from('grant_matches').select('grant_id, match_score, likely_eligible, blockers').eq('user_id', user.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Catalogue"
        title="All grants"
        description="Every scheme we track, with your match score where you have one. Open any grant for the full eligibility breakdown."
      />
      <GrantBrowser
        grants={(grants as Grant[] | null) ?? []}
        matches={(matches as Pick<GrantMatch, 'grant_id' | 'match_score' | 'likely_eligible' | 'blockers'>[] | null) ?? []}
      />
    </div>
  );
}
