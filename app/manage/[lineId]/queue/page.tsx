import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserBusiness,
  getLineWithPositions
} from '@/utils/supabase/queries';
import RealtimeRefresh from '@/components/RealtimeRefresh';
import QueueVisual from '@/components/ui/LineForms/QueueVisual';

export default async function LineQueueFullscreenPage({
  params
}: {
  params: Promise<{ lineId: string }>;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const { lineId } = await params;
  const business = await getUserBusiness(supabase);

  if (!business) {
    return redirect('/account');
  }

  const lineData = await getLineWithPositions(supabase, lineId);

  if (!lineData || !lineData.id || lineData.business_id !== business.id) {
    return redirect('/manage');
  }

  const waitingPositions = (lineData.positions || []).filter(
    (p: any) => p.status === 'waiting'
  );
  const calledPositions = (lineData.positions || []).filter(
    (p: any) => p.status === 'called'
  );
  const currentPosition =
    calledPositions.find((p: any) => p.position === lineData.position) ?? null;

  const fmtNum = (n: number | null | undefined) =>
    String(n ?? 0).padStart(3, '0');

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: 'var(--pq-bg)',
        padding: 'clamp(20px, 3vw, 48px)'
      }}
    >
      <RealtimeRefresh lineId={lineId} />

      <Link
        href={`/manage/${lineId}`}
        className="pq-mono absolute"
        style={{
          top: 16,
          left: 16,
          color: 'var(--pq-ink-3)',
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          zIndex: 1
        }}
      >
        ← Back
      </Link>

      <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
        <div className="min-w-0 flex items-end gap-6 flex-wrap">
          <div className="min-w-0">
            <div className="pq-eyebrow mb-2">
              <span className="pq-dot" />
              Now serving
            </div>
            <div
              className="pq-ticket-number"
              style={{
                fontSize: 'clamp(64px, 10vw, 160px)',
                color: currentPosition
                  ? 'var(--pq-accent)'
                  : 'var(--pq-ink-3)',
                lineHeight: 0.9,
                fontWeight: 500,
                textShadow: currentPosition
                  ? '0 0 60px oklch(0.88 0.19 125 / 0.3)'
                  : 'none'
              }}
            >
              {currentPosition ? `#${fmtNum(currentPosition.position)}` : '—'}
            </div>
          </div>
          {currentPosition && (
            <div className="min-w-0 pb-2">
              <div className="pq-label" style={{ marginBottom: 4 }}>
                Customer
              </div>
              <div
                className="break-words"
                style={{
                  fontSize: 'clamp(20px, 3vw, 40px)',
                  color: 'var(--pq-ink-0)',
                  fontWeight: 500,
                  letterSpacing: '-0.01em'
                }}
              >
                {currentPosition.name}
              </div>
            </div>
          )}
        </div>
        <div
          className="pq-mono pb-2 flex-shrink-0"
          style={{
            fontSize: 'clamp(11px, 1vw, 14px)',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--pq-ink-3)'
          }}
        >
          {waitingPositions.length} waiting · next #
          {waitingPositions[0]
            ? fmtNum(waitingPositions[0].position)
            : '—'}
        </div>
      </div>

      <div
        className="pq-card relative overflow-hidden flex-1 flex items-center"
        style={{
          padding: 'clamp(20px, 3vw, 48px)',
          background:
            'linear-gradient(180deg, var(--pq-surface-1) 0%, var(--pq-surface-0) 100%)'
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(900px 360px at 6% 50%, oklch(0.88 0.19 125 / 0.10), transparent 65%)'
          }}
        />
        <div className="relative w-full">
          <QueueVisual
            positions={waitingPositions as any}
            nowServing={lineData.position}
            servingPosition={currentPosition as any}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}
