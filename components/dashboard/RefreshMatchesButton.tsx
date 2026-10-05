'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconRefresh, IconSparkle } from '@/components/layout/icons';
import { api } from '@/lib/api';

type MatchResponse = { source: 'ai' | 'rules'; eligible: number; ai_remaining: number; notice: string | null };

export default function RefreshMatchesButton({ firstRun = false, aiRemaining }: { firstRun?: boolean; aiRemaining: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'warn' | 'error'; text: string } | null>(null);

  async function run() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await api<MatchResponse>('/api/grants/match', { method: 'POST', json: {} });
      setMessage(
        res.notice
          ? { tone: 'warn', text: res.notice }
          : { tone: 'ok', text: `Done. ${res.eligible} likely eligible. ${res.ai_remaining} AI refresh${res.ai_remaining === 1 ? '' : 'es'} left this month.` }
      );
      router.refresh();
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : 'Matching failed' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button type="button" onClick={run} disabled={busy} className={firstRun ? 'btn-primary px-5 py-3' : 'btn-secondary'}>
        {firstRun ? <IconSparkle className="h-4 w-4" /> : <IconRefresh className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />}
        {busy ? 'Matching against every grant…' : firstRun ? 'Find my grants' : 'Refresh matches'}
      </button>
      {message ? (
        <p
          className={`max-w-xs text-xs sm:text-right ${
            message.tone === 'error' ? 'text-ineligible-ink' : message.tone === 'warn' ? 'text-caution-ink' : 'text-eligible-ink'
          }`}
        >
          {message.text}
        </p>
      ) : (
        <p className="text-xs text-faint">
          {aiRemaining > 0 ? `${aiRemaining} AI refresh${aiRemaining === 1 ? '' : 'es'} left this month` : 'Rules based scoring until next month'}
        </p>
      )}
    </div>
  );
}
