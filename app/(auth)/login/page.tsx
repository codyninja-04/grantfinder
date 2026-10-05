import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import GoogleButton from '@/components/auth/GoogleButton';

export const metadata = { title: 'Sign in' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Your matches, applications and drafts are right where you left them."
      footer={
        <>
          New to GrantFinder?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {searchParams.error && (
        <p className="mb-4 rounded-xl bg-ineligible-soft px-3.5 py-2.5 text-sm text-ineligible-ink">
          That sign in did not go through. Give it another try.
        </p>
      )}
      <GoogleButton next={searchParams.next} label="Continue with Google" />
    </AuthCard>
  );
}
