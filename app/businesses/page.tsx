import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUser, getBusinesses } from '@/utils/supabase/queries';

export default async function BusinessesPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const businesses = await getBusinesses(supabase);

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[320px] pq-grid-bg pointer-events-none" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-6 relative">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="pq-eyebrow mb-4">Workspace</div>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: 'var(--pq-ink-0)',
                lineHeight: 1.02
              }}
            >
              Businesses
            </h1>
            <p className="mt-3" style={{ color: 'var(--pq-ink-2)', fontSize: 16 }}>
              Each business can host any number of lines. Pick one to manage or add a new one.
            </p>
          </div>
          <Link href="/businesses/new" className="pq-btn pq-btn-primary">
            + New business
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative pb-24">
        {businesses.length === 0 ? (
          <div className="pq-card p-12 text-center mt-8">
            <div className="pq-eyebrow mb-4" style={{ justifyContent: 'center' }}>
              Empty
            </div>
            <p style={{ color: 'var(--pq-ink-1)', fontSize: 18 }}>
              No businesses yet. Create your first to start managing lines.
            </p>
            <Link
              href="/businesses/new"
              className="pq-btn pq-btn-primary mt-6 inline-flex"
            >
              Create your first business →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business: any, idx: number) => (
              <div
                key={business.id}
                className="pq-card pq-card-hover p-5 flex flex-col"
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
                    BIZ · {String(idx + 1).padStart(3, '0')}
                  </div>
                  <div className="pq-chip">Active</div>
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
                  {business.name || `Business ${business.id?.slice(0, 8) || 'N/A'}`}
                </h3>
                {business.description && (
                  <p
                    className="mt-2"
                    style={{ color: 'var(--pq-ink-2)', fontSize: 13.5, lineHeight: 1.55 }}
                  >
                    {business.description}
                  </p>
                )}
                <div
                  className="mt-4 pq-mono"
                  style={{
                    color: 'var(--pq-ink-3)',
                    fontSize: 11,
                    letterSpacing: '0.08em'
                  }}
                >
                  {business.created_at && (
                    <>Since {new Date(business.created_at).toLocaleDateString()}</>
                  )}
                </div>
                <div className="pq-divider my-4" />
                <Link
                  href={`/businesses/${business.id}/lines`}
                  className="pq-btn pq-btn-ghost w-full justify-between"
                >
                  Manage lines
                  <span aria-hidden>→</span>
                </Link>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-3">
                    <summary
                      className="pq-mono cursor-pointer"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--pq-ink-3)'
                      }}
                    >
                      View raw data
                    </summary>
                    <pre
                      className="mt-2 pq-mono overflow-auto max-h-40"
                      style={{ fontSize: 10.5, color: 'var(--pq-ink-3)' }}
                    >
                      {JSON.stringify(business, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
