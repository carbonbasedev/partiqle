'use client';

import Button from '@/components/ui/Button';
import { callNextPosition } from '@/utils/supabase/server-actions/positions';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NextInLineButtonProps {
  businessId: string;
  lineId: string;
  disabled?: boolean;
}

export default function NextInLineButton({
  businessId,
  lineId,
  disabled
}: NextInLineButtonProps) {
  const router = useRouter();
  const [isCallingNext, setIsCallingNext] = useState(false);

  const handleCallNext = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsCallingNext(true);
    await handleRequest(e, callNextPosition, router);
    setIsCallingNext(false);
  };

  return (
    <form onSubmit={handleCallNext}>
      <input type="hidden" name="lineId" value={lineId} />
      <input type="hidden" name="businessId" value={businessId} />
      <Button
        variant="slim"
        type="submit"
        loading={isCallingNext}
        disabled={disabled}
        className="px-4 py-2 text-sm"
      >
        Call Next in Line
      </Button>
    </form>
  );
}


