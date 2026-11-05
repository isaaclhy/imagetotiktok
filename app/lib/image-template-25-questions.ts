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
  splitCopycatQuestionAndOptions,
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

function hasChoiceMarkers(body: string): boolean {
  const split = splitCopycatQuestionAndOptions(body);
  if (split.options.trim()) return true;
  return /(?:^|\n)\s*[a-d]\.\s+\S/i.test(body);
}

let plainPool: string[] | null = null;
let choicePool: string[] | null = null;

function posts(): CopycatPost[] {
  return [
    ...getFlamingoCardsPosts(FLAMINGO_CARDS_FEED.posts),
    ...getFlamingoConvoPosts(),
    ...getQuestions21Posts(),
    ...getItsAllAboutLovingYouPosts(),
    ...getTryDeepenPosts(),
    ...getWeDeepOnePosts(),
    ...getCoupleDeepQuestionsPosts(),
    ...getCrayCrayQuestions03Posts(),
    ...getCrayCrayQuestions7Posts(),
    ...getDeepQuestionsAppPosts(),
    ...getFlamingoCardsTiktokPosts(),
    ...getQuestionsForTonightPosts(),
    ...getCoupleSyxPosts(),
    ...getMisunderstoodCou4Posts(),
    ...getCoupleCardsPosts(),
    ...getHhTalkPosts(),
    ...getGoldenThoughtsDailyPosts(),
    ...getLvrsbaePosts(),
    ...getSpillCardsAppPosts(),
    ...getHookPosts(),
  ];
}

function bankQuestions(): string[] {
  return [
    ...FUNNY_QUESTIONS,
    ...FLIRTY_QUESTIONS,
    ...ME_OR_YOU_QUESTIONS,
    ...BRAVE_QUESTIONS,
  ];
}

function buildPools() {
  if (plainPool && choicePool) return;
  const plain = new Map<string, string>();
  const choices = new Map<string, string>();
  const keep = (body: string, into: Map<string, string>) => {
    const trimmed = body.trim();
    if (trimmed.length < 8) return;
    const key = trimmed.toLowerCase();
    if (!into.has(key)) into.set(key, trimmed);
  };
  for (const post of posts()) {
    for (const slide of post.slideText) {
      if (isCopycatPromoNoiseSlide(slide)) continue;
      const body = formatCopycatSlideBody(slide);
      if (!body.trim()) continue;
      if ((slide.options?.length ?? 0) > 0 || hasChoiceMarkers(body)) keep(body, choices);
      else keep(body, plain);
    }
  }
  for (const question of bankQuestions()) {
    if (hasChoiceMarkers(question)) keep(question, choices);
    else keep(question, plain);
  }
  plainPool = [...plain.values()];
  choicePool = [...choices.values()];
}

function take(source: readonly string[], count: number, skip: Set<string>, into: string[]) {
  for (const body of source) {
    if (into.length >= count) return;
    const key = body.trim().toLowerCase();
    if (!key || skip.has(key)) continue;
    skip.add(key);
    into.push(body);
  }
}

/**
 * Open-ended questions first: Copycat slides and bank lines with no choices,
 * preferring ones that are actually questions. Multiple-choice bodies are
 * only used once those run out. The slide painter centres any options under
 * the question when they appear.
 */
export function pickTemplate25QuestionBodies(count: number, exclude: string[] = []): string[] {
  buildPools();
  const wanted = Math.max(0, count);
  const skip = new Set(exclude.map((item) => item.trim().toLowerCase()).filter(Boolean));
  const picked: string[] = [];
  const plain = shuffle(plainPool ?? []);
  take(
    plain.filter((body) => body.includes('?')),
    wanted,
    skip,
    picked
  );
  take(plain, wanted, skip, picked);
  take(shuffle(choicePool ?? []), wanted, skip, picked);
  return picked;
}
