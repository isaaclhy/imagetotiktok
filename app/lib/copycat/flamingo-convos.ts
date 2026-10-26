import {
  cleanCopycatDisplayText,
  normalizeCopycatPosts,
  type CopycatCompetitorFeed,
  type CopycatPost,
  type CopycatSlideText,
} from './flamingo-cards';
import rawConvoFeed from './flamingo-convos.json';
import rawReelsFeed from './flamingoappreels.json';

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

const convoFeed = rawConvoFeed as RawFeed;
const reelsFeed = rawReelsFeed as RawFeed;

function mapSlide(slide: RawSlide): CopycatSlideText {
  const text = cleanCopycatDisplayText(slide.text);
  if (!slide.options?.length) return { text };
  return {
    text,
    options: slide.options.map(cleanCopycatDisplayText),
  };
}

/** Instagram likes stand in for views so ranking matches CopycatPost. */
function mapPost(post: RawPost, handle: string): CopycatPost {
  return {
    id: post.id,
    views: post.likes,
    coverText: cleanCopycatDisplayText(post.coverText),
    slideText: post.slideText.map(mapSlide),
    handle,
    platform: 'instagram',
  };
}

function mapFeed(feed: RawFeed): CopycatPost[] {
  return feed.posts.map((post) => mapPost(post, feed.handle));
}

const convoPosts = mapFeed(convoFeed);
const reelsPosts = mapFeed(reelsFeed);

/** Flamingo convos Instagram posts used by the Copycat tab. */
export const FLAMINGO_CONVOS_FEED: CopycatCompetitorFeed = {
  handle: convoFeed.handle,
  minViews: 0,
  postCount: convoPosts.length,
  posts: convoPosts,
  platform: 'instagram',
};

export const FLAMINGO_APPREELS_FEED: CopycatCompetitorFeed = {
  handle: reelsFeed.handle,
  minViews: 0,
  postCount: reelsPosts.length,
  posts: reelsPosts,
  platform: 'instagram',
};

function mergeUniquePosts(...groups: CopycatPost[][]): CopycatPost[] {
  const seen = new Set<string>();
  const merged: CopycatPost[] = [];
  for (const group of groups) {
    for (const post of group) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      merged.push(post);
    }
  }
  return merged;
}

/** TikTok @flamingokiss1 + Instagram @flamingoconvos + @flamingoappreels. */
export function getFlamingoCardsPosts(tiktokPosts: CopycatPost[]): CopycatPost[] {
  const tiktok = tiktokPosts.map((post) => ({
    ...post,
    handle: post.handle ?? 'flamingokiss1',
    platform: post.platform ?? ('tiktok' as const),
  }));
  return normalizeCopycatPosts(mergeUniquePosts(tiktok, convoPosts, reelsPosts));
}
