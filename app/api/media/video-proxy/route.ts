import { NextRequest, NextResponse } from 'next/server';
import {
  isAllowedMediaVideoUrl,
  MEDIA_PROXY_UPSTREAM_HEADERS,
} from '@/app/lib/media-proxy';

/**
 * GET /api/media/video-proxy?url=...
 * Proxies Pexels / Instagram / Facebook CDN MP4s so the browser can play
 * and draw frames to canvas. Forwards Range requests for Safari / iOS.
 */
export async function GET(request: NextRequest) {
  try {
    const raw = new URL(request.url).searchParams.get('url');
    if (!raw || !isAllowedMediaVideoUrl(raw)) {
      return NextResponse.json({ error: 'Invalid or missing video URL' }, { status: 400 });
    }

    const upstreamHeaders: HeadersInit = { ...MEDIA_PROXY_UPSTREAM_HEADERS };
    const range = request.headers.get('range');
    if (range) {
      upstreamHeaders.Range = range;
    }

    const res = await fetch(raw, { headers: upstreamHeaders });
    if (!res.ok && res.status !== 206) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'video/mp4');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');

    const contentLength = res.headers.get('Content-Length');
    if (contentLength) headers.set('Content-Length', contentLength);
    const contentRange = res.headers.get('Content-Range');
    if (contentRange) headers.set('Content-Range', contentRange);

    return new NextResponse(res.body, { status: res.status, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to proxy video';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
