'use server';

import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';

export async function addPosition(formData: FormData) {
  const name = String(formData.get('name')).trim();
  const phone = String(formData.get('phone')).trim() || null;
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  if (!name) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Position creation failed.',
      'Name is required.'
    );
  }

  if (!lineId || !businessId) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines`,
      'Position creation failed.',
      'Line ID and Business ID are required.'
    );
  }

  const supabase = createClient();

  // Verify user owns the business
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Position creation failed.',
      'You must be logged in to add a position.'
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Position creation failed.',
      'Business not found or you do not have permission.'
    );
  }

  // Verify line belongs to business
  const { data: line } = await supabase
    .from('lines')
    .select('id')
    .eq('id', lineId)
    .eq('business_id', businessId)
    .single();

  if (!line) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Position creation failed.',
      'Line not found or does not belong to this business.'
    );
  }

  // Get the highest position number for this line
  const { data: lastPosition } = await supabase
    .from('positions')
    .select('position')
    .eq('line_id', lineId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

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
    ]);

  if (insertError) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Position creation failed.',
      insertError.message
    );
  }

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

  if (!name) {
    return getErrorRedirect(
      `/lines/${lineId}/join`,
      'Join failed.',
      'Name is required.'
    );
  }

  if (!lineId) {
    return getErrorRedirect(
      '/',
      'Join failed.',
      'Line ID is required.'
    );
  }

  const supabase = createClient();

  // Verify line exists
  const { data: line } = await supabase
    .from('lines')
    .select('id')
    .eq('id', lineId)
    .single();

  if (!line) {
    return getErrorRedirect(
      '/',
      'Join failed.',
      'Line not found.'
    );
  }

  // Get the highest position number for this line
  const { data: lastPosition } = await supabase
    .from('positions')
    .select('position')
    .eq('line_id', lineId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = lastPosition?.position ? Number(lastPosition.position) + 1 : 1;

  // Insert the position and return the created row
  const { data: newPosition, error: insertError } = await supabase
    .from('positions')
    .insert([
      {
        name,
        phone,
        line_id: lineId,
        position: nextPosition,
        status: 'waiting'
      }
    ])
    .select()
    .single();

  if (insertError || !newPosition) {
    return getErrorRedirect(
      `/lines/${lineId}/join`,
      'Join failed.',
      insertError?.message || 'Unable to join the line.'
    );
  }

  return getStatusRedirect(
    `/lines/${lineId}/positions/${newPosition.id}`,
    'You\'re in line!',
    `You are position #${newPosition.position}.`
  );
}

export async function callPosition(formData: FormData) {
  const positionId = String(formData.get('positionId')).trim();
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  if (!positionId || !lineId || !businessId) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call position.',
      'Missing required parameters.'
    );
  }

  const supabase = createClient();

  // Verify user owns the business
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call position.',
      'You must be logged in.'
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call position.',
      'Business not found or you do not have permission.'
    );
  }

  // Get the position
  const { data: position } = await supabase
    .from('positions')
    .select('*')
    .eq('id', positionId)
    .eq('line_id', lineId)
    .single();

  if (!position || position.status !== 'waiting') {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call position.',
      'Position not found or is not waiting.'
    );
  }

  // Update position status to 'called'
  const { error: updateError } = await supabase
    .from('positions')
    .update({ status: 'called' })
    .eq('id', positionId);

  if (updateError) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call position.',
      updateError.message
    );
  }

  // Update line's current position
  const { error: lineUpdateError } = await supabase
    .from('lines')
    .update({ position: position.position })
    .eq('id', lineId);

  if (lineUpdateError) {
    console.error('Error updating line position:', lineUpdateError);
  }

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

  if (!positionId || !lineId || !businessId) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to skip position.',
      'Missing required parameters.'
    );
  }

  const supabase = createClient();

  // Verify user owns the business
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to skip position.',
      'You must be logged in.'
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to skip position.',
      'Business not found or you do not have permission.'
    );
  }

  // Get the position
  const { data: position } = await supabase
    .from('positions')
    .select('*')
    .eq('id', positionId)
    .eq('line_id', lineId)
    .single();

  if (!position || position.status !== 'waiting') {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to skip position.',
      'Position not found or is not waiting.'
    );
  }

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

  if (!lineId || !businessId) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call next position.',
      'Missing required parameters.'
    );
  }

  const supabase = createClient();

  // Verify user owns the business
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call next position.',
      'You must be logged in.'
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/${lineId}`,
      'Failed to call next position.',
      'Business not found or you do not have permission.'
    );
  }

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

