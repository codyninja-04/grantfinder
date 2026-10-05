import Link from 'next/link';
import { ComplexityTag, EligibilityPill, ScoreBadge } from '@/components/grants/badges';
import { IconArrowRight } from '@/components/layout/icons';
import type { Grant, GrantMatch } from '@/lib/types';

export default function GrantMatchCard({ grant, match, rank }: { grant: Grant; match: GrantMatch; rank?: number }) {
  return (
    <Link
      href={`/grants/${grant.id}`}
      className="card group flex gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
    >
      <ScoreBadge score={match.match_score} eligible={match.likely_eligible} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-faint">
              {rank != null && <span className="font-mono text-primary">#{rank} · </span>}
              {grant.provider}
            </p>
            <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug tracking-tight">{grant.name}</h3>
          </div>
          <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        {match.reasoning && <p className="mt-2 text-sm leading-relaxed text-muted">{match.reasoning}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <EligibilityPill eligible={match.likely_eligible} blockers={match.blockers.length} />
          <ComplexityTag complexity={grant.application_complexity} />
          {grant.funding_cap && <span className="chip">{grant.funding_cap}</span>}
        </div>
      </div>
    </Link>
  );
}
