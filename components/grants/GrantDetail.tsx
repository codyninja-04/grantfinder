import { IconExternal } from '@/components/layout/icons';
import { INITIATIVES, labelFor } from '@/lib/options';
import { timeAgo } from '@/lib/format';
import type { Grant, GrantMatch } from '@/lib/types';
import { ComplexityTag, EligibilityPill, ScoreBadge } from './badges';

export default function GrantDetail({ grant, match, actions }: { grant: Grant; match: GrantMatch | null; actions?: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {match && <ScoreBadge score={match.match_score} eligible={match.likely_eligible} size="lg" />}
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{grant.provider}</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold leading-tight tracking-tight sm:text-[36px]">
              {grant.name}
              {grant.short_name && <span className="ml-2 font-normal text-faint">({grant.short_name})</span>}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {match && <EligibilityPill eligible={match.likely_eligible} blockers={match.blockers.length} />}
              <ComplexityTag complexity={grant.application_complexity} />
              {grant.eligible_initiatives.map((i) => (
                <span key={i} className="chip">
                  {labelFor(INITIATIVES, i)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {match?.reasoning && (
          <div className="mt-6 rounded-xl border border-primary/15 bg-primary-soft/50 p-4">
            <p className="text-xs font-semibold text-primary">
              Why this score {match.source === 'ai' ? '(AI assessed)' : '(rules based)'} · {timeAgo(match.matched_at)}
            </p>
            <p className="mt-1 leading-relaxed text-ink">{match.reasoning}</p>
          </div>
        )}

        <dl className="mt-6 grid gap-4 border-t border-hairline pt-6 sm:grid-cols-2">
          <div>
            <dt className="eyebrow">Support level</dt>
            <dd className="mt-1 font-semibold">{grant.funding_percent ?? 'Varies'}</dd>
          </div>
          <div>
            <dt className="eyebrow">Cap</dt>
            <dd className="mt-1 font-semibold">{grant.funding_cap ?? 'Varies'}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {actions}
          {grant.official_url && (
            <a href={grant.official_url} target="_blank" rel="noreferrer" className="btn-secondary">
              Official page
              <IconExternal className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold tracking-tight">In plain English</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/90">{grant.plain_english ?? grant.description}</p>

        {grant.covers.length > 0 && (
          <>
            <h3 className="mt-7 text-sm font-semibold">What it can pay for</h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {grant.covers.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </>
        )}

        {grant.narrative_focus && (
          <>
            <h3 className="mt-7 text-sm font-semibold">What assessors tend to look for</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{grant.narrative_focus}</p>
          </>
        )}
      </div>
    </div>
  );
}
