import { NextRequest, NextResponse } from 'next/server';
import { isAppAuthed, unauthorizedAppResponse } from '@/app/lib/app-auth';
import { deleteVideoLibraryItem, getVideoLibraryDoc } from '@/app/lib/video-library/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

function attachmentName(filename: string): string {
  const cleaned = filename.replace(/[^A-Za-z0-9._-]+/g, '') || 'video.mp4';
  return cleaned.toLowerCase().endsWith('.mp4') ? cleaned : `${cleaned}.mp4`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAppAuthed(request)) return unauthorizedAppResponse();
  const { id } = await context.params;
  try {
    const doc = await getVideoLibraryDoc(id);
    if (!doc?.blobUrl) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const download = request.nextUrl.searchParams.get('download') === '1';
    const upstreamHeaders = new Headers();
    const range = request.headers.get('range');
    if (range && !download) upstreamHeaders.set('range', range);
    const upstream = await fetch(doc.blobUrl, { headers: upstreamHeaders });
    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json({ error: 'Could not read the video file' }, { status: 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
    headers.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
    headers.set('Cache-Control', 'private, no-store');
    headers.set(
      'Content-Disposition',
      `${download ? 'attachment' : 'inline'}; filename="${attachmentName(doc.filename)}"`
    );
    const length = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    if (length) headers.set('Content-Length', length);
    if (contentRange) headers.set('Content-Range', contentRange);

    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAppAuthed(request)) return unauthorizedAppResponse();
  const { id } = await context.params;
  try {
    const removed = await deleteVideoLibraryItem(id);
    if (!removed) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
