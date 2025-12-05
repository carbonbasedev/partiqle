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

  // Verify user owns the business
  if (business.user_id !== user.id) {
    return redirect('/businesses');
  }

  const lines = await getLinesByBusiness(supabase, id);

  return (
    <section className="mb-32 bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Lines for {business.name}
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Manage your virtual waiting lines
          </p>
        </div>
      </div>
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/businesses"
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
          >
            ← Back to Businesses
          </Link>
          <Link
            href={`/businesses/${id}/lines/new`}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
          >
            + Add New Line
          </Link>
        </div>
        {lines.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-lg mb-4">
              No lines found. Create your first line to get started.
            </p>
            <Link
              href={`/businesses/${id}/lines/new`}
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
            >
              Create Your First Line
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {lines.map((line: any) => (
              <Link
                key={line.id}
                href={`/businesses/${id}/lines/${line.id}`}
                className="w-full border rounded-md border-zinc-700 bg-zinc-900 hover:border-zinc-600 transition-colors block"
              >
                <div className="px-5 py-4">
                  <h3 className="mb-1 text-xl font-semibold text-white">
                    {line.name || `Line ${line.id?.slice(0, 8) || 'N/A'}`}
                  </h3>
                  <div className="text-xs text-zinc-500 mt-2">
                    {line.created_at && (
                      <p>
                        Created:{' '}
                        {new Date(line.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {line.position > 0 && (
                      <p className="mt-1">
                        Current Position: {line.position}
                      </p>
                    )}
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

