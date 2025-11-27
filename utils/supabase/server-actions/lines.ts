'use server';

import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';

export async function addLine(formData: FormData) {
  const name = String(formData.get('name')).trim();
  const businessId = String(formData.get('businessId')).trim();

  if (!name) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/new`,
      'Line creation failed.',
      'Line name is required.'
    );
  }

  if (!businessId) {
    return getErrorRedirect(
      '/businesses',
      'Line creation failed.',
      'Business ID is required.'
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
      `/businesses/${businessId}/lines/new`,
      'Line creation failed.',
      'You must be logged in to create a line.'
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
      `/businesses/${businessId}/lines/new`,
      'Line creation failed.',
      'Business not found or you do not have permission.'
    );
  }

  // Insert the line
  const { error: insertError } = await supabase
    .from('lines')
    .insert([
      {
        name,
        business_id: businessId,
        position: 0
      }
    ]);

  if (insertError) {
    return getErrorRedirect(
      `/businesses/${businessId}/lines/new`,
      'Line creation failed.',
      insertError.message
    );
  }

  return getStatusRedirect(
    `/businesses/${businessId}/lines`,
    'Success!',
    'Your line has been created.'
  );
}


