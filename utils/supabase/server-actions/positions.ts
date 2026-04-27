'use server';

import type { Database } from '@/types_db';
import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';

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
    `/businesses/${businessId}/lines/${lineId}`,
    'Success!',
    'Position added to the line.'
  );
}

export async function joinLinePublic(formData: FormData) {
  const name = String(formData.get('name')).trim();
  const phone = String(formData.get('phone')).trim() || null;
  const lineId = String(formData.get('lineId')).trim();

  const supabase = await createClient();

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
  
  // Update position status to 'called'
  await supabase
    .from('positions')
    .update({ status: 'called'} as never)
    .eq('id', positionId);
  
  // Update line's current position
  await supabase
    .from('lines')
    .update({ position: positionData?.position ?? null } as never)
    .eq('id', lineId);

  return getStatusRedirect(
    `/businesses/${businessId}/lines/${lineId}`,
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
    `/businesses/${businessId}/lines/${lineId}`,
    'Success!',
    `Position skipped`
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

  // Mark this position as called
  await supabase
    .from('positions')
    .update({ status: 'called' } as never)
    .eq('id', nextPositionData?.id ?? '0');

  // Update the line's current position
  await supabase
    .from('lines')
    .update({ position: nextPositionData?.position ?? null } as never)
    .eq('id', lineId);


  return getStatusRedirect(
    `/businesses/${businessId}/lines/${lineId}`,
    'Success!',
    `Next position has been called.`
  );
}

