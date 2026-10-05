'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconPlus } from '@/components/layout/icons';
import { api } from '@/lib/api';

export default function TrackGrantButton({ grantId, label = 'Start an application' }: { grantId: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const { application } = await api<{ application: { id: string } }>('/api/applications', {
        method: 'POST',
        json: { grant_id: grantId },
      });
      router.push(`/applications/${application.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the application');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button type="button" onClick={start} disabled={busy} className="btn-primary">
        <IconPlus className="h-4 w-4" />
        {busy ? 'Setting up…' : label}
      </button>
      {error && <p className="max-w-xs text-xs text-ineligible-ink">{error}</p>}
    </div>
  );
}
