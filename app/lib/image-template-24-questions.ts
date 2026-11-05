import {
  BRAVE_QUESTIONS,
  FLIRTY_QUESTIONS,
  FUNNY_QUESTIONS,
  ME_OR_YOU_QUESTIONS,
} from '@/app/lib/constants';
import { getCoupleCardsPosts } from '@/app/lib/copycat/couple-cards';
import {
  FLAMINGO_CARDS_FEED,
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
import { getWeDeepOnePosts } from '@/app/lib/copycat/wedeepone';
import { getCoupleDeepQuestionsPosts } from '@/app/lib/copycat/coupledeepquestions';
import { getCrayCrayQuestions03Posts } from '@/app/lib/copycat/craycrayquestions03';
import { getCrayCrayQuestions7Posts } from '@/app/lib/copycat/craycrayquestions7';
import { getDeepQuestionsAppPosts } from '@/app/lib/copycat/deepquestionsapp';
import { getFlamingoCardsTiktokPosts } from '@/app/lib/copycat/flamingo-cards-tiktok';
import { getQuestionsForTonightPosts } from '@/app/lib/copycat/questionsfortonight';
import { getCoupleSyxPosts } from '@/app/lib/copycat/couple-syx';
import { getMisunderstoodCou4Posts } from '@/app/lib/copycat/misunderstood-cou4';

/**
 * Funny / chaotic question stems for image template 24.
 * Copycat feeds contribute the question line only (no a–d options). There is
 * no scraped @penguincardss feed in this repo, so that account is not included.
 */

const CHAOTIC_RE = /\b(if|would|rather|how many|how long|what if)\b/i;
const DEEP_RE =
  /\b(soulmate|trauma|childhood|vulnerable|attachment|therapy|purpose|meaning of life)\b/i;
const COVERISH_RE = /\bquestions to ask\b/i;

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

function usableStem(text: string): string | null {
  const stem = text.replace(/\s+/g, ' ').trim();
  if (stem.length < 12 || stem.length > 220) return null;
  if (COVERISH_RE.test(stem)) return null;
  return stem;
}

function collectStems(posts: CopycatPost[], into: Map<string, string>) {
  for (const post of posts) {
    for (const slide of post.slideText) {
      if (isCopycatPromoNoiseSlide(slide)) continue;
      const stem = usableStem(slide.text);
      if (!stem) continue;
      const key = stem.toLowerCase();
      if (!into.has(key)) into.set(key, stem);
    }
  }
}

let cached: { chaotic: string[]; rest: string[] } | null = null;

function copycatBuckets(): { chaotic: string[]; rest: string[] } {
  if (cached) return cached;
  const into = new Map<string, string>();
  collectStems(getFlamingoCardsPosts(FLAMINGO_CARDS_FEED.posts), into);
  collectStems(getFlamingoConvoPosts(), into);
  collectStems(getQuestions21Posts(), into);
  collectStems(getItsAllAboutLovingYouPosts(), into);
  collectStems(getTryDeepenPosts(), into);
  collectStems(getWeDeepOnePosts(), into);
  collectStems(getCoupleDeepQuestionsPosts(), into);
  collectStems(getCrayCrayQuestions03Posts(), into);
  collectStems(getCrayCrayQuestions7Posts(), into);
  collectStems(getDeepQuestionsAppPosts(), into);
  collectStems(getFlamingoCardsTiktokPosts(), into);
  collectStems(getQuestionsForTonightPosts(), into);
  collectStems(getCoupleSyxPosts(), into);
  collectStems(getMisunderstoodCou4Posts(), into);
  collectStems(getCoupleCardsPosts(), into);
  collectStems(getHhTalkPosts(), into);
  collectStems(getGoldenThoughtsDailyPosts(), into);
  collectStems(getLvrsbaePosts(), into);
  collectStems(getSpillCardsAppPosts(), into);
  collectStems(getHookPosts(), into);
  const chaotic: string[] = [];
  const rest: string[] = [];
  for (const stem of into.values()) {
    if (CHAOTIC_RE.test(stem) && !DEEP_RE.test(stem)) chaotic.push(stem);
    else rest.push(stem);
  }
  cached = { chaotic, rest };
  return cached;
}

/**
 * Prefer funny bank lines and chaotic copycat stems. Other pools fill the rest.
 * `exclude` drops bodies already on the post so Retry doesn't repeat them.
 */
export function pickTemplate24QuestionBodies(count: number, exclude: string[] = []): string[] {
  if (count <= 0) return [];
  const skip = new Set(exclude.map((item) => item.trim().toLowerCase()).filter(Boolean));
  const fresh = (question: string) => !skip.has(question.trim().toLowerCase());
  const { chaotic, rest } = copycatBuckets();
  const buckets = {
    funny: shuffle(FUNNY_QUESTIONS.filter(fresh)),
    chaotic: shuffle(chaotic.filter(fresh)),
    other: shuffle(
      [...FLIRTY_QUESTIONS, ...ME_OR_YOU_QUESTIONS, ...BRAVE_QUESTIONS, ...rest].filter(fresh)
    ),
  };
  const seen = new Set<string>();
  const picked: string[] = [];
  const take = (name: keyof typeof buckets): boolean => {
    const list = buckets[name];
    while (list.length > 0) {
      const next = list.pop()!;
      const key = next.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(next);
      return true;
    }
    return false;
  };
  const order = ['funny', 'chaotic', 'funny', 'chaotic', 'other'] as const;
  let spins = 0;
  while (picked.length < count && spins < count + 4) {
    const before = picked.length;
    for (const slot of order) {
      if (picked.length >= count) break;
      take(slot);
    }
    if (picked.length === before) break;
    spins += 1;
  }
  return picked.slice(0, count);
}
