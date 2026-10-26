import {
  cleanCopycatDisplayText,
  normalizeCopycatPosts,
  type CopycatCompetitorFeed,
  type CopycatPost,
  type CopycatSlideText,
} from './flamingo-cards';
import rawFeed from './hhtalk.json';

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

function mapSlide(slide: RawSlide): CopycatSlideText {
  const text = cleanCopycatDisplayText(slide.text);
  if (!slide.options?.length) return { text };
  return {
    text,
    options: slide.options.map(cleanCopycatDisplayText),
  };
}

function mapPost(post: RawPost): CopycatPost {
  return {
    id: post.id,
    views: typeof post.views === 'number' ? post.views : post.likes ?? 0,
    coverText: cleanCopycatDisplayText(post.coverText),
    slideText: post.slideText.map(mapSlide),
    handle: feed.handle,
    platform: 'tiktok',
  };
}

const posts = feed.posts.map(mapPost);

/** TikTok @hhtalk posts used by the Copycat tab. */
export const HH_TALK_FEED: CopycatCompetitorFeed = {
  handle: feed.handle,
  minViews: feed.minViews ?? 0,
  postCount: posts.length,
  platform: 'tiktok',
  posts,
};

export function getHhTalkPosts(): CopycatPost[] {
  return normalizeCopycatPosts(HH_TALK_FEED.posts);
}
