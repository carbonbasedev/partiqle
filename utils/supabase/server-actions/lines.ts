'use server';

import { createClient } from '@/utils/supabase/server';
import { getStatusRedirect } from 'utils/helpers';

export async function addLine(formData: FormData) {
  const name = String(formData.get('name')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = await createClient();

  // Insert the line
  await supabase
    .from('lines')
    .insert([
      {
        name,
        business_id: businessId,
        position: 0
      }
    ] as any);

  return getStatusRedirect(
    `/businesses/${businessId}/lines`,
    'Success!',
    'Your line has been created.'
  );
}


