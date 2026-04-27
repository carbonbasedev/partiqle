'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { addBusiness } from '@/utils/supabase/server-actions/businesses';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddBusinessForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, addBusiness, router);
    setIsSubmitting(false);
  };

  return (
    <Card
      title="Add new business"
      description="All businesses are tied to your account."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center gap-3">
          <p className="pq-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pq-ink-3)' }}>
            You can edit details later
          </p>
          <Button
            variant="slim"
            type="submit"
            form="addBusinessForm"
            loading={isSubmitting}
          >
            Create business
          </Button>
        </div>
      }
    >
      <div className="mt-6 mb-2">
        <form id="addBusinessForm" onSubmit={(e) => handleSubmit(e)}>
          <div className="grid gap-5">
            <div>
              <label htmlFor="name" className="pq-label">Business name *</label>
              <input
                id="name"
                type="text"
                name="name"
                className="pq-input"
                placeholder="e.g. Clinic on 5th, Hana Hair Studio"
                required
                maxLength={255}
              />
            </div>
            <div>
              <label htmlFor="description" className="pq-label">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="pq-input resize-none"
                placeholder="Optional — a short sentence that describes this business."
                maxLength={1000}
              />
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}
