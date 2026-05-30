import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || PUBLIC_FILE.test(pathname)) {
    return response;
  }

  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  const hasSavedLanguage = Boolean(req.cookies.get('signalboost_language')?.value || req.cookies.get('site-language')?.value);

  if (country === 'MX' && !hasSavedLanguage) {
    response.cookies.set('signalboost_language', 'es', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    response.cookies.set('site-language', 'es', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
