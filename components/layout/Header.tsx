'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconMenu, IconX } from './icons';
import Logo from './Logo';
import { NAV, isActive } from './nav';

/** Mobile top bar with a slide down menu. The sidebar takes over on large screens. */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-surface/85 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn-ghost -mr-2 px-2.5"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>
      {open && (
        <nav className="animate-rise border-t border-hairline px-3 pb-4 pt-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium ${
                isActive(pathname, href) ? 'bg-primary-soft text-primary' : 'text-ink'
              }`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
