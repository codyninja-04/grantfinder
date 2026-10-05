import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server side client wired to the request cookies so auth carries through
 * server components, route handlers and server actions. RLS does the access
 * control, this only supplies the identity.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, where cookies are read only. The
            // middleware already refreshes the session, so this is safe.
          }
        },
      },
    }
  );
}
