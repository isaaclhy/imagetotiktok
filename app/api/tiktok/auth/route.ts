import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

// PKCE helpers
function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  let redirectUri =
    process.env.TIKTOK_REDIRECT_URI ??
    `${request.nextUrl.origin}/api/tiktok/callback`;
  
  // Ensure redirect URI ends with trailing slash if it's a path (per TikTok docs)
  if (redirectUri && !redirectUri.includes('?') && !redirectUri.includes('#') && !redirectUri.endsWith('/')) {
    redirectUri = redirectUri + '/';
  }

  if (!clientKey) {
    return NextResponse.json(
      { error: 'Missing TIKTOK_CLIENT_KEY' },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');

  authUrl.searchParams.set('client_key', clientKey);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'user.info.basic,video.publish');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  response.cookies.set('tiktok_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}
