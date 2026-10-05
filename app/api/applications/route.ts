import { NextResponse, type NextRequest } from 'next/server';
import { jsonError, zodMessage } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { LIMITS, getTier } from '@/lib/usage';
import { applicationCreateSchema } from '@/lib/validation';

const SELECT = '*, grant:grants(id, name, short_name, provider, funding_percent, application_complexity)';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const { data, error } = await supabase
    .from('grant_applications')
    .select(SELECT)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ applications: data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return jsonError('Sign in first', 401);

  const parsed = applicationCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(zodMessage(parsed.error));

  const tier = await getTier(supabase, user.id);
  const limit = LIMITS[tier].trackedApplications;
  if (Number.isFinite(limit)) {
    const { count } = await supabase
      .from('grant_applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('status', 'in', '(approved,rejected)');
    if ((count ?? 0) >= limit) {
      return jsonError(`The free plan tracks up to ${limit} open applications. Close one or upgrade to Pro.`, 402, { upgrade: true });
    }
  }

  const { data: grant } = await supabase.from('grants').select('id').eq('id', parsed.data.grant_id).maybeSingle();
  if (!grant) return jsonError('Grant not found', 404);

  const { data, error } = await supabase
    .from('grant_applications')
    .insert({ user_id: user.id, grant_id: parsed.data.grant_id, title: parsed.data.title ?? null })
    .select('id')
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ application: data }, { status: 201 });
}
