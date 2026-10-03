import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL ?? '';

export const IMAGE_BUCKET = 'product-images';

export const supabase: SupabaseClient | null =
  URL && ANON_KEY ? createClient(URL, ANON_KEY) : null;
