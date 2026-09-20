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

async function searchOfficialPins(query: string, token: string): Promise<PinCandidate[]> {
  const url = new URL('https://api.pinterest.com/v5/search/pins');
  url.searchParams.set('query', query);
  url.searchParams.set('page_size', '50');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinterest API error: ${res.status} ${text.slice(0, 180)}`);
  }
  return collectFromOfficialSearch(await res.json());
}

async function searchPublicPins(query: string): Promise<PinCandidate[]> {
  const data = JSON.stringify({
    options: {
      query,
      scope: 'pins',
      page_size: 50,
      auto_correction_disabled: true,
    },
    context: {},
  });
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
  return collectFromPublicSearch(await res.json());
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
  count: number
): PinCandidate[] {
  const unique = new Map<string, PinCandidate>();
  for (const candidate of candidates) {
    if (!unique.has(candidate.url)) unique.set(candidate.url, candidate);
  }
  const all = [...unique.values()];
  const withoutExcluded = all.filter((c) => !exclude.has(c.url));
  const base = withoutExcluded.length >= Math.min(count, all.length) ? withoutExcluded : all;
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
    const count = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get('count') ?? '1', 10) || 1)
    );
    const token = process.env.PINTEREST_ACCESS_TOKEN?.trim();

    let candidates: PinCandidate[] = [];
    let lastError: string | null = null;

    if (token) {
      try {
        candidates = await searchOfficialPins(query, token);
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Official Pinterest search failed';
      }
    }

    if (candidates.length === 0) {
      try {
        candidates = await searchPublicPins(query);
      } catch (e) {
        lastError = e instanceof Error ? e.message : lastError || 'Pinterest search failed';
      }
    }

    const picked = pickCandidates(candidates, exclude, count);
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
