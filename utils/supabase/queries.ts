import { cache } from 'react';
import type { SupabaseClient } from '@/utils/supabase/server';
import type { Database } from '@/types_db';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient): Promise<Database['public']['Tables']['users']['Row'] | null> => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

export const getBusinesses = cache(async (supabase: SupabaseClient) => {
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }

  return businesses || [];
});

export const getBusiness = cache(async (supabase: SupabaseClient, businessId: string): Promise<Database['public']['Tables']['businesses']['Row'] | null> => {
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error) {
    console.error('Error fetching business:', error);
    return null;
  }

  return business;
});

export const getLinesByBusiness = cache(async (supabase: SupabaseClient, businessId: string) => {
  const { data: lines, error } = await supabase
    .from('lines')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lines:', error);
    return [];
  }

  return lines || [];
});

export const getLineById = cache(async (supabase: SupabaseClient, lineId: string) => {
  const { data: line, error } = await supabase
    .from('lines')
    .select('*')
    .eq('id', lineId)
    .single();

  if (error) {
    console.error('Error fetching line:', error);
    return null;
  }

  return line;
});

export const getPositionsByLine = cache(async (supabase: SupabaseClient, lineId: string) => {
  const { data: positions, error } = await supabase
    .from('positions')
    .select('*')
    .eq('line_id', lineId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return positions || [];
});

export const getLineWithPositions = cache(async (supabase: SupabaseClient, lineId: string): Promise<(Database['public']['Tables']['lines']['Row'] & { positions: Database['public']['Tables']['positions']['Row'][] }) | null> => {
  const { data: line, error: lineError } = await supabase
    .from('lines')
    .select('*')
    .eq('id', lineId)
    .single();

  if (lineError || !line) {
    console.error('Error fetching line:', lineError);
    return null;
  }

  const { data: positions, error: positionsError } = await supabase
    .from('positions')
    .select('*')
    .eq('line_id', lineId)
    .order('position', { ascending: true });

  if (positionsError) {
    console.error('Error fetching positions:', positionsError);
    return { ...(line as Database['public']['Tables']['lines']['Row']), positions: [] };
  }

  return { ...(line as Database['public']['Tables']['lines']['Row']), positions: positions || [] };
});
