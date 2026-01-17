import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=tiktok_auth_failed`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=missing_params`
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('tiktok_oauth_state')?.value;
  const codeVerifier = cookieStore.get('tiktok_code_verifier')?.value;

  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=invalid_state`
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=missing_code_verifier`
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  let redirectUri =
    process.env.TIKTOK_REDIRECT_URI ??
    `${request.nextUrl.origin}/api/tiktok/callback`;
  
  // Ensure redirect URI ends with trailing slash if it's a path (per TikTok docs)
  if (redirectUri && !redirectUri.includes('?') && !redirectUri.includes('#') && !redirectUri.endsWith('/')) {
    redirectUri = redirectUri + '/';
  }

  if (!clientKey || !clientSecret) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=server_config_error`
    );
  }

  const tokenRes = await fetch(
    'https://open.tiktokapis.com/v2/oauth/token/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }
  );

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error('TikTok token error:', tokenData);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/?error=token_exchange_failed`
    );
  }

  const response = NextResponse.redirect(
    `${request.nextUrl.origin}/?tiktok_auth=success`
  );

  response.cookies.set('tiktok_access_token', tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenData.expires_in ?? 86400,
  });

  if (tokenData.refresh_token) {
    response.cookies.set(
      'tiktok_refresh_token',
      tokenData.refresh_token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      }
    );
  }

  response.cookies.delete('tiktok_oauth_state');
  response.cookies.delete('tiktok_code_verifier');

  return response;
}
