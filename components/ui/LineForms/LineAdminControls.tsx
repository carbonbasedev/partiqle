'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { togglePaused, resetLine } from '@/utils/supabase/server-actions/lines';
import { addTestCustomers } from '@/utils/supabase/server-actions/positions';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';

export default function LineAdminControls({
  lineId,
  businessId,
  paused
}: {
  lineId: string;
  businessId: string;
  paused: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<'pause' | 'reset' | 'test' | null>(null);

  const onTogglePaused = async (e: React.FormEvent<HTMLFormElement>) => {
    setBusy('pause');
    await handleRequest(e, togglePaused, router);
    setBusy(null);
  };

  const onAddTest = async (e: React.FormEvent<HTMLFormElement>) => {
    setBusy('test');
    await handleRequest(e, addTestCustomers, router);
    setBusy(null);
  };

  const onReset = async (e: React.FormEvent<HTMLFormElement>) => {
    setBusy('reset');
    await handleRequest(e, resetLine, router);
    setBusy(null);
    setConfirming(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={onTogglePaused}>
        <input type="hidden" name="lineId" value={lineId} />
        <input type="hidden" name="businessId" value={businessId} />
        <input type="hidden" name="paused" value={String(paused)} />
        <Button variant="slim" type="submit" loading={busy === 'pause'}>
          {paused ? '▶  Resume line' : '❚❚  Pause line'}
        </Button>
      </form>

      <form onSubmit={onAddTest}>
        <input type="hidden" name="lineId" value={lineId} />
        <input type="hidden" name="businessId" value={businessId} />
        <Button variant="slim" type="submit" loading={busy === 'test'}>
          {busy === 'test' ? 'Adding…' : '+ Add test customers'}
        </Button>
      </form>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="pq-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pq-rose, oklch(0.7 0.18 20))',
            padding: '8px 14px',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: 8,
            background: 'rgba(244, 63, 94, 0.06)',
            cursor: 'pointer'
          }}
        >
          Reset line
        </button>
      ) : (
        <div
          className="flex flex-wrap items-center gap-2 pq-mono"
          style={{
            padding: '8px 12px',
            border: '1px solid rgba(244, 63, 94, 0.45)',
            borderRadius: 8,
            background: 'rgba(244, 63, 94, 0.10)',
            fontSize: 11,
            letterSpacing: '0.10em',
            color: 'var(--pq-ink-1)'
          }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.16em' }}>
            Delete all positions and restart at #1?
          </span>
          <form onSubmit={onReset} style={{ display: 'inline-flex', gap: 8 }}>
            <input type="hidden" name="lineId" value={lineId} />
            <input type="hidden" name="businessId" value={businessId} />
            <button
              type="submit"
              disabled={busy === 'reset'}
              className="pq-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#fff',
                padding: '6px 12px',
                border: '1px solid rgba(244, 63, 94, 0.6)',
                borderRadius: 6,
                background: 'rgba(244, 63, 94, 0.7)',
                cursor: busy === 'reset' ? 'wait' : 'pointer'
              }}
            >
              {busy === 'reset' ? 'Resetting…' : 'Yes, reset'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="pq-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--pq-ink-2)',
                padding: '6px 12px',
                border: '1px solid var(--pq-border)',
                borderRadius: 6,
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
