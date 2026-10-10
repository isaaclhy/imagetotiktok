import { NextRequest, NextResponse } from 'next/server';
import {
  IMAGE_TEMPLATE7_PINTEREST_QUERY,
  pinterestImageProxyUrl,
} from '@/app/lib/pinterest';

export const dynamic = 'force-dynamic';

type PinCandidate = {
  url: string;
  width: number;
  height: number;
};

type PinImageSize = {
  url?: string;
  width?: number;
  height?: number;
};

const PINTEREST_SEARCH_HEADERS = {
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9',
  Origin: 'https://www.pinterest.com',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Pinterest-PWS-Handler': 'www/search/[scope].js',
  'X-Pinterest-AppState': 'active',
};

function shuffleCopy<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

function isBrowserFriendlyImageUrl(url: string): boolean {
  const path = url.split('?')[0]?.toLowerCase() ?? '';
  if (/\.(heic|heif|tif|tiff)$/.test(path)) return false;
  return true;
}

function pickBestImage(images: Record<string, PinImageSize | undefined> | undefined): PinCandidate | null {
  if (!images) return null;
  const order = ['orig', '736x', '474x', '236x', '170x'] as const;
  for (const key of order) {
    const size = images[key];
    const url = size?.url?.trim();
    if (!url || !url.startsWith('https://') || !isBrowserFriendlyImageUrl(url)) continue;
    return {
      url,
      width: size?.width ?? 0,
      height: size?.height ?? 0,
    };
  }
  return null;
}

function collectFromPublicSearch(json: unknown): PinCandidate[] {
  const root = json as {
    resource_response?: { data?: { results?: unknown[] } | unknown[] };
  };
  const payload = root?.resource_response?.data;
  const results = Array.isArray(payload) ? payload : payload?.results ?? [];
  const candidates: PinCandidate[] = [];
  for (const item of results) {
    const pin = item as { images?: Record<string, PinImageSize | undefined>; type?: string };
    const image = pickBestImage(pin.images);
    if (!image) continue;
    candidates.push(image);
  }
  return candidates;
}

function collectFromOfficialSearch(json: unknown): PinCandidate[] {
  const root = json as {
    items?: Array<{
      media?: { images?: Record<string, PinImageSize | undefined> };
    }>;
  };
  const candidates: PinCandidate[] = [];
  for (const item of root.items ?? []) {
    const image = pickBestImage(item.media?.images);
    if (!image) continue;
    candidates.push(image);
  }
  return candidates;
}

type PinPage = {
  candidates: PinCandidate[];
  bookmark: string | null;
};

function readBookmark(json: unknown): string | null {
  if (!json || typeof json !== 'object') return null;
  const root = json as { bookmark?: unknown; resource_response?: { bookmark?: unknown } };
  const candidates = [root.resource_response?.bookmark, root.bookmark];
  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const bookmark = value.trim();
    if (bookmark && bookmark !== '-end-') return bookmark;
  }
  return null;
}

async function searchOfficialPinsPage(
  query: string,
  token: string,
  bookmark?: string | null
): Promise<PinPage> {
  const url = new URL('https://api.pinterest.com/v5/search/pins');
  url.searchParams.set('query', query);
  url.searchParams.set('page_size', '50');
  if (bookmark) url.searchParams.set('bookmark', bookmark);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinterest API error: ${res.status} ${text.slice(0, 180)}`);
  }
  const json = await res.json();
  return { candidates: collectFromOfficialSearch(json), bookmark: readBookmark(json) };
}

async function searchPublicPinsPage(query: string, bookmark?: string | null): Promise<PinPage> {
  const options: Record<string, unknown> = {
    query,
    scope: 'pins',
    page_size: 50,
    auto_correction_disabled: true,
  };
  if (bookmark) options.bookmarks = [bookmark];
  const data = JSON.stringify({ options, context: {} });
  const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}`;
  const url =
    'https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=' +
    encodeURIComponent(sourceUrl) +
    '&data=' +
    encodeURIComponent(data);
  const res = await fetch(url, {
    headers: {
      ...PINTEREST_SEARCH_HEADERS,
      Referer: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinterest search error: ${res.status} ${text.slice(0, 180)}`);
  }
  const json = await res.json();
  return { candidates: collectFromPublicSearch(json), bookmark: readBookmark(json) };
}

type DeepPool = {
  byUrl: Map<string, PinCandidate>;
  bookmark: string | null;
  exhausted: boolean;
  primed: boolean;
  source: 'official' | 'public' | null;
};

const deepPools = new Map<string, DeepPool>();
const DEEP_POOL_CAP = 400;
const DEEP_PRIME_PAGES = 3;

async function fetchDeepPage(query: string, pool: DeepPool, token: string | undefined): Promise<PinPage> {
  if (pool.source !== 'public' && token) {
    try {
      const page = await searchOfficialPinsPage(query, token, pool.bookmark);
      if (page.candidates.length > 0 || pool.bookmark) {
        pool.source = 'official';
        return page;
      }
    } catch (e) {
      if (pool.byUrl.size > 0) throw e;
    }
    pool.source = 'public';
    pool.bookmark = null;
  }
  pool.source = 'public';
  return searchPublicPinsPage(query, pool.bookmark);
}

async function collectDeepCandidates(query: string, token: string | undefined): Promise<PinCandidate[]> {
  let pool = deepPools.get(query);
  if (!pool) {
    pool = { byUrl: new Map(), bookmark: null, exhausted: false, primed: false, source: null };
    deepPools.set(query, pool);
  }
  const pages = pool.primed ? 1 : DEEP_PRIME_PAGES;
  for (let i = 0; i < pages && !pool.exhausted && pool.byUrl.size < DEEP_POOL_CAP; i++) {
    const page = await fetchDeepPage(query, pool, token);
    const before = pool.byUrl.size;
    for (const candidate of page.candidates) {
      if (!pool.byUrl.has(candidate.url)) pool.byUrl.set(candidate.url, candidate);
    }
    pool.bookmark = page.bookmark;
    if (!page.bookmark || page.candidates.length === 0 || pool.byUrl.size === before) {
      pool.exhausted = true;
    }
  }
  pool.primed = true;
  return [...pool.byUrl.values()];
}

function parseExcludeList(raw: string): Set<string> {
  return new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function pickCandidates(
  candidates: PinCandidate[],
  exclude: Set<string>,
  count: number,
  allowExcludedFallback = true
): PinCandidate[] {
  const unique = new Map<string, PinCandidate>();
  for (const candidate of candidates) {
    if (!unique.has(candidate.url)) unique.set(candidate.url, candidate);
  }
  const all = [...unique.values()];
  const withoutExcluded = all.filter((c) => !exclude.has(c.url));
  const base = allowExcludedFallback
    ? withoutExcluded.length >= Math.min(count, all.length)
      ? withoutExcluded
      : all
    : withoutExcluded.length > 0
      ? withoutExcluded
      : all;
  if (base.length === 0) return [];
  const portraits = base.filter((c) => c.height >= c.width && c.height >= 400);
  const usable =
    portraits.length >= Math.min(count, base.length)
      ? portraits
      : base.filter((c) => c.height >= 400 || c.width >= 400);
  const finalPool = usable.length > 0 ? usable : base;
  return shuffleCopy(finalPool).slice(0, count);
}

/**
 * GET /api/pinterest/search?query=blurry+couples+kissing+selfie&exclude=...
 * Returns a random pin image for the query. Uses official v5 when
 * PINTEREST_ACCESS_TOKEN is set; otherwise public Pinterest search.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || IMAGE_TEMPLATE7_PINTEREST_QUERY;
    const exclude = parseExcludeList(searchParams.get('exclude')?.trim() || '');
    const deep = searchParams.get('deep') === '1';
    const count = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get('count') ?? '1', 10) || 1)
    );
    const token = process.env.PINTEREST_ACCESS_TOKEN?.trim();

    let candidates: PinCandidate[] = [];
    let lastError: string | null = null;

    if (deep) {
      try {
        candidates = await collectDeepCandidates(query, token || undefined);
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Pinterest search failed';
        const cached = deepPools.get(query);
        if (cached && cached.byUrl.size > 0) candidates = [...cached.byUrl.values()];
      }
    } else if (token) {
      try {
        candidates = (await searchOfficialPinsPage(query, token)).candidates;
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Official Pinterest search failed';
      }
    }

    if (!deep && candidates.length === 0) {
      try {
        candidates = (await searchPublicPinsPage(query)).candidates;
      } catch (e) {
        lastError = e instanceof Error ? e.message : lastError || 'Pinterest search failed';
      }
    }

    const picked = pickCandidates(candidates, exclude, count, !deep);
    if (picked.length === 0) {
      return NextResponse.json(
        { error: lastError || 'No Pinterest images found' },
        { status: lastError ? 502 : 404 }
      );
    }

    const images = picked.map((item) => ({
      imageUrl: pinterestImageProxyUrl(item.url),
      originalUrl: item.url,
    }));

    return NextResponse.json({
      imageUrl: images[0]!.imageUrl,
      originalUrl: images[0]!.originalUrl,
      images,
      query,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to search Pinterest';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
