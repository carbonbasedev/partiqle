'use client';

import { callNextPosition } from '@/utils/supabase/server-actions/positions';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NextInLineButtonProps {
  businessId: string;
  lineId: string;
  disabled?: boolean;
  size?: 'default' | 'large';
  fullWidth?: boolean;
}

export default function NextInLineButton({
  businessId,
  lineId,
  disabled,
  size = 'default',
  fullWidth = false
}: NextInLineButtonProps) {
  const router = useRouter();
  const [isCallingNext, setIsCallingNext] = useState(false);

  const handleCallNext = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsCallingNext(true);
    await handleRequest(e, callNextPosition, router);
    setIsCallingNext(false);
  };

  const largeStyle =
    size === 'large'
      ? {
          padding: '18px 28px',
          fontSize: 17,
          letterSpacing: '-0.01em',
          fontWeight: 600,
          width: fullWidth ? '100%' : undefined
        }
      : { width: fullWidth ? '100%' : undefined };

  return (
    <form onSubmit={handleCallNext} style={fullWidth ? { width: '100%' } : undefined}>
      <input type="hidden" name="lineId" value={lineId} />
      <input type="hidden" name="businessId" value={businessId} />
      <button
        type="submit"
        disabled={disabled || isCallingNext}
        className="pq-btn pq-btn-primary"
        style={largeStyle}
      >
        {isCallingNext ? 'Calling…' : (
          <>
            Call next
            <span className="pq-mono" style={{ opacity: 0.6, marginLeft: 8 }}>→</span>
          </>
        )}
      </button>
    </form>
  );
}
