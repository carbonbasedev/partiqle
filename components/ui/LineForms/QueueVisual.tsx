interface QueuePosition {
  id: number | string;
  position: number;
  name: string;
  status: string;
}

export default function QueueVisual({
  positions,
  nowServing
}: {
  positions: QueuePosition[];
  nowServing: number | null | undefined;
}) {
  const waiting = positions
    .filter((p) => p.status === 'waiting')
    .sort((a, b) => Number(a.position) - Number(b.position));

  const max = 14;
  const visible = waiting.slice(0, max);
  const overflow = Math.max(0, waiting.length - max);

  if (waiting.length === 0) {
    return (
      <div
        className="pq-mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--pq-ink-3)',
          padding: '24px 0'
        }}
      >
        Queue empty — waiting for joins
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Flow line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          top: 14,
          height: 1,
          background:
            'linear-gradient(90deg, oklch(0.88 0.19 125 / 0.6), rgba(255,255,255,0.05))'
        }}
      />
      <div className="relative flex items-start gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {visible.map((p, i) => {
          const isNext = i === 0;
          return (
            <div
              key={p.id}
              className="flex flex-col items-center shrink-0"
              style={{ minWidth: 44 }}
              title={`#${p.position} · ${p.name}`}
            >
              <div
                style={{
                  width: isNext ? 16 : 10,
                  height: isNext ? 16 : 10,
                  borderRadius: 999,
                  marginTop: isNext ? 6 : 9,
                  background: isNext ? 'oklch(0.88 0.19 125)' : 'rgba(255,255,255,0.55)',
                  boxShadow: isNext ? '0 0 18px oklch(0.88 0.19 125 / 0.55)' : 'none',
                  border: isNext ? '2px solid oklch(0.88 0.19 125 / 0.4)' : 'none'
                }}
              />
              <div
                className="pq-mono mt-2"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  color: isNext ? 'var(--pq-accent)' : 'var(--pq-ink-3)'
                }}
              >
                {String(p.position).padStart(3, '0')}
              </div>
              <div
                className="mt-1 text-center"
                style={{
                  fontSize: 11,
                  color: 'var(--pq-ink-2)',
                  maxWidth: 64,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {p.name}
              </div>
            </div>
          );
        })}
        {overflow > 0 && (
          <div
            className="flex flex-col items-center shrink-0 pq-mono"
            style={{
              minWidth: 44,
              fontSize: 11,
              color: 'var(--pq-ink-3)',
              letterSpacing: '0.14em'
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                marginTop: 9,
                background: 'rgba(255,255,255,0.2)'
              }}
            />
            <div className="mt-2">+{overflow}</div>
            <div className="mt-1" style={{ fontSize: 10 }}>more</div>
          </div>
        )}
      </div>
      {nowServing != null && nowServing > 0 && (
        <div
          className="pq-mono mt-3"
          style={{
            fontSize: 10.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--pq-ink-3)'
          }}
        >
          Now serving #{String(nowServing).padStart(3, '0')}
        </div>
      )}
    </div>
  );
}
