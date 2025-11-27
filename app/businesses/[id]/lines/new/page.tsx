import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser, getBusiness } from '@/utils/supabase/queries';
import AddLineForm from '@/components/ui/LineForms/AddLineForm';

export default async function NewLinePage({
  params
}: {
  params: { id: string };
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

  return (
    <section className="mb-32 bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Add New Line
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Create a new virtual waiting line for {business.name}
          </p>
        </div>
      </div>
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <AddLineForm businessId={params.id} />
      </div>
    </section>
  );
}

