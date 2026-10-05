'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { IconAlert, IconCheck, IconCopy, IconRefresh, IconSparkle } from '@/components/layout/icons';
import { ApiError, api } from '@/lib/api';
import { timeAgo, wordCount } from '@/lib/format';
import type { NarrativeDraft } from '@/lib/types';

type SectionKey = 'project_justification' | 'expected_outcomes_section' | 'implementation_plan';

const SECTIONS: { key: SectionKey; title: string; hint: string }[] = [
  { key: 'project_justification', title: 'Project justification', hint: 'The problem, why now, and why this project fixes it.' },
  { key: 'expected_outcomes_section', title: 'Expected outcomes', hint: 'Measurable results with a baseline and a target.' },
  { key: 'implementation_plan', title: 'Implementation plan', hint: 'Milestones, timing, owners and how you will track progress.' },
];

const PLACEHOLDER = /\[FILL IN:[^\]]*\]/g;

const STEPS = ['Reading your project notes', 'Matching it to what assessors look for', 'Writing the three sections', 'Flagging the gaps'];

function countPlaceholders(text: string) {
  return text.match(PLACEHOLDER)?.length ?? 0;
}

/** Renders text with [FILL IN: …] placeholders highlighted so gaps are impossible to miss. */
function Preview({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-3 text-[15px] leading-[1.75] text-ink/90">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n');
        const isList = lines.every((l) => /^\s*[-•]\s+/.test(l));
        const render = (s: string) =>
          s.split(/(\[FILL IN:[^\]]*\])/g).map((part, j) =>
            part.startsWith('[FILL IN:') ? (
              <mark key={j} className="rounded bg-caution-soft px-1 py-0.5 font-medium text-caution-ink ring-1 ring-caution/20">
                {part}
              </mark>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            )
          );
        return isList ? (
          <ul key={i} className="space-y-1.5">
            {lines.map((l, k) => (
              <li key={k} className="flex gap-2.5">
                <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>{render(l.replace(/^\s*[-•]\s+/, ''))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{render(para)}</p>
        );
      })}
    </div>
  );
}

export default function NarrativeDrafter({
  applicationId,
  initialDraft,
  draftedAt,
  hasProject,
  remaining,
  tier,
}: {
  applicationId: string;
  initialDraft: NarrativeDraft | null;
  draftedAt: string | null;
  hasProject: boolean;
  remaining: number;
  tier: 'free' | 'pro';
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<NarrativeDraft | null>(initialDraft);
  const [saved, setSaved] = useState<NarrativeDraft | null>(initialDraft);
  const [lastDrafted, setLastDrafted] = useState(draftedAt);
  const [left, setLeft] = useState(remaining);
  const [mode, setMode] = useState<Record<SectionKey, 'preview' | 'edit'>>({
    project_justification: 'preview',
    expected_outcomes_section: 'preview',
    implementation_plan: 'preview',
  });
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const gaps = draft ? SECTIONS.reduce((n, s) => n + countPlaceholders(draft[s.key]), 0) : 0;

  useEffect(() => {
    if (!generating) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 3500);
    return () => clearInterval(t);
  }, [generating]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function generate() {
    if (draft && !confirm('Write a fresh draft? Your current text will be replaced.')) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api<{ draft: NarrativeDraft; drafted_at: string; remaining: number }>('/api/narrative/draft', {
        method: 'POST',
        json: { application_id: applicationId },
      });
      setDraft(res.draft);
      setSaved(res.draft);
      setLastDrafted(res.drafted_at);
      setLeft(res.remaining);
      router.refresh();
    } catch (e) {
      const upgrade = e instanceof ApiError && (e.data as { upgrade?: boolean })?.upgrade;
      setError({ text: e instanceof Error ? e.message : 'Drafting failed', upgrade });
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/api/applications/${applicationId}`, { method: 'PATCH', json: { narrative_draft: draft } });
      setSaved(draft);
    } catch (e) {
      setError({ text: e instanceof Error ? e.message : 'Could not save' });
    } finally {
      setSaving(false);
    }
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      setError({ text: 'Copy failed. Select the text and copy it manually.' });
    }
  }

  const allText = draft ? SECTIONS.map((s) => `${s.title}\n\n${draft[s.key]}`).join('\n\n\n') : '';

  if (!draft) {
    return (
      <div className="card overflow-hidden">
        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <IconSparkle className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-[28px] font-semibold leading-tight tracking-tight">Turn your notes into the written sections</h2>
            <p className="mt-3 leading-relaxed text-muted">
              We use your business profile and project notes to write a first draft of the project justification, expected outcomes and
              implementation plan. Nothing is made up: wherever a real figure is needed you will see a highlighted placeholder to fill in.
            </p>
            {error && (
              <p className="mt-5 rounded-xl bg-ineligible-soft px-4 py-3 text-sm text-ineligible-ink">
                {error.text}
                {error.upgrade && (
                  <>
                    {' '}
                    <Link href="/settings" className="font-semibold underline">
                      See plans
                    </Link>
                  </>
                )}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={generate} disabled={generating || !hasProject} className="btn-primary px-5 py-3">
                <IconSparkle className="h-4 w-4" />
                {generating ? 'Drafting…' : 'Draft my narrative'}
              </button>
              <span className="text-xs text-muted">
                {tier === 'free' ? `${left} free draft${left === 1 ? '' : 's'} left this month` : `${left} drafts left this month`}
              </span>
            </div>
            {!hasProject && (
              <p className="mt-3 text-sm text-caution-ink">
                <Link href={`/applications/${applicationId}`} className="font-semibold underline">
                  Describe the project
                </Link>{' '}
                before drafting.
              </p>
            )}
          </div>

          <ol className="space-y-3 rounded-2xl bg-background p-5">
            {STEPS.map((s, i) => {
              const done = generating && i < step;
              const current = generating && i === step;
              return (
                <li key={s} className={`flex items-center gap-3 text-sm ${current ? 'font-semibold text-ink' : done ? 'text-eligible-ink' : 'text-muted'}`}>
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-mono ${
                      done ? 'border-eligible bg-eligible text-white' : current ? 'border-primary text-primary' : 'border-hairline bg-surface'
                    }`}
                  >
                    {done ? <IconCheck className="h-3.5 w-3.5" /> : current ? <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> : i + 1}
                  </span>
                  {s}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        {SECTIONS.map((s, idx) => {
          const text = draft[s.key];
          const holes = countPlaceholders(text);
          return (
            <section key={s.key} className="card overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-3.5 sm:px-6">
                <div>
                  <p className="font-mono text-[11px] text-primary">0{idx + 1}</p>
                  <h2 className="font-display text-lg font-semibold tracking-tight">{s.title}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="mr-2 text-xs text-faint tabular">{wordCount(text)} words</span>
                  {holes > 0 && <span className="mr-1 rounded-full bg-caution-soft px-2 py-0.5 text-xs font-semibold text-caution-ink">{holes} to fill</span>}
                  <div className="flex rounded-lg border border-hairline p-0.5 text-xs font-semibold">
                    {(['preview', 'edit'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode((cur) => ({ ...cur, [s.key]: m }))}
                        className={`rounded-md px-2.5 py-1 capitalize ${mode[s.key] === m ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => copy(s.key, text)} className="btn-ghost px-2 py-1.5" aria-label={`Copy ${s.title}`}>
                    {copied === s.key ? <IconCheck className="h-4 w-4 text-eligible" /> : <IconCopy className="h-4 w-4" />}
                  </button>
                </div>
              </header>
              <div className="px-5 py-5 sm:px-6">
                {mode[s.key] === 'edit' ? (
                  <textarea
                    value={text}
                    onChange={(e) => setDraft({ ...draft, [s.key]: e.target.value })}
                    rows={Math.min(24, Math.max(8, text.split('\n').length + Math.ceil(text.length / 90)))}
                    className="input resize-y font-sans leading-[1.75]"
                    aria-label={s.title}
                  />
                ) : (
                  <Preview text={text} />
                )}
              </div>
            </section>
          );
        })}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="card p-5">
          <p className="eyebrow">Draft</p>
          <p className="mt-1.5 text-sm text-muted">Written {timeAgo(lastDrafted)}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={save} disabled={!dirty || saving} className="btn-primary">
              {saving ? 'Saving…' : dirty ? 'Save edits' : 'All changes saved'}
            </button>
            <button type="button" onClick={() => copy('all', allText)} className="btn-secondary">
              {copied === 'all' ? <IconCheck className="h-4 w-4 text-eligible" /> : <IconCopy className="h-4 w-4" />}
              Copy all sections
            </button>
            <button type="button" onClick={generate} disabled={generating || left <= 0} className="btn-ghost">
              <IconRefresh className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Redrafting…' : 'Redraft from notes'}
            </button>
            <p className="text-center text-xs text-faint">{left} draft{left === 1 ? '' : 's'} left this month</p>
          </div>
          {error && (
            <p className="mt-3 rounded-xl bg-ineligible-soft px-3 py-2 text-xs text-ineligible-ink">
              {error.text}
              {error.upgrade && (
                <>
                  {' '}
                  <Link href="/settings" className="font-semibold underline">
                    See plans
                  </Link>
                </>
              )}
            </p>
          )}
        </div>

        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <IconAlert className="h-4 w-4 text-caution" />
            Before you submit
          </p>
          <p className="mt-1 text-xs text-muted">
            {gaps > 0 ? `${gaps} placeholder${gaps === 1 ? '' : 's'} still in the text.` : 'No placeholders left in the text.'}
          </p>
          {draft.missing_information.length > 0 && (
            <ul className="mt-3 space-y-2">
              {draft.missing_information.map((m) => (
                <li key={m} className="flex gap-2 text-sm leading-snug text-ink/85">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-caution" />
                  {m}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-hairline pt-3 text-xs leading-relaxed text-faint">
            This is a starting point, not a submission. Read every line, replace placeholders with real figures and check the agency&apos;s
            current template before pasting it into the official portal.
          </p>
        </div>
      </aside>
    </div>
  );
}
