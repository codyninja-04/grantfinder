'use client';

import { createBrowserClient } from '@supabase/ssr';

// Browser side Supabase client. Rows are cast to the hand written types in
// @/lib/types at the call site rather than wiring up generated types.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
