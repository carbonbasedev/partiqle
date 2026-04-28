import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLineWithPositions } from '@/utils/supabase/queries';
import TicketAlert from '@/components/TicketAlert';

export default async function PublicPositionPage({
  params
}: {
  params: Promise<{ lineId: string; positionId: string }>;
}) {
  const supabase = await createClient();

  const { lineId, positionId } = await params;
  const lineData = await getLineWithPositions(supabase, lineId);

  if (!lineData || !lineData.positions) {
    return notFound();
  }

  const position = (lineData.positions as any[]).find(
    (p) => String(p.id) === String(positionId)
  );

  if (!position) {
    return notFound();
  }

  const peopleAhead = (lineData.positions as any[]).filter(
    (p) => p.status === 'waiting' && p.position < position.position
  ).length;

  const isCalled = position.status === 'called';
  const isSkipped = position.status === 'skipped';

  const fmtNum = (n: number) => String(n).padStart(3, '0');

  // Wait ratio — how close to the front (0 = just joined, 1 = now serving)
  const total = (lineData.positions as any[]).filter((p) => p.status === 'waiting').length + peopleAhead;
  const progress = total > 0 ? 1 - peopleAhead / total : 1;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--pq-bg)' }}
    >
      <div className="pq-grid-bg absolute inset-0 pointer-events-none opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: isCalled
            ? 'radial-gradient(900px 600px at 50% 30%, oklch(0.88 0.19 125 / 0.18), transparent 60%)'
            : 'radial-gradient(800px 500px at 50% 0%, oklch(0.72 0.18 290 / 0.10), transparent 60%)'
        }}
      />

      <TicketAlert
        positionId={String(positionId)}
        lineId={lineId}
        initialStatus={String(position.status)}
      />

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="pq-eyebrow mb-3" style={{ justifyContent: 'center' }}>
            <span className="pq-dot" />
            {isCalled ? 'Called — head in' : isSkipped ? 'Skipped' : 'Your ticket'}
          </div>
          <div
            className="pq-mono mb-2"
            style={{
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--pq-ink-3)'
            }}
          >
            Line
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--pq-ink-0)',
              lineHeight: 1.1
            }}
          >
            {lineData.name}
          </h1>
        </div>

        {/* Ticket card */}
        <div
          className="pq-card relative overflow-hidden"
          style={{
            padding: 0,
            background: isCalled
              ? 'linear-gradient(135deg, oklch(0.88 0.19 125 / 0.10) 0%, var(--pq-surface-0) 70%)'
              : 'linear-gradient(180deg, var(--pq-surface-1) 0%, var(--pq-surface-0) 100%)',
            borderColor: isCalled ? 'oklch(0.88 0.19 125 / 0.35)' : undefined
          }}
        >
          {/* Perforated tear-strip at top */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{
              borderBottom: '1px dashed var(--pq-border-strong)',
              background: 'var(--pq-surface-0)'
            }}
          >
            <div
              className="pq-mono"
              style={{
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--pq-ink-3)'
              }}
            >
              Ticket · {String(position.id).slice(0, 8).toUpperCase()}
            </div>
            <div
              className="pq-chip"
              style={
                isCalled
                  ? { background: 'oklch(0.88 0.19 125 / 0.12)', color: 'var(--pq-accent)', borderColor: 'oklch(0.88 0.19 125 / 0.4)' }
                  : isSkipped
                    ? { background: 'rgba(255,255,255,0.03)', color: 'var(--pq-ink-3)' }
                    : {}
              }
            >
              {isCalled && <span className="pq-dot" style={{ width: 5, height: 5 }} />}
              {isCalled ? 'Now serving' : isSkipped ? 'Skipped' : 'Waiting'}
            </div>
          </div>

          {/* Big number */}
          <div className="px-6 py-10 text-center">
            <div
              className="pq-mono mb-3"
              style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--pq-ink-3)'
              }}
            >
              Your position
            </div>
            <div
              className="pq-ticket-number"
              style={{
                fontSize: 'clamp(96px, 26vw, 168px)',
                color: isCalled ? 'var(--pq-accent)' : 'var(--pq-ink-0)',
                lineHeight: 0.9,
                fontWeight: 500,
                textShadow: isCalled ? '0 0 50px oklch(0.88 0.19 125 / 0.35)' : 'none'
              }}
            >
              #{fmtNum(position.position)}
            </div>
            {position.name && (
              <div
                className="mt-5"
                style={{
                  fontSize: 18,
                  color: 'var(--pq-ink-1)',
                  fontWeight: 500,
                  letterSpacing: '-0.01em'
                }}
              >
                {position.name}
              </div>
            )}
            {position.phone && (
              <div
                className="pq-mono mt-1"
                style={{ color: 'var(--pq-ink-3)', fontSize: 12 }}
              >
                {position.phone}
              </div>
            )}
          </div>

          {/* Status strip */}
          {isCalled ? (
            <div
              className="px-6 py-5"
              style={{
                background: 'oklch(0.88 0.19 125 / 0.08)',
                borderTop: '1px solid oklch(0.88 0.19 125 / 0.2)'
              }}
            >
              <p
                className="text-center"
                style={{ color: 'var(--pq-accent)', fontSize: 15, fontWeight: 500 }}
              >
                It&apos;s your turn — head to the counter.
              </p>
            </div>
          ) : isSkipped ? (
            <div
              className="px-6 py-5"
              style={{ background: 'var(--pq-surface-0)', borderTop: '1px solid var(--pq-border)' }}
            >
              <p
                className="text-center"
                style={{ color: 'var(--pq-ink-2)', fontSize: 14 }}
              >
                Your position was skipped. Check in with staff to rejoin.
              </p>
            </div>
          ) : (
            <div
              className="px-6 py-6"
              style={{
                background: 'var(--pq-surface-0)',
                borderTop: '1px solid var(--pq-border)'
              }}
            >
              {/* People ahead */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="pq-mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--pq-ink-3)'
                  }}
                >
                  People ahead
                </div>
                <div
                  className="pq-ticket-number"
                  style={{ fontSize: 28, color: 'var(--pq-ink-0)' }}
                >
                  {fmtNum(peopleAhead)}
                </div>
              </div>

              {/* Progress track */}
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: 'var(--pq-surface-2)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(6, progress * 100)}%`,
                    background:
                      'linear-gradient(90deg, oklch(0.72 0.18 290), oklch(0.88 0.19 125))',
                    borderRadius: 999,
                    transition: 'width 400ms ease'
                  }}
                />
              </div>

              <div
                className="pq-mono flex items-center justify-between mt-3"
                style={{
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--pq-ink-3)'
                }}
              >
                <span>Joined</span>
                <span>Now serving #{lineData.position ? fmtNum(lineData.position) : '—'}</span>
                <span>You</span>
              </div>
            </div>
          )}
        </div>

        {/* Helper caption */}
        <p
          className="text-center mt-8"
          style={{ color: 'var(--pq-ink-2)', fontSize: 13, lineHeight: 1.55, maxWidth: 360, margin: '32px auto 0' }}
        >
          Keep this page open. It updates automatically as the line moves — refresh if you don&apos;t see changes.
        </p>
        <p
          className="pq-mono text-center mt-6"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--pq-ink-3)'
          }}
        >
          Powered by Partiqle
        </p>
      </div>
    </section>
  );
}
