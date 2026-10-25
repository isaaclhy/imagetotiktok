import {
  cleanCopycatDisplayText,
  isCopycatPromoNoiseSlide,
  type CopycatCompetitorFeed,
  type CopycatPost,
  type CopycatSlideText,
} from './flamingo-cards';
import rawFeed from './flamingo-convo.json';

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
    platform: 'instagram',
  };
}

const posts = feed.posts.map(mapPost).filter((post) => post.slideText.length > 0);

/** Instagram @flamingoappreels carousel posts used by Copycat. */
export const FLAMINGO_CONVO_FEED: CopycatCompetitorFeed = {
  handle: feed.handle,
  minViews: feed.minViews ?? 0,
  postCount: posts.length,
  platform: 'instagram',
  posts,
};

export function getFlamingoConvoPosts(): CopycatPost[] {
  return FLAMINGO_CONVO_FEED.posts;
}
