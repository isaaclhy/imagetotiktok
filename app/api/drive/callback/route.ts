import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  GOOGLE_DRIVE_OAUTH_STATE_COOKIE,
  GOOGLE_DRIVE_REFRESH_COOKIE,
  exchangeCodeForTokens,
  getGoogleRedirectUri,
  isOAuthConfigured,
} from '@/app/lib/google-drive';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const { searchParams } = request.nextUrl;

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/?settings=1&drive_auth=error&drive_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/?settings=1&drive_auth=error&drive_error=missing_params`);
  }

  if (!isOAuthConfigured()) {
    return NextResponse.redirect(`${origin}/?settings=1&drive_auth=error&drive_error=server_config`);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_DRIVE_OAUTH_STATE_COOKIE)?.value;
  if (!storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}/?settings=1&drive_auth=error&drive_error=invalid_state`);
  }

  try {
    const redirectUri = getGoogleRedirectUri(origin);
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const response = NextResponse.redirect(`${origin}/?settings=1&drive_auth=success`);
    response.cookies.set(GOOGLE_DRIVE_REFRESH_COOKIE, tokens.refresh_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.delete(GOOGLE_DRIVE_OAUTH_STATE_COOKIE);
    return response;
  } catch (e) {
    console.error('Google Drive OAuth callback failed:', e);
    const message = e instanceof Error ? e.message : 'token_exchange_failed';
    return NextResponse.redirect(
      `${origin}/?settings=1&drive_auth=error&drive_error=${encodeURIComponent(message)}`
    );
  }
}
