import { OAuth2Client } from 'google-auth-library';

/** Per-file Drive access (non-sensitive scope — no Google app verification required). */
export const DRIVE_OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';

export const GOOGLE_DRIVE_REFRESH_COOKIE = 'google_drive_refresh_token';
export const GOOGLE_DRIVE_OAUTH_STATE_COOKIE = 'google_drive_oauth_state';

export function getDriveFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (!folderId) throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID');
  return folderId;
}

export function resolveDriveFolderId(override?: string | null): string {
  const folderId = override?.trim() || getDriveFolderId();
  if (!/^[\w-]+$/.test(folderId)) {
    throw new Error('Invalid Google Drive folder ID');
  }
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
  mimeType: string,
  folderIdOverride?: string | null
): Promise<{ id?: string | null; name?: string | null; webViewLink?: string | null }> {
  const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
  const folderId = resolveDriveFolderId(folderIdOverride);
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

type DriveListItem = { id: string; mimeType?: string | null };

async function driveApiRequest(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${DRIVE_FILES_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });
}

async function listDirectChildren(accessToken: string, folderId: string): Promise<DriveListItem[]> {
  const items: DriveListItem[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,mimeType)',
      pageSize: '200',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await driveApiRequest(accessToken, `?${params.toString()}`);
    const data = (await res.json()) as {
      error?: { message?: string };
      files?: DriveListItem[];
      nextPageToken?: string;
    };
    if (!res.ok) {
      throw new Error(data.error?.message || `Drive list failed (${res.status})`);
    }
    items.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await driveApiRequest(accessToken, `/${fileId}?supportsAllDrives=true`, { method: 'DELETE' });
  if (res.status === 204 || res.status === 200) return;

  const data = (await res.json()) as { error?: { message?: string } };
  throw new Error(data.error?.message || `Drive delete failed (${res.status})`);
}

async function clearDriveFolderContentsWithToken(accessToken: string, folderId: string): Promise<number> {
  const children = await listDirectChildren(accessToken, folderId);
  let deleted = 0;

  for (const child of children) {
    if (child.mimeType === DRIVE_FOLDER_MIME) {
      deleted += await clearDriveFolderContentsWithToken(accessToken, child.id);
    }
    await deleteDriveFile(accessToken, child.id);
    deleted += 1;
  }

  return deleted;
}

export async function clearDriveFolderContents(
  refreshToken: string,
  folderIdOverride?: string | null
): Promise<{ deleted: number }> {
  const accessToken = await getAccessTokenFromRefreshToken(refreshToken);
  const folderId = resolveDriveFolderId(folderIdOverride);
  const deleted = await clearDriveFolderContentsWithToken(accessToken, folderId);
  return { deleted };
}
