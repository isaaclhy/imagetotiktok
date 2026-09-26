/** Hardcoded Template 7 search terms — swap later when the query is configurable. */
export const IMAGE_TEMPLATE7_PINTEREST_QUERY = 'blurry couples kissing selfie';
export const IMAGE_TEMPLATE7_PINTEREST_QUESTION_QUERIES = [
  'blurry hands holding',
  'couples shadow blurry',
  'couples ootd selfie blurry',
] as const;
export const IMAGE_TEMPLATE7_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE7_TAB_COUNT = 1 + IMAGE_TEMPLATE7_QUESTION_COUNT;

/** Template 8 cover search — rotate queries so Retries don’t stick to the same pins. */
export const IMAGE_TEMPLATE8_PINTEREST_QUERIES = [
  'couples selfie cute',
  'couple mirror selfie',
  'cute couple selfie aesthetic',
  'boyfriend girlfriend selfie',
  'couples cozy selfie',
  'couple phone selfie',
] as const;
export const IMAGE_TEMPLATE8_PINTEREST_QUERY = IMAGE_TEMPLATE8_PINTEREST_QUERIES[0];

/** Template 9 cover search — randomly pick between the two on each fetch/Retry. */
export const IMAGE_TEMPLATE9_PINTEREST_QUERIES = [
  'Top down selfie angle funny women',
  'women face mask selfie unhinged',
] as const;
export const IMAGE_TEMPLATE9_PINTEREST_QUERY = IMAGE_TEMPLATE9_PINTEREST_QUERIES[0];

/** Template 10 cover search. */
export const IMAGE_TEMPLATE10_PINTEREST_QUERY = 'couples beach selfie';
/** Template 10 Q1–Q5 search — kept distinct from the cover query. */
export const IMAGE_TEMPLATE10_PINTEREST_QUESTION_QUERIES = [
  'couples cute moments',
] as const;

/** Template 11 — same query for cover + Q1–Q5. */
export const IMAGE_TEMPLATE11_PINTEREST_QUERY = 'cute celebrity couples moments';
export const IMAGE_TEMPLATE11_PINTEREST_QUESTION_QUERIES = [
  IMAGE_TEMPLATE11_PINTEREST_QUERY,
] as const;

/** How many recent covers to avoid before allowing a re-pick. */
export const PINTEREST_COVER_RECENT_EXCLUDE_LIMIT = 12;
/** Fetch a pool, then pick one — spreads chance beyond the single top hit. */
export const PINTEREST_COVER_CANDIDATE_POOL = 12;

export function pickRandomPinterestQuery(
  queries: readonly string[],
  avoid?: string
): string {
  const pool = queries.filter((q) => q.trim().length > 0);
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0]!;
  const options = avoid ? pool.filter((q) => q !== avoid) : pool;
  const list = options.length > 0 ? options : pool;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function rememberPinterestCoverUrl(
  recent: string[],
  nextUrl: string,
  limit = PINTEREST_COVER_RECENT_EXCLUDE_LIMIT
): string[] {
  const original = originalPinterestUrlFromSrc(nextUrl);
  if (!original) return recent;
  return [original, ...recent.filter((url) => url !== original)].slice(0, limit);
}

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

/** Normalize proxy/original URLs so the same pin isn’t treated as two images. */
export function pinterestImageIdentity(src: string): string {
  return originalPinterestUrlFromSrc(src).trim().toLowerCase();
}

/**
 * Shuffle `images` and take up to `count` unique URLs (by original pin identity),
 * skipping anything in `exclude`.
 */
export function pickDistinctPinterestImageUrls(
  images: PinterestSearchImage[],
  count: number,
  exclude: string[] = []
): string[] {
  const seen = new Set(
    exclude.map((url) => pinterestImageIdentity(url)).filter(Boolean)
  );
  const shuffled = [...images];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = tmp;
  }
  const picked: string[] = [];
  for (const item of shuffled) {
    if (picked.length >= count) break;
    const url = item.imageUrl?.trim();
    if (!url) continue;
    const id = pinterestImageIdentity(item.originalUrl || url);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    picked.push(url);
  }
  return picked;
}

export function pickMixedPinterestQuestionUrls(
  pools: PinterestSearchImage[][],
  count: number,
  exclude: string[] = []
): string[] {
  const seen = new Set(
    exclude.map((url) => pinterestImageIdentity(url)).filter(Boolean)
  );
  const queues = pools
    .map((pool) =>
      pool
        .map((item) => item.imageUrl)
        .filter((url) => {
          const trimmed = url.trim();
          if (!trimmed) return false;
          const id = pinterestImageIdentity(trimmed);
          return Boolean(id) && !seen.has(id);
        })
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
    let nextUrl: string | undefined;
    while (queue.length > 0) {
      const candidate = queue.shift()!;
      const id = pinterestImageIdentity(candidate);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      nextUrl = candidate;
      break;
    }
    if (!nextUrl) {
      i -= 1;
      continue;
    }
    picked.push(nextUrl);
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
  exclude?: string | string[];
  /** How many candidates to fetch before picking one at random. */
  poolSize?: number;
  signal?: AbortSignal;
}): Promise<{ imageUrl: string; originalUrl: string; query: string }> {
  const query = options?.query?.trim() || IMAGE_TEMPLATE7_PINTEREST_QUERY;
  const poolSize = Math.max(1, options?.poolSize ?? 1);
  const result = await fetchPinterestSearchImages({
    query,
    count: poolSize,
    exclude: options?.exclude,
    signal: options?.signal,
  });
  const pick = result.images[Math.floor(Math.random() * result.images.length)]!;
  return {
    imageUrl: pick.imageUrl,
    originalUrl: pick.originalUrl,
    query: result.query,
  };
}
