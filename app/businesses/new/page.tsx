import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddBusinessForm from '@/components/ui/BusinessForms/AddBusinessForm';
import Link from 'next/link';

export default async function NewBusinessPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[300px] pq-grid-bg pointer-events-none" aria-hidden="true" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-24 pb-6 relative">
        <Link href="/businesses" className="pq-mono inline-flex items-center gap-2 mb-6" style={{ color: 'var(--pq-ink-2)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          ← Back to businesses
        </Link>
        <div className="pq-eyebrow mb-4">New business</div>
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
          Spin up a business
        </h1>
        <p className="mt-3" style={{ color: 'var(--pq-ink-2)', fontSize: 15, maxWidth: 520 }}>
          Each business is a container for lines. Name it after the location, team, or service.
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative pb-24">
        <AddBusinessForm />
      </div>
    </section>
  );
}
