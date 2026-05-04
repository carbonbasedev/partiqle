'use client';

import { useState } from 'react';
import { leaveLine } from '@/utils/supabase/server-actions/positions';

export default function LeaveLineButton({
  positionId,
  lineId
}: {
  positionId: string;
  lineId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const redirectUrl = await leaveLine(formData);
    window.location.href = redirectUrl;
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="pq-btn pq-btn-ghost w-full justify-center"
        style={{ color: 'var(--pq-ink-2)' }}
      >
        Leave the line
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="positionId" value={positionId} />
      <input type="hidden" name="lineId" value={lineId} />
      <p
        className="pq-mono text-center"
        style={{
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--pq-ink-3)'
        }}
      >
        Leave the line? This can&apos;t be undone.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isSubmitting}
          className="pq-btn pq-btn-ghost flex-1 justify-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="pq-btn pq-btn-primary flex-1 justify-center"
        >
          {isSubmitting ? 'Leaving…' : 'Yes, leave'}
        </button>
      </div>
    </form>
  );
}
