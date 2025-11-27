'use client';

import Button from '@/components/ui/Button';
import { callPosition, skipPosition } from '@/utils/supabase/server-actions/positions';
import { handleRequest } from '@/utils/supabase/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PositionActionsProps {
  position: any;
  businessId: string;
  lineId: string;
}

export default function PositionActions({ position, businessId, lineId }: PositionActionsProps) {
  const router = useRouter();
  const [isCalling, setIsCalling] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const handleCall = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsCalling(true);
    await handleRequest(e, callPosition, router);
    setIsCalling(false);
  };

  const handleSkip = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSkipping(true);
    await handleRequest(e, skipPosition, router);
    setIsSkipping(false);
  };

  if (position.status !== 'waiting') {
    return null;
  }

  return (
    <div className="flex gap-2 mt-2">
      <form onSubmit={handleCall}>
        <input type="hidden" name="positionId" value={position.id} />
        <input type="hidden" name="lineId" value={lineId} />
        <input type="hidden" name="businessId" value={businessId} />
        <Button
          variant="slim"
          type="submit"
          loading={isCalling}
          className="text-xs px-3 py-1"
        >
          Call
        </Button>
      </form>
      <form onSubmit={handleSkip}>
        <input type="hidden" name="positionId" value={position.id} />
        <input type="hidden" name="lineId" value={lineId} />
        <input type="hidden" name="businessId" value={businessId} />
        <Button
          variant="slim"
          type="submit"
          loading={isSkipping}
          className="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600"
        >
          Skip
        </Button>
      </form>
    </div>
  );
}

