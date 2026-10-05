import Link from 'next/link';
import { IconAlert, IconCheck, IconX } from '@/components/layout/icons';
import type { ChecklistItem } from '@/lib/types';

const STATUS = {
  pass: { icon: IconCheck, ring: 'bg-eligible-soft text-eligible', label: 'Met' },
  fail: { icon: IconX, ring: 'bg-ineligible-soft text-ineligible', label: 'Not met' },
  check: { icon: IconAlert, ring: 'bg-caution-soft text-caution', label: 'Check' },
} as const;

export default function EligibilityChecklist({ items, hasProfile }: { items: ChecklistItem[]; hasProfile: boolean }) {
  const fails = items.filter((i) => i.status === 'fail').length;
  const passes = items.filter((i) => i.status === 'pass').length;
  const checks = items.length - fails - passes;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-hairline px-5 py-4 sm:px-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">Eligibility checklist</h2>
        <p className="mt-1 text-sm text-muted">
          {hasProfile ? (
            <>
              <span className="font-semibold text-eligible-ink">{passes} met</span>
              {fails > 0 && (
                <>
                  {' · '}
                  <span className="font-semibold text-ineligible-ink">{fails} not met</span>
                </>
              )}
              {' · '}
              <span className="font-semibold text-caution-ink">{checks} to confirm yourself</span>
            </>
          ) : (
            <>
              <Link href="/business-profile" className="font-semibold text-primary hover:underline">
                Fill in your business profile
              </Link>{' '}
              to check these against your company.
            </>
          )}
        </p>
      </div>
      <ul className="divide-y divide-hairline">
        {items.map((item) => {
          const s = STATUS[item.status];
          const Icon = s.icon;
          return (
            <li key={item.key} className="flex gap-3.5 px-5 py-4 sm:px-6">
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${s.ring}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="sr-only">{s.label}</span>
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-snug">{item.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
