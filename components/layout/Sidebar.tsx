'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { NAV, isActive } from './nav';

export default function Sidebar({ companyName, tier }: { companyName: string | null; tier: 'free' | 'pro' }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline bg-surface/70 px-4 py-6 backdrop-blur lg:flex">
      <Link href="/dashboard" className="px-2">
        <Logo />
      </Link>

      <nav className="mt-10 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-background hover:text-ink'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? 'text-primary' : 'text-faint group-hover:text-ink'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-hairline bg-background p-4">
        <p className="eyebrow">Matching for</p>
        <p className="mt-1 truncate text-sm font-semibold text-ink">{companyName ?? 'Your business'}</p>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${tier === 'pro' ? 'bg-eligible' : 'bg-faint'}`} />
          {tier === 'pro' ? 'Pro plan' : 'Free plan'}
        </p>
      </div>
    </aside>
  );
}
