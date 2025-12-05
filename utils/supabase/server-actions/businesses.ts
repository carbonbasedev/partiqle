'use server';

import type { TablesInsert } from '@/types_db';
import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';

export async function addBusiness(formData: FormData) {

  const name = String(formData.get('name')).trim();
  const description = String(formData.get('description')).trim() || null;

  const supabase = await createClient();

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
  const businessData: TablesInsert<'businesses'> = {
    name,
    description,
    user_id: user.id
  };

  await supabase
    .from('businesses')
    .insert([businessData]);

  return getStatusRedirect(
    '/businesses',
    'Success!',
    'Your business has been created.'
  );
}


