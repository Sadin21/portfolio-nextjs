import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Browser-safe Supabase client using the public anonymous key.
 * Safe to use in client components.
 */
export const supabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
