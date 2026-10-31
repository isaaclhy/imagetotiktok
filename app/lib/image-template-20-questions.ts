import {
  FLAMINGO_CARDS_FEED,
  formatCopycatSlideBody,
  type CopycatPost,
  type CopycatSlideText,
} from '@/app/lib/copycat/flamingo-cards';
import { getFlamingoConvoPosts } from '@/app/lib/copycat/flamingo-convo';
import { getQuestions21Posts } from '@/app/lib/copycat/questions-21';
import { getItsAllAboutLovingYouPosts } from '@/app/lib/copycat/itsallaboutlovingyou';
import { getTryDeepenPosts } from '@/app/lib/copycat/trydeepen';
import { getCoupleCardsPosts } from '@/app/lib/copycat/couple-cards';
import { getHhTalkPosts } from '@/app/lib/copycat/hhtalk';
import { getGoldenThoughtsDailyPosts } from '@/app/lib/copycat/goldenthoughtsdaily';
import { getLvrsbaePosts } from '@/app/lib/copycat/lvrsbae';
import { getSpillCardsAppPosts } from '@/app/lib/copycat/spillcardsapp';
import { getHookPosts } from '@/app/lib/copycat/hook-posts';

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i]!;
    next[i] = next[j]!;
    next[j] = swap;
  }
  return next;
}

let choicePool: string[] | null = null;

function posts(): CopycatPost[] {
  return [
    ...getTryDeepenPosts(),
    ...FLAMINGO_CARDS_FEED.posts,
    ...getFlamingoConvoPosts(),
    ...getQuestions21Posts(),
    ...getItsAllAboutLovingYouPosts(),
    ...getCoupleCardsPosts(),
    ...getHhTalkPosts(),
    ...getGoldenThoughtsDailyPosts(),
    ...getLvrsbaePosts(),
    ...getSpillCardsAppPosts(),
    ...getHookPosts(),
  ];
}

function choiceRank(slide: CopycatSlideText): number {
  const count = slide.options?.length ?? 0;
  if (count === 4) return 0;
  if (count === 3 || count === 5) return 1;
  if (count >= 2) return 2;
  return 3;
}

/** Multiple-choice slide bodies, four-option questions first. */
export function template20ChoicePool(): readonly string[] {
  if (choicePool) return choicePool;
  const ranked = posts()
    .flatMap((post) => post.slideText)
    .filter((slide) => (slide.options?.length ?? 0) >= 2 && slide.text.trim())
    .sort((a, b) => choiceRank(a) - choiceRank(b));
  const seen = new Set<string>();
  const bodies: string[] = [];
  for (const slide of ranked) {
    const body = formatCopycatSlideBody(slide);
    const key = body.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    bodies.push(body);
  }
  choicePool = bodies;
  return bodies;
}

function optionCount(body: string): number {
  return body.match(/^[a-z0-9]\. /gim)?.length ?? 0;
}

/** Four-option questions first, then three or five, then any other choices. */
function choiceTiers(): string[][] {
  const tiers: string[][] = [[], [], []];
  for (const body of template20ChoicePool()) {
    const count = optionCount(body);
    if (count === 4) tiers[0]!.push(body);
    else if (count === 3 || count === 5) tiers[1]!.push(body);
    else tiers[2]!.push(body);
  }
  return tiers;
}

function takeUnique(source: readonly string[], wanted: number, used: Set<string>, into: string[]) {
  for (const body of source) {
    if (into.length >= wanted) return;
    const key = body.trim().toLowerCase();
    if (!key || used.has(key)) continue;
    used.add(key);
    into.push(body);
  }
}

/**
 * Studio questions for template 20. Multiple-choice copy from the Copycat
 * feeds is used first, preferring four options so slides render as A–D.
 * The question bank fills any gap.
 */
export function pickTemplate20Questions(count: number, fallback: readonly string[]): string[] {
  const wanted = Math.max(0, count);
  const picked: string[] = [];
  const used = new Set<string>();
  for (const tier of choiceTiers()) takeUnique(shuffle(tier), wanted, used, picked);
  takeUnique(shuffle(fallback), wanted, used, picked);
  return picked;
}

/** One new multiple-choice question, or a bank question when the pool is exhausted. */
export function pickTemplate20Question(fallback: readonly string[], exclude?: string): string {
  const avoid = (exclude ?? '').trim().toLowerCase();
  for (const tier of choiceTiers()) {
    const choices = tier.filter((body) => body.trim().toLowerCase() !== avoid);
    if (choices.length > 0) return choices[Math.floor(Math.random() * choices.length)]!;
  }
  const bank = fallback.filter((question) => question.trim().toLowerCase() !== avoid);
  const pool = bank.length > 0 ? bank : fallback;
  return pool[Math.floor(Math.random() * pool.length)] ?? '';
}
