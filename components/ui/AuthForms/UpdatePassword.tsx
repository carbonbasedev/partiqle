'use client';

import Button from '@/components/ui/Button';
import { updatePassword } from '@/utils/supabase/auth-helpers/server';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface UpdatePasswordProps {
  redirectMethod: string;
}

export default function UpdatePassword({
  redirectMethod
}: UpdatePasswordProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, updatePassword, router);
    setIsSubmitting(false);
  };

  return (
    <form noValidate={true} onSubmit={(e) => handleSubmit(e)}>
      <div className="grid gap-4">
        <div>
          <label htmlFor="password" className="pq-label">New password</label>
          <input
            id="password"
            placeholder="••••••••"
            type="password"
            name="password"
            autoComplete="new-password"
            className="pq-input"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="pq-label">Confirm new password</label>
          <input
            id="passwordConfirm"
            placeholder="••••••••"
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
            className="pq-input"
          />
        </div>
        <Button
          variant="slim"
          type="submit"
          className="mt-2 w-full"
          loading={isSubmitting}
          style={{
            background: 'var(--pq-accent)',
            color: 'var(--pq-accent-ink)',
            borderColor: 'transparent',
            fontWeight: 600
          }}
        >
          Update password
        </Button>
      </div>
    </form>
  );
}
