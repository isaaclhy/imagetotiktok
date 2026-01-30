import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/pexels/video
 * Fetches a single portrait Pexels *image* for use as card 1 background (video mode).
 * Query params: ?query=cinematic (optional), ?page=1 (optional, for "Change Image" randomness).
 * Returns { videoUrl, thumbnailUrl } (both same image URL) or error.
 * Requires PIXELS_API_KEY (Pexels API key) in env.
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PIXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing PIXELS_API_KEY' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'couple in nature';
    const pageParam = searchParams.get('page');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'portrait');
    url.searchParams.set('per_page', '1');
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Pexels API error: ${res.status} ${text}` },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }

    const data = (await res.json()) as {
      photos?: Array<{
        id: number;
        width: number;
        height: number;
        avg_color?: string;
        src?: {
          original?: string;
          large?: string;
          large2x?: string;
          medium?: string;
          small?: string;
          portrait?: string;
          landscape?: string;
          tiny?: string;
        };
      }>;
    };

    const photos = data?.photos ?? [];
    const photo = photos[0];
    if (!photo?.src) {
      return NextResponse.json(
        { error: 'No portrait images found' },
        { status: 404 }
      );
    }

    const s = photo.src;
    const imageUrl = s.portrait || s.large || s.large2x || s.original || s.medium || '';

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL in response' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      videoUrl: imageUrl,
      thumbnailUrl: imageUrl,
      avgColor: photo.avg_color || null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch Pexels image';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
