import { NextRequest, NextResponse } from 'next/server';
import { getGoogleRedirectUri, isOAuthConfigured } from '@/app/lib/google-drive';

/** Shows the redirect URI this deployment sends to Google — use to fix redirect_uri_mismatch. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const redirectUri = getGoogleRedirectUri(origin);
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';

  return NextResponse.json({
    origin,
    redirectUri,
    envRedirectUriSet: Boolean(process.env.GOOGLE_REDIRECT_URI?.trim()),
    oauthConfigured: isOAuthConfigured(),
    clientIdSuffix: clientId ? clientId.slice(-20) : null,
    googleCloudHint:
      'In Google Cloud → Credentials → your Web OAuth client, add redirectUri exactly under Authorized redirect URIs.',
  });
}
