'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ComplexityTag } from '@/components/grants/badges';
import { IconPen } from '@/components/layout/icons';
import { api } from '@/lib/api';
import { formatDate, formatSGD, timeAgo } from '@/lib/format';
import { STATUSES } from '@/lib/options';
import type { ApplicationStatus, ApplicationWithGrant } from '@/lib/types';

const COLUMN_TONE: Record<ApplicationStatus, string> = {
  considering: 'bg-faint',
  preparing: 'bg-primary',
  submitted: 'bg-caution',
  approved: 'bg-eligible',
  rejected: 'bg-ineligible',
};

export default function ApplicationTracker({ applications }: { applications: ApplicationWithGrant[] }) {
  const router = useRouter();
  const [items, setItems] = useState(applications);
  const [error, setError] = useState<string | null>(null);

  async function move(id: string, status: ApplicationStatus) {
    const before = items;
    setError(null);
    setItems((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await api(`/api/applications/${id}`, { method: 'PATCH', json: { status } });
      router.refresh();
    } catch (e) {
      setItems(before);
      setError(e instanceof Error ? e.message : 'Could not update the status');
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-xl bg-ineligible-soft px-4 py-2.5 text-sm text-ineligible-ink">{error}</p>}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="grid min-w-[1000px] grid-cols-5 gap-3">
          {STATUSES.map((col) => {
            const list = items.filter((a) => a.status === col.value);
            return (
              <section key={col.value} className="flex flex-col rounded-2xl bg-hairline/45 p-2.5">
                <header className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span className={`h-2 w-2 rounded-full ${COLUMN_TONE[col.value]}`} />
                    {col.label}
                  </span>
                  <span className="font-mono text-xs text-muted">{list.length}</span>
                </header>
                <ul className="flex flex-1 flex-col gap-2">
                  {list.map((a) => (
                    <li key={a.id} className="card p-3.5">
                      <Link href={`/applications/${a.id}`} className="block hover:text-primary">
                        <p className="text-[11px] font-medium text-faint">{a.grant.short_name ?? a.grant.provider}</p>
                        <p className="mt-0.5 font-semibold leading-snug">{a.title || a.grant.name}</p>
                      </Link>
                      <div className="mt-2 space-y-1 text-xs text-muted">
                        {a.requested_amount != null && <p className="font-mono tabular text-ink">{formatSGD(Number(a.requested_amount))}</p>}
                        {a.target_submit_date && <p>Submit by {formatDate(a.target_submit_date)}</p>}
                        <p className="flex items-center gap-1">
                          {a.narrative_draft ? (
                            <>
                              <IconPen className="h-3 w-3" /> Draft ready
                            </>
                          ) : (
                            <>Updated {timeAgo(a.updated_at)}</>
                          )}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <ComplexityTag complexity={a.grant.application_complexity} />
                        <select
                          aria-label="Move to"
                          value={a.status}
                          onChange={(e) => move(a.id, e.target.value as ApplicationStatus)}
                          className="rounded-lg border border-hairline bg-surface px-1.5 py-1 text-xs text-muted focus:border-primary focus:outline-none"
                        >
                          {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  ))}
                  {list.length === 0 && <li className="rounded-xl border border-dashed border-hairline px-3 py-6 text-center text-xs text-faint">Empty</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
