'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { togglePaused, resetLine, deleteLine } from '@/utils/supabase/server-actions/lines';
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
  const [confirming, setConfirming] = useState<false | 'reset' | 'delete'>(
    false
  );
  const [busy, setBusy] = useState<
    'pause' | 'reset' | 'delete' | 'test' | null
  >(null);

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

  const onDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    setBusy('delete');
    await handleRequest(e, deleteLine, router);
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

      {confirming === 'reset' ? (
        <ConfirmRow
          message="Delete all positions and restart at #1?"
          confirmLabel={busy === 'reset' ? 'Resetting…' : 'Yes, reset'}
          onSubmit={onReset}
          onCancel={() => setConfirming(false)}
          lineId={lineId}
          businessId={businessId}
          busy={busy === 'reset'}
        />
      ) : confirming === 'delete' ? (
        <ConfirmRow
          message="Permanently delete this line and all its data?"
          confirmLabel={busy === 'delete' ? 'Deleting…' : 'Yes, delete'}
          onSubmit={onDelete}
          onCancel={() => setConfirming(false)}
          lineId={lineId}
          businessId={businessId}
          busy={busy === 'delete'}
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setConfirming('reset')}
            className="pq-mono"
            style={dangerOutlineStyle}
          >
            Reset line
          </button>
          <button
            type="button"
            onClick={() => setConfirming('delete')}
            className="pq-mono"
            style={dangerOutlineStyle}
          >
            Delete line
          </button>
        </>
      )}
    </div>
  );
}

const dangerOutlineStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--pq-rose, oklch(0.7 0.18 20))',
  padding: '8px 14px',
  border: '1px solid rgba(244, 63, 94, 0.35)',
  borderRadius: 8,
  background: 'rgba(244, 63, 94, 0.06)',
  cursor: 'pointer'
};

function ConfirmRow({
  message,
  confirmLabel,
  onSubmit,
  onCancel,
  lineId,
  businessId,
  busy
}: {
  message: string;
  confirmLabel: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  lineId: string;
  businessId: string;
  busy: boolean;
}) {
  return (
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
        {message}
      </span>
      <form onSubmit={onSubmit} style={{ display: 'inline-flex', gap: 8 }}>
        <input type="hidden" name="lineId" value={lineId} />
        <input type="hidden" name="businessId" value={businessId} />
        <button
          type="submit"
          disabled={busy}
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
            cursor: busy ? 'wait' : 'pointer'
          }}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
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
  );
}
