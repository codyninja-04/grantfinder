'use client';

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compactSGD, formatSGD } from '@/lib/format';

export interface FundingRow {
  name: string;
  short: string;
  cap: number;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: FundingRow }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-hairline bg-surface px-3 py-2 text-sm shadow-lift">
      <p className="font-semibold">{row.name}</p>
      <p className="tabular text-muted">Up to {formatSGD(row.cap)}</p>
    </div>
  );
}

/**
 * Funding potential across likely eligible grants. Only schemes with a fixed
 * dollar cap can be added up honestly; the rest are percentage of project cost
 * and are listed separately rather than given a made up number.
 */
export default function FundingPotentialCard({
  capped,
  uncapped,
  requestedTotal,
}: {
  capped: FundingRow[];
  uncapped: { name: string; percent: string | null }[];
  requestedTotal: number;
}) {
  const total = capped.reduce((sum, r) => sum + r.cap, 0);
  const height = Math.max(120, capped.length * 44 + 24);

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Funding potential</p>
          <p className="mt-2 font-display text-[40px] font-semibold leading-none tracking-tight tabular">
            {total > 0 ? formatSGD(total) : 'Project based'}
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            {total > 0
              ? `Combined fixed caps across ${capped.length} likely eligible scheme${capped.length === 1 ? '' : 's'}. ${
                  uncapped.length ? `${uncapped.length} more pay a share of project cost on top.` : ''
                }`
              : 'Your likely eligible grants pay a share of qualifying project costs rather than a fixed amount.'}
          </p>
        </div>
        {requestedTotal > 0 && (
          <div className="rounded-xl bg-background px-4 py-3 text-right">
            <p className="eyebrow">In your tracker</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular">{formatSGD(requestedTotal)}</p>
          </div>
        )}
      </div>

      {capped.length > 0 && (
        <div className="mt-6" style={{ height }} role="img" aria-label={`Bar chart of funding caps: ${capped.map((r) => `${r.name} ${formatSGD(r.cap)}`).join(', ')}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={capped} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 0 }} barCategoryGap={10}>
              <CartesianGrid horizontal={false} stroke="#EEF2F6" />
              <XAxis type="number" tickFormatter={compactSGD} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="short" width={96} tick={{ fontSize: 12, fill: '#5B6B7C' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#E8F0F8', opacity: 0.6 }} />
              <Bar dataKey="cap" fill="#0F4C81" radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
                <LabelList dataKey="cap" position="right" formatter={(v: number) => compactSGD(v)} style={{ fontSize: 12, fill: '#0B1B2B', fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {uncapped.length > 0 && (
        <div className="mt-5 border-t border-hairline pt-4">
          <p className="text-xs font-semibold text-muted">Share of project cost</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {uncapped.map((u) => (
              <li key={u.name} className="chip" title={u.percent ?? undefined}>
                <span className="font-semibold text-ink">{u.name}</span>
                {u.percent && <span className="hidden sm:inline">· {u.percent}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
