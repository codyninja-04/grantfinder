'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Something broke</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">That did not load properly</h1>
      <p className="mt-3 max-w-md leading-relaxed text-muted">It is probably temporary. Try again, and if it keeps happening head back to your matches.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/dashboard" className="btn-secondary">
          My matches
        </Link>
      </div>
    </main>
  );
}
