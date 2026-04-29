'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { setBusinessName } from '@/utils/supabase/server-actions/businesses';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BusinessNameFormProps {
  currentName: string | null;
  isFirstTime: boolean;
}

export default function BusinessNameForm({
  currentName,
  isFirstTime
}: BusinessNameFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    handleRequest(e, setBusinessName, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title={isFirstTime ? 'Name your business' : 'Your business'}
      description={
        isFirstTime
          ? 'Pick a name for your business to start creating lines. You can change this anytime.'
          : 'The name customers see on join pages and tickets.'
      }
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center gap-3">
          <p
            className="pq-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--pq-ink-3)'
            }}
          >
            {isFirstTime ? 'Required to create lines' : 'Up to 64 characters'}
          </p>
          <Button
            variant="slim"
            type="submit"
            form="businessNameForm"
            loading={isSubmitting}
          >
            {isFirstTime ? 'Create business' : 'Update name'}
          </Button>
        </div>
      }
    >
      <div className="mt-6 mb-2">
        <form id="businessNameForm" onSubmit={(e) => handleSubmit(e)}>
          <input
            type="text"
            name="name"
            className="pq-input"
            style={{ maxWidth: 380 }}
            defaultValue={currentName ?? ''}
            placeholder="e.g. Pier 9 Coffee, City Clinic"
            required
            maxLength={64}
          />
        </form>
      </div>
    </Card>
  );
}
