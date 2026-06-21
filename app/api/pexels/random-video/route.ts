import { NextRequest, NextResponse } from 'next/server';

type PexelsVideoFile = {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
};

type PexelsVideo = {
  id: number;
  image: string;
  video_files: PexelsVideoFile[];
};

function pickPortraitMp4Url(files: PexelsVideoFile[]): string | null {
  const mp4s = files.filter((f) => f.file_type === 'video/mp4' && f.link);
  if (!mp4s.length) return null;

  const portrait = mp4s.filter((f) => f.height >= f.width);
  const pool = portrait.length ? portrait : mp4s;
  pool.sort((a, b) => b.height - a.height);

  const top = pool.slice(0, 3);
  return top[Math.floor(Math.random() * top.length)]!.link;
}

/**
 * GET /api/pexels/random-video
 * Fetches a random portrait Pexels video (MP4).
 * Query params: ?query=sunrise+couples (optional), ?page=1 (optional).
 * Returns { videoUrl, thumbnailUrl } or error.
 * Requires PIXELS_API_KEY in env.
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PIXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing PIXELS_API_KEY' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'sunrise couples';
    const pageParam = searchParams.get('page');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1 + Math.floor(Math.random() * 15);

    const url = new URL('https://api.pexels.com/v1/videos/search');
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'portrait');
    url.searchParams.set('per_page', '15');
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

    const data = (await res.json()) as { videos?: PexelsVideo[] };
    const videos = data?.videos ?? [];
    if (!videos.length) {
      return NextResponse.json({ error: 'No portrait videos found' }, { status: 404 });
    }

    const shuffled = [...videos].sort(() => Math.random() - 0.5);
    for (const video of shuffled) {
      const videoUrl = pickPortraitMp4Url(video.video_files ?? []);
      if (videoUrl) {
        return NextResponse.json({
          videoUrl,
          thumbnailUrl: video.image || null,
        });
      }
    }

    return NextResponse.json({ error: 'No usable MP4 files in results' }, { status: 404 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch Pexels video';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
