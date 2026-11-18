import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default async function proxy(request: NextRequest, _event: NextFetchEvent) {
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|_vercel|monitoring|api|.*\\..*).*)',
};
