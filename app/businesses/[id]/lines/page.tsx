import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUser, getBusiness, getLinesByBusiness } from '@/utils/supabase/queries';

export default async function BusinessLinesPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const { id } = await params;
  const business = await getBusiness(supabase, id);

  if (!business) {
    return redirect('/businesses');
  }

  if (business.user_id !== user.id) {
    return redirect('/businesses');
  }

  const lines = await getLinesByBusiness(supabase, id);

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[320px] pq-grid-bg pointer-events-none" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-6 pt-16 sm:pt-20 pb-6 relative">
        <Link href="/businesses" className="pq-mono inline-flex items-center gap-2 mb-6" style={{ color: 'var(--pq-ink-2)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          ← All businesses
        </Link>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="pq-eyebrow mb-4">Lines / {business.name}</div>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: 'var(--pq-ink-0)',
                lineHeight: 1.02
              }}
            >
              {business.name}
            </h1>
            <p className="mt-3" style={{ color: 'var(--pq-ink-2)', fontSize: 16 }}>
              Manage virtual waiting lines for this business.
            </p>
          </div>
          <Link href={`/businesses/${id}/lines/new`} className="pq-btn pq-btn-primary">
            + New line
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative pb-24">
        {lines.length === 0 ? (
          <div className="pq-card p-12 text-center mt-8">
            <div className="pq-eyebrow mb-4" style={{ justifyContent: 'center' }}>
              Empty
            </div>
            <p style={{ color: 'var(--pq-ink-1)', fontSize: 18 }}>
              No lines yet. Create your first line to start queuing people.
            </p>
            <Link
              href={`/businesses/${id}/lines/new`}
              className="pq-btn pq-btn-primary mt-6 inline-flex"
            >
              Create your first line →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {lines.map((line: any, idx: number) => (
              <Link
                key={line.id}
                href={`/businesses/${id}/lines/${line.id}`}
                className="pq-card pq-card-hover p-5 flex flex-col group"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="pq-mono"
                    style={{
                      color: 'var(--pq-ink-3)',
                      fontSize: 10.5,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase'
                    }}
                  >
                    LINE · {String(idx + 1).padStart(3, '0')}
                  </div>
                  {line.position > 0 ? (
                    <div className="pq-chip pq-chip-live">Live</div>
                  ) : (
                    <div className="pq-chip">Idle</div>
                  )}
                </div>
                <h3
                  className="mt-4"
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--pq-ink-0)',
                    letterSpacing: '-0.015em'
                  }}
                >
                  {line.name || `Line ${line.id?.slice(0, 8) || 'N/A'}`}
                </h3>
                <div className="pq-divider my-4" />
                <div className="flex items-end justify-between">
                  <div>
                    <div className="pq-label" style={{ marginBottom: 4 }}>Now serving</div>
                    <div
                      className="pq-ticket-number"
                      style={{ fontSize: 32, color: line.position > 0 ? 'var(--pq-accent)' : 'var(--pq-ink-3)' }}
                    >
                      {line.position > 0 ? `#${String(line.position).padStart(3, '0')}` : '—'}
                    </div>
                  </div>
                  <div
                    className="pq-mono"
                    style={{
                      color: 'var(--pq-ink-3)',
                      fontSize: 10.5,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {line.created_at && new Date(line.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
