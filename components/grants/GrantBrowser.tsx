'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconArrowRight, IconSearch } from '@/components/layout/icons';
import { INITIATIVES } from '@/lib/options';
import type { Complexity, Grant, GrantMatch, Initiative } from '@/lib/types';
import { ComplexityTag, EligibilityPill, ScoreBadge } from './badges';

type MatchLite = Pick<GrantMatch, 'grant_id' | 'match_score' | 'likely_eligible' | 'blockers'>;

export default function GrantBrowser({ grants, matches }: { grants: Grant[]; matches: MatchLite[] }) {
  const [query, setQuery] = useState('');
  const [initiative, setInitiative] = useState<Initiative | ''>('');
  const [complexity, setComplexity] = useState<Complexity | ''>('');
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const matchById = useMemo(() => new Map(matches.map((m) => [m.grant_id, m])), [matches]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return grants
      .filter((g) => {
        if (q) {
          const hay = `${g.name} ${g.short_name ?? ''} ${g.provider} ${g.description ?? ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (initiative && !g.eligible_initiatives.includes(initiative)) return false;
        if (complexity && g.application_complexity !== complexity) return false;
        if (eligibleOnly && !matchById.get(g.id)?.likely_eligible) return false;
        return true;
      })
      .sort((a, b) => (matchById.get(b.id)?.match_score ?? -1) - (matchById.get(a.id)?.match_score ?? -1) || a.name.localeCompare(b.name));
  }, [grants, query, initiative, complexity, eligibleOnly, matchById]);

  return (
    <div className="space-y-5">
      <div className="card flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search grants</span>
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            className="input border-transparent bg-background pl-10 focus:bg-surface"
            placeholder="Search by name, agency or keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto py-2 text-sm" value={initiative} onChange={(e) => setInitiative(e.target.value as Initiative | '')} aria-label="Filter by purpose">
            <option value="">Any purpose</option>
            {INITIATIVES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
          <select className="input w-auto py-2 text-sm" value={complexity} onChange={(e) => setComplexity(e.target.value as Complexity | '')} aria-label="Filter by effort">
            <option value="">Any effort</option>
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="complex">Complex</option>
          </select>
          {matches.length > 0 && (
            <button
              type="button"
              onClick={() => setEligibleOnly((v) => !v)}
              aria-pressed={eligibleOnly}
              className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                eligibleOnly ? 'border-eligible bg-eligible-soft text-eligible-ink' : 'border-hairline bg-surface text-muted hover:text-ink'
              }`}
            >
              Likely eligible only
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted">
        {results.length} of {grants.length} schemes
      </p>

      {results.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-semibold">Nothing matches those filters</p>
          <p className="mt-1 text-sm text-muted">Try a broader search or clear a filter.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {results.map((g) => {
            const m = matchById.get(g.id);
            return (
              <li key={g.id}>
                <Link
                  href={`/grants/${g.id}`}
                  className="card group flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
                >
                  <div className="flex items-start gap-4">
                    {m && <ScoreBadge score={m.match_score} eligible={m.likely_eligible} />}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-faint">{g.provider}</p>
                      <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug tracking-tight">{g.name}</h3>
                    </div>
                    <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{g.description}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    {m && <EligibilityPill eligible={m.likely_eligible} blockers={m.blockers.length} />}
                    <ComplexityTag complexity={g.application_complexity} />
                    {g.funding_percent && <span className="chip max-w-full truncate">{g.funding_percent}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
