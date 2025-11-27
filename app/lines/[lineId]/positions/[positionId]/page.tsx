import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLineWithPositions } from '@/utils/supabase/queries';

export default async function PublicPositionPage({
  params
}: {
  params: { lineId: string; positionId: string };
}) {
  const supabase = createClient();

  const lineData = await getLineWithPositions(supabase, params.lineId);

  if (!lineData || !lineData.positions) {
    return notFound();
  }

  const position = (lineData.positions as any[]).find(
    (p) => String(p.id) === String(params.positionId)
  );

  if (!position) {
    return notFound();
  }

  const peopleAhead = (lineData.positions as any[]).filter(
    (p) => p.status === 'waiting' && p.position < position.position
  ).length;

  const isCalled = position.status === 'called';

  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-xl border border-zinc-800 rounded-xl bg-zinc-950/70 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-wide text-zinc-400 mb-1">
            You&apos;re in line for
          </p>
          <h1 className="text-3xl font-extrabold text-white mb-2 break-words">
            {lineData.name}
          </h1>
        </div>

        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">
            Your position
          </p>
          <p className="text-4xl font-black text-white mb-1">
            #{position.position}
          </p>
          {position.name && (
            <p className="text-zinc-300 text-lg">{position.name}</p>
          )}
          {position.phone && (
            <p className="text-zinc-500 text-sm mt-1">{position.phone}</p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                isCalled
                  ? 'bg-green-600/80 text-white'
                  : 'bg-yellow-600/80 text-white'
              }`}
            >
              {isCalled ? 'Currently being served' : 'Waiting'}
            </span>
            <div className="text-right text-xs text-zinc-400">
              <p>Line ID: {params.lineId}</p>
            </div>
          </div>
        </div>

        {!isCalled && (
          <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-sm text-zinc-200">
              There are{' '}
              <span className="font-semibold text-white">{peopleAhead}</span>{' '}
              people ahead of you.
            </p>
            {lineData.position ? (
              <p className="text-xs text-zinc-400 mt-2">
                We&apos;re currently serving position{' '}
                <span className="font-semibold text-zinc-200">
                  #{lineData.position}
                </span>
                .
              </p>
            ) : (
              <p className="text-xs text-zinc-400 mt-2">
                No one has been called yet. You&apos;ll see your status update
                here when it&apos;s your turn.
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-zinc-500 text-center">
          Keep this page open so you can easily check your place in line.
        </p>
      </div>
    </section>
  );
}


