'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconArrowRight, IconCheck } from '@/components/layout/icons';
import { api } from '@/lib/api';
import { INDUSTRIES, INITIATIVES, REVENUE_RANGES, STAGES } from '@/lib/options';
import type { BusinessProfile, BusinessStage, Initiative, RevenueRange } from '@/lib/types';
import { UEN_PATTERN } from '@/lib/validation';

type FormState = {
  company_name: string;
  uen: string;
  industry: string;
  annual_revenue_range: RevenueRange | '';
  employee_count: string;
  years_operating: string;
  is_local_shareholding_30_percent: boolean;
  business_stage: BusinessStage | '';
  planned_initiatives: Initiative[];
  project_notes: string;
};

function initialState(p: BusinessProfile | null): FormState {
  return {
    company_name: p?.company_name ?? '',
    uen: p?.uen ?? '',
    industry: p?.industry ?? '',
    annual_revenue_range: p?.annual_revenue_range ?? '',
    employee_count: p?.employee_count?.toString() ?? '',
    years_operating: p?.years_operating?.toString() ?? '',
    is_local_shareholding_30_percent: p?.is_local_shareholding_30_percent ?? true,
    business_stage: p?.business_stage ?? '',
    planned_initiatives: p?.planned_initiatives ?? [],
    project_notes: p?.project_notes ?? '',
  };
}

function Section({ step, title, hint, children }: { step: string; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-hairline py-8 first:border-t-0 first:pt-0 md:grid-cols-[220px_1fr]">
      <div>
        <p className="font-mono text-xs text-primary">{step}</p>
        <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{hint}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export default function BusinessProfileForm({ profile, welcome }: { profile: BusinessProfile | null; welcome: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(profile));
  const [saving, setSaving] = useState<'save' | 'match' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const toggleInitiative = (value: Initiative) =>
    set(
      'planned_initiatives',
      form.planned_initiatives.includes(value)
        ? form.planned_initiatives.filter((v) => v !== value)
        : [...form.planned_initiatives, value]
    );

  const uenInvalid = form.uen.trim() !== '' && !UEN_PATTERN.test(form.uen.trim().toUpperCase());

  async function submit(andMatch: boolean) {
    setError(null);
    if (!form.company_name.trim()) return setError('Add your company name first.');
    if (uenInvalid) return setError('Check the UEN format, or leave it blank for now.');

    setSaving(andMatch ? 'match' : 'save');
    try {
      await api('/api/profile', {
        method: 'PUT',
        json: {
          ...form,
          industry: form.industry || null,
          annual_revenue_range: form.annual_revenue_range || null,
          business_stage: form.business_stage || null,
          employee_count: form.employee_count === '' ? null : Number(form.employee_count),
          years_operating: form.years_operating === '' ? null : Number(form.years_operating),
        },
      });
      if (andMatch) {
        await api('/api/grants/match', { method: 'POST', json: {} });
        router.push('/dashboard?matched=1');
      } else {
        setSaved(true);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile');
    } finally {
      setSaving(null);
    }
  }

  const completeness = [
    form.company_name,
    form.industry,
    form.business_stage,
    form.annual_revenue_range,
    form.employee_count,
    form.years_operating,
    form.planned_initiatives.length ? 'y' : '',
  ].filter(Boolean).length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(true);
      }}
      className="space-y-6"
    >
      {welcome && !profile && (
        <div className="card animate-rise border-primary/20 bg-primary-soft/50 p-5">
          <p className="font-semibold text-primary-dark">Welcome to GrantFinder</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Fill in what you know. The more detail you give, the sharper the matching, but only the company name is required.
          </p>
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <Section step="01" title="Your company" hint="Used on drafts. The UEN is optional and only checked for format.">
          <div>
            <label className="label" htmlFor="company_name">
              Company name
            </label>
            <input
              id="company_name"
              className="input"
              value={form.company_name}
              onChange={(e) => set('company_name', e.target.value)}
              placeholder="Tan & Sons Trading Pte Ltd"
              maxLength={120}
            />
          </div>
          <div>
            <label className="label" htmlFor="uen">
              UEN <span className="font-normal text-faint">(optional)</span>
            </label>
            <input
              id="uen"
              className={`input font-mono uppercase ${uenInvalid ? 'border-ineligible focus:border-ineligible focus:ring-ineligible-soft' : ''}`}
              value={form.uen}
              onChange={(e) => set('uen', e.target.value)}
              placeholder="201912345K"
              maxLength={10}
            />
            {uenInvalid && <p className="mt-1.5 text-xs text-ineligible-ink">That does not look like a Singapore UEN.</p>}
          </div>
        </Section>

        <Section step="02" title="The business" hint="Stage and size decide most of the hard eligibility rules.">
          <div>
            <label className="label" htmlFor="industry">
              Industry
            </label>
            <select id="industry" className="input" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
              <option value="">Choose one</option>
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="label">Stage</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {STAGES.map((s) => {
                const active = form.business_stage === s.value;
                return (
                  <button
                    type="button"
                    key={s.value}
                    onClick={() => set('business_stage', s.value)}
                    aria-pressed={active}
                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                      active ? 'border-primary bg-primary-soft/60 ring-1 ring-primary' : 'border-hairline bg-surface hover:border-primary/30'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{s.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="years">
                Years operating
              </label>
              <input
                id="years"
                type="number"
                min={0}
                inputMode="numeric"
                className="input tabular"
                value={form.years_operating}
                onChange={(e) => set('years_operating', e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <label className="label" htmlFor="employees">
                Employees
              </label>
              <input
                id="employees"
                type="number"
                min={0}
                inputMode="numeric"
                className="input tabular"
                value={form.employee_count}
                onChange={(e) => set('employee_count', e.target.value)}
                placeholder="12"
              />
            </div>
            <div>
              <label className="label" htmlFor="revenue">
                Annual revenue
              </label>
              <select
                id="revenue"
                className="input"
                value={form.annual_revenue_range}
                onChange={(e) => set('annual_revenue_range', e.target.value as RevenueRange | '')}
              >
                <option value="">Choose one</option>
                {REVENUE_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        <Section
          step="03"
          title="Ownership"
          hint="Most Enterprise Singapore grants need at least 30% of shares held by Singapore Citizens or PRs. This one is strict."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { v: true, title: 'Yes, 30% or more', body: 'Singapore Citizens or PRs hold at least 30% of shares' },
              { v: false, title: 'No, less than 30%', body: 'Mostly foreign owned, or not sure yet' },
            ].map((o) => {
              const active = form.is_local_shareholding_30_percent === o.v;
              return (
                <button
                  type="button"
                  key={String(o.v)}
                  onClick={() => set('is_local_shareholding_30_percent', o.v)}
                  aria-pressed={active}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${
                    active ? 'border-primary bg-primary-soft/60 ring-1 ring-primary' : 'border-hairline hover:border-primary/30'
                  }`}
                >
                  <span className="block text-sm font-semibold">{o.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{o.body}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section step="04" title="What you want to do" hint="Grants fund projects, not businesses. Pick everything you are seriously considering in the next 12 months.">
          <div className="flex flex-wrap gap-2">
            {INITIATIVES.map((i) => {
              const active = form.planned_initiatives.includes(i.value);
              return (
                <button
                  type="button"
                  key={i.value}
                  title={i.hint}
                  onClick={() => toggleInitiative(i.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                    active ? 'border-primary bg-primary text-white' : 'border-hairline bg-surface text-ink hover:border-primary/40'
                  }`}
                >
                  {active && <IconCheck className="h-3.5 w-3.5" />}
                  {i.label}
                </button>
              );
            })}
          </div>
          <div>
            <label className="label" htmlFor="notes">
              Anything specific? <span className="font-normal text-faint">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={4}
              className="input resize-y leading-relaxed"
              value={form.project_notes}
              onChange={(e) => set('project_notes', e.target.value)}
              placeholder="We want to replace our paper order forms with an online ordering system, and start supplying cafes in Johor Bahru next year."
              maxLength={1500}
            />
            <p className="mt-1.5 text-xs text-faint">This helps the AI judge fit. It is never shared.</p>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-4 z-10">
        <div className="card flex flex-col gap-3 p-4 shadow-lift sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-hairline">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completeness / 7) * 100}%` }} />
            </div>
            <p className="text-sm text-muted">
              {error ? <span className="text-ineligible-ink">{error}</span> : saved ? 'Saved' : `${completeness} of 7 filled in`}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" disabled={saving !== null} onClick={() => submit(false)}>
              {saving === 'save' ? 'Saving…' : 'Save'}
            </button>
            <button type="submit" className="btn-primary" disabled={saving !== null}>
              {saving === 'match' ? 'Matching grants…' : 'Save and find grants'}
              {saving !== 'match' && <IconArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
