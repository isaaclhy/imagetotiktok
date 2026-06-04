import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  GOOGLE_DRIVE_REFRESH_COOKIE,
  clearDriveFolderContents,
  isOAuthConfigured,
} from '@/app/lib/google-drive';

export async function POST(request: Request) {
  if (!isOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          'Google Drive is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_DRIVE_FOLDER_ID in .env.local.',
      },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(GOOGLE_DRIVE_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Not connected to Google Drive. Click Connect Google Drive first.' },
      { status: 401 }
    );
  }

  try {
    let folderId: string | undefined;
    try {
      const body = (await request.json()) as { folderId?: string };
      folderId = typeof body.folderId === 'string' ? body.folderId : undefined;
    } catch {
      folderId = undefined;
    }

    const result = await clearDriveFolderContents(refreshToken, folderId);
    return NextResponse.json(result);
  } catch (e) {
    console.error('Drive clear-folder failed:', e);
    const message = e instanceof Error ? e.message : 'Failed to clear folder';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
