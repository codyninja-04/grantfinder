import { NextResponse, type NextRequest } from 'next/server';
import { jsonError, zodMessage } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validation';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user.id).maybeSingle();
  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(zodMessage(parsed.error));

  const { data, error } = await supabase
    .from('business_profiles')
    .upsert({ ...parsed.data, user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ profile: data });
}
