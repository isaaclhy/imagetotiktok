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
 */
export async function GET(request: NextRequest) {
  try {
    const raw = new URL(request.url).searchParams.get('url');
    if (!raw || !isAllowedPexelsVideoUrl(raw)) {
      return NextResponse.json({ error: 'Invalid or missing video URL' }, { status: 400 });
    }

    const res = await fetch(raw);
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'video/mp4');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(res.body, { status: 200, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to proxy video';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
