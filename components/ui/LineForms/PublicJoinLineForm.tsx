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
      title="Join this line"
      description="Enter your details to receive a position in the queue."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="pb-4 sm:pb-0 text-xs text-zinc-400">
            You&apos;ll be added to the end of the line.
          </p>
          <Button
            variant="slim"
            type="submit"
            form="publicJoinLineForm"
            loading={isSubmitting}
          >
            Join Line
          </Button>
        </div>
      }
    >
      <div className="mt-4 mb-4">
        <form id="publicJoinLineForm" onSubmit={(e) => handleSubmit(e)}>
          <input type="hidden" name="lineId" value={lineId} />
          <div className="grid gap-4">
            <div className="grid gap-1">
              <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:border-zinc-600 focus:outline-none"
                placeholder="Your name"
                required
                maxLength={255}
              />
            </div>
            <div className="grid gap-1">
              <label htmlFor="phone" className="text-sm font-medium text-zinc-300">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                className="w-full p-3 rounded-md bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:border-zinc-600 focus:outline-none"
                placeholder="Your phone number"
                maxLength={20}
              />
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
}


