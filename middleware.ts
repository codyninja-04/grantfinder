import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const APP_ROUTES = ['/dashboard', '/business-profile', '/grants', '/applications', '/settings'];
const AUTH_ROUTES = ['/login', '/signup'];

/**
 * Refreshes the Supabase session on every request and bounces people to the
 * right side of the auth wall. Data access is still enforced by RLS.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const inApp = APP_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));
  const onAuth = AUTH_ROUTES.includes(path);

  if (!user && inApp) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  if (user && (onAuth || path === '/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
