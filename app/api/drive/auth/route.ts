import { NextRequest, NextResponse } from 'next/server';
import {
  GOOGLE_DRIVE_OAUTH_STATE_COOKIE,
  getGoogleAuthUrl,
  getGoogleRedirectUri,
  isOAuthConfigured,
} from '@/app/lib/google-drive';

export async function GET(request: NextRequest) {
  if (!isOAuthConfigured()) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_DRIVE_FOLDER_ID.' },
      { status: 503 }
    );
  }

  const redirectUri = getGoogleRedirectUri(request.nextUrl.origin);
  const state = crypto.randomUUID();
  const authUrl = getGoogleAuthUrl(redirectUri);

  const url = new URL(authUrl);
  url.searchParams.set('state', state);

  const response = NextResponse.redirect(url.toString());
  response.cookies.set(GOOGLE_DRIVE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}
