'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { addLine } from '@/utils/supabase/server-actions/lines';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AddLineFormProps {
  businessId: string;
}

export default function AddLineForm({ businessId }: AddLineFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, addLine, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title="Add a new line"
      description="People can join this line and wait off-site for their turn."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center gap-3">
          <p className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
            You can add positions after it&apos;s created
          </p>
          <Button
            variant="slim"
            type="submit"
            form="addLineForm"
            loading={isSubmitting}
          >
            Create line
          </Button>
        </div>
      }
    >
      <div className="mt-6 mb-2">
        <form id="addLineForm" onSubmit={(e) => handleSubmit(e)}>
          <input type="hidden" name="businessId" value={businessId} />
          <div>
            <label htmlFor="name" className="pq-label">Line name *</label>
            <input
              id="name"
              type="text"
              name="name"
              className="pq-input"
              placeholder="e.g. Customer service, Checkout, Consultation"
              required
              maxLength={255}
            />
          </div>
        </form>
      </div>
    </Card>
  );
}
