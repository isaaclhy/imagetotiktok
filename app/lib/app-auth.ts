import { NextRequest, NextResponse } from 'next/server';

export const APP_AUTH_COOKIE = 'app_auth';

export function isAppAuthed(request: NextRequest): boolean {
  return request.cookies.get(APP_AUTH_COOKIE)?.value === '1';
}

export function unauthorizedAppResponse() {
  return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
}
