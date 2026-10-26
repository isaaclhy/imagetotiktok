import {
  cleanCopycatDisplayText,
  normalizeCopycatPosts,
  type CopycatCompetitorFeed,
  type CopycatPost,
  type CopycatSlideText,
} from './flamingo-cards';
import rawFeed from './questions-21.json';

type RawSlide = {
  text: string;
  options?: string[];
};

type RawPost = {
  id: string;
  likes: number;
  coverText: string;
  slideText: RawSlide[];
};

type RawFeed = {
  handle: string;
  platform: string;
  postCount: number;
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
    views: post.likes,
    coverText: cleanCopycatDisplayText(post.coverText),
    slideText: post.slideText.map(mapSlide),
    handle: feed.handle,
    platform: 'instagram',
  };
}

const posts = feed.posts.map(mapPost);

/** Instagram @21questionscards posts used by the Copycat tab. */
export const QUESTIONS_21_FEED: CopycatCompetitorFeed = {
  handle: feed.handle,
  minViews: 0,
  postCount: posts.length,
  platform: 'instagram',
  posts,
};

export function getQuestions21Posts(): CopycatPost[] {
  return normalizeCopycatPosts(QUESTIONS_21_FEED.posts);
}
