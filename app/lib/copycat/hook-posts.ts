import {
  cleanCopycatDisplayText,
  isCopycatPromoNoiseSlide,
  normalizeCopycatPosts,
  type CopycatCompetitorFeed,
  type CopycatPost,
  type CopycatSlideText,
} from './flamingo-cards';
import rawFeed from './hook-posts.json';

type RawSlide = {
  text: string;
  options?: string[];
};

type RawPost = {
  id: string;
  views?: number;
  likes?: number;
  coverText: string;
  slideText: RawSlide[];
};

type RawFeed = {
  handle: string;
  platform?: string;
  postCount?: number;
  minViews?: number;
  posts: RawPost[];
};

const feed = rawFeed as RawFeed;

function mapSlide(slide: RawSlide): CopycatSlideText | null {
  const text = cleanCopycatDisplayText(slide.text);
  if (!text) return null;
  const mapped: CopycatSlideText = slide.options?.length
    ? { text, options: slide.options.map(cleanCopycatDisplayText).filter(Boolean) }
    : { text };
  if (isCopycatPromoNoiseSlide(mapped)) return null;
  return mapped;
}

function mapPost(post: RawPost): CopycatPost {
  return {
    id: post.id,
    views: typeof post.views === 'number' ? post.views : post.likes ?? 0,
    coverText: cleanCopycatDisplayText(post.coverText),
    slideText: post.slideText.map(mapSlide).filter((slide): slide is CopycatSlideText => slide != null),
    handle: feed.handle,
    platform: 'tiktok',
  };
}

const posts = feed.posts.map(mapPost).filter((post) => post.slideText.length > 0);

/** Curated hook posts used by the Copycat tab when "Use hook posts" is on. */
export const HOOK_POSTS_FEED: CopycatCompetitorFeed = {
  handle: feed.handle,
  minViews: feed.minViews ?? 0,
  postCount: posts.length,
  platform: 'tiktok',
  posts,
};

/**
 * Cover + 5 questions, already sized for a Copycat carousel.
 * `normalizeCopycatPosts` rewrites covers that happen to contain a count word
 * before "question" (for example "one question"), so the authored hook is put
 * back afterward.
 */
export function getHookPosts(): CopycatPost[] {
  const covers = new Map(posts.map((post) => [post.id, post.coverText]));
  return normalizeCopycatPosts(posts).map((post) => {
    const cover = covers.get(post.id);
    return cover == null ? post : { ...post, coverText: cover };
  });
}
