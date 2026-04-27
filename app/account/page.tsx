import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function Account() {
  const supabase = await createClient();
  const [user, userDetails, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-[360px] pq-grid-bg pointer-events-none" aria-hidden="true" />
      <div className="max-w-4xl mx-auto px-6 pt-16 sm:pt-24 pb-8 relative">
        <div className="pq-eyebrow mb-4">Settings</div>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--pq-ink-0)',
            lineHeight: 1.02
          }}
        >
          Account
        </h1>
        <p className="mt-3" style={{ color: 'var(--pq-ink-2)', fontSize: 16, maxWidth: 560 }}>
          Manage your profile, email and subscription. Billing is handled securely through Stripe.
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-6 relative">
        <CustomerPortalForm subscription={subscription} />
        <NameForm userName={userDetails?.full_name ?? ''} />
        <EmailForm userEmail={user.email} />
      </div>
    </section>
  );
}
