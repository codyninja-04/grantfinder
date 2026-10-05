import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

/** For server components inside the signed in area. */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}
