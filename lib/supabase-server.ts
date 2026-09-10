import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-side Supabase client with admin (service_role) privileges.
 * Bypasses Row Level Security (RLS) for server routes, vector retrieval, and session management.
 * NEVER expose this client to the browser.
 */
export const supabaseServer = createClient(
  supabaseUrl || '',
  supabaseServiceRoleKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
