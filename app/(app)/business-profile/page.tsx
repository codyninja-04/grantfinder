import BusinessProfileForm from '@/components/profile/BusinessProfileForm';
import PageHeader from '@/components/layout/PageHeader';
import { requireUser } from '@/lib/session';
import type { BusinessProfile } from '@/lib/types';

export const metadata = { title: 'Business profile' };

export default async function BusinessProfilePage({ searchParams }: { searchParams: { welcome?: string } }) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Business profile"
        title="Tell us about your business"
        description="Everything here feeds the matching. Change it any time and refresh your matches."
      />
      <BusinessProfileForm profile={(data as BusinessProfile | null) ?? null} welcome={searchParams.welcome === '1'} />
    </div>
  );
}
