import { mediaVideoProxySrc } from '@/app/lib/media-proxy';
import rawFeed from './freshbakeddonuts.json';

export type FreshBakedDonutPost = {
  id: string;
  url?: string;
  reelUrl?: string;
  views: number;
  likes?: number;
  comments?: number;
  durationSec: number;
  createdAt?: number;
  caption: string;
  thumbnailUrl: string;
  videoUrl: string;
};

type RawFeed = {
  handle: string;
  platform?: string;
  minViews?: number;
  posts: FreshBakedDonutPost[];
};

const feed = rawFeed as RawFeed;

export const FRESH_BAKED_DONUT_HANDLE = feed.handle;
export const FRESH_BAKED_DONUT_POSTS: FreshBakedDonutPost[] = feed.posts.filter(
  (post) => post.videoUrl
);

export function freshBakedDonutPlaybackSrc(post: FreshBakedDonutPost): string {
  return mediaVideoProxySrc(post.videoUrl);
}

export function captionWithoutHashtags(caption: string): string {
  return caption
    .replace(/#[\w\u00c0-\u024f]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function freshBakedDonutSelectedPost(
  selectedId: string | null,
  posts: FreshBakedDonutPost[] = FRESH_BAKED_DONUT_POSTS
): FreshBakedDonutPost | null {
  if (!selectedId) return null;
  return posts.find((post) => post.id === selectedId) ?? null;
}

export function freshBakedDonutCaptionSource(post: FreshBakedDonutPost | null): {
  cover: string;
  questions: string[];
} {
  const cover = captionWithoutHashtags(post?.caption ?? '') || 'little penguin';
  return { cover, questions: [] };
}
