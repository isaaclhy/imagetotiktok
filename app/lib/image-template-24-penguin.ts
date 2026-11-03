import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_TEXT_GAP_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/**
 * Penguin-cards slideshow (image template 24).
 * Measured from @penguincardss posts at 1080×1440 (same frame as the other
 * image templates). One flat pale colour per post, a row of progress squares,
 * a heavy centred cover with one highlighted word, and one slightly rotated
 * colour card per question. The last question keeps its card and closes with
 * template 2's App Store promo. There is no extra CTA-only slide.
 */
export const IMAGE_TEMPLATE24_DEFAULT_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE24_MIN_QUESTIONS = 3;
export const IMAGE_TEMPLATE24_MAX_QUESTIONS = 8;

export const IMAGE_TEMPLATE24_BACKGROUNDS = ['#E9F1EC', '#F8ECE9', '#F6F1E6'] as const;
export const IMAGE_TEMPLATE24_CARD_COLORS = [
  '#FF7BAC',
  '#7AE0C3',
  '#B79CFF',
  '#FF9F52',
  '#7FBFFF',
  '#FFD23F',
] as const;
export const IMAGE_TEMPLATE24_HIGHLIGHT_COLORS = ['#FFD93D', '#FF9F52'] as const;
export const IMAGE_TEMPLATE24_HIGHLIGHT_WORDS = [
  'unhinged',
  'dumb',
  'ragebait',
  'chaotic',
  'brutal',
  'spicy',
  'petty',
] as const;

export type Template24HighlightWord = (typeof IMAGE_TEMPLATE24_HIGHLIGHT_WORDS)[number];
export type Template24HighlightChoice = 'random' | Template24HighlightWord;

export type Template24Look = {
  background: string;
  /** One colour per question slide. Index 0 is the first question. */
  cardColors: string[];
  /** Degrees, one per question slide, about -2 to +2. */
  rotations: number[];
  highlightColor: string;
  /** Resolved cover word. Empty means the cover has no highlighter. */
  highlightWord: string;
};

export const IMAGE_TEMPLATE24_TEXT = '#111111';
export const IMAGE_TEMPLATE24_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE24_FOOTER_COLOR = '#7A827D';
export const IMAGE_TEMPLATE24_FONT_STACK =
  '"Plus Jakarta Sans", "Poppins", Nunito, Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE24_FOOTER_FONT_STACK =
  '"Poppins", "Plus Jakarta Sans", "TikTok Sans", system-ui, sans-serif';

const PARTNERS = ['your boyfriend', 'your girlfriend', 'him', 'her'] as const;
const WHENS = ['tonight', 'before bed', 'tonight before bed', 'right now'] as const;

export function isImageTemplate24Id(templateId: number | null | undefined): boolean {
  return templateId === 24;
}

export function isTemplate24HighlightChoice(value: string): value is Template24HighlightChoice {
  return (
    value === 'random' ||
    (IMAGE_TEMPLATE24_HIGHLIGHT_WORDS as readonly string[]).includes(value)
  );
}

export function template24SlideCount(questionCount: number): number {
  return Math.max(1, questionCount) + 1;
}

/** First family from `--font-plus-jakarta` (the self-hosted next/font face). */
export function template24PrimaryFontFamily(): string {
  if (typeof document === 'undefined') return 'Plus Jakarta Sans';
  const raw = getComputedStyle(document.body).getPropertyValue('--font-plus-jakarta').trim();
  if (!raw) return 'Plus Jakarta Sans';
  const quoted = raw.match(/^['"]([^'"]+)['"]/);
  const first = quoted?.[1] ?? raw.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || 'Plus Jakarta Sans';
}

export function template24CanvasFontStack(family = template24PrimaryFontFamily()): string {
  if (!family || family === 'Plus Jakarta Sans') return IMAGE_TEMPLATE24_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE24_FONT_STACK}`;
}

export async function loadTemplate24Fonts(fontFamily: string): Promise<void> {
  const quoted =
    fontFamily.includes(' ') || fontFamily.startsWith('"') ? fontFamily : `"${fontFamily}"`;
  const loads = [
    document.fonts.load(`800 100px ${quoted}`),
    document.fonts.load(`800 72px ${quoted}`),
    document.fonts.load(`800 32px ${quoted}`),
    document.fonts.load(`600 28px "Poppins"`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

function randInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    const swap = next[i]!;
    next[i] = next[j]!;
    next[j] = swap;
  }
  return next;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function template24ContainsWord(text: string, word: string): boolean {
  if (!word.trim()) return false;
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(text);
}

export function resolveTemplate24Highlight(
  choice: Template24HighlightChoice,
  avoid?: string
): string {
  if (choice !== 'random') return choice;
  const pool = IMAGE_TEMPLATE24_HIGHLIGHT_WORDS.filter((word) => word !== avoid);
  const words = pool.length > 0 ? pool : IMAGE_TEMPLATE24_HIGHLIGHT_WORDS;
  return words[randInt(words.length)]!;
}

/**
 * Highlight word for a competitor cover. Random picks a keyword that is
 * actually in the text. A chosen word is returned even when it is absent;
 * the painter only draws the block when the word is present.
 */
export function template24HighlightForCover(
  text: string,
  choice: Template24HighlightChoice
): string {
  if (choice === 'random') {
    const hits = shuffle(IMAGE_TEMPLATE24_HIGHLIGHT_WORDS).filter((word) =>
      template24ContainsWord(text, word)
    );
    return hits[0] ?? '';
  }
  return choice;
}

function pickDifferent<T extends string>(options: readonly T[], avoid?: string): T {
  const pool = options.filter((option) => option !== avoid);
  const list = pool.length > 0 ? pool : options;
  return list[randInt(list.length)]!;
}

function pickCardColor(avoid?: string): string {
  return pickDifferent(IMAGE_TEMPLATE24_CARD_COLORS, avoid);
}

function pickRotation(previous?: number): number {
  for (let attempt = 0; attempt < 8; attempt++) {
    const sign = Math.random() < 0.5 ? -1 : 1;
    const magnitude = 0.6 + Math.random() * 1.4;
    const value = Math.round(sign * magnitude * 10) / 10;
    if (previous == null || Math.abs(value - previous) >= 0.6) return value;
  }
  return previous != null && previous > 0 ? -1.3 : 1.3;
}

function rollCardColors(count: number): string[] {
  const colors: string[] = [];
  while (colors.length < count) colors.push(pickCardColor(colors[colors.length - 1]));
  return colors;
}

function rollRotations(count: number): number[] {
  const rotations: number[] = [];
  while (rotations.length < count) rotations.push(pickRotation(rotations[rotations.length - 1]));
  return rotations;
}

export function rollTemplate24Look(
  questionCount: number,
  highlight: Template24HighlightChoice = 'random',
  avoidWord?: string
): Template24Look {
  const count = Math.max(0, questionCount);
  return {
    background: pickDifferent(IMAGE_TEMPLATE24_BACKGROUNDS),
    cardColors: rollCardColors(count),
    rotations: rollRotations(count),
    highlightColor: pickDifferent(IMAGE_TEMPLATE24_HIGHLIGHT_COLORS),
    highlightWord: resolveTemplate24Highlight(highlight, avoidWord),
  };
}

/** New background, card order, rotations, and highlighter colour. Keeps the word. */
export function rerollTemplate24Look(look: Template24Look): Template24Look {
  const count = Math.max(look.cardColors.length, look.rotations.length);
  return {
    background: pickDifferent(IMAGE_TEMPLATE24_BACKGROUNDS, look.background),
    cardColors: rollCardColors(count),
    rotations: rollRotations(count),
    highlightColor: pickDifferent(IMAGE_TEMPLATE24_HIGHLIGHT_COLORS, look.highlightColor),
    highlightWord: look.highlightWord,
  };
}

/** Keep the current colours and tilts, extending or trimming to the question count. */
export function fitTemplate24Look(look: Template24Look, questionCount: number): Template24Look {
  const count = Math.max(0, questionCount);
  const cardColors = look.cardColors.slice(0, count);
  const rotations = look.rotations.slice(0, count);
  while (cardColors.length < count) cardColors.push(pickCardColor(cardColors[cardColors.length - 1]));
  while (rotations.length < count) rotations.push(pickRotation(rotations[rotations.length - 1]));
  return { ...look, cardColors, rotations };
}

export const IMAGE_TEMPLATE24_DEFAULT_LOOK: Template24Look = {
  background: IMAGE_TEMPLATE24_BACKGROUNDS[0],
  cardColors: ['#FF7BAC', '#7AE0C3', '#B79CFF', '#FF9F52', '#7FBFFF'],
  rotations: [-1.4, 1.6, -0.8, 1.2, -1.8],
  highlightColor: IMAGE_TEMPLATE24_HIGHLIGHT_COLORS[0],
  highlightWord: 'unhinged',
};

export function template24CoverTitle(count: number, word: string): string {
  const keyword = word.trim() || 'unhinged';
  const mega = Math.random() < 0.35 ? 'mega ' : '';
  const partner = PARTNERS[randInt(PARTNERS.length)]!;
  const when = Math.random() < 0.72 ? ` ${WHENS[randInt(WHENS.length)]}` : '';
  return `${count} ${mega}${keyword} questions to ask ${partner}${when}`;
}

export function template24Retitle(title: string, count: number, word: string): string {
  const keyword = word.trim();
  const trimmed = title.trim();
  if (!trimmed || !keyword) return template24CoverTitle(count, keyword || 'unhinged');
  let next = /^\d+\b/.test(trimmed) ? trimmed.replace(/^\d+\b/, String(count)) : trimmed;
  if (template24ContainsWord(next, keyword)) return next;
  for (const known of IMAGE_TEMPLATE24_HIGHLIGHT_WORDS) {
    if (!template24ContainsWord(next, known)) continue;
    return next.replace(new RegExp(`\\b${escapeRegExp(known)}\\b`, 'i'), keyword);
  }
  return template24CoverTitle(count, keyword);
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

function breakOverflowToken(
  ctx: CanvasRenderingContext2D,
  token: string,
  maxWidth: number
): string[] {
  if (ctx.measureText(token).width <= maxWidth) return [token];
  const parts: string[] = [];
  let rest = token;
  while (rest.length > 0) {
    if (ctx.measureText(rest).width <= maxWidth) {
      parts.push(rest);
      break;
    }
    let lo = 1;
    let hi = rest.length - 1;
    let best = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (ctx.measureText(rest.slice(0, mid)).width <= maxWidth) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    parts.push(rest.slice(0, best));
    rest = rest.slice(best);
  }
  return parts;
}

function wrapParagraph(ctx: CanvasRenderingContext2D, paragraph: string, maxWidth: number): string[] {
  const words = paragraph.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    for (const chunk of breakOverflowToken(ctx, word, maxWidth)) {
      if (!current) {
        current = chunk;
        continue;
      }
      const candidate = `${current} ${chunk}`;
      if (ctx.measureText(candidate).width <= maxWidth) current = candidate;
      else {
        lines.push(current);
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapBlock(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, '').split('\n')) {
    const wrapped = wrapParagraph(ctx, paragraph, maxWidth);
    if (wrapped.length === 0) {
      if (lines.length > 0) lines.push('');
      continue;
    }
    lines.push(...wrapped);
  }
  return lines.length > 0 ? lines : [''];
}

function paintProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tabIndex: number,
  slideCount: number
) {
  const count = Math.max(1, slideCount);
  const size = Math.max(14, Math.round(width * 0.022));
  const gap = Math.max(6, Math.round(width * 0.008));
  const y = Math.round(height * 0.05);
  const total = count * size + (count - 1) * gap;
  let x = (width - total) / 2;
  const radius = Math.max(2, size * 0.16);
  const index = Math.min(Math.max(0, tabIndex), count - 1);
  for (let i = 0; i < count; i++) {
    roundRect(ctx, x, y, size, size, radius);
    if (i === index) {
      ctx.fillStyle = '#141414';
      ctx.fill();
    } else {
      ctx.lineWidth = Math.max(2.25, size * 0.12);
      ctx.strokeStyle = '#141414';
      ctx.stroke();
    }
    x += size + gap;
  }
}

function paintFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const size = width * 0.026;
  ctx.font = `600 ${size}px ${IMAGE_TEMPLATE24_FOOTER_FONT_STACK}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE24_FOOTER_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE24_FOOTER, width / 2, height * 0.931);
}

function splitHighlight(
  line: string,
  word: string
): { before: string; match: string; after: string } | null {
  if (!word.trim()) return null;
  const match = line.match(new RegExp(`^(.*?)(\\b${escapeRegExp(word)}\\b)(.*)$`, 'i'));
  if (!match) return null;
  return { before: match[1] ?? '', match: match[2] ?? word, after: match[3] ?? '' };
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  fontFamily: string,
  highlightWord: string,
  highlightColor: string
) {
  const maxWidth = width * 0.86;
  const pillHeight = width * 0.062;
  const pillCenter = height * 0.805;
  const pillTop = pillCenter - pillHeight / 2;
  const regionTop = height * 0.16;
  const regionBottom = pillTop - height * 0.045;
  const regionHeight = Math.max(height * 0.2, regionBottom - regionTop);
  let fontSize = width * 0.093;
  const minSize = width * 0.055;
  const linePitch = 1.18;

  const layoutAt = (size: number) => {
    ctx.font = `800 ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, `${-size * 0.025}px`);
    const lines = title.trim() ? wrapBlock(ctx, title, maxWidth) : [''];
    const block = lines.length * size * linePitch;
    return { lines, block };
  };

  let layout = layoutAt(fontSize);
  while (fontSize > minSize && layout.block > regionHeight) {
    fontSize = Math.max(minSize, fontSize - width * 0.004);
    layout = layoutAt(fontSize);
    if (fontSize === minSize) break;
  }

  const block = layout.block;
  let y = regionTop + (regionHeight - block) / 2 + (fontSize * linePitch) / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, `${-fontSize * 0.025}px`);
  for (const line of layout.lines) {
    const lineWidth = ctx.measureText(line).width;
    const start = (width - lineWidth) / 2;
    const parts = splitHighlight(line, highlightWord);
    if (parts) {
      const beforeWidth = ctx.measureText(parts.before).width;
      const matchWidth = ctx.measureText(parts.match).width;
      const padX = fontSize * 0.12;
      const trailingSpace = parts.before.match(/ +$/)?.[0] ?? '';
      const gap = trailingSpace ? ctx.measureText(trailingSpace).width : padX;
      const leftPad = trailingSpace ? Math.min(padX * 0.45, gap * 0.22) : padX;
      const rectH = fontSize * 0.9;
      const rectW = leftPad + matchWidth + padX;
      const rectX = start + beforeWidth - leftPad;
      const rectY = y - rectH / 2 + fontSize * 0.03;
      ctx.fillStyle = highlightColor;
      roundRect(ctx, rectX, rectY, rectW, rectH, fontSize * 0.18);
      ctx.fill();
      ctx.font = `800 ${fontSize}px ${fontFamily}`;
      setLetterSpacing(ctx, `${-fontSize * 0.025}px`);
    }
    ctx.fillStyle = IMAGE_TEMPLATE24_TEXT;
    ctx.fillText(line, start, y);
    y += fontSize * linePitch;
  }

  paintSwipePill(ctx, width, pillCenter, fontFamily);
}

function paintSwipePill(
  ctx: CanvasRenderingContext2D,
  width: number,
  centerY: number,
  fontFamily: string
) {
  const size = width * 0.03;
  const label = 'swipe';
  ctx.font = `800 ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  const textWidth = ctx.measureText(label).width;
  const arrow = size * 0.42;
  const gap = size * 0.38;
  const padX = size * 0.95;
  const content = textWidth + gap + arrow;
  const pillW = content + padX * 2;
  const pillH = size * 2.15;
  const x = (width - pillW) / 2;
  const y = centerY - pillH / 2;
  ctx.fillStyle = '#141414';
  roundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textX = x + padX;
  ctx.fillText(label, textX, centerY + size * 0.04);
  const ax = textX + textWidth + gap;
  const head = size * 0.24;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(2.5, size * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(ax, centerY);
  ctx.lineTo(ax + arrow, centerY);
  ctx.moveTo(ax + arrow - head, centerY - head);
  ctx.lineTo(ax + arrow, centerY);
  ctx.lineTo(ax + arrow - head, centerY + head);
  ctx.stroke();
}

function questionBody(text: string): string {
  const { question } = splitCopycatQuestionAndOptions(text);
  const body = question.trim() || text.trim();
  return body;
}

function paintCardText(
  ctx: CanvasRenderingContext2D,
  cardW: number,
  cardH: number,
  text: string,
  fontFamily: string
) {
  const padX = cardW * 0.09;
  const padY = cardH * 0.12;
  const maxWidth = cardW - padX * 2;
  const maxHeight = cardH - padY * 2;
  let fontSize = Math.min(cardW * 0.105, cardH * 0.16);
  const minSize = cardW * 0.045;
  const linePitch = 1.16;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let lines: string[] = [''];
  while (fontSize > minSize) {
    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    setLetterSpacing(ctx, `${-fontSize * 0.02}px`);
    lines = wrapBlock(ctx, text, maxWidth);
    const block = lines.length * fontSize * linePitch;
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width), 0);
    if (block <= maxHeight && widest <= maxWidth + 1) break;
    fontSize = Math.max(minSize, fontSize * 0.94);
    if (fontSize === minSize) {
      ctx.font = `800 ${fontSize}px ${fontFamily}`;
      setLetterSpacing(ctx, `${-fontSize * 0.02}px`);
      lines = wrapBlock(ctx, text, maxWidth);
      break;
    }
  }
  const block = lines.length * fontSize * linePitch;
  let y = -block / 2 + (fontSize * linePitch) / 2;
  ctx.fillStyle = IMAGE_TEMPLATE24_TEXT;
  ctx.font = `800 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, `${-fontSize * 0.02}px`);
  for (const line of lines) {
    ctx.fillText(line, 0, y);
    y += fontSize * linePitch;
  }
}

function paintQuestionCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  fill: string,
  rotation: number,
  centerY: number,
  cardScale: number
) {
  const cardW = width * 0.82 * cardScale;
  const cardH = height * 0.49 * cardScale;
  const radius = cardW * 0.055;
  const shadow = width * (8 / 1080);
  const stroke = Math.max(4, width * (5 / 1080));
  const cx = width / 2;
  const radians = (rotation * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx + shadow, centerY + shadow);
  ctx.rotate(radians);
  ctx.fillStyle = '#111111';
  roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, centerY);
  ctx.rotate(radians);
  ctx.fillStyle = fill;
  roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, radius);
  ctx.fill();
  ctx.lineWidth = stroke;
  ctx.strokeStyle = '#111111';
  ctx.stroke();
  paintCardText(ctx, cardW, cardH, text, fontFamily);
  ctx.restore();
}

function cardColorAt(look: Template24Look, questionIndex: number): string {
  const existing = look.cardColors[questionIndex];
  if (existing) return existing;
  const palette = IMAGE_TEMPLATE24_CARD_COLORS;
  const previous = look.cardColors[questionIndex - 1];
  const slot = questionIndex % palette.length;
  const color = palette[slot] ?? palette[0];
  if (color !== previous) return color;
  return palette[(slot + 1) % palette.length] ?? color;
}

function rotationAt(look: Template24Look, questionIndex: number): number {
  const existing = look.rotations[questionIndex];
  if (existing != null) return existing;
  const tilt = ((questionIndex % 5) - 2) * 0.7;
  return tilt === 0 ? 1.1 : tilt;
}

function paintClosingPromo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  promo: CanvasImageSource | null
) {
  const layout = imageTemplate2Q5PromoLayout(width, height, 0);
  if (promo) ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
  const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
  const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
  ctx.font = `800 ${labelSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE24_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, layout.y - labelGap);
}

export function paintTemplate24Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCover?: boolean;
    isCta?: boolean;
    look?: Template24Look;
    promo?: CanvasImageSource | null;
    fontFamily?: string;
  }
) {
  const look = options.look ?? IMAGE_TEMPLATE24_DEFAULT_LOOK;
  const slideCount = options.slideCount ?? template24SlideCount(look.cardColors.length || 5);
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE24_FONT_STACK;

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = look.background;
  ctx.fillRect(0, 0, width, height);
  paintProgress(ctx, width, height, options.tabIndex, slideCount);

  if (isCover) {
    paintCover(
      ctx,
      width,
      height,
      options.text,
      fontFamily,
      look.highlightWord,
      look.highlightColor
    );
    paintFooter(ctx, width, height);
    return;
  }

  const questionIndex = Math.max(0, options.tabIndex - 1);
  const body = questionBody(options.text);
  if (isCta) {
    const layout = imageTemplate2Q5PromoLayout(width, height, 0);
    const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const ceiling =
      layout.y -
      labelGap -
      labelSize -
      height * IMAGE_TEMPLATE2_Q5_PROMO_TEXT_GAP_RATIO;
    const top = height * 0.11;
    const cardH = height * 0.49;
    const room = ceiling - top;
    const cardScale = Math.min(0.86, Math.max(0.62, (room * 0.92) / cardH));
    const scaledH = cardH * cardScale;
    const centerY = top + (room - scaledH) / 2 + scaledH / 2;
    paintQuestionCard(
      ctx,
      width,
      height,
      body,
      fontFamily,
      cardColorAt(look, questionIndex),
      rotationAt(look, questionIndex),
      centerY,
      cardScale
    );
    paintClosingPromo(ctx, width, height, fontFamily, options.promo ?? null);
    return;
  }

  paintQuestionCard(
    ctx,
    width,
    height,
    body,
    fontFamily,
    cardColorAt(look, questionIndex),
    rotationAt(look, questionIndex),
    height * 0.487,
    1
  );
  paintFooter(ctx, width, height);
}
