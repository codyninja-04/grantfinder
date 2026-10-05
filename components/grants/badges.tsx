import { IconAlert, IconCheck, IconX } from '@/components/layout/icons';
import { COMPLEXITY } from '@/lib/options';
import type { Complexity } from '@/lib/types';

export function ScoreBadge({ score, eligible, size = 'md' }: { score: number; eligible: boolean; size?: 'md' | 'lg' }) {
  const tone = !eligible
    ? 'bg-ineligible-soft text-ineligible-ink'
    : score >= 70
      ? 'bg-eligible-soft text-eligible-ink'
      : score >= 45
        ? 'bg-primary-soft text-primary'
        : 'bg-background text-muted';
  const dims = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-12 w-12 text-[15px]';

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl font-mono font-semibold tabular ${dims} ${tone}`}
      title={`Match score ${score} out of 100`}
    >
      {score}
    </span>
  );
}

export function EligibilityPill({ eligible, blockers }: { eligible: boolean; blockers?: number }) {
  if (!eligible && (blockers ?? 0) > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ineligible-soft px-2.5 py-0.5 text-xs font-semibold text-ineligible-ink">
        <IconX className="h-3.5 w-3.5" />
        Not eligible
      </span>
    );
  }
  if (!eligible) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-caution-soft px-2.5 py-0.5 text-xs font-semibold text-caution-ink">
        <IconAlert className="h-3.5 w-3.5" />
        Weak fit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-eligible-soft px-2.5 py-0.5 text-xs font-semibold text-eligible-ink">
      <IconCheck className="h-3.5 w-3.5" />
      Likely eligible
    </span>
  );
}

export function ComplexityTag({ complexity }: { complexity: Complexity }) {
  const bars = complexity === 'simple' ? 1 : complexity === 'moderate' ? 2 : 3;
  return (
    <span className="chip" title={COMPLEXITY[complexity].hint}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3].map((b) => (
          <span key={b} className={`w-[3px] rounded-sm ${b <= bars ? 'bg-primary' : 'bg-hairline'}`} style={{ height: 4 + b * 2 }} />
        ))}
      </span>
      {COMPLEXITY[complexity].label}
    </span>
  );
}
