import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'app_auth';

// Routes that do NOT require password (Spill It page and auth flow)
const PUBLIC_PATHS = ['/spill-it', '/password', '/api/auth'];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/spill-it')) return true;
  if (pathname === '/password') return true;
  if (pathname.startsWith('/api/auth')) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const hasAuth = request.cookies.get(AUTH_COOKIE)?.value === '1';

  if (!hasAuth) {
    const url = new URL('/password', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
