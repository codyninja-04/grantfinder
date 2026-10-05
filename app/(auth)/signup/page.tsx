import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import GoogleButton from '@/components/auth/GoogleButton';

export const metadata = { title: 'Create account' };

export default function SignupPage() {
  return (
    <AuthCard
      title="See which grants fit you"
      subtitle="Tell us about your business in about two minutes and we will match you against the main Singapore schemes. Free to start."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton next="/business-profile?welcome=1" label="Sign up with Google" />
      <p className="mt-5 text-center text-xs leading-relaxed text-muted">
        We only use Google to sign you in. Your business details are private to your account.
      </p>
    </AuthCard>
  );
}
