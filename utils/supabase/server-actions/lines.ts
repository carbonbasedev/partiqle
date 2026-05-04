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
    `/manage`,
    'Success!',
    'Your line has been created.'
  );
}

export async function togglePaused(formData: FormData) {
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();
  const paused = String(formData.get('paused')) === 'true';

  const supabase = await createClient();

  await supabase
    .from('lines')
    .update({ paused: !paused } as never)
    .eq('id', lineId);

  return getStatusRedirect(
    `/manage/${lineId}`,
    'Success!',
    paused ? 'Line resumed.' : 'Line paused — new joins blocked.'
  );
}

export async function deleteLine(formData: FormData) {
  const lineId = String(formData.get('lineId')).trim();

  const supabase = await createClient();

  // positions has ON DELETE CASCADE on the line FK, so removing the line
  // also removes its positions and any push subscriptions tied to them.
  await supabase.from('lines').delete().eq('id', lineId);

  return getStatusRedirect(
    `/manage`,
    'Line deleted.',
    'The line and all related data were removed.'
  );
}

export async function resetLine(formData: FormData) {
  const lineId = String(formData.get('lineId')).trim();
  const businessId = String(formData.get('businessId')).trim();

  const supabase = await createClient();

  // Delete every position for this line, then reset the served counter and average.
  await supabase.from('positions').delete().eq('line_id', lineId);
  await supabase
    .from('lines')
    .update({ position: 0, avg_serve_seconds: null } as never)
    .eq('id', lineId);

  return getStatusRedirect(
    `/manage/${lineId}`,
    'Line reset.',
    'All positions were removed and numbering restarts at 1.'
  );
}
