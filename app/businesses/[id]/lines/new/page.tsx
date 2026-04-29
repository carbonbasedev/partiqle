import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUser, getBusiness } from '@/utils/supabase/queries';
import AddLineForm from '@/components/ui/LineForms/AddLineForm';

export default async function NewLinePage({
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

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[300px] pq-grid-bg pointer-events-none" aria-hidden="true" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-20 pb-6 relative">
        <Link href={`/businesses/${id}/lines`} className="pq-mono inline-flex items-center gap-2 mb-6" style={{ color: 'var(--pq-ink-2)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          ← Back to lines
        </Link>
        <div className="pq-eyebrow mb-4">New line · {business.name}</div>
        <h1
          className="break-words"
          style={{
            fontSize: 'clamp(28px, 7vw, 40px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--pq-ink-0)',
            lineHeight: 1.05
          }}
        >
          Create a line
        </h1>
        <p className="mt-3" style={{ color: 'var(--pq-ink-2)', fontSize: 15, maxWidth: 520 }}>
          Pick a name that reflects what people are queueing for — a counter, service, or check-in.
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative pb-24">
        <AddLineForm businessId={id} />
      </div>
    </section>
  );
}
