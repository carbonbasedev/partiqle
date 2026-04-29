import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUser, getUserBusiness, getLineWithPositions } from '@/utils/supabase/queries';
import { getURL } from 'utils/helpers';

export default async function LineQRDisplayPage({
  params
}: {
  params: Promise<{ lineId: string }>;
}) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const { lineId } = await params;
  const business = await getUserBusiness(supabase);

  if (!business) {
    return redirect('/account');
  }

  const lineData = await getLineWithPositions(supabase, lineId);

  if (!lineData || !lineData.id || lineData.business_id !== business.id) {
    return redirect('/manage');
  }

  const host = (await headers()).get('host') ?? undefined;
  const publicJoinUrl = getURL(`/lines/${lineId}/join`, host);
  const qrData = encodeURIComponent(publicJoinUrl);
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&data=${qrData}&format=svg&margin=4`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between"
      style={{
        background: 'var(--pq-bg)',
        padding: 'clamp(24px, 4vw, 64px)'
      }}
    >
      <div className="absolute top-4 left-4">
        <Link
          href={`/manage/${lineId}`}
          className="pq-mono"
          style={{
            color: 'var(--pq-ink-3)',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textDecoration: 'none'
          }}
        >
          ← Back
        </Link>
      </div>

      <div className="flex flex-col items-center text-center w-full mt-8">
        <div className="pq-eyebrow mb-4" style={{ justifyContent: 'center' }}>
          <span className="pq-dot" />
          Scan to join the line
        </div>
        <h1
          style={{
            fontSize: 'clamp(40px, 7vw, 104px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--pq-ink-0)',
            lineHeight: 1.02
          }}
        >
          {lineData.name}
        </h1>
      </div>

      <div
        className="flex items-center justify-center"
        style={{
          background: '#fafafa',
          borderRadius: 24,
          padding: 'clamp(16px, 2.5vw, 40px)',
          width: 'min(72vh, 72vw)',
          aspectRatio: '1 / 1'
        }}
      >
        <img
          src={qrImageSrc}
          alt={`QR code to join ${lineData.name}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <div className="flex flex-col items-center gap-2 mb-4">
        <div
          className="pq-mono"
          style={{
            fontSize: 'clamp(12px, 1.3vw, 16px)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--pq-ink-3)'
          }}
        >
          Or visit
        </div>
        <div
          className="pq-mono"
          style={{
            fontSize: 'clamp(14px, 1.6vw, 20px)',
            color: 'var(--pq-ink-1)',
            wordBreak: 'break-all',
            textAlign: 'center',
            maxWidth: '90vw'
          }}
        >
          {publicJoinUrl}
        </div>
      </div>
    </div>
  );
}
