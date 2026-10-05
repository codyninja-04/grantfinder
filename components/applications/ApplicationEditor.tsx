'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconTrash } from '@/components/layout/icons';
import { api } from '@/lib/api';
import { wordCount } from '@/lib/format';
import { STATUSES } from '@/lib/options';
import type { ApplicationStatus, GrantApplication } from '@/lib/types';

export default function ApplicationEditor({ application, grantName }: { application: GrantApplication; grantName: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: application.title ?? '',
    status: application.status,
    requested_amount: application.requested_amount?.toString() ?? '',
    target_submit_date: application.target_submit_date ?? '',
    project_description: application.project_description ?? '',
    expected_outcomes: application.expected_outcomes ?? '',
    notes: application.notes ?? '',
  });
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'deleting'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (state === 'saved') setState('idle');
  };

  async function save() {
    setState('saving');
    setError(null);
    try {
      await api(`/api/applications/${application.id}`, {
        method: 'PATCH',
        json: { ...form, requested_amount: form.requested_amount === '' ? null : Number(form.requested_amount) },
      });
      setState('saved');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
      setState('idle');
    }
  }

  async function remove() {
    if (!confirm('Remove this application from your tracker? Any draft narrative will be lost.')) return;
    setState('deleting');
    try {
      await api(`/api/applications/${application.id}`, { method: 'DELETE' });
      router.push('/applications');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete');
      setState('idle');
    }
  }

  return (
    <form
      className="card space-y-6 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">
            Project name
          </label>
          <input
            id="title"
            className="input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder={`e.g. ${grantName} for online ordering`}
            maxLength={140}
          />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" className="input" value={form.status} onChange={(e) => set('status', e.target.value as ApplicationStatus)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="amount">
              Amount (S$)
            </label>
            <input
              id="amount"
              type="number"
              min={0}
              inputMode="numeric"
              className="input font-mono tabular"
              value={form.requested_amount}
              onChange={(e) => set('requested_amount', e.target.value)}
              placeholder="40000"
            />
          </div>
          <div>
            <label className="label" htmlFor="date">
              Submit by
            </label>
            <input id="date" type="date" className="input" value={form.target_submit_date} onChange={(e) => set('target_submit_date', e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label className="label" htmlFor="desc">
            What is the project?
          </label>
          <span className="text-xs text-faint tabular">{wordCount(form.project_description)} words</span>
        </div>
        <textarea
          id="desc"
          rows={6}
          className="input resize-y leading-relaxed"
          value={form.project_description}
          onChange={(e) => set('project_description', e.target.value)}
          placeholder="Rough notes are fine. What problem are you fixing, what will you buy or build, who is the vendor, how long will it take?"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label className="label" htmlFor="outcomes">
            What should change because of it?
          </label>
          <span className="text-xs text-faint tabular">{wordCount(form.expected_outcomes)} words</span>
        </div>
        <textarea
          id="outcomes"
          rows={4}
          className="input resize-y leading-relaxed"
          value={form.expected_outcomes}
          onChange={(e) => set('expected_outcomes', e.target.value)}
          placeholder="Numbers help a lot. Today we process 40 orders a day by hand, we want 120 with the same two staff."
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Private notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="input resize-y leading-relaxed"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Quotes requested, contacts at the agency, documents still needed…"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={remove} disabled={state === 'deleting'} className="btn-ghost justify-start text-ineligible-ink hover:bg-ineligible-soft hover:text-ineligible-ink">
          <IconTrash className="h-4 w-4" />
          {state === 'deleting' ? 'Removing…' : 'Remove'}
        </button>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-ineligible-ink">{error}</span>}
          {state === 'saved' && <span className="text-sm text-eligible-ink">Saved</span>}
          <button type="submit" className="btn-primary" disabled={state === 'saving'}>
            {state === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
