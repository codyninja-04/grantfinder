import Link from 'next/link';
import Logo from '@/components/layout/Logo';

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,#E8F0F8_0%,transparent_70%)]" />
      <Link href="/" className="relative mb-10">
        <Logo />
      </Link>
      <div className="card relative w-full max-w-sm animate-rise p-7">
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
      <p className="relative mt-6 text-sm text-muted">{footer}</p>
    </main>
  );
}
