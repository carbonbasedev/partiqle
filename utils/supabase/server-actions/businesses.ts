'use server';

import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';

export async function addBusiness(formData: FormData) {
  // Get form data
  const name = String(formData.get('name')).trim();
  const description = String(formData.get('description')).trim() || null;

  // Validate required fields
  if (!name) {
    return getErrorRedirect(
      '/businesses/new',
      'Business creation failed.',
      'Business name is required.'
    );
  }

  const supabase = createClient();

  // Get the current user
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return getErrorRedirect(
      '/businesses/new',
      'Business creation failed.',
      'You must be logged in to create a business.'
    );
  }

  // Insert the business
  const { error: insertError } = await supabase
    .from('businesses')
    .insert([
      {
        name,
        description,
        user_id: user.id
      }
    ]);

  if (insertError) {
    return getErrorRedirect(
      '/businesses/new',
      'Business creation failed.',
      insertError.message
    );
  }

  return getStatusRedirect(
    '/businesses',
    'Success!',
    'Your business has been created.'
  );
}


