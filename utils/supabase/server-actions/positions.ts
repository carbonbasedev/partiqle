'use server';

import type { Database } from '@/types_db';
import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';

export async function addPosition(formData: FormData) {
  const name = String(formData.get('name')).trim();
  const phone = String(formData.get('phone')).trim() || null;
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = createClient();

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
  const { error: insertError } = await supabase
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

  const supabase = createClient();

  const { data: lastPositionRaw } = await supabase
    .from('positions')
    .select('*')
    .eq('line_id', lineId)
    .order('position', { ascending: false })
    .limit(1)
    .returns<Pick<Database['public']['Tables']['positions']['Row'], 'position'>>()
    .single();

  const lastPosition = lastPositionRaw as Pick<Database['public']['Tables']['positions']['Row'], 'position'> | null;
  const nextPosition = lastPosition?.position ? Number(lastPosition.position) + 1 : 1;

  // Insert the position and return the created row
  const { data: newPositionRaw, error: insertError } = await supabase
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

  if (!newPosition) {
    return getErrorRedirect(
      `/lines/${lineId}/join`,
      'Join failed.',
      'Unable to join the line.'
    );
  }

  return getStatusRedirect(
    `/lines/${lineId}/positions/${newPosition.id}`,
    'You\'re in line!',
    `You are position #${newPosition?.position}.`
  );
}

export async function callPosition(formData: FormData) {
  const positionId = String(formData.get('positionId')).trim();
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = createClient();

  // Update position status to 'called'
  const { error: updateError } = await supabase
    .from('positions')
    .update({ status: 'called' })
    .eq('id', positionId);

  // Update line's current position
  const { error: lineUpdateError } = await supabase
    .from('lines')
    .update({ position: position.position })
    .eq('id', lineId);


  return getStatusRedirect(
    `/businesses/${businessId}/lines/${lineId}`,
    'Success!',
    `Position ${position.position} (${position.name}) has been called.`
  );
}

export async function skipPosition(formData: FormData) {
  const positionId = String(formData.get('positionId')).trim();
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = createClient();


  // Update position status to 'skipped'
  const { error: updateError } = await supabase
    .from('positions')
    .update({ status: 'skipped' })
    .eq('id', positionId);

  if (updateError) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to skip position.',
      updateError.message
    );
  }

  return getStatusRedirect(
    `/businesses/${businessId}/lines/${lineId}`,
    'Success!',
    `Position ${position.position} (${position.name}) has been skipped.`
  );
}

export async function callNextPosition(formData: FormData) {
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();


  const supabase = createClient();

  // Find the next waiting position in this line
  const { data: nextPosition, error: nextError } = await supabase
    .from('positions')
    .select('*')
    .eq('line_id', lineId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextError) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call next position.',
      nextError.message
    );
  }

  if (!nextPosition) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'No one is waiting in line.',
      'There are no waiting positions to call.'
    );
  }

  // Mark this position as called
  const { error: updateError } = await supabase
    .from('positions')
    .update({ status: 'called' })
    .eq('id', nextPosition.id);

  if (updateError) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call next position.',
      updateError.message
    );
  }

  // Update the line's current position
  const { error: lineUpdateError } = await supabase
    .from('lines')
    .update({ position: nextPosition.position })
    .eq('id', lineId);

  if (lineUpdateError) {
    console.error('Error updating line position:', lineUpdateError);
  }

  return getStatusRedirect(
    `/businesses/${businessId}/lines/${lineId}`,
    'Success!',
    `Next position ${nextPosition.position} (${nextPosition.name}) has been called.`
  );
}

