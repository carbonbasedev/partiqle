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
    <section className="mb-32 bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            My Businesses
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            View and manage your businesses
          </p>
        </div>
      </div>
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mt-8 flex justify-end">
          <Link
            href="/businesses/new"
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
          >
            + Add New Business
          </Link>
        </div>
        {businesses.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-lg mb-4">
              No businesses found. Create your first business to get started.
            </p>
            <Link
              href="/businesses/new"
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
            >
              Create Your First Business
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business: any) => (
              <div
                key={business.id}
                className="w-full border rounded-md border-zinc-700 bg-zinc-900 hover:border-zinc-600 transition-colors"
              >
                <div className="px-5 py-4">
                  <h3 className="mb-1 text-xl font-semibold text-white">
                    {business.name || `Business ${business.id?.slice(0, 8) || 'N/A'}`}
                  </h3>
                  {business.description && (
                    <p className="text-zinc-300 text-sm mb-4">
                      {business.description}
                    </p>
                  )}
                  <div className="text-xs text-zinc-500 mb-4">
                    {business.created_at && (
                      <p>
                        Created:{' '}
                        {new Date(business.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/businesses/${business.id}/lines`}
                    className="inline-block px-4 py-2 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
                  >
                    Manage Lines
                  </Link>
                  {/* Display all other fields as JSON for debugging/development */}
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4">
                      <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400">
                        View all data
                      </summary>
                      <pre className="mt-2 text-xs text-zinc-600 overflow-auto max-h-40">
                        {JSON.stringify(business, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

