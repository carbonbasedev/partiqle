'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { joinLinePublic } from '@/utils/supabase/server-actions/positions';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PublicJoinLineFormProps {
  lineId: string;
}

export default function PublicJoinLineForm({ lineId }: PublicJoinLineFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, joinLinePublic, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title="Take a ticket"
      description="Enter your name. Phone is optional but helps staff reach you."
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
            No signup required
          </p>
          <Button
            variant="slim"
            type="submit"
            form="publicJoinLineForm"
            loading={isSubmitting}
          >
            Join line →
          </Button>
        </div>
      }
    >
      <div className="mt-6 mb-2">
        <form id="publicJoinLineForm" onSubmit={(e) => handleSubmit(e)}>
          <input type="hidden" name="lineId" value={lineId} />
          <div className="grid gap-5">
            <div>
              <label htmlFor="name" className="pq-label">Your name *</label>
              <input
                id="name"
                type="text"
                name="name"
                className="pq-input"
                placeholder="First name, or first + last initial"
                required
                autoFocus
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
