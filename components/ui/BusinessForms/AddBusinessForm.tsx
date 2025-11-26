'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { addBusiness } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
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
      title="Add New Business"
      description="Create a new business to get started. Fill in the details below."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="pb-4 sm:pb-0">
            All businesses are associated with your account.
          </p>
          <Button
            variant="slim"
            type="submit"
            form="addBusinessForm"
            loading={isSubmitting}
          >
            Create Business
          </Button>
        </div>
      }
    >
      <div className="mt-8 mb-4">
        <form id="addBusinessForm" onSubmit={(e) => handleSubmit(e)}>
          <div className="grid gap-4">
            <div className="grid gap-1">
              <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                Business Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-zinc-500"
                placeholder="Enter business name"
                required
                maxLength={255}
              />
            </div>
            <div className="grid gap-1">
              <label htmlFor="description" className="text-sm font-medium text-zinc-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-zinc-500 resize-none"
                placeholder="Enter business description (optional)"
                maxLength={1000}
              />
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}

