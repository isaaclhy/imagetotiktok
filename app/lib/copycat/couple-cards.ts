import {
  cleanCopycatDisplayText,
  isCopycatPromoNoiseSlide,
  normalizeCopycatPosts,
  type CopycatCompetitorFeed,
  type CopycatPost,
  type CopycatSlideText,
} from './flamingo-cards';
import rawFeed from './couple-cards.json';

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

/** TikTok @couple_cards posts used by the Copycat tab. */
export const COUPLE_CARDS_FEED: CopycatCompetitorFeed = {
  handle: feed.handle,
  minViews: feed.minViews ?? 0,
  postCount: posts.length,
  platform: 'tiktok',
  posts,
};

export function getCoupleCardsPosts(): CopycatPost[] {
  return normalizeCopycatPosts(COUPLE_CARDS_FEED.posts);
}
