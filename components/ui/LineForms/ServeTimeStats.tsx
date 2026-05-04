'use client';

import { useEffect, useRef, useState } from 'react';

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '—';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${String(mm).padStart(2, '0')}m`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ServeTimeStats({
  calledAt,
  avgSeconds
}: {
  calledAt: string | null;
  avgSeconds: number | null;
}) {
  // Anchor the timer at the moment the page renders (or a new turn starts),
  // not at the DB called_at — closing/leaving the page or pausing the line
  // resets the counter on the next visit / resume.
  const startRef = useRef<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!calledAt) {
      startRef.current = null;
      return;
    }
    startRef.current = Date.now();
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [calledAt]);

  const elapsed =
    calledAt && startRef.current != null
      ? Math.max(0, (now - startRef.current) / 1000)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div
          className="pq-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--pq-ink-3)'
          }}
        >
          Current turn
        </div>
        <div
          className="pq-ticket-number"
          style={{
            fontSize: 32,
            color: elapsed != null ? 'var(--pq-ink-0)' : 'var(--pq-ink-3)',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {elapsed != null ? formatDuration(elapsed) : '—'}
        </div>
      </div>
      <div>
        <div
          className="pq-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--pq-ink-3)'
          }}
        >
          Avg per turn
        </div>
        <div
          className="pq-ticket-number"
          style={{
            fontSize: 32,
            color: avgSeconds != null ? 'var(--pq-ink-1)' : 'var(--pq-ink-3)',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {formatDuration(avgSeconds)}
        </div>
      </div>
    </div>
  );
}
