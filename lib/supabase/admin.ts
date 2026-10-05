import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service role client for the few writes users are not allowed to make
 * themselves, like logging usage events after an AI call. Only ever import
 * this from route handlers.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
