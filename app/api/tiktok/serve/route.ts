import { NextRequest, NextResponse } from 'next/server';
import { verifyServeToken } from '@/lib/tiktok-serve-token';

/**
 * Serves TikTok photo images from your domain (e.g. www.bleamies.com).
 * Used when APP_URL is set so TikTok fetches from your domain instead of Blob.
 * Verify your domain (e.g. https://www.bleamies.com) in TikTok Developer Portal → Manage URL properties.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    const { blobUrl } = verifyServeToken(token);
    const res = await fetch(blobUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }
    const contentType = res.headers.get('content-type') || 'image/png';
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Bad request';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
