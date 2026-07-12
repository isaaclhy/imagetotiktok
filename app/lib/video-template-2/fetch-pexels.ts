type PexelsVideoFile = {
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
};

type PexelsVideo = {
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

export type PexelsVideoResult = {
  videoUrl: string;
  thumbnailUrl: string | null;
};

export async function fetchRandomPexelsPortraitVideo(options?: {
  query?: string;
  page?: number;
}): Promise<PexelsVideoResult> {
  const apiKey = process.env.PIXELS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing PIXELS_API_KEY');
  }

  const query = options?.query?.trim() || 'sunrise couples';
  const page = options?.page ?? 1 + Math.floor(Math.random() * 15);

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
    throw new Error(`Pexels API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { videos?: PexelsVideo[] };
  const videos = data?.videos ?? [];
  if (!videos.length) {
    throw new Error('No portrait videos found on Pexels');
  }

  const shuffled = [...videos].sort(() => Math.random() - 0.5);
  for (const video of shuffled) {
    const videoUrl = pickPortraitMp4Url(video.video_files ?? []);
    if (videoUrl) {
      return {
        videoUrl,
        thumbnailUrl: video.image || null,
      };
    }
  }

  throw new Error('No usable MP4 files in Pexels results');
}
