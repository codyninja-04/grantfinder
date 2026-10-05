import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { DISCLAIMER } from '@/lib/options';
import { requireUser } from '@/lib/session';
import { getTier } from '@/lib/usage';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, tier] = await Promise.all([
    supabase.from('business_profiles').select('company_name').eq('user_id', user.id).maybeSingle(),
    getTier(supabase, user.id),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar companyName={profile?.company_name ?? null} tier={tier} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-10">
          <p className="border-t border-hairline pt-5 text-xs leading-relaxed text-faint">{DISCLAIMER}</p>
        </footer>
      </div>
    </div>
  );
}
