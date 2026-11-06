import { NextRequest, NextResponse } from 'next/server';
import { isAppAuthed, unauthorizedAppResponse } from '@/app/lib/app-auth';
import {
  ensureBinaryBatch,
  ensureCartoonOriginals,
  ensurePhotoRevision,
  listVideoLibrary,
} from '@/app/lib/video-library/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/** Saved cartoon quiz videos. Requires the same site password cookie as the rest of the app. */
export async function GET(request: NextRequest) {
  if (!isAppAuthed(request)) return unauthorizedAppResponse();
  try {
    await ensureCartoonOriginals();
    await ensureBinaryBatch();
    await ensurePhotoRevision();
    const videos = await listVideoLibrary();
    return NextResponse.json({ videos });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load the video library';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
