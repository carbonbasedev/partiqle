import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUser, getBusiness, getLineWithPositions } from '@/utils/supabase/queries';
import AddPositionForm from '@/components/ui/LineForms/AddPositionForm';
import PositionActions from '@/components/ui/LineForms/PositionActions';
import NextInLineButton from '@/components/ui/LineForms/NextInLineButton';
import { getURL } from 'utils/helpers';
import RealtimeRefresh from '@/components/RealtimeRefresh';
import QueueVisual from '@/components/ui/LineForms/QueueVisual';
import LineAdminControls from '@/components/ui/LineForms/LineAdminControls';

export default async function LineManagementPage({
  params
}: {
  params: Promise<{ id: string; lineId: string }>;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const { id, lineId } = await params;
  const business = await getBusiness(supabase, id);

  if (!business) {
    return redirect('/businesses');
  }

  if (business.user_id !== user.id) {
    return redirect('/businesses');
  }

  const lineData = await getLineWithPositions(supabase, lineId);

  if (!lineData || !lineData.id || lineData.business_id !== id) {
    return redirect(`/businesses/${id}/lines`);
  }

  const host = (await headers()).get('host') ?? undefined;
  const publicJoinUrl = getURL(`/lines/${lineId}/join`, host);
  const qrData = encodeURIComponent(publicJoinUrl);
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrData}&bgcolor=0b0b10&color=fafafa&margin=6`;

  const waitingPositions = (lineData.positions || []).filter(
    (p: any) => p.status === 'waiting'
  );
  const calledPositions = (lineData.positions || []).filter(
    (p: any) => p.status === 'called'
  );
  const skippedPositions = (lineData.positions || []).filter(
    (p: any) => p.status === 'skipped'
  );
  const pastCalledPositions = [...calledPositions, ...skippedPositions].sort(
    (a: any, b: any) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    }
  );

  const currentPosition = calledPositions.find(
    (p: any) => p.position === lineData.position
  );

  const lastCalledPosition =
    pastCalledPositions.length > 0 ? pastCalledPositions[0] : null;

  const fmtNum = (n: number | null | undefined) => String(n ?? 0).padStart(3, '0');
  const totalServed = pastCalledPositions.filter((p: any) => p.status === 'called').length;

  return (
    <section className="relative">
      <RealtimeRefresh lineId={lineId} />
      <div className="absolute inset-x-0 top-0 h-[360px] pq-grid-bg pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pb-5 relative">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="pq-eyebrow mb-2">
              <span className="pq-dot" />
              Live · {business.name}
            </div>
            <h1
              style={{
                fontSize: 40,
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: 'var(--pq-ink-0)',
                lineHeight: 1.02
              }}
            >
              {lineData.name}
            </h1>
          </div>
          <LineAdminControls
            lineId={lineId}
            businessId={id}
            paused={Boolean((lineData as any).paused)}
          />
        </div>
        {(lineData as any).paused && (
          <div
            className="pq-mono mt-4 inline-flex items-center gap-2"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid oklch(0.78 0.16 70 / 0.4)',
              background: 'oklch(0.78 0.16 70 / 0.10)',
              color: 'oklch(0.85 0.16 70)',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase'
            }}
          >
            ❚❚  Line paused — new joins blocked
          </div>
        )}
      </div>

      {/* Live queue — full-width visual */}
      <div className="max-w-7xl mx-auto px-6 relative mb-6">
        <div
          className="pq-card relative overflow-hidden"
          style={{
            padding: '20px 24px 18px',
            background:
              'linear-gradient(180deg, var(--pq-surface-1) 0%, var(--pq-surface-0) 100%)'
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(700px 280px at 6% 50%, oklch(0.88 0.19 125 / 0.08), transparent 65%)'
            }}
          />
          <div className="relative">
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <div className="pq-eyebrow">
                <span className="pq-dot" />
                Live queue
              </div>
              <div
                className="pq-mono"
                style={{
                  fontSize: 11,
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
            <QueueVisual
              positions={waitingPositions as any}
              nowServing={lineData.position}
            />
          </div>
        </div>
      </div>

      {/* Now-serving ticket display */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <div
          className="pq-card relative overflow-hidden"
          style={{
            padding: 0,
            background:
              'linear-gradient(135deg, oklch(0.88 0.19 125 / 0.04) 0%, rgba(10,11,13,0) 55%), linear-gradient(180deg, var(--pq-surface-1) 0%, var(--pq-surface-0) 100%)'
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(circle at 85% 30%, oklch(0.88 0.19 125 / 0.10), transparent 45%)'
            }}
          />
          <div className="relative grid md:grid-cols-[2fr_1fr] gap-0">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="pq-eyebrow">
                  <span className="pq-dot" />
                  Now serving
                </div>
                <div className="pq-chip pq-mono">
                  {waitingPositions.length} waiting
                </div>
              </div>
              <div
                className="pq-ticket-number"
                style={{
                  fontSize: 'clamp(96px, 14vw, 200px)',
                  color: currentPosition ? 'var(--pq-accent)' : 'var(--pq-ink-3)',
                  lineHeight: 0.9,
                  fontWeight: 500,
                  textShadow: currentPosition ? '0 0 60px oklch(0.88 0.19 125 / 0.3)' : 'none'
                }}
              >
                {currentPosition ? `#${fmtNum(currentPosition.position)}` : '—'}
              </div>
              {currentPosition ? (
                <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
                  <div>
                    <div className="pq-label" style={{ marginBottom: 4 }}>Customer</div>
                    <div style={{ fontSize: 24, color: 'var(--pq-ink-0)', fontWeight: 500, letterSpacing: '-0.01em' }}>
                      {currentPosition.name}
                    </div>
                    {currentPosition.phone && (
                      <div className="pq-mono mt-1" style={{ color: 'var(--pq-ink-3)', fontSize: 13 }}>
                        {currentPosition.phone}
                      </div>
                    )}
                  </div>
                  <div className="pq-chip pq-chip-live">● Called</div>
                </div>
              ) : (
                <p className="mt-6" style={{ color: 'var(--pq-ink-2)', fontSize: 15 }}>
                  No one is currently being served. Click{' '}
                  <span className="pq-mono" style={{ color: 'var(--pq-ink-1)' }}>Call next</span>{' '}
                  above to bring the first person forward.
                </p>
              )}
            </div>

            {/* Stats column */}
            <div
              className="p-8 md:p-10 border-t md:border-t-0 md:border-l"
              style={{ borderColor: 'var(--pq-line)' }}
            >
              <div className="pq-label mb-3">Session stats</div>
              <dl className="grid gap-5">
                <div>
                  <dt className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
                    Waiting
                  </dt>
                  <dd className="pq-ticket-number" style={{ fontSize: 40, color: 'var(--pq-ink-0)' }}>
                    {fmtNum(waitingPositions.length)}
                  </dd>
                </div>
                <div>
                  <dt className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
                    Served
                  </dt>
                  <dd className="pq-ticket-number" style={{ fontSize: 40, color: 'var(--pq-ink-1)' }}>
                    {fmtNum(totalServed)}
                  </dd>
                </div>
                {lastCalledPosition && (
                  <div>
                    <dt className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
                      Last called
                    </dt>
                    <dd style={{ color: 'var(--pq-ink-1)', fontSize: 14, marginTop: 4 }}>
                      #{fmtNum(lastCalledPosition.position)} · {lastCalledPosition.name}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-7 pt-6" style={{ borderTop: '1px solid var(--pq-line)' }}>
                <NextInLineButton
                  businessId={id}
                  lineId={lineId}
                  disabled={
                    waitingPositions.length === 0 || (lineData as any).paused
                  }
                  size="large"
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: queue + QR/add */}
      <div className="max-w-7xl mx-auto px-6 relative mt-8 pb-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* Queue stream */}
          <div className="pq-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="pq-eyebrow mb-2">Queue</div>
                <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--pq-ink-0)' }}>
                  Waiting · {waitingPositions.length}
                </h2>
              </div>
            </div>

            {waitingPositions.length === 0 ? (
              <div
                className="text-center py-14 rounded-xl"
                style={{ border: '1px dashed var(--pq-line-strong)', background: 'var(--pq-surface-0)' }}
              >
                <div className="pq-eyebrow mb-2" style={{ justifyContent: 'center' }}>Empty queue</div>
                <p style={{ color: 'var(--pq-ink-2)', fontSize: 14 }}>
                  No one is waiting. Share the QR or add someone manually.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col" style={{ gap: 1 }}>
                {waitingPositions.map((position: any, idx: number) => (
                  <li
                    key={position.id}
                    className="pq-queue-row"
                    style={{ opacity: idx === 0 ? 1 : 1 - idx * 0.03 }}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className="pq-mono flex-shrink-0"
                        style={{
                          fontSize: 20,
                          color: idx === 0 ? 'var(--pq-accent)' : 'var(--pq-ink-2)',
                          fontWeight: 500,
                          minWidth: 56,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        #{fmtNum(position.position)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="truncate"
                          style={{
                            fontSize: 15,
                            color: 'var(--pq-ink-0)',
                            fontWeight: 500,
                            letterSpacing: '-0.005em'
                          }}
                        >
                          {position.name}
                        </div>
                        {position.phone && (
                          <div className="pq-mono truncate" style={{ color: 'var(--pq-ink-3)', fontSize: 12, marginTop: 2 }}>
                            {position.phone}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {idx === 0 && <span className="pq-chip pq-chip-live">Next</span>}
                        <PositionActions
                          position={position}
                          businessId={id}
                          lineId={lineId}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* History */}
            {pastCalledPositions.length > 0 && (
              <details className="mt-8 group">
                <summary
                  className="pq-mono cursor-pointer flex items-center gap-2"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--pq-ink-2)',
                    userSelect: 'none'
                  }}
                >
                  <span className="pq-mono group-open:rotate-90 transition-transform" style={{ display: 'inline-block' }}>▸</span>
                  History · {pastCalledPositions.length}
                </summary>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--pq-line)' }}>
                        {['Position', 'Name', 'Phone', 'Status', 'Time'].map((h) => (
                          <th
                            key={h}
                            className="pq-mono text-left py-3 px-2"
                            style={{
                              fontSize: 10.5,
                              letterSpacing: '0.14em',
                              textTransform: 'uppercase',
                              color: 'var(--pq-ink-3)',
                              fontWeight: 500
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pastCalledPositions.map((position: any) => (
                        <tr
                          key={position.id}
                          style={{ borderBottom: '1px solid var(--pq-line)' }}
                        >
                          <td className="pq-mono py-3 px-2" style={{ color: 'var(--pq-ink-1)', fontSize: 13 }}>
                            #{fmtNum(position.position)}
                          </td>
                          <td className="py-3 px-2" style={{ color: 'var(--pq-ink-1)', fontSize: 13 }}>
                            {position.name}
                          </td>
                          <td className="pq-mono py-3 px-2" style={{ color: 'var(--pq-ink-3)', fontSize: 12 }}>
                            {position.phone || '—'}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className="pq-chip"
                              style={
                                position.status === 'called'
                                  ? { background: 'oklch(0.88 0.19 125 / 0.08)', color: 'var(--pq-accent)', borderColor: 'oklch(0.88 0.19 125 / 0.3)' }
                                  : { background: 'rgba(255,255,255,0.04)', color: 'var(--pq-ink-3)' }
                              }
                            >
                              {position.status}
                            </span>
                          </td>
                          <td className="pq-mono py-3 px-2" style={{ color: 'var(--pq-ink-3)', fontSize: 12 }}>
                            {new Date(position.created_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>

          {/* Sidebar: QR + add form */}
          <div className="flex flex-col gap-6">
            <AddPositionForm businessId={id} lineId={lineId} />

            <div className="pq-card p-6 md:p-8">
              <div className="pq-eyebrow mb-4">Self-serve</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--pq-ink-0)', marginBottom: 4 }}>
                Let customers join themselves
              </h3>
              <p style={{ color: 'var(--pq-ink-2)', fontSize: 13.5, lineHeight: 1.55, marginBottom: 20 }}>
                Display this QR at your location. Scanning opens a simple form to join.
              </p>
              <div
                className="flex justify-center p-4 rounded-xl"
                style={{
                  background: 'var(--pq-surface-0)',
                  border: '1px solid var(--pq-line)'
                }}
              >
                <img
                  src={qrImageSrc}
                  alt="QR code to join this line"
                  className="w-48 h-48"
                  style={{ borderRadius: 8 }}
                />
              </div>
              <div className="mt-4">
                <div className="pq-label" style={{ marginBottom: 6 }}>Direct URL</div>
                <Link
                  href={publicJoinUrl}
                  className="pq-mono block truncate"
                  style={{
                    color: 'var(--pq-accent)',
                    fontSize: 12,
                    textDecoration: 'none'
                  }}
                  target="_blank"
                >
                  {publicJoinUrl}
                </Link>
              </div>
              <Link
                href={`/businesses/${id}/lines/${lineId}/qr`}
                target="_blank"
                className="pq-btn pq-btn-ghost mt-4 w-full justify-center"
              >
                Open fullscreen display →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
