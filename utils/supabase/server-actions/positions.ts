'use server';

import type { Database } from '@/types_db';
import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';
import { sendCallNotification } from '@/utils/push';

export async function addPosition(formData: FormData) {
  const name = String(formData.get('name')).trim();
  const phone = String(formData.get('phone')).trim() || null;
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = await createClient();

  // Get the highest position number for this line
  const { data: lastPositionRaw } = await supabase
    .from('positions')
    .select('position')
    .eq('line_id', lineId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastPosition = lastPositionRaw as Pick<Database['public']['Tables']['positions']['Row'], 'position'> | null;
  const nextPosition = lastPosition?.position ? Number(lastPosition.position) + 1 : 1;

  // Insert the position
  await supabase
    .from('positions')
    .insert([
      {
        name,
        phone,
        line_id: lineId,
        position: nextPosition,
        status: 'waiting'
      }
    ] as any);

  return getStatusRedirect(
    `/manage/${lineId}`,
    'Success!',
    'Position added to the line.'
  );
}

export async function joinLinePublic(formData: FormData) {
  const name = String(formData.get('name')).trim();
  const phone = String(formData.get('phone')).trim() || null;
  const lineId = String(formData.get('lineId')).trim();

  const supabase = await createClient();

  const { data: lineRow } = await supabase
    .from('lines')
    .select('paused')
    .eq('id', lineId)
    .maybeSingle();
  if ((lineRow as any)?.paused) {
    return getErrorRedirect(
      `/lines/${lineId}/join`,
      'Line is paused.',
      'This line is not accepting new joins right now.'
    );
  }

  const { data: lastPositionRaw } = await supabase
    .from('positions')
    .select('*')
    .eq('line_id', lineId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastPosition = lastPositionRaw as Pick<Database['public']['Tables']['positions']['Row'], 'position'> | null;
  const nextPosition = lastPosition?.position ? Number(lastPosition.position) + 1 : 1;

  // Insert the position and return the created row
  const { data: newPositionRaw} = await supabase
    .from('positions')
    .insert([
      {
        name,
        phone,
        line_id: lineId,
        position: nextPosition,
        status: 'waiting'
      }
    ] as any)
    .select()
    .single();

  const newPosition = newPositionRaw as Pick<Database['public']['Tables']['positions']['Row'], 'id' | 'position'> | null;

  return getStatusRedirect(
    `/lines/${lineId}/positions/${newPosition?.id}`,
    'You\'re in line!',
    `You are position #${newPosition?.position}.`
  );
}

async function closeOpenServeAndRecomputeAvg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lineId: string
) {
  const now = new Date().toISOString();

  // Stamp served_at on any currently-called position that hasn't been closed yet.
  await supabase
    .from('positions')
    .update({ served_at: now } as never)
    .eq('line_id', lineId)
    .eq('status', 'called')
    .is('served_at', null);

  // Recompute the line's average from every closed serve sample.
  const { data: rows } = await supabase
    .from('positions')
    .select('called_at, served_at')
    .eq('line_id', lineId)
    .not('called_at', 'is', null)
    .not('served_at', 'is', null);

  const samples =
    (rows as { called_at: string; served_at: string }[] | null) ?? [];
  const totalSeconds = samples.reduce((acc, r) => {
    const dt =
      (new Date(r.served_at).getTime() - new Date(r.called_at).getTime()) /
      1000;
    return acc + (Number.isFinite(dt) && dt >= 0 ? dt : 0);
  }, 0);
  const avg = samples.length > 0 ? totalSeconds / samples.length : null;

  await supabase
    .from('lines')
    .update({ avg_serve_seconds: avg } as never)
    .eq('id', lineId);
}

export async function callPosition(formData: FormData) {
  const positionId = String(formData.get('positionId')).trim();
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = await createClient();

  const { data: position } = await supabase
  .from('positions')
  .select('*')
  .eq('id', positionId)
  .single();

  const positionData = position as Database['public']['Tables']['positions']['Row'] | null;

  // Close the previously called position (if any) and recompute the line's average.
  await closeOpenServeAndRecomputeAvg(supabase, lineId);

  // Update position status to 'called' and stamp called_at
  await supabase
    .from('positions')
    .update({
      status: 'called',
      called_at: new Date().toISOString(),
      served_at: null
    } as never)
    .eq('id', positionId);

  // Update line's current position
  await supabase
    .from('lines')
    .update({ position: positionData?.position ?? null } as never)
    .eq('id', lineId);

  await sendCallNotification(positionId);

  return getStatusRedirect(
    `/manage/${lineId}`,
    'Success!',
    `Position has been called.`
  );
}

export async function skipPosition(formData: FormData) {
  const positionId = String(formData.get('positionId')).trim();
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = await createClient();

  // Update position status to 'skipped'
  await supabase
    .from('positions')
    .update({ status: 'skipped' } as never)
    .eq('id', positionId);

  return getStatusRedirect(
    `/manage/${lineId}`,
    'Success!',
    `Position skipped`
  );
}

const TEST_FIRST_NAMES = [
  'Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Luna', 'Mason',
  'Iris', 'Owen', 'Maya', 'Leo', 'Nora', 'Eli', 'Cora', 'Finn',
  'Ruby', 'Jude', 'Hazel', 'Theo'
];
const TEST_LAST_NAMES = [
  'Patel', 'Nguyen', 'Garcia', 'Kim', 'Silva', 'Khan', 'Rossi',
  'Müller', 'Costa', 'Brown', 'Jones', 'Yamada', 'Dubois', 'Andersen'
];

function randomTestName() {
  const first =
    TEST_FIRST_NAMES[Math.floor(Math.random() * TEST_FIRST_NAMES.length)];
  const last =
    TEST_LAST_NAMES[Math.floor(Math.random() * TEST_LAST_NAMES.length)];
  return `${first} ${last}`;
}

function randomTestPhone() {
  const part = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `+1 555 ${part().slice(0, 3)}-${part()}`;
}

export async function addTestCustomers(formData: FormData) {
  const lineId = String(formData.get('lineId')).trim();
  const count = 10;

  const supabase = await createClient();

  const { data: lastPositionRaw } = await supabase
    .from('positions')
    .select('position')
    .eq('line_id', lineId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastPosition =
    (lastPositionRaw as { position: number | null } | null)?.position ?? 0;

  const rows = Array.from({ length: count }, (_, i) => ({
    name: randomTestName(),
    phone: randomTestPhone(),
    line_id: lineId,
    position: Number(lastPosition) + i + 1,
    status: 'waiting'
  }));

  await supabase.from('positions').insert(rows as any);

  return getStatusRedirect(
    `/manage/${lineId}`,
    'Test customers added',
    `${count} test customers were added to the queue.`
  );
}

export async function leaveLine(formData: FormData) {
  const positionId = String(formData.get('positionId')).trim();
  const lineId = String(formData.get('lineId')).trim();

  const supabase = await createClient();

  const { data: positionRow } = await supabase
    .from('positions')
    .select('status')
    .eq('id', positionId)
    .maybeSingle();

  const status = (positionRow as { status: string } | null)?.status;

  if (status !== 'waiting') {
    return getErrorRedirect(
      `/lines/${lineId}/positions/${positionId}`,
      'Cannot leave',
      'This ticket is no longer waiting in the queue.'
    );
  }

  await supabase.from('positions').delete().eq('id', positionId);

  // Touch the line row so subscribers (filtered by line_id) get a realtime
  // event. The DELETE on positions can't be filtered server-side without
  // REPLICA IDENTITY FULL, so we piggy-back on the lines table subscription.
  const { data: lineRow } = await supabase
    .from('lines')
    .select('position')
    .eq('id', lineId)
    .maybeSingle();
  await supabase
    .from('lines')
    .update({ position: (lineRow as { position: number | null } | null)?.position ?? null } as never)
    .eq('id', lineId);

  return getStatusRedirect(
    `/lines/${lineId}/join`,
    'You left the line.',
    'Your spot has been removed from the queue.'
  );
}

export async function callNextPosition(formData: FormData) {
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = await createClient();

  // Find the next waiting position in this line
  const { data: nextPosition } = await supabase
    .from('positions')
    .select('*')
    .eq('line_id', lineId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle();

  const nextPositionData = nextPosition as Database['public']['Tables']['positions']['Row'] | null;

  // Close the previously called position (if any) and recompute the line's average.
  await closeOpenServeAndRecomputeAvg(supabase, lineId);

  // Mark this position as called and stamp called_at
  if (nextPositionData?.id) {
    await supabase
      .from('positions')
      .update({
        status: 'called',
        called_at: new Date().toISOString(),
        served_at: null
      } as never)
      .eq('id', nextPositionData.id);
  }

  // Update the line's current position
  await supabase
    .from('lines')
    .update({ position: nextPositionData?.position ?? null } as never)
    .eq('id', lineId);

  if (nextPositionData?.id) {
    await sendCallNotification(nextPositionData.id);
  }

  return getStatusRedirect(
    `/manage/${lineId}`,
    'Success!',
    `Next position has been called.`
  );
}

