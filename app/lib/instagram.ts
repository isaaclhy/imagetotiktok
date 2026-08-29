/**
 * Instagram Graph API — Content Publishing (internal, single-account use).
 *
 * Setup (no App Review needed while the Meta app stays in development mode and
 * you publish only to your own account):
 *   1. Switch the Instagram account to Business or Creator.
 *   2. Create a Meta app, add the Instagram product, add yourself as admin/tester.
 *   3. Put these in .env.local:
 *        INSTAGRAM_ACCESS_TOKEN=...   (long-lived user token, or a Business
 *                                      Manager system-user token which never expires)
 *        INSTAGRAM_USER_ID=...        (the IG Business account id, not the username)
 *
 * Instagram never accepts raw uploads — it fetches a public URL, so media must
 * be pushed to Vercel Blob first (same trick as the TikTok photo route).
 */

const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

/** Instagram allows 10 items per carousel. */
export const INSTAGRAM_CAROUSEL_MAX = 10;
/** Caption hard limit. */
export const INSTAGRAM_CAPTION_MAX = 2200;

export type InstagramConfig = {
  accessToken: string;
  igUserId: string;
};

export function readInstagramConfig(): InstagramConfig | null {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const igUserId = process.env.INSTAGRAM_USER_ID?.trim();
  if (!accessToken || !igUserId) return null;
  return { accessToken, igUserId };
}

type GraphError = { error?: { message?: string; code?: number; error_subcode?: number } };

async function graphRequest<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json()) as T & GraphError;
  if (!res.ok || data?.error) {
    const msg = data?.error?.message || `Instagram API error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function fetchInstagramAccount(
  config: InstagramConfig
): Promise<{ id: string; username: string; profilePictureUrl: string | null }> {
  const url = new URL(`${GRAPH_BASE}/${config.igUserId}`);
  url.searchParams.set('fields', 'id,username,profile_picture_url');
  url.searchParams.set('access_token', config.accessToken);
  const data = await graphRequest<{
    id: string;
    username: string;
    profile_picture_url?: string;
  }>(url.toString());
  return {
    id: data.id,
    username: data.username,
    profilePictureUrl: data.profile_picture_url ?? null,
  };
}

type ContainerParams = Record<string, string>;

async function createContainer(
  config: InstagramConfig,
  params: ContainerParams
): Promise<string> {
  const body = new URLSearchParams({ ...params, access_token: config.accessToken });
  const data = await graphRequest<{ id: string }>(
    `${GRAPH_BASE}/${config.igUserId}/media`,
    { method: 'POST', body }
  );
  return data.id;
}

/** Image container. `isCarouselItem` children are published via a parent container. */
export function createImageContainer(
  config: InstagramConfig,
  imageUrl: string,
  options: { caption?: string; isCarouselItem?: boolean } = {}
): Promise<string> {
  const params: ContainerParams = { image_url: imageUrl };
  if (options.isCarouselItem) params.is_carousel_item = 'true';
  if (options.caption) params.caption = options.caption.slice(0, INSTAGRAM_CAPTION_MAX);
  return createContainer(config, params);
}

export function createReelContainer(
  config: InstagramConfig,
  videoUrl: string,
  options: { caption?: string; coverUrl?: string; shareToFeed?: boolean } = {}
): Promise<string> {
  const params: ContainerParams = {
    media_type: 'REELS',
    video_url: videoUrl,
  };
  if (options.caption) params.caption = options.caption.slice(0, INSTAGRAM_CAPTION_MAX);
  if (options.coverUrl) params.cover_url = options.coverUrl;
  if (options.shareToFeed !== undefined) params.share_to_feed = String(options.shareToFeed);
  return createContainer(config, params);
}

export function createCarouselContainer(
  config: InstagramConfig,
  childrenIds: string[],
  caption: string
): Promise<string> {
  return createContainer(config, {
    media_type: 'CAROUSEL',
    children: childrenIds.join(','),
    caption: caption.slice(0, INSTAGRAM_CAPTION_MAX),
  });
}

export type ContainerStatus = 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED';

export async function fetchContainerStatus(
  config: InstagramConfig,
  containerId: string
): Promise<{ status: ContainerStatus; error: string | null }> {
  const url = new URL(`${GRAPH_BASE}/${containerId}`);
  url.searchParams.set('fields', 'status_code,status');
  url.searchParams.set('access_token', config.accessToken);
  const data = await graphRequest<{ status_code?: ContainerStatus; status?: string }>(
    url.toString()
  );
  return {
    status: data.status_code ?? 'IN_PROGRESS',
    error: data.status ?? null,
  };
}

/**
 * Videos transcode asynchronously — publishing before the container reports
 * FINISHED fails, so poll first. Images usually finish on the first check.
 */
export async function waitForContainerReady(
  config: InstagramConfig,
  containerId: string,
  options: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
  const intervalMs = options.intervalMs ?? 3000;
  const startedAt = Date.now();

  for (;;) {
    const { status, error } = await fetchContainerStatus(config, containerId);
    if (status === 'FINISHED' || status === 'PUBLISHED') return;
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(error || `Instagram could not process the media (${status})`);
    }
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('Timed out waiting for Instagram to process the media');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function publishContainer(
  config: InstagramConfig,
  containerId: string
): Promise<string> {
  const body = new URLSearchParams({
    creation_id: containerId,
    access_token: config.accessToken,
  });
  const data = await graphRequest<{ id: string }>(
    `${GRAPH_BASE}/${config.igUserId}/media_publish`,
    { method: 'POST', body }
  );
  return data.id;
}

export async function fetchPermalink(
  config: InstagramConfig,
  mediaId: string
): Promise<string | null> {
  try {
    const url = new URL(`${GRAPH_BASE}/${mediaId}`);
    url.searchParams.set('fields', 'permalink');
    url.searchParams.set('access_token', config.accessToken);
    const data = await graphRequest<{ permalink?: string }>(url.toString());
    return data.permalink ?? null;
  } catch {
    return null;
  }
}
