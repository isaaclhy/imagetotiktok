import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  GOOGLE_DRIVE_REFRESH_COOKIE,
  isOAuthConfigured,
  uploadBufferToDrive,
} from '@/app/lib/google-drive';

const MAX_BYTES = 25 * 1024 * 1024;

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
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 25 MB)' }, { status: 400 });
    }

    const folderIdRaw = formData.get('folderId');
    const folderId = typeof folderIdRaw === 'string' ? folderIdRaw : undefined;

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\-]+/g, '_') || 'upload.png';
    const uploaded = await uploadBufferToDrive(
      refreshToken,
      buffer,
      safeName,
      file.type || 'image/png',
      folderId
    );

    return NextResponse.json({
      id: uploaded.id,
      name: uploaded.name,
      webViewLink: uploaded.webViewLink,
    });
  } catch (e) {
    console.error('Drive upload failed:', e);
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
