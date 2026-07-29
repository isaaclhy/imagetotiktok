import { NextRequest, NextResponse } from 'next/server';

function isAllowedPexelsVideoUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('pexels.com');
  } catch {
    return false;
  }
}

/**
 * GET /api/pexels/video-proxy?url=...
 * Proxies a Pexels MP4 so the browser can draw frames to canvas (export with caption).
 * Forwards Range requests — required for Safari / iOS video loading.
 */
export async function GET(request: NextRequest) {
  try {
    const raw = new URL(request.url).searchParams.get('url');
    if (!raw || !isAllowedPexelsVideoUrl(raw)) {
      return NextResponse.json({ error: 'Invalid or missing video URL' }, { status: 400 });
    }

    const upstreamHeaders: HeadersInit = {};
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
