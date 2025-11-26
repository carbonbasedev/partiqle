import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddBusinessForm from '@/components/ui/BusinessForms/AddBusinessForm';

export default async function NewBusinessPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <section className="mb-32 bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Add New Business
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Create a new business and start managing it right away
          </p>
        </div>
      </div>
      <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
        <AddBusinessForm />
      </div>
    </section>
  );
}

