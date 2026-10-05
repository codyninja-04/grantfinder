import { NextResponse, type NextRequest } from 'next/server';
import { jsonError, zodMessage } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { applicationUpdateSchema } from '@/lib/validation';

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const parsed = applicationUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(zodMessage(parsed.error));

  // Only send keys the client actually included so partial updates stay partial.
  const patch = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));

  const { data, error } = await supabase
    .from('grant_applications')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError('Application not found', 404);
  return NextResponse.json({ application: data });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const { error } = await supabase.from('grant_applications').delete().eq('id', params.id).eq('user_id', user.id);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
