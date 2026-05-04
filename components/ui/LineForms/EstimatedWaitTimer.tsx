'use client';

import { useEffect, useRef, useState } from 'react';

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${String(mm).padStart(2, '0')}m`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function EstimatedWaitTimer({
  avgSeconds,
  peopleAhead
}: {
  avgSeconds: number | null;
  peopleAhead: number;
}) {
  const totalSeconds =
    avgSeconds != null && avgSeconds >= 0
      ? avgSeconds * Math.max(0, peopleAhead)
      : null;

  const startedAtRef = useRef<number>(Date.now());
  const [now, setNow] = useState(() => Date.now());

  // Reset the anchor whenever the inputs change (e.g. admin presses Call Next).
  useEffect(() => {
    startedAtRef.current = Date.now();
    setNow(Date.now());
  }, [totalSeconds]);

  useEffect(() => {
    if (totalSeconds == null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [totalSeconds]);

  const elapsed = (now - startedAtRef.current) / 1000;
  const remaining =
    totalSeconds != null ? Math.max(0, totalSeconds - elapsed) : null;

  const reachedZero = remaining != null && remaining <= 0;

  return (
    <div className="pq-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div
          className="pq-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--pq-ink-3)'
          }}
        >
          Estimated wait
        </div>
        {peopleAhead > 0 && (
          <div
            className="pq-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--pq-ink-3)'
            }}
          >
            {peopleAhead} ahead
          </div>
        )}
      </div>

      {totalSeconds == null ? (
        <p style={{ color: 'var(--pq-ink-2)', fontSize: 14 }}>
          Estimate becomes available after the first turn is served.
        </p>
      ) : reachedZero ? (
        <p
          className="text-center"
          style={{
            color: 'var(--pq-accent)',
            fontSize: 16,
            fontWeight: 500,
            padding: '8px 0'
          }}
        >
          You will be called shortly.
        </p>
      ) : (
        <div
          className="pq-ticket-number text-center"
          style={{
            fontSize: 'clamp(40px, 12vw, 64px)',
            color: 'var(--pq-ink-0)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {formatDuration(remaining ?? 0)}
        </div>
      )}
    </div>
  );
}
