import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files, API routes, and Next.js internals.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // NEVER touch auth routes. The OAuth callback (/auth/callback) carries the
  // PKCE code + verifier cookie; redirecting it (e.g. to /es/auth/callback)
  // breaks the code exchange and the login fails. Leave all /auth/* alone.
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Already has an active locale prefix.
  const hasLocale = ['/en', '/es'].some(
    (loc) => pathname.startsWith(`${loc}/`) || pathname === loc
  );
  if (hasLocale) return NextResponse.next();

  // Geo redirect by Vercel edge country header.
  const country = req.headers.get('x-vercel-ip-country') || 'US';
  if (country === 'MX') {
    req.nextUrl.pathname = `/es${pathname}`;
    return NextResponse.redirect(req.nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
