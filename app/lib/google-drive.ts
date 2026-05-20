import { OAuth2Client } from 'google-auth-library';

/** Create/upload files the user opens with this app; sufficient for uploads into a folder you own. */
export const DRIVE_OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

export const GOOGLE_DRIVE_REFRESH_COOKIE = 'google_drive_refresh_token';
export const GOOGLE_DRIVE_OAUTH_STATE_COOKIE = 'google_drive_oauth_state';

export function getDriveFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (!folderId) throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID');
  return folderId;
}

export function getGoogleRedirectUri(origin: string): string {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() || `${origin.replace(/\/$/, '')}/api/drive/callback`
  );
}

export function isOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      process.env.GOOGLE_DRIVE_FOLDER_ID?.trim()
  );
}

export function getOAuth2Client(redirectUri?: string): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }
  if (!redirectUri) {
    throw new Error('redirectUri is required');
  }
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(redirectUri: string): string {
  const client = getOAuth2Client(redirectUri);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [DRIVE_OAUTH_SCOPE],
  });
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const client = getOAuth2Client(redirectUri);
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error('No refresh token returned. Try disconnecting and connecting again.');
  }
  return tokens;
}

export async function getAccessTokenFromRefreshToken(refreshToken: string): Promise<string> {
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() || 'http://localhost:3000/api/drive/callback';
  const client = getOAuth2Client(redirectUri);
  client.setCredentials({ refresh_token: refreshToken });
  const tokenResponse = await client.getAccessToken();
  const accessToken = tokenResponse.token;
  if (!accessToken) throw new Error('Failed to refresh Google access token');
  return accessToken;
}

export async function uploadBufferToDrive(
  refreshToken: string,
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ id?: string | null; name?: string | null; webViewLink?: string | null }> {
  const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
  const folderId = getDriveFolderId();
  const metadata = JSON.stringify({ name: filename, parents: [folderId] });
  const boundary = `bleamies_${Date.now()}`;

  const preamble = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    'utf8'
  );
  const closing = Buffer.from(`\r\n--${boundary}--`, 'utf8');
  const body = Buffer.concat([preamble, buffer, closing]);

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(body.length),
    },
    body,
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    id?: string;
    name?: string;
    webViewLink?: string;
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Drive upload failed (${res.status})`);
  }

  return data;
}
