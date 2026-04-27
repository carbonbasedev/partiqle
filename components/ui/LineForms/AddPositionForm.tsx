'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { addPosition } from '@/utils/supabase/server-actions/positions';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AddPositionFormProps {
  businessId: string;
  lineId: string;
}

export default function AddPositionForm({ businessId, lineId }: AddPositionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, addPosition, router);
    setIsSubmitting(false);
    (e.target as HTMLFormElement)?.reset();
  };

  return (
    <Card
      title="Add walk-in"
      description="Manually add someone to the end of the queue."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center gap-3">
          <p className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
            Added at position N+1
          </p>
          <Button
            variant="slim"
            type="submit"
            form="addPositionForm"
            loading={isSubmitting}
          >
            Add to line
          </Button>
        </div>
      }
    >
      <div className="mt-6 mb-2">
        <form id="addPositionForm" onSubmit={(e) => handleSubmit(e)}>
          <input type="hidden" name="businessId" value={businessId} />
          <input type="hidden" name="lineId" value={lineId} />
          <div className="grid gap-4">
            <div>
              <label htmlFor="name" className="pq-label">Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                className="pq-input"
                placeholder="Person's name"
                required
                maxLength={255}
              />
            </div>
            <div>
              <label htmlFor="phone" className="pq-label">Phone (optional)</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                className="pq-input"
                placeholder="+1 555 123 4567"
                maxLength={20}
              />
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}
