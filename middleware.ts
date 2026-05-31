import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: This app does NOT use URL-prefixed locales (there are no /es or /en
// route folders). Language is handled in-app by the i18n provider/toggle.
// A previous version redirected MX visitors to /es, which 404s and also broke
// the OAuth callback. This middleware now passes everything through untouched.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
