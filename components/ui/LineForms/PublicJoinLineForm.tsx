'use client';

import Button from '@/components/ui/Button';
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
    <form
      id="publicJoinLineForm"
      onSubmit={(e) => handleSubmit(e)}
      className="grid gap-4"
    >
      <input type="hidden" name="lineId" value={lineId} />
      <div>
        <label htmlFor="name" className="pq-label">
          Your name *
        </label>
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
        <label htmlFor="phone" className="pq-label">
          Phone (optional)
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          className="pq-input"
          placeholder="+1 555 123 4567"
          maxLength={20}
        />
      </div>
      <Button
        variant="slim"
        type="submit"
        loading={isSubmitting}
        className="w-full mt-2"
      >
        Take a ticket →
      </Button>
    </form>
  );
}
