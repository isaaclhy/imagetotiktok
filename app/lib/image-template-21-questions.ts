import {
  BRAVE_QUESTIONS,
  FLIRTY_QUESTIONS,
  FUNNY_QUESTIONS,
  ME_OR_YOU_QUESTIONS,
} from '@/app/lib/constants';
import { getCoupleCardsPosts } from '@/app/lib/copycat/couple-cards';
import {
  FLAMINGO_CARDS_FEED,
  formatCopycatSlideBody,
  isCopycatPromoNoiseSlide,
  type CopycatPost,
} from '@/app/lib/copycat/flamingo-cards';
import { getFlamingoConvoPosts } from '@/app/lib/copycat/flamingo-convo';
import { getFlamingoCardsPosts } from '@/app/lib/copycat/flamingo-convos';
import { getGoldenThoughtsDailyPosts } from '@/app/lib/copycat/goldenthoughtsdaily';
import { getHhTalkPosts } from '@/app/lib/copycat/hhtalk';
import { getHookPosts } from '@/app/lib/copycat/hook-posts';
import { getItsAllAboutLovingYouPosts } from '@/app/lib/copycat/itsallaboutlovingyou';
import { getLvrsbaePosts } from '@/app/lib/copycat/lvrsbae';
import { getQuestions21Posts } from '@/app/lib/copycat/questions-21';
import { getSpillCardsAppPosts } from '@/app/lib/copycat/spillcardsapp';
import { getTryDeepenPosts } from '@/app/lib/copycat/trydeepen';

type ChoiceBody = {
  body: string;
  optionCount: number;
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i]!;
    next[i] = next[j]!;
    next[j] = swap;
  }
  return next;
}

function collect(posts: CopycatPost[], into: Map<string, ChoiceBody>) {
  for (const post of posts) {
    for (const slide of post.slideText) {
      if (isCopycatPromoNoiseSlide(slide)) continue;
      if (!slide.options?.length || !slide.text.trim()) continue;
      const body = formatCopycatSlideBody(slide);
      const key = slide.text.trim().toLowerCase();
      const existing = into.get(key);
      if (!existing || slide.options.length > existing.optionCount) {
        into.set(key, { body, optionCount: slide.options.length });
      }
    }
  }
}

let cached: ChoiceBody[] | null = null;

function choicePool(): ChoiceBody[] {
  if (cached) return cached;
  const into = new Map<string, ChoiceBody>();
  collect(getFlamingoCardsPosts(FLAMINGO_CARDS_FEED.posts), into);
  collect(getFlamingoConvoPosts(), into);
  collect(getQuestions21Posts(), into);
  collect(getItsAllAboutLovingYouPosts(), into);
  collect(getTryDeepenPosts(), into);
  collect(getCoupleCardsPosts(), into);
  collect(getHhTalkPosts(), into);
  collect(getGoldenThoughtsDailyPosts(), into);
  collect(getLvrsbaePosts(), into);
  collect(getSpillCardsAppPosts(), into);
  collect(getHookPosts(), into);
  cached = [...into.values()];
  return cached;
}

function bankQuestions(): string[] {
  return [
    ...FUNNY_QUESTIONS,
    ...FLIRTY_QUESTIONS,
    ...ME_OR_YOU_QUESTIONS,
    ...BRAVE_QUESTIONS,
  ];
}

/**
 * Multiple-choice bodies from Copycat posts (a–d when the post has them).
 * Plain question-bank lines fill in only when a post has no options.
 */
export function pickTemplate21QuestionBodies(count: number, exclude: string[] = []): string[] {
  const skip = new Set(exclude.map((item) => item.trim()).filter(Boolean));
  const pool = choicePool();
  const fresh = (item: ChoiceBody) => !skip.has(item.body);
  const fours = shuffle(pool.filter((item) => item.optionCount >= 4 && fresh(item)));
  const rest = shuffle(pool.filter((item) => item.optionCount > 0 && item.optionCount < 4 && fresh(item)));
  const plain = shuffle(bankQuestions().filter((question) => !skip.has(question)));
  const picked: string[] = [];
  for (const item of [...fours, ...rest]) {
    if (picked.length >= count) break;
    picked.push(item.body);
  }
  for (const question of plain) {
    if (picked.length >= count) break;
    picked.push(question);
  }
  if (picked.length < count) {
    for (const item of shuffle(pool)) {
      if (picked.length >= count) break;
      if (!picked.includes(item.body)) picked.push(item.body);
    }
  }
  return picked.slice(0, count);
}
