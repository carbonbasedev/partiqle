import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLineById } from '@/utils/supabase/queries';
import PublicJoinLineForm from '@/components/ui/LineForms/PublicJoinLineForm';

export default async function PublicJoinLinePage({
  params
}: {
  params: { lineId: string };
}) {
  const supabase = createClient();

  const line = await getLineById(supabase, params.lineId);

  if (!line) {
    return redirect('/');
  }

  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Join the Line
          </h1>
          <p className="mt-3 text-zinc-300 text-lg">
            You&apos;re joining{' '}
            <span className="font-semibold text-white">{line.name}</span>. Enter
            your details to get your position.
          </p>
        </div>
        <PublicJoinLineForm lineId={params.lineId} />
      </div>
    </section>
  );
}


