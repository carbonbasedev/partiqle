import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLineById } from '@/utils/supabase/queries';
import PublicJoinLineForm from '@/components/ui/LineForms/PublicJoinLineForm';

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
          background:
            'radial-gradient(800px 500px at 50% 0%, oklch(0.88 0.19 125 / 0.08), transparent 60%)'
        }}
      />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <div className="pq-eyebrow mb-4" style={{ justifyContent: 'center' }}>
            <span className="pq-dot" />
            Live queue
          </div>
          <div
            className="pq-mono mb-3"
            style={{
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--pq-ink-3)'
            }}
          >
            You&apos;re joining
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
            {line.name}
          </h1>
          <p
            className="mt-4"
            style={{ color: 'var(--pq-ink-2)', fontSize: 15, maxWidth: 340, margin: '16px auto 0' }}
          >
            Leave your name and you&apos;ll get a live ticket. Keep the next page open — we&apos;ll update it as you move up.
          </p>
        </div>
        {isPaused ? (
          <div
            className="pq-card text-center"
            style={{ padding: 32 }}
          >
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
            <p style={{ color: 'var(--pq-ink-1)', fontSize: 16, lineHeight: 1.5 }}>
              This line isn&apos;t accepting new joins right now. Check back in a few minutes.
            </p>
          </div>
        ) : (
          <PublicJoinLineForm lineId={lineId} />
        )}
        <p
          className="pq-mono text-center mt-8"
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
