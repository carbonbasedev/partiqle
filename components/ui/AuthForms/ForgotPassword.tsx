'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';
import { requestPasswordUpdate } from '@/utils/supabase/auth-helpers/server';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ForgotPasswordProps {
  allowEmail: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function ForgotPassword({
  allowEmail,
  redirectMethod,
  disableButton
}: ForgotPasswordProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, requestPasswordUpdate, router);
    setIsSubmitting(false);
  };

  return (
    <div>
      <form noValidate={true} onSubmit={(e) => handleSubmit(e)}>
        <div className="grid gap-4">
          <div>
            <label htmlFor="email" className="pq-label">Email</label>
            <input
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="pq-input"
            />
          </div>
          <Button
            variant="slim"
            type="submit"
            className="mt-2 w-full"
            loading={isSubmitting}
            disabled={disableButton}
            style={{
              background: 'var(--pq-accent)',
              color: 'var(--pq-accent-ink)',
              borderColor: 'transparent',
              fontWeight: 600
            }}
          >
            Send reset email
          </Button>
        </div>
      </form>
      <div className="mt-5 flex flex-col gap-1.5 pq-mono" style={{ fontSize: 12, color: 'var(--pq-ink-2)' }}>
        <Link href="/signin/password_signin" className="hover:underline">
          Back to sign in →
        </Link>
        {allowEmail && (
          <Link href="/signin/email_signin" className="hover:underline">
            Sign in via magic link →
          </Link>
        )}
        <Link href="/signin/signup" className="hover:underline" style={{ color: 'var(--pq-accent)' }}>
          Don&apos;t have an account? Sign up →
        </Link>
      </div>
    </div>
  );
}
