import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/signin',
  '/sign-in',
  '/signup',
  '/sign-up',
  '/reset-password',
  '/forgot-password',
  '/otp',
  '/signin',
  '/signup',
  '/reset-password',
  '/forgot-password',
  '/otp',
  '/oauth-callback',
  '/share',
  '/human-input',
  '/education',
  '/webapp-unavailable',
  '/monitoring',
  '/api/health',
  '/console/api',
  '/api'
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API requests pass through without HTML redirect
  if (pathname.startsWith('/console/api') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('console_token')?.value;

  if (!token) {
    const signInUrl = new URL('/signin', request.url);
    if (pathname !== '/') {
      signInUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes if needed
    '/(api|trpc)(.*)'
  ]
};
