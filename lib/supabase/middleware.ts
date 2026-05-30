import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignora arquivos estáticos, rotas de API e frameworks internos do Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verifica se a rota já possui prefixo de locale ativo
  const hasLocale = ['/en', '/es'].some(
    (loc) => pathname.startsWith(`${loc}/`) || pathname === loc
  );

  if (hasLocale) return NextResponse.next();

  // Captura o país a partir do cabeçalho de borda da Vercel
  const geoCountry = (req as NextRequest & { geo?: { country?: string } }).geo?.country;
  const country = geoCountry || req.headers.get('x-vercel-ip-country') || 'US';

  if (country === 'MX') {
    req.nextUrl.pathname = `/es${pathname}`;
    return NextResponse.redirect(req.nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
