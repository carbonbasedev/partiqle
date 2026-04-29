'use server';

import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from 'utils/helpers';

export async function setBusinessName(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;

  if (!name) {
    return getErrorRedirect(
      '/account',
      'Business name required.',
      'Please enter a name for your business.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return getErrorRedirect(
      '/signin',
      'Not signed in.',
      'You must be logged in to manage your business.'
    );
  }

  const { data: existingRaw } = await supabase
    .from('businesses')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const existing = existingRaw as { id: string } | null;

  if (existing) {
    await supabase
      .from('businesses')
      .update({ name, description } as never)
      .eq('id', existing.id);

    return getStatusRedirect(
      '/account',
      'Saved.',
      'Your business name has been updated.'
    );
  }

  await supabase
    .from('businesses')
    .insert([{ name, description, user_id: user.id }] as any);

  return getStatusRedirect(
    '/manage',
    'Welcome!',
    'Your business is set up — start by adding your first line.'
  );
}
