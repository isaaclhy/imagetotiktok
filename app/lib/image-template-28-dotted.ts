import {
  BRAVE_QUESTIONS,
  FLIRTY_QUESTIONS,
  FUNNY_QUESTIONS,
  ME_OR_YOU_QUESTIONS,
} from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoTextCeiling,
  paintImageTemplate2Q5Promo,
} from '@/app/lib/image-template-2-cover';

/**
 * Dotted-grid slideshow (image template 28), in the style of @thesenuka.
 * 1080×1440. White fading to light grey, faint dotted grid, navy and plum
 * type. Cover is one of two seeded variants. Three question slides follow.
 * The last question keeps its copy and closes with template 2's App Store
 * promo (same mock, "Download for more questions!" label, and crop).
 * There is no extra CTA slide.
 */
export const IMAGE_TEMPLATE28_QUESTION_COUNT = 3;
export const IMAGE_TEMPLATE28_SLIDE_COUNT = IMAGE_TEMPLATE28_QUESTION_COUNT + 1;
/** Last question. The App Store mock sits on this slide. */
export const IMAGE_TEMPLATE28_CTA_TAB = IMAGE_TEMPLATE28_QUESTION_COUNT;

export const IMAGE_TEMPLATE28_NAVY = '#101B3A';
export const IMAGE_TEMPLATE28_PLUM = '#8E4A63';
export const IMAGE_TEMPLATE28_BRAND = 'Spill It';
export const IMAGE_TEMPLATE28_SWIPE = 'Swipe →';

export const IMAGE_TEMPLATE28_DISPLAY_FONT_STACK =
  '"League Gothic", "Arial Narrow", Impact, sans-serif';
export const IMAGE_TEMPLATE28_BODY_FONT_STACK =
  '"Inter ExtraBold", Inter, "Liberation Sans", Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE28_UI_FONT_STACK =
  'Inter, "Liberation Sans", Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE28_EMOJI_FONT_STACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

/** Stable cover when a caller does not pass a seed. Old vs new, date night. */
export const IMAGE_TEMPLATE28_DEFAULT_SEED = 7;

const TOPICS = [
  'DATE NIGHT QUESTIONS',
  'COUPLE QUESTIONS',
  'RELATIONSHIP QUESTIONS',
  'LATE NIGHT QUESTIONS',
  'DEEP QUESTIONS',
  'FLIRTY QUESTIONS',
  'HONEST QUESTIONS',
  'SPICY QUESTIONS',
  'BEDTIME QUESTIONS',
  'THIS OR THAT QUESTIONS',
] as const;

const QUESTION_EMOJIS = [
  '💔',
  '🍷',
  '✨',
  '😳',
  '💭',
  '🌙',
  '💌',
  '🔥',
  '😊',
  '💋',
  '🌹',
  '💫',
  '❤️',
  '💬',
] as const;

const LABELS_OLD_NEW = ['QUESTION #1', 'QUESTION #2', 'QUESTION #3'] as const;
const LABELS_STOP_ASKING = ['INSTEAD ASK', 'OR TRY', 'AND THE BOLD ONE'] as const;

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'your',
  'you',
  'my',
  'me',
  'i',
  'is',
  'are',
  'was',
  'were',
  'be',
  'do',
  'does',
  'did',
  'what',
  'whats',
  "what's",
  'who',
  'how',
  'when',
  'where',
  'why',
  'that',
  'this',
  'it',
  'if',
  'but',
  'would',
  'could',
  'should',
  'have',
  'has',
  'had',
  'our',
  'we',
  'they',
  'them',
  'their',
  'about',
  'from',
  'into',
  'than',
  'then',
  'just',
  'not',
  'no',
  'yes',
  'one',
  'thing',
  'there',
  'been',
  'being',
  'dont',
  "don't",
  'didnt',
  "didn't",
  'cant',
  "can't",
  'wont',
  "won't",
  'im',
  "i'm",
  'ive',
  "i've",
  'youre',
  "you're",
  'its',
  "it's",
  'even',
  'still',
  'really',
  'very',
  'more',
  'most',
  'some',
  'any',
  'all',
  'out',
  'up',
  'so',
  'as',
  'at',
  'by',
  'we',
]);

export type Template28Variant = 'old-new' | 'stop-asking';

export type Template28Look = {
  seed: number;
  variant: Template28Variant;
  topic: string;
};

export function isImageTemplate28Id(templateId: number | null | undefined): boolean {
  return templateId === 28;
}

/** A different cover than `avoid`, for the Randomize control and a new post. */
export function rollTemplate28Seed(avoid?: number): number {
  let next = 0;
  do {
    next = (Math.floor(Math.random() * 0x100000000) >>> 0) || 1;
  } while (next === avoid);
  return next;
}

export function template28LookFromSeed(seed: number): Template28Look {
  const rand = mulberry32(seed || IMAGE_TEMPLATE28_DEFAULT_SEED);
  const variant: Template28Variant = rand() < 0.5 ? 'old-new' : 'stop-asking';
  const topic = TOPICS[Math.floor(rand() * TOPICS.length)] ?? TOPICS[0];
  return { seed: seed || IMAGE_TEMPLATE28_DEFAULT_SEED, variant, topic };
}

export function template28LookLabel(look: Template28Look): string {
  if (look.variant === 'stop-asking') return 'Stop asking';
  return `Old vs new · ${look.topic}`;
}

export function template28CoverPlainText(look: Template28Look): string {
  if (look.variant === 'stop-asking') {
    return 'STOP ASKING "HOW WAS YOUR DAY?" ASK THIS INSTEAD';
  }
  return `OLD ${look.topic} VS NEW ${look.topic}`;
}

export function template28QuestionLabel(look: Template28Look, questionIndex: number): string {
  const labels = look.variant === 'stop-asking' ? LABELS_STOP_ASKING : LABELS_OLD_NEW;
  return labels[questionIndex] ?? `QUESTION #${questionIndex + 1}`;
}

export function template28QuestionEmojis(seed: number, count: number): string[] {
  const rand = mulberry32(((seed || 1) ^ 0x5e11a) >>> 0);
  const pool = [...QUESTION_EMOJIS];
  const out: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(rand() * pool.length);
    out.push(pool.splice(index, 1)[0]!);
  }
  return out;
}

/** One content word from the question, stable for a seed and slide. */
export function template28HighlightWord(
  question: string,
  seed: number,
  questionIndex: number
): string {
  const words = question.match(/[A-Za-z][A-Za-z']*/g) ?? [];
  const content = words.filter((word) => {
    const lower = word.toLowerCase().replace(/'/g, '');
    return !STOP_WORDS.has(lower) && word.length >= 4;
  });
  const pool = content.length > 0 ? content : words.filter((word) => word.length >= 3);
  if (pool.length === 0) return '';
  const ranked = [...pool].sort((a, b) => b.length - a.length);
  const top = ranked.slice(0, Math.min(5, ranked.length));
  const rand = mulberry32((((seed || 1) + (questionIndex + 1) * 131) ^ 0x91) >>> 0);
  return top[Math.floor(rand() * top.length)] ?? '';
}

/** Question sentence only. Option lists from the feed are not part of this layout. */
export function template28QuestionText(raw: string): string {
  const split = splitCopycatQuestionAndOptions(raw);
  return (split.question || raw).replace(/\s+/g, ' ').trim();
}

function questionBank(): string[] {
  return [
    ...FUNNY_QUESTIONS,
    ...FLIRTY_QUESTIONS,
    ...ME_OR_YOU_QUESTIONS,
    ...BRAVE_QUESTIONS,
  ];
}

/**
 * Questions from the app's banks. A seed makes the draw stable (render
 * scripts, padding a short post). Without one, each call is a fresh shuffle.
 */
export function pickTemplate28Questions(
  count: number,
  exclude: string[] = [],
  seed?: number
): string[] {
  const skip = new Set(exclude.map((item) => item.trim().toLowerCase()).filter(Boolean));
  const pool = questionBank().filter((question) => !skip.has(question.trim().toLowerCase()));
  const rand = seed === undefined ? null : mulberry32((seed ^ 0x0b5) >>> 0);
  const shuffled = rand ? seededShuffle(pool, rand) : shuffle(pool);
  return shuffled.slice(0, count);
}

/** Keep up to three real questions, then fill from the banks. */
export function fillTemplate28Questions(existing: string[], seed: number): string[] {
  const picked: string[] = [];
  const seen = new Set<string>();
  for (const raw of existing) {
    const question = template28QuestionText(raw);
    const key = question.toLowerCase();
    if (!question || seen.has(key)) continue;
    seen.add(key);
    picked.push(question);
    if (picked.length === IMAGE_TEMPLATE28_QUESTION_COUNT) break;
  }
  if (picked.length < IMAGE_TEMPLATE28_QUESTION_COUNT) {
    picked.push(
      ...pickTemplate28Questions(
        IMAGE_TEMPLATE28_QUESTION_COUNT - picked.length,
        picked,
        seed
      )
    );
  }
  return picked.slice(0, IMAGE_TEMPLATE28_QUESTION_COUNT);
}

export function template28DisplayFontFamily(): string {
  return cssFamily('--font-league-gothic', 'League Gothic');
}

export function template28BodyFontFamily(): string {
  return cssFamily('--font-inter-extrabold', 'Inter ExtraBold');
}

export function template28UiFontFamily(): string {
  return cssFamily('--font-inter', 'Inter');
}

export function template28DisplayFontStack(family = template28DisplayFontFamily()): string {
  if (!family || family === 'League Gothic') return IMAGE_TEMPLATE28_DISPLAY_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE28_DISPLAY_FONT_STACK}`;
}

export function template28BodyFontStack(family = template28BodyFontFamily()): string {
  if (!family || family === 'Inter ExtraBold') return IMAGE_TEMPLATE28_BODY_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE28_BODY_FONT_STACK}`;
}

export function template28UiFontStack(family = template28UiFontFamily()): string {
  if (!family || family === 'Inter') return IMAGE_TEMPLATE28_UI_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE28_UI_FONT_STACK}`;
}

export async function loadTemplate28Fonts(
  display = template28DisplayFontFamily(),
  body = template28BodyFontFamily(),
  ui = template28UiFontFamily()
): Promise<void> {
  const loads = [
    document.fonts.load(`400 160px ${quoteFamily(display)}`),
    document.fonts.load(`800 72px ${quoteFamily(body)}`),
    document.fonts.load(`700 32px ${quoteFamily(ui)}`),
    document.fonts.load(`600 24px ${quoteFamily(ui)}`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

export function paintTemplate28Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCover?: boolean;
    isCta?: boolean;
    /** Cover variant, topic, emoji, and highlight. The same seed always matches. */
    seed?: number;
    promo?: CanvasImageSource | null;
    displayFontFamily?: string;
    bodyFontFamily?: string;
    uiFontFamily?: string;
    emojiFontFamily?: string;
  }
) {
  const slideCount = Math.max(1, options.slideCount ?? IMAGE_TEMPLATE28_SLIDE_COUNT);
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const displayFont = options.displayFontFamily ?? IMAGE_TEMPLATE28_DISPLAY_FONT_STACK;
  const bodyFont = options.bodyFontFamily ?? IMAGE_TEMPLATE28_BODY_FONT_STACK;
  const uiFont = options.uiFontFamily ?? IMAGE_TEMPLATE28_UI_FONT_STACK;
  const emojiFont = options.emojiFontFamily ?? IMAGE_TEMPLATE28_EMOJI_FONT_STACK;
  const look = template28LookFromSeed(options.seed ?? IMAGE_TEMPLATE28_DEFAULT_SEED);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  setLetterSpacing(ctx, '0px');
  ctx.globalAlpha = 1;
  paintBackground(ctx, width, height);
  paintCounter(ctx, width, height, options.tabIndex, slideCount, uiFont);

  if (isCover) {
    paintCover(ctx, width, height, look, options.text, displayFont, emojiFont);
    paintBrandRow(ctx, width, height, height * 0.952, uiFont);
    return;
  }

  const questionIndex = Math.max(0, options.tabIndex - 1);
  const question = template28QuestionText(options.text);
  const highlight = template28HighlightWord(question, look.seed, questionIndex);
  const emoji = template28QuestionEmojis(look.seed, IMAGE_TEMPLATE28_QUESTION_COUNT)[
    questionIndex
  ];
  const label = template28QuestionLabel(look, questionIndex);
  const textBottom = paintQuestion(ctx, width, height, {
    question,
    highlight,
    label,
    emoji,
    bodyFont,
    uiFont,
    emojiFont,
    isCta,
  });
  if (isCta) {
    const brandSize = Math.round(height * 0.022);
    const layout = paintImageTemplate2Q5Promo(ctx, width, height, {
      promo: options.promo ?? null,
      fontFamily: uiFont,
      textColor: IMAGE_TEMPLATE28_NAVY,
      textBottom: textBottom + brandSize + height * 0.02,
      fontWeight: 700,
    });
    const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    paintBrandRow(ctx, width, height, layout.y - labelGap - labelSize - height * 0.012, uiFont);
    return;
  }
  paintBrandRow(ctx, width, height, height * 0.952, uiFont);
}

function paintBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.55, '#F7F8FA');
  gradient.addColorStop(1, '#E4E7EE');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const step = Math.max(18, Math.round(width * 0.026));
  const radius = Math.max(1.15, width * 0.00145);
  ctx.fillStyle = 'rgba(168, 176, 188, 0.85)';
  for (let y = step * 0.55; y < height; y += step) {
    for (let x = step * 0.55; x < width; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function paintCounter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tabIndex: number,
  slideCount: number,
  uiFont: string
) {
  const label = `${tabIndex + 1}/${slideCount}`;
  const size = Math.round(height * 0.022);
  setLetterSpacing(ctx, '0px');
  ctx.font = `600 ${size}px ${uiFont}`;
  const textWidth = ctx.measureText(label).width;
  const padX = size * 0.95;
  const pillH = Math.round(height * 0.0405);
  const pillW = Math.max(textWidth + padX * 2, pillH * 1.7);
  const x = width - width * 0.038 - pillW;
  const y = height * 0.03;
  ctx.fillStyle = '#7E858F';
  fillRoundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + pillW / 2, y + pillH / 2 + size * 0.04);
}

function paintBrandRow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseline: number,
  uiFont: string
) {
  const size = Math.round(height * 0.023);
  setLetterSpacing(ctx, '0px');
  ctx.font = `700 ${size}px ${uiFont}`;
  ctx.fillStyle = IMAGE_TEMPLATE28_NAVY;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillText(IMAGE_TEMPLATE28_BRAND, width * 0.07, baseline);
  ctx.textAlign = 'right';
  ctx.fillText(IMAGE_TEMPLATE28_SWIPE, width * 0.94, baseline);
}

type CoverRun = {
  text: string;
  color: string;
  emoji?: string;
  scale: number;
  gapBefore: number;
  rule?: boolean;
};

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  look: Template28Look,
  text: string,
  displayFont: string,
  emojiFont: string
) {
  const topic = resolveTopic(look, text);
  const runs = coverRuns(look.variant, topic);
  const left = width * 0.07;
  const maxWidth = width * 0.9;
  const top = height * 0.117;
  const bottom = height * 0.9;
  let size = Math.round(width * 0.2);
  let block = measureCover(ctx, runs, size, displayFont, emojiFont);
  while (size > 48 && (block.width > maxWidth || top + block.height > bottom)) {
    size -= 2;
    block = measureCover(ctx, runs, size, displayFont, emojiFont);
  }
  let y = top;
  for (const line of block.lines) {
    y += line.gapBefore;
    if (line.rule) {
      ctx.fillStyle = line.color;
      const ruleW = Math.max(28, line.fontSize * 0.72);
      const ruleH = Math.max(6, line.fontSize * 0.14);
      fillRoundRect(ctx, left, y, ruleW, ruleH, ruleH / 2);
      y += ruleH;
      continue;
    }
    const baseline = y + line.ascent;
    setLetterSpacing(ctx, '0px');
    ctx.font = `400 ${line.fontSize}px ${displayFont}`;
    ctx.fillStyle = line.color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(line.text, left, baseline);
    if (line.emoji) {
      const textWidth = ctx.measureText(line.text).width;
      const emojiSize = line.ascent * 0.98;
      paintEmoji(
        ctx,
        line.emoji,
        left + textWidth + line.fontSize * 0.2,
        baseline - line.ascent * 0.5,
        emojiSize,
        emojiFont
      );
    }
    y += line.ascent + line.descent + line.extraAfter;
  }
}

function resolveTopic(look: Template28Look, text: string): string {
  if (look.variant !== 'old-new') return look.topic;
  const raw = text.replace(/\s+/g, ' ').trim();
  if (!raw) return look.topic;
  if (raw.toUpperCase() === template28CoverPlainText(look).toUpperCase()) return look.topic;
  if (/^OLD\b/i.test(raw) || /^STOP ASKING/i.test(raw)) return look.topic;
  return raw.toUpperCase();
}

function coverRuns(variant: Template28Variant, topic: string): CoverRun[] {
  if (variant === 'stop-asking') {
    return [
      { text: 'STOP ASKING', color: IMAGE_TEMPLATE28_NAVY, scale: 1, gapBefore: 0 },
      { text: '"HOW WAS', color: IMAGE_TEMPLATE28_NAVY, scale: 1, gapBefore: 0 },
      {
        text: 'YOUR DAY?"',
        color: IMAGE_TEMPLATE28_NAVY,
        emoji: '🙄',
        scale: 1,
        gapBefore: 0,
      },
      { text: '', color: IMAGE_TEMPLATE28_NAVY, scale: 0.28, gapBefore: 0.42, rule: true },
      { text: 'ASK THIS', color: IMAGE_TEMPLATE28_PLUM, scale: 1, gapBefore: 0.46 },
      {
        text: 'INSTEAD',
        color: IMAGE_TEMPLATE28_PLUM,
        emoji: '👇',
        scale: 1,
        gapBefore: 0,
      },
    ];
  }
  const topicLines = wrapTopic(topic);
  return [
    { text: 'OLD', color: IMAGE_TEMPLATE28_NAVY, emoji: '❌', scale: 1, gapBefore: 0 },
    ...topicLines.map((line, index) => ({
      text: line,
      color: IMAGE_TEMPLATE28_NAVY,
      scale: 1,
      gapBefore: index === 0 ? 0 : 0,
    })),
    { text: 'VS', color: IMAGE_TEMPLATE28_NAVY, scale: 0.5, gapBefore: 0.2 },
    { text: 'NEW', color: IMAGE_TEMPLATE28_PLUM, emoji: '💕', scale: 1, gapBefore: 0.22 },
    ...topicLines.map((line) => ({
      text: line,
      color: IMAGE_TEMPLATE28_PLUM,
      scale: 1,
      gapBefore: 0,
    })),
  ];
}

function wrapTopic(topic: string): string[] {
  const words = topic.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  if (words.length <= 1) return [words.join(' ')];
  if (words.length === 2) return words;
  return [words.slice(0, -1).join(' '), words[words.length - 1]!];
}

type MeasuredCoverLine = {
  text: string;
  color: string;
  emoji?: string;
  fontSize: number;
  ascent: number;
  descent: number;
  gapBefore: number;
  width: number;
  rule?: boolean;
  extraAfter: number;
};

function measureCover(
  ctx: CanvasRenderingContext2D,
  runs: CoverRun[],
  baseSize: number,
  displayFont: string,
  emojiFont: string
): { width: number; height: number; lines: MeasuredCoverLine[] } {
  const lines: MeasuredCoverLine[] = [];
  let height = 0;
  let width = 0;
  ctx.textBaseline = 'alphabetic';
  runs.forEach((run, index) => {
    const fontSize = Math.max(16, Math.round(baseSize * run.scale));
    const gapBefore = index === 0 ? 0 : baseSize * (run.gapBefore > 0 ? run.gapBefore : 0.09);
    if (run.rule) {
      const ruleH = Math.max(6, fontSize * 0.14);
      lines.push({
        text: '',
        color: run.color,
        fontSize,
        ascent: 0,
        descent: 0,
        gapBefore,
        width: fontSize * 0.72,
        rule: true,
        extraAfter: 0,
      });
      height += gapBefore + ruleH;
      return;
    }
    setLetterSpacing(ctx, '0px');
    ctx.font = `400 ${fontSize}px ${displayFont}`;
    const metrics = ctx.measureText(run.text || 'H');
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.02;
    let lineWidth = metrics.width;
    if (run.emoji) {
      const emojiSize = ascent * 0.98;
      lineWidth += fontSize * 0.2 + measureEmoji(ctx, run.emoji, emojiSize, emojiFont);
    }
    const extraAfter = run.emoji ? baseSize * 0.08 : 0;
    lines.push({
      text: run.text,
      color: run.color,
      emoji: run.emoji,
      fontSize,
      ascent,
      descent,
      gapBefore,
      width: lineWidth,
      extraAfter,
    });
    height += gapBefore + ascent + descent + extraAfter;
    width = Math.max(width, lineWidth);
  });
  return { width, height, lines };
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    question: string;
    highlight: string;
    label: string;
    emoji?: string;
    bodyFont: string;
    uiFont: string;
    emojiFont: string;
    isCta: boolean;
  }
): number {
  const left = width * 0.068;
  const maxWidth = width * 0.78;
  const labelSize = Math.round(height * 0.02);
  const emojiSize = Math.round(width * 0.078);
  const counterBottom = height * 0.03 + height * 0.0405;
  const ceiling = options.isCta
    ? imageTemplate2Q5PromoTextCeiling(width, height) - height * 0.07
    : height * 0.9;
  const topLimit = Math.max(counterBottom + height * 0.04, height * 0.16);
  let size = Math.round(width * 0.078);
  let lines = layoutQuestion(ctx, options.question, size, maxWidth, options.bodyFont);
  while (size > 34 && questionBlockHeight(lines, size, labelSize, height) > ceiling - topLimit) {
    size -= 2;
    lines = layoutQuestion(ctx, options.question, size, maxWidth, options.bodyFont);
  }
  const blockH = questionBlockHeight(lines, size, labelSize, height);
  const preferredTop = height * (options.isCta ? 0.2 : 0.36);
  let labelTop = preferredTop;
  if (labelTop + blockH > ceiling) labelTop = Math.max(topLimit, ceiling - blockH);
  if (labelTop < topLimit) labelTop = topLimit;

  setLetterSpacing(ctx, `${Math.round(labelSize * 0.14)}px`);
  ctx.font = `700 ${labelSize}px ${options.uiFont}`;
  ctx.fillStyle = IMAGE_TEMPLATE28_PLUM;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(options.label, left, labelTop);
  setLetterSpacing(ctx, '0px');

  if (options.emoji) {
    const pillLeft = width - width * 0.038 - width * 0.11;
    const emojiX = Math.min(width * 0.72, pillLeft - emojiSize - width * 0.016);
    const emojiTop = Math.max(counterBottom + height * 0.02, labelTop - emojiSize * 0.9);
    paintEmoji(ctx, options.emoji, emojiX, emojiTop + emojiSize / 2, emojiSize, options.emojiFont);
  }

  const linePitch = size * 1.16;
  ctx.font = `800 ${size}px ${options.bodyFont}`;
  ctx.textBaseline = 'alphabetic';
  let baseline = labelTop + labelSize + height * 0.04 + size * 0.78;
  let bottom = baseline;
  for (const line of lines) {
    drawHighlightedLine(
      ctx,
      line,
      left,
      baseline,
      options.highlight,
      IMAGE_TEMPLATE28_NAVY,
      IMAGE_TEMPLATE28_PLUM
    );
    const metrics = ctx.measureText(line || 'H');
    bottom = baseline + (metrics.actualBoundingBoxDescent || size * 0.2);
    baseline += linePitch;
  }
  return bottom;
}

function questionBlockHeight(
  lines: string[],
  size: number,
  labelSize: number,
  height: number
): number {
  return labelSize + height * 0.04 + Math.max(1, lines.length) * size * 1.16;
}

function layoutQuestion(
  ctx: CanvasRenderingContext2D,
  question: string,
  size: number,
  maxWidth: number,
  bodyFont: string
): string[] {
  setLetterSpacing(ctx, '0px');
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 ${size}px ${bodyFont}`;
  const words = question.split(' ').filter(Boolean);
  if (words.length === 0) return [''];
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

function drawHighlightedLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  baseline: number,
  highlight: string,
  navy: string,
  plum: string
) {
  const hit = highlight ? findWord(line, highlight) : null;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (!hit) {
    ctx.fillStyle = navy;
    ctx.fillText(line, x, baseline);
    return;
  }
  const before = line.slice(0, hit.start);
  const word = line.slice(hit.start, hit.end);
  const after = line.slice(hit.end);
  let cursor = x;
  ctx.fillStyle = navy;
  if (before) {
    ctx.fillText(before, cursor, baseline);
    cursor += ctx.measureText(before).width;
  }
  ctx.fillStyle = plum;
  ctx.fillText(word, cursor, baseline);
  cursor += ctx.measureText(word).width;
  ctx.fillStyle = navy;
  if (after) ctx.fillText(after, cursor, baseline);
}

function findWord(line: string, word: string): { start: number; end: number } | null {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`\\b${escaped}\\b`, 'i').exec(line);
  if (!match) return null;
  return { start: match.index, end: match.index + match[0].length };
}

function paintEmoji(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  x: number,
  y: number,
  size: number,
  emojiFont: string
) {
  ctx.font = `${Math.round(size)}px ${emojiFont}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
}

function measureEmoji(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  size: number,
  emojiFont: string
): number {
  ctx.font = `${Math.round(size)}px ${emojiFont}`;
  return ctx.measureText(emoji).width;
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}

function cssFamily(variable: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const raw = getComputedStyle(document.body).getPropertyValue(variable).trim();
  if (!raw) return fallback;
  const quoted = raw.match(/^['"]([^'"]+)['"]/);
  const first = quoted?.[1] ?? raw.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || fallback;
}

function quoteFamily(family: string): string {
  if (family.startsWith('"') || family.startsWith("'")) return family;
  return family.includes(' ') ? `"${family}"` : family;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

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

function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const swap = next[i]!;
    next[i] = next[j]!;
    next[j] = swap;
  }
  return next;
}
