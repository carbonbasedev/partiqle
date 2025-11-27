import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUser, getBusiness, getLineWithPositions } from '@/utils/supabase/queries';
import AddPositionForm from '@/components/ui/LineForms/AddPositionForm';
import PositionActions from '@/components/ui/LineForms/PositionActions';
import NextInLineButton from '@/components/ui/LineForms/NextInLineButton';
import { getURL } from 'utils/helpers';

export default async function LineManagementPage({
  params
}: {
  params: { id: string; lineId: string };
}) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const business = await getBusiness(supabase, params.id);

  if (!business) {
    return redirect('/businesses');
  }

  // Verify user owns the business
  if (business.user_id !== user.id) {
    return redirect('/businesses');
  }

  const lineData = await getLineWithPositions(supabase, params.lineId);

  if (!lineData || !lineData.id || lineData.business_id !== params.id) {
    return redirect(`/businesses/${params.id}/lines`);
  }

  // Separate positions by status
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

  // Get currently called position (if any)
  const currentPosition = calledPositions.find(
    (p: any) => p.position === lineData.position
  );

  // Get the last called/skipped position (most recent in history)
  const lastCalledPosition =
    pastCalledPositions.length > 0 ? pastCalledPositions[0] : null;

  const publicJoinUrl = getURL(`/lines/${params.lineId}/join`);
  const qrData = encodeURIComponent(publicJoinUrl);
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  return (
    <section className="mb-32 bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            {lineData.name}
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Manage positions in this line
          </p>
        </div>
      </div>
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mt-8 mb-4 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href={`/businesses/${params.id}/lines`}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors inline-block"
          >
            ← Back to Lines
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-300">
              <span className="font-medium text-white">Current position:</span>{' '}
              {lineData.position ? (
                <span className="text-green-400">#{lineData.position}</span>
              ) : (
                <span className="text-zinc-400">None called yet</span>
              )}
            </div>
            <NextInLineButton
              businessId={params.id}
              lineId={params.lineId}
              disabled={waitingPositions.length === 0}
            />
          </div>
        </div>

        {/* Public QR code to join this line */}
        <div className="mb-8 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-center">
          <div className="text-sm text-zinc-300 max-w-xl">
            <h2 className="text-lg font-semibold text-white mb-1">
              Let customers join themselves
            </h2>
            <p className="text-zinc-400">
              Display this QR code at your location. Customers can scan it to open a
              simple page where they enter their name and phone number to join this
              line.
            </p>
            <p className="mt-3 text-xs text-zinc-500 break-all">
              Join URL:{' '}
              <Link href={publicJoinUrl} className="underline hover:text-zinc-300">
                {publicJoinUrl}
              </Link>
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <div className="inline-flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <img
                src={qrImageSrc}
                alt="QR code to join this line"
                className="w-40 h-40"
              />
              <p className="text-xs text-zinc-400 text-center">
                Scan to join <span className="font-semibold text-zinc-100">{lineData.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick status summary for current and last called */}
        {(currentPosition || lastCalledPosition) && (
          <div className="mb-6 text-sm text-zinc-300 space-y-1">
            {currentPosition && (
              <p>
                <span className="font-medium text-white">Currently serving:</span>{' '}
                <span className="text-green-400">
                  #{currentPosition.position} {currentPosition.name && `- ${currentPosition.name}`}
                </span>
              </p>
            )}
            {lastCalledPosition && (
              <p>
                <span className="font-medium text-white">Last called:</span>{' '}
                <span className="text-zinc-200">
                  #{lastCalledPosition.position}{' '}
                  {lastCalledPosition.name && `- ${lastCalledPosition.name}`}{' '}
                  <span className="text-xs uppercase tracking-wide text-zinc-400">
                    ({lastCalledPosition.status})
                  </span>
                </span>
              </p>
            )}
          </div>
        )}

        {/* Currently Called Position */}
        {currentPosition && (
          <div className="mb-8 p-6 border-2 border-green-500 rounded-md bg-green-900/20">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Currently Serving
            </h2>
            <div className="bg-zinc-900 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">
                    Position #{currentPosition.position}
                  </p>
                  <p className="text-xl text-zinc-300 mt-2">{currentPosition.name}</p>
                  {currentPosition.phone && (
                    <p className="text-zinc-400 mt-1">{currentPosition.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-medium rounded">
                    CALLED
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Position Form */}
        <div className="mb-8">
          <AddPositionForm businessId={params.id} lineId={params.lineId} />
        </div>

        {/* Waiting Positions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Waiting Positions ({waitingPositions.length})
          </h2>
          {waitingPositions.length === 0 ? (
            <p className="text-zinc-400">No one is currently waiting.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {waitingPositions.map((position: any) => (
                <div
                  key={position.id}
                  className="border rounded-md border-zinc-700 bg-zinc-900 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xl font-semibold text-white">
                        Position #{position.position}
                      </p>
                      <p className="text-zinc-300 mt-1">{position.name}</p>
                      {position.phone && (
                        <p className="text-zinc-400 text-sm mt-1">{position.phone}</p>
                      )}
                    </div>
                    <span className="inline-block px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded">
                      WAITING
                    </span>
                  </div>
                  <PositionActions
                    position={position}
                    businessId={params.id}
                    lineId={params.lineId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Called Positions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Past Called Positions ({pastCalledPositions.length})
          </h2>
          {pastCalledPositions.length === 0 ? (
            <p className="text-zinc-400">No positions have been called yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left p-3 text-zinc-300 font-medium">Position</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Name</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Phone</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Status</th>
                    <th className="text-left p-3 text-zinc-300 font-medium">Called At</th>
                  </tr>
                </thead>
                <tbody>
                  {pastCalledPositions.map((position: any) => (
                    <tr
                      key={position.id}
                      className="border-b border-zinc-800 hover:bg-zinc-900"
                    >
                      <td className="p-3 text-white font-medium">
                        #{position.position}
                      </td>
                      <td className="p-3 text-zinc-300">{position.name}</td>
                      <td className="p-3 text-zinc-400">{position.phone || '-'}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            position.status === 'called'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {position.status === 'called' ? 'CALLED' : 'SKIPPED'}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-400 text-sm">
                        {new Date(position.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

