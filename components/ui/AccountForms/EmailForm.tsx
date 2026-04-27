'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { updateEmail } from '@/utils/supabase/auth-helpers/server';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EmailForm({
  userEmail
}: {
  userEmail: string | undefined;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    if (e.currentTarget.newEmail.value === userEmail) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    handleRequest(e, updateEmail, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title="Your email"
      description="The email address used to sign into your account."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center gap-3">
          <p className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
            We&apos;ll email to verify the change
          </p>
          <Button
            variant="slim"
            type="submit"
            form="emailForm"
            loading={isSubmitting}
          >
            Update email
          </Button>
        </div>
      }
    >
      <div className="mt-6 mb-2">
        <form id="emailForm" onSubmit={(e) => handleSubmit(e)}>
          <input
            type="text"
            name="newEmail"
            className="pq-input"
            style={{ maxWidth: 380 }}
            defaultValue={userEmail ?? ''}
            placeholder="Your email"
            maxLength={64}
          />
        </form>
      </div>
    </Card>
  );
}
