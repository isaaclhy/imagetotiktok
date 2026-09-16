import { NextRequest, NextResponse } from 'next/server';

function isAllowedPinimgUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('pinimg.com');
  } catch {
    return false;
  }
}

/**
 * GET /api/pinterest/image-proxy?url=...
 * Proxies a pinimg.com photo so the browser can draw it to canvas on export.
 */
export async function GET(request: NextRequest) {
  try {
    const raw = new URL(request.url).searchParams.get('url');
    if (!raw || !isAllowedPinimgUrl(raw)) {
      return NextResponse.json({ error: 'Invalid or missing image URL' }, { status: 400 });
    }

    const res = await fetch(raw, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: 'https://www.pinterest.com/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=3600');
    const contentLength = res.headers.get('Content-Length');
    if (contentLength) headers.set('Content-Length', contentLength);

    return new NextResponse(res.body, { status: 200, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to proxy Pinterest image';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
