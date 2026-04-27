'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { updateName } from '@/utils/supabase/auth-helpers/server';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NameForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    if (e.currentTarget.fullName.value === userName) {
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }
    handleRequest(e, updateName, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title="Your name"
      description="Your full name, or a display name you're comfortable with."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center gap-3">
          <p className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
            64 characters maximum
          </p>
          <Button
            variant="slim"
            type="submit"
            form="nameForm"
            loading={isSubmitting}
          >
            Update name
          </Button>
        </div>
      }
    >
      <div className="mt-6 mb-2">
        <form id="nameForm" onSubmit={(e) => handleSubmit(e)}>
          <input
            type="text"
            name="fullName"
            className="pq-input"
            style={{ maxWidth: 380 }}
            defaultValue={userName}
            placeholder="Your name"
            maxLength={64}
          />
        </form>
      </div>
    </Card>
  );
}
