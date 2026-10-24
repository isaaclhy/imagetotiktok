import {
  cleanCopycatDisplayText,
  FLAMINGO_CARDS_FEED,
  isCopycatPromoNoiseSlide,
  splitCopycatQuestionAndOptions,
  type CopycatPost,
  type CopycatSlideText,
} from '@/app/lib/copycat/flamingo-cards';
import { getCoupleCardsPosts } from '@/app/lib/copycat/couple-cards';
import { getFlamingoCardsPosts } from '@/app/lib/copycat/flamingo-convos';
import { getGoldenThoughtsDailyPosts } from '@/app/lib/copycat/goldenthoughtsdaily';
import { getHhTalkPosts } from '@/app/lib/copycat/hhtalk';
import { getItsAllAboutLovingYouPosts } from '@/app/lib/copycat/itsallaboutlovingyou';
import { getLvrsbaePosts } from '@/app/lib/copycat/lvrsbae';
import { getQuestions21Posts } from '@/app/lib/copycat/questions-21';
import { getSpillCardsAppPosts } from '@/app/lib/copycat/spillcardsapp';
import { getTryDeepenPosts } from '@/app/lib/copycat/trydeepen';

export const VIDEO_TEMPLATE4_PEXELS_QUERY = 'ocean sunset';
export const VIDEO_TEMPLATE4_LABELS = [
  'Questions for your boyfriend:',
] as const;
export type VideoTemplate4Label = string;

export const VIDEO_TEMPLATE4_COMPETITORS = [
  { id: 'flamingo-cards', label: 'Flamingo cards' },
  { id: '21-questions', label: '21 Questions' },
  { id: 'its-all-about-loving-you', label: "It's all about loving you" },
  { id: 'try-deepen', label: 'Try deepen' },
  { id: 'couple-cards', label: 'Couples Cards' },
  { id: 'hh-talk', label: 'HH Talk' },
  { id: 'golden-thoughts-daily', label: 'Golden Thoughts Daily' },
  { id: 'lvrsbae', label: '.lvrsbae' },
  { id: 'spill-cards-app', label: 'Spill Cards App' },
] as const;

export type VideoTemplate4CompetitorId = (typeof VIDEO_TEMPLATE4_COMPETITORS)[number]['id'];
export type VideoTemplate4CompetitorFilter = VideoTemplate4CompetitorId | 'all';

const FONT = '"TikTok Sans", system-ui, -apple-system, sans-serif';

export type VideoTemplate4Content = { label: string; questions: string[] };

function slideHasOptions(slide: CopycatSlideText): boolean {
  if (slide.options?.length) return true;
  if (splitCopycatQuestionAndOptions(slide.text).options) return true;
  return /(?:^|\n)\s*[a-d]\.\s+\S/i.test(slide.text);
}

function questionSlides(post: CopycatPost): CopycatSlideText[] {
  return post.slideText.filter(
    (slide) => !isCopycatPromoNoiseSlide(slide) && slide.text.trim()
  );
}

function isQuestionsOnlyPost(post: CopycatPost): boolean {
  const slides = questionSlides(post);
  return slides.length > 0 && slides.every((slide) => !slideHasOptions(slide));
}

function postsForCompetitor(id: VideoTemplate4CompetitorId): CopycatPost[] {
  switch (id) {
    case 'flamingo-cards':
      return getFlamingoCardsPosts(FLAMINGO_CARDS_FEED.posts);
    case '21-questions':
      return getQuestions21Posts();
    case 'its-all-about-loving-you':
      return getItsAllAboutLovingYouPosts();
    case 'try-deepen':
      return getTryDeepenPosts();
    case 'couple-cards':
      return getCoupleCardsPosts();
    case 'hh-talk':
      return getHhTalkPosts();
    case 'golden-thoughts-daily':
      return getGoldenThoughtsDailyPosts();
    case 'lvrsbae':
      return getLvrsbaePosts();
    case 'spill-cards-app':
      return getSpillCardsAppPosts();
  }
}

function competitorPosts(filter: VideoTemplate4CompetitorFilter = 'all'): CopycatPost[] {
  if (filter !== 'all') return postsForCompetitor(filter);
  const seen = new Set<string>();
  const posts: CopycatPost[] = [];
  for (const competitor of VIDEO_TEMPLATE4_COMPETITORS) {
    for (const post of postsForCompetitor(competitor.id)) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      posts.push(post);
    }
  }
  return posts;
}

function questionSetsFromPosts(posts: CopycatPost[]): VideoTemplate4Content[] {
  const sets: VideoTemplate4Content[] = [];
  for (const post of posts) {
    if (!isQuestionsOnlyPost(post)) continue;
    const cover = cleanCopycatDisplayText(post.coverText);
    if (!cover) continue;
    const questions = questionSlides(post)
      .map((slide) => cleanCopycatDisplayText(slide.text))
      .filter((question) => question && question !== cover);
    if (!questions.length) continue;
    sets.push({ label: cover, questions });
  }
  return sets;
}

function questionSetsFor(
  competitorId: VideoTemplate4CompetitorFilter = 'all'
): VideoTemplate4Content[] {
  return questionSetsFromPosts(competitorPosts(competitorId));
}

function pickVideoTemplate4Set(
  exclude?: VideoTemplate4Content,
  competitorId: VideoTemplate4CompetitorFilter = 'all'
): VideoTemplate4Content {
  const pool = questionSetsFor(competitorId);
  if (pool.length === 0) {
    return {
      label: VIDEO_TEMPLATE4_LABELS[0],
      questions: ['What is your favorite thing about us?'],
    };
  }
  const filtered = exclude ? pool.filter((set) => set.label !== exclude.label) : pool;
  const list = filtered.length > 0 ? filtered : pool;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function pickVideoTemplate4Content(
  exclude?: VideoTemplate4Content,
  competitorId: VideoTemplate4CompetitorFilter = 'all'
): VideoTemplate4Content {
  return pickVideoTemplate4Set(exclude, competitorId);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      lines.push(current);
      current = words[i]!;
    }
  }
  lines.push(current);
  return lines;
}

export function paintVideoTemplate4Overlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: { label: string; questions: string[] }
) {
  const sky = ctx.createLinearGradient(0, 0, 0, frameHeight);
  sky.addColorStop(0, 'rgba(255, 142, 64, 0.26)');
  sky.addColorStop(0.28, 'rgba(255, 112, 56, 0.14)');
  sky.addColorStop(0.55, 'rgba(210, 72, 58, 0.08)');
  sky.addColorStop(0.78, 'rgba(120, 32, 48, 0.14)');
  sky.addColorStop(1, 'rgba(68, 14, 36, 0.24)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const vignette = ctx.createRadialGradient(
    frameWidth / 2,
    frameHeight * 0.42,
    frameWidth * 0.18,
    frameWidth / 2,
    frameHeight * 0.5,
    frameWidth * 0.92
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.62, 'rgba(0, 0, 0, 0.08)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const questions = options.questions.map((q) => q.trim()).filter(Boolean);
  const left = frameWidth * 0.11;
  const maxW = frameWidth * 0.78;
  const minTop = frameHeight * 0.16;
  const maxBottom = frameHeight * 0.72;
  const maxBlock = maxBottom - minTop;

  let labelSize = Math.round(frameWidth * 0.062);
  let questionSize = Math.round(frameWidth * 0.03);
  let labelLines: string[] = [];
  let questionBlocks: string[][] = [];
  let labelLineH = labelSize * 1.18;
  let questionLineH = questionSize * 1.2;
  let questionGap = questionSize * 0.85;
  let titleGap = questionSize * 1.15;
  let blockH = 0;

  for (let step = 0; step < 10; step++) {
    labelLineH = labelSize * 1.18;
    questionLineH = questionSize * 1.2;
    questionGap = questionSize * 0.85;
    titleGap = Math.max(labelSize * 0.7, questionSize * 1.15);
    ctx.font = `800 ${labelSize}px ${FONT}`;
    labelLines = wrapLines(ctx, options.label, maxW);
    ctx.font = `700 ${questionSize}px ${FONT}`;
    questionBlocks = questions.map((question, i) =>
      wrapLines(ctx, `${i + 1}. ${question}`, maxW)
    );
    const questionH = questionBlocks.reduce(
      (sum, lines, i) =>
        sum + lines.length * questionLineH + (i > 0 ? questionGap : 0),
      0
    );
    blockH =
      labelLines.length * labelLineH + (questionH ? titleGap : 0) + questionH;
    if (blockH <= maxBlock || questionSize <= Math.round(frameWidth * 0.02)) break;
    labelSize = Math.max(Math.round(frameWidth * 0.044), labelSize - 2);
    questionSize = Math.max(Math.round(frameWidth * 0.02), questionSize - 2);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = Math.max(10, frameWidth * 0.028);
  ctx.shadowOffsetY = Math.max(1, frameWidth * 0.004);

  let y = minTop + labelLineH / 2;

  ctx.font = `800 ${labelSize}px ${FONT}`;
  for (const line of labelLines) {
    ctx.fillText(line, left, y);
    y += labelLineH;
  }
  y += titleGap;
  ctx.font = `700 ${questionSize}px ${FONT}`;
  for (const lines of questionBlocks) {
    for (const line of lines) {
      ctx.fillText(line, left, y);
      y += questionLineH;
    }
    y += questionGap;
  }

  const markY = frameHeight * 0.78;
  const heartSize = Math.round(frameWidth * 0.036);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = Math.max(8, frameWidth * 0.02);
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.textAlign = 'center';
  ctx.font = `400 ${heartSize}px ${FONT}`;
  ctx.fillText('♥ ♥ ♥', frameWidth / 2, markY - heartSize * 1.35);
  ctx.font = `700 ${Math.round(frameWidth * 0.03)}px ${FONT}`;
  ctx.textBaseline = 'bottom';
  ctx.fillText('Spill It', frameWidth / 2, markY);
}
