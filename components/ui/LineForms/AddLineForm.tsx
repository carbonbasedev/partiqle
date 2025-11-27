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
      title="Add New Line"
      description="Create a new virtual waiting line for your business."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="pb-4 sm:pb-0">
            People can join this line and wait for their turn.
          </p>
          <Button
            variant="slim"
            type="submit"
            form="addLineForm"
            loading={isSubmitting}
          >
            Create Line
          </Button>
        </div>
      }
    >
      <div className="mt-8 mb-4">
        <form id="addLineForm" onSubmit={(e) => handleSubmit(e)}>
          <input type="hidden" name="businessId" value={businessId} />
          <div className="grid gap-4">
            <div className="grid gap-1">
              <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                Line Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:border-zinc-600 focus:outline-none"
                placeholder="e.g., Customer Service, Checkout, Consultation"
                required
                maxLength={255}
              />
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}

