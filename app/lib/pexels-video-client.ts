/** Portrait target height — prefer 1080×1920 Pexels renditions for TikTok export. */
export const PEXELS_PREFER_HEIGHT = 1920;

/** Route remote Pexels MP4 URLs through our proxy for CORS + stable Range requests. */
export function pexelsVideoProxySrc(directUrl: string): string {
  if (directUrl.startsWith('/') || !/^https?:\/\//i.test(directUrl)) {
    return directUrl;
  }
  return `/api/pexels/video-proxy?url=${encodeURIComponent(directUrl)}`;
}

export type ClientPexelsVideoResult = {
  videoUrl: string;
  thumbnailUrl: string | null;
};

export async function fetchClientRandomPexelsVideo(options: {
  queries: readonly string[];
  preferHeight?: number;
}): Promise<ClientPexelsVideoResult> {
  const query = options.queries[Math.floor(Math.random() * options.queries.length)]!;
  const page = 1 + Math.floor(Math.random() * 15);
  const preferHeight = options.preferHeight ?? PEXELS_PREFER_HEIGHT;
  const res = await fetch(
    `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}&preferHeight=${preferHeight}`
  );
  const data = (await res.json()) as {
    videoUrl?: string;
    thumbnailUrl?: string | null;
    error?: string;
  };
  if (!res.ok || !data.videoUrl) {
    throw new Error(data.error || 'Failed to fetch video');
  }
  return {
    videoUrl: pexelsVideoProxySrc(data.videoUrl),
    thumbnailUrl: data.thumbnailUrl ?? null,
  };
}
