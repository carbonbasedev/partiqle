import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { positionId, subscription } = body || {};
  if (
    !positionId ||
    !subscription?.endpoint ||
    !subscription?.keys?.p256dh ||
    !subscription?.keys?.auth
  ) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = (await createClient()) as any;

  const { error } = await supabase.from('push_subscriptions').insert({
    position_id: Number(positionId),
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth
  } as any);

  // 23505 = unique violation; the same endpoint is already registered, fine.
  if (error && (error as any).code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
