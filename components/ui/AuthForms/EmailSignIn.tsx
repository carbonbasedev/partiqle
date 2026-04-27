'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';
import { signInWithEmail } from '@/utils/supabase/auth-helpers/server';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EmailSignInProps {
  allowPassword: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function EmailSignIn({
  allowPassword,
  redirectMethod,
  disableButton
}: EmailSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signInWithEmail, router);
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
            Send magic link
          </Button>
        </div>
      </form>
      {allowPassword && (
        <div className="mt-5 flex flex-col gap-1.5 pq-mono" style={{ fontSize: 12, color: 'var(--pq-ink-2)' }}>
          <Link href="/signin/password_signin" className="hover:underline">
            Use email + password →
          </Link>
          <Link href="/signin/signup" className="hover:underline" style={{ color: 'var(--pq-accent)' }}>
            Don&apos;t have an account? Sign up →
          </Link>
        </div>
      )}
    </div>
  );
}
