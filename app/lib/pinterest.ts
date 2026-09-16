/** Hardcoded Template 7 search terms — swap later when the query is configurable. */
export const IMAGE_TEMPLATE7_PINTEREST_QUERY = 'blurry couples kissing selfie';
export const IMAGE_TEMPLATE7_PINTEREST_QUESTION_QUERIES = [
  'blurry hands holding',
  'couples shadow blurry',
] as const;
export const IMAGE_TEMPLATE7_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE7_TAB_COUNT = 1 + IMAGE_TEMPLATE7_QUESTION_COUNT;

export function pinterestImageProxyUrl(originalUrl: string): string {
  if (originalUrl.startsWith('/') || !/^https?:\/\//i.test(originalUrl)) {
    return originalUrl;
  }
  return `/api/pinterest/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}

export function originalPinterestUrlFromSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.pathname.includes('/api/pinterest/image-proxy')) {
      return parsed.searchParams.get('url')?.trim() || trimmed;
    }
  } catch {
    /* keep original */
  }
  return trimmed;
}

export function imageTemplate7SourcesReady(sources: string[]): boolean {
  return Array.from({ length: IMAGE_TEMPLATE7_TAB_COUNT }, (_, i) =>
    (sources[i] ?? '').trim()
  ).every(Boolean);
}

export type PinterestSearchImage = {
  imageUrl: string;
  originalUrl: string;
};

export function pickMixedPinterestQuestionUrls(
  pools: PinterestSearchImage[][],
  count: number
): string[] {
  const queues = pools
    .map((pool) =>
      pool
        .map((item) => item.imageUrl)
        .filter((url) => url.trim().length > 0)
    )
    .filter((urls) => urls.length > 0)
    .map((urls) => {
      const next = [...urls];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = next[i]!;
        next[i] = next[j]!;
        next[j] = tmp;
      }
      return next;
    });
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    const available = queues.filter((queue) => queue.length > 0);
    if (available.length === 0) break;
    const queue = available[Math.floor(Math.random() * available.length)]!;
    picked.push(queue.shift()!);
  }
  return picked;
}

export async function fetchPinterestSearchImages(options: {
  query: string;
  count?: number;
  exclude?: string | string[];
  signal?: AbortSignal;
}): Promise<{ images: PinterestSearchImage[]; query: string }> {
  const query = options.query.trim();
  const count = Math.max(1, options.count ?? 1);
  const excludeList = (Array.isArray(options.exclude) ? options.exclude : [options.exclude ?? ''])
    .map((value) => originalPinterestUrlFromSrc(value))
    .filter(Boolean);
  const params = new URLSearchParams({ query, count: String(count) });
  if (excludeList.length > 0) params.set('exclude', excludeList.join(','));
  const res = await fetch(`/api/pinterest/search?${params.toString()}`, {
    signal: options.signal,
  });
  const data = (await res.json()) as {
    imageUrl?: string;
    originalUrl?: string;
    images?: PinterestSearchImage[];
    query?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch Pinterest image');
  }
  const images =
    data.images?.filter((item) => item.imageUrl) ??
    (data.imageUrl
      ? [{ imageUrl: data.imageUrl, originalUrl: data.originalUrl || data.imageUrl }]
      : []);
  if (images.length === 0) {
    throw new Error(data.error || 'Failed to fetch Pinterest image');
  }
  return { images, query: data.query || query };
}

export async function fetchPinterestCoverImage(options?: {
  query?: string;
  exclude?: string;
  signal?: AbortSignal;
}): Promise<{ imageUrl: string; originalUrl: string; query: string }> {
  const query = options?.query?.trim() || IMAGE_TEMPLATE7_PINTEREST_QUERY;
  const result = await fetchPinterestSearchImages({
    query,
    count: 1,
    exclude: options?.exclude,
    signal: options?.signal,
  });
  const first = result.images[0]!;
  return {
    imageUrl: first.imageUrl,
    originalUrl: first.originalUrl,
    query: result.query,
  };
}
