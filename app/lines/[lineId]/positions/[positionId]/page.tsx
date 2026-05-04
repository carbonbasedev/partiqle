import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLineWithPositions } from '@/utils/supabase/queries';
import TicketAlert from '@/components/TicketAlert';
import LeaveLineButton from '@/components/ui/LineForms/LeaveLineButton';

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

  const aheadList = (lineData.positions as any[])
    .filter(
      (p) => p.status === 'waiting' && p.position < position.position
    )
    .sort((a, b) => Number(a.position) - Number(b.position));

  const peopleAhead = aheadList.length;

  const isCalled = position.status === 'called';
  const isSkipped = position.status === 'skipped';

  const fmtNum = (n: number) => String(n).padStart(3, '0');

  return (
    <section
      className="relative flex items-start justify-center px-4 pt-6 pb-6"
      style={{ background: 'var(--pq-bg)' }}
    >
      <div
        className="pq-grid-bg absolute inset-0 pointer-events-none opacity-60"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: isCalled
            ? 'radial-gradient(900px 600px at 50% 30%, oklch(0.88 0.19 125 / 0.18), transparent 60%)'
            : 'radial-gradient(800px 500px at 50% 0%, oklch(0.72 0.18 290 / 0.10), transparent 60%)'
        }}
      />

      <div className="w-full max-w-md relative flex flex-col gap-4">
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
            className="flex items-center justify-between px-4 sm:px-5 py-3 gap-2"
            style={{
              borderBottom: '1px dashed var(--pq-border-strong)',
              background: 'var(--pq-surface-0)'
            }}
          >
            <div
              className="pq-mono truncate"
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
              className="pq-chip flex-shrink-0"
              style={
                isCalled
                  ? {
                      background: 'oklch(0.88 0.19 125 / 0.12)',
                      color: 'var(--pq-accent)',
                      borderColor: 'oklch(0.88 0.19 125 / 0.4)'
                    }
                  : isSkipped
                    ? {
                        background: 'rgba(255,255,255,0.03)',
                        color: 'var(--pq-ink-3)'
                      }
                    : {}
              }
            >
              {isCalled && (
                <span className="pq-dot" style={{ width: 5, height: 5 }} />
              )}
              {isCalled ? 'Now serving' : isSkipped ? 'Skipped' : 'Waiting'}
            </div>
          </div>

          {/* Big number */}
          <div className="px-5 sm:px-6 py-8 sm:py-10 text-center">
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
              className="pq-ticket-number break-all"
              style={{
                fontSize: 'clamp(80px, 24vw, 168px)',
                color: isCalled ? 'var(--pq-accent)' : 'var(--pq-ink-0)',
                lineHeight: 0.9,
                fontWeight: 500,
                textShadow: isCalled
                  ? '0 0 50px oklch(0.88 0.19 125 / 0.35)'
                  : 'none'
              }}
            >
              #{fmtNum(position.position)}
            </div>
            {position.name && (
              <div
                className="mt-5 break-words"
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
                className="pq-mono mt-1 truncate"
                style={{ color: 'var(--pq-ink-3)', fontSize: 12 }}
              >
                {position.phone}
              </div>
            )}
          </div>

          {/* Status strip */}
          {isCalled ? (
            <div
              className="px-5 sm:px-6 py-5"
              style={{
                background: 'oklch(0.88 0.19 125 / 0.08)',
                borderTop: '1px solid oklch(0.88 0.19 125 / 0.2)'
              }}
            >
              <p
                className="text-center"
                style={{
                  color: 'var(--pq-accent)',
                  fontSize: 15,
                  fontWeight: 500
                }}
              >
                It&apos;s your turn — head to the counter.
              </p>
            </div>
          ) : isSkipped ? (
            <div
              className="px-5 sm:px-6 py-5"
              style={{
                background: 'var(--pq-surface-0)',
                borderTop: '1px solid var(--pq-border)'
              }}
            >
              <p
                className="text-center"
                style={{ color: 'var(--pq-ink-2)', fontSize: 14 }}
              >
                Your position was skipped. Check in with staff to rejoin.
              </p>
            </div>
          ) : null}
        </div>

        {/* Queue visual — only shown while waiting */}
        {!isCalled && !isSkipped && (
          <div className="pq-card p-4 sm:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3 gap-2">
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
                style={{ fontSize: 22, color: 'var(--pq-ink-0)' }}
              >
                {fmtNum(peopleAhead)}
              </div>
            </div>

            <TicketQueueVisual
              ahead={aheadList.map((p) => ({
                id: p.id,
                position: p.position
              }))}
              myPosition={position.position}
            />

            <div
              className="pq-mono flex items-center justify-between mt-3 gap-2"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--pq-ink-3)'
              }}
            >
              <span className="truncate">
                Now serving #
                {lineData.position ? fmtNum(lineData.position) : '—'}
              </span>
              <span className="flex-shrink-0">You · #{fmtNum(position.position)}</span>
            </div>
          </div>
        )}

        {/* Alert + wake-lock controls */}
        <TicketAlert
          positionId={String(positionId)}
          lineId={lineId}
          initialStatus={String(position.status)}
        />

        {!isCalled && !isSkipped && (
          <div className="pq-card p-4 sm:p-5">
            <LeaveLineButton
              positionId={String(positionId)}
              lineId={lineId}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function TicketQueueVisual({
  ahead,
  myPosition
}: {
  ahead: { id: string | number; position: number }[];
  myPosition: number;
}) {
  const max = 24;
  const visible = ahead.slice(-max);
  const overflow = Math.max(0, ahead.length - visible.length);
  const fmt = (n: number) => String(n).padStart(3, '0');

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          top: 14,
          height: 1,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.05), oklch(0.88 0.19 125 / 0.6))'
        }}
      />
      <div
        className="relative flex items-start gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {overflow > 0 && (
          <div
            className="flex flex-col items-center shrink-0 pq-mono"
            style={{
              minWidth: 36,
              fontSize: 10,
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
                background: 'rgba(255,255,255,0.18)'
              }}
            />
            <div className="mt-2">+{overflow}</div>
          </div>
        )}
        {visible.map((p) => (
          <div
            key={p.id}
            className="flex flex-col items-center shrink-0"
            style={{ minWidth: 36 }}
            title={`#${p.position}`}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                marginTop: 9,
                background: 'rgba(255,255,255,0.45)'
              }}
            />
            <div
              className="pq-mono mt-2"
              style={{
                fontSize: 10,
                letterSpacing: '0.12em',
                color: 'var(--pq-ink-3)'
              }}
            >
              {fmt(p.position)}
            </div>
          </div>
        ))}
        {/* My ticket — accent dot */}
        <div
          className="flex flex-col items-center shrink-0"
          style={{ minWidth: 44 }}
          title={`You · #${myPosition}`}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              marginTop: 6,
              background: 'oklch(0.88 0.19 125)',
              boxShadow: '0 0 18px oklch(0.88 0.19 125 / 0.55)',
              border: '2px solid oklch(0.88 0.19 125 / 0.4)'
            }}
          />
          <div
            className="pq-mono mt-2"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--pq-accent)',
              fontWeight: 500
            }}
          >
            {fmt(myPosition)}
          </div>
        </div>
      </div>
    </div>
  );
}
