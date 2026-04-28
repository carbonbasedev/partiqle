import 'server-only';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';

let configured = false;
function configure() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !sub) {
    throw new Error('VAPID keys not configured');
  }
  webpush.setVapidDetails(sub, pub, priv);
  configured = true;
}

function adminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function sendCallNotification(positionId: number | string) {
  try {
    configure();
  } catch {
    return;
  }
  const supabase = adminClient();
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, position_id')
    .eq('position_id', positionId);

  const rows = (subs as any[]) || [];
  if (rows.length === 0) return;

  // Look up the position so we can include the number in the message
  const { data: pos } = await supabase
    .from('positions')
    .select('position, line_id')
    .eq('id', positionId)
    .maybeSingle();
  const positionNumber = (pos as any)?.position;
  const lineId = (pos as any)?.line_id;

  const payload = JSON.stringify({
    title: "It's your turn",
    body:
      positionNumber != null
        ? `Position #${String(positionNumber).padStart(3, '0')} — head to the counter.`
        : 'Head to the counter.',
    tag: `call:${positionId}`,
    url: lineId ? `/lines/${lineId}/positions/${positionId}` : '/'
  });

  await Promise.all(
    rows.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth }
          },
          payload
        );
      } catch (err: any) {
        // Stale endpoint — clean it up so we don't keep retrying.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', s.id);
        }
      }
    })
  );
}
