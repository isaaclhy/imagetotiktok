import {
  cleanCopycatDisplayText,
  type CopycatCompetitorFeed,
  type CopycatPost,
  type CopycatSlideText,
} from './flamingo-cards';
import rawFeed from './flamingo-convos.json';

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

/** Instagram likes stand in for views so ranking matches CopycatPost. */
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

/** Flamingo convos Instagram posts used by the Copycat tab. */
export const FLAMINGO_CONVOS_FEED: CopycatCompetitorFeed = {
  handle: feed.handle,
  minViews: 0,
  postCount: posts.length,
  posts,
  platform: 'instagram',
};

/** All Flamingo Cards sources: TikTok @flamingokiss1 + Instagram @flamingoconvos. */
export function getFlamingoCardsPosts(
  tiktokPosts: CopycatPost[]
): CopycatPost[] {
  const tiktok = tiktokPosts.map((post) => ({
    ...post,
    handle: post.handle ?? 'flamingokiss1',
    platform: post.platform ?? ('tiktok' as const),
  }));
  return [...tiktok, ...posts];
}
