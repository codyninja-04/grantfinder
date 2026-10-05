import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">We could not find that page</h1>
      <p className="mt-3 max-w-md leading-relaxed text-muted">The grant or application may have been removed, or the link is mistyped.</p>
      <Link href="/dashboard" className="btn-primary mt-8">
        Back to my matches
      </Link>
    </main>
  );
}
