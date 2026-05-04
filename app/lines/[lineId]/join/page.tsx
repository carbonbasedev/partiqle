import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLineById } from '@/utils/supabase/queries';
import PublicJoinLineForm from '@/components/ui/LineForms/PublicJoinLineForm';
import ShareLineButton from '@/components/ui/LineForms/ShareLineButton';
import { getURL } from 'utils/helpers';

export default async function PublicJoinLinePage({
  params
}: {
  params: Promise<{ lineId: string }>;
}) {
  const supabase = await createClient();

  const { lineId } = await params;
  const line = await getLineById(supabase, lineId);

  if (!line) {
    return redirect('/');
  }

  const isPaused = Boolean((line as any).paused);
  const host = (await headers()).get('host') ?? undefined;
  const shareUrl = getURL(`/lines/${lineId}/join`, host);

  return (
    <section
      className="relative flex items-start justify-center px-4 pt-10 pb-6"
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
          background:
            'radial-gradient(800px 500px at 50% 0%, oklch(0.88 0.19 125 / 0.08), transparent 60%)'
        }}
      />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div
            className="pq-eyebrow mb-4 break-words"
            style={{ justifyContent: 'center' }}
          >
            <span className="pq-dot" />
            You&apos;re joining {line.name}
          </div>
          <h1
            className="break-words"
            style={{
              fontSize: 'clamp(28px, 8vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: 'var(--pq-ink-0)',
              lineHeight: 1.05
            }}
          >
            Take a ticket
          </h1>
        </div>
        {isPaused ? (
          <div className="pq-card text-center" style={{ padding: 32 }}>
            <div
              className="pq-mono mb-3"
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--pq-ink-3)'
              }}
            >
              ❚❚  Line paused
            </div>
            <p
              style={{ color: 'var(--pq-ink-1)', fontSize: 16, lineHeight: 1.5 }}
            >
              This line isn&apos;t accepting new joins right now. Check back in a
              few minutes.
            </p>
          </div>
        ) : (
          <div className="pq-card p-5 sm:p-6">
            <PublicJoinLineForm lineId={lineId} />
          </div>
        )}
        <div className="mt-4">
          <ShareLineButton lineName={line.name} url={shareUrl} />
        </div>
      </div>
    </section>
  );
}
