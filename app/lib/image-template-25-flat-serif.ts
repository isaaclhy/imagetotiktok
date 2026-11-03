import { IMAGE_TEMPLATE23_FOOTER_COLOR, IMAGE_TEMPLATE23_FOOTER_FONT_STACK, IMAGE_TEMPLATE23_TEXT } from '@/app/lib/image-template-23-flat-dark';
import { IMAGE_TEMPLATE20_FONT_STACK } from '@/app/lib/image-template-20-ocean';
import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_ASPECT,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
} from '@/app/lib/image-template-2-cover';

/**
 * Flat serif slideshow (image template 25). Trydeepen-style: one solid colour
 * per slide, no card, frame, grain, vignette, gradient, or progress bar.
 *
 * Cover + five questions + a CTA slide of its own (7 slides). Type is the
 * template 20 serif, centred. The cover is bold; questions are regular.
 * The footer matches template 23 (Poppins SemiBold, same string, ~78% white).
 * The CTA is template 2's "Download for more questions!" line plus template 2's
 * App Store phone, placed where the reference phone sits (not template 2's
 * 90%-wide crop at 66% of the height).
 */
export const IMAGE_TEMPLATE25_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE25_SLIDE_COUNT = IMAGE_TEMPLATE25_QUESTION_COUNT + 2;
export const IMAGE_TEMPLATE25_CTA_TAB = IMAGE_TEMPLATE25_SLIDE_COUNT - 1;

export const IMAGE_TEMPLATE25_COVER_BG = '#241033';
export const IMAGE_TEMPLATE25_CTA_BG = '#1B1C21';
/**
 * Question colours. The first five are the measured cycle. The tail is the
 * rest of template 23's palette, in that list's order, for longer posts.
 */
export const IMAGE_TEMPLATE25_QUESTION_COLORS = [
  '#311B0E',
  '#1E1B4A',
  '#122319',
  '#0B0A0F',
  '#132B2F',
  '#241033',
  '#121828',
  '#0B1E3E',
] as const;

export const IMAGE_TEMPLATE25_TEXT = IMAGE_TEMPLATE23_TEXT;
export const IMAGE_TEMPLATE25_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE25_FONT_STACK = IMAGE_TEMPLATE20_FONT_STACK;
export const IMAGE_TEMPLATE25_FOOTER_FONT_STACK = IMAGE_TEMPLATE23_FOOTER_FONT_STACK;
export const IMAGE_TEMPLATE25_CTA_LABEL = IMAGE_TEMPLATE2_Q5_PROMO_LABEL;

/** Cover. Bold, ~0.069 × width, pitch ~0.075 × height, wrap ~0.62 × width. */
const COVER_SIZE = 0.069;
const COVER_LEADING = (0.075 / COVER_SIZE) * (4 / 3);
const COVER_WIDTH = 0.62;
const COVER_CENTER = 0.475;

/** Questions. Regular, ~0.052 × width, pitch ~0.0556 × height, wrap ~0.64 × width. */
const QUESTION_SIZE = 0.052;
const QUESTION_LEADING = (0.0556 / QUESTION_SIZE) * (4 / 3);
const QUESTION_WIDTH = 0.64;
/** Ink bottom of the last line, including the descender allowance. */
const QUESTION_BOTTOM = 0.532;
/** Extra air between the question and the first option, in ems. */
const OPTION_GAP_EM = 0.55;

const FOOTER_Y = 0.862;
const FOOTER_SIZE = 0.038;
const FOOTER_WEIGHT = 600;

/** CTA heading sits in the reference band (y 0.11–0.26); the phone starts under it. */
const CTA_HEADING_SIZE = 0.062;
const CTA_HEADING_WIDTH = 0.78;
const CTA_HEADING_CENTER = (0.11 + 0.26) / 2;
const CTA_PHONE_TOP = 0.47;
const CTA_PHONE_WIDTH = 0.64;

export function isImageTemplate25Id(templateId: number | null | undefined): boolean {
  return templateId === 25;
}

export function template25Background(tabIndex: number, isCta = false): string {
  if (isCta) return IMAGE_TEMPLATE25_CTA_BG;
  if (tabIndex <= 0) return IMAGE_TEMPLATE25_COVER_BG;
  const slot = (tabIndex - 1) % IMAGE_TEMPLATE25_QUESTION_COLORS.length;
  return IMAGE_TEMPLATE25_QUESTION_COLORS[slot] ?? IMAGE_TEMPLATE25_QUESTION_COLORS[0];
}

export async function loadTemplate25Fonts(): Promise<void> {
  const loads = [
    document.fonts.load(`400 56px ${IMAGE_TEMPLATE25_FONT_STACK}`),
    document.fonts.load(`700 75px ${IMAGE_TEMPLATE25_FONT_STACK}`),
    document.fonts.load(`600 41px "Poppins"`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
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

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, '').split('\n')) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (lines.length > 0) lines.push('');
      continue;
    }
    const wrapped: string[] = [];
    let current = '';
    for (const word of words) {
      for (const chunk of breakOverflowToken(ctx, word, maxWidth)) {
        if (!current) {
          current = chunk;
          continue;
        }
        const next = `${current} ${chunk}`;
        if (ctx.measureText(next).width <= maxWidth) current = next;
        else {
          wrapped.push(current);
          current = chunk;
        }
      }
    }
    if (current) wrapped.push(current);
    lines.push(...rebalanceShortLastLine(ctx, wrapped, maxWidth));
  }
  return lines.filter((line) => line.length > 0);
}

function rebalanceShortLastLine(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number
): string[] {
  if (lines.length < 2) return lines;
  const last = lines[lines.length - 1]!;
  if (!last || last.includes(' ')) return lines;
  if (ctx.measureText(last).width > maxWidth * 0.42) return lines;
  const prevWords = lines[lines.length - 2]!.split(' ');
  if (prevWords.length < 2) return lines;
  const moved = prevWords.pop()!;
  const candidateLast = `${moved} ${last}`;
  if (ctx.measureText(candidateLast).width > maxWidth) return lines;
  const next = lines.slice();
  next[next.length - 2] = prevWords.join(' ');
  next[next.length - 1] = candidateLast;
  return next;
}

function inkAscent(ctx: CanvasRenderingContext2D, fontSize: number): number {
  const box = ctx.measureText('Hyg');
  return box.actualBoundingBoxAscent || fontSize * 0.72;
}

function inkDescent(ctx: CanvasRenderingContext2D, fontSize: number): number {
  const box = ctx.measureText('Hygpq');
  return box.actualBoundingBoxDescent || fontSize * 0.21;
}

function drawCentered(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  firstBaseline: number,
  pitch: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let y = firstBaseline;
  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += pitch;
  }
}

function paintFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const size = width * FOOTER_SIZE;
  ctx.font = `${FOOTER_WEIGHT} ${size}px ${IMAGE_TEMPLATE25_FOOTER_FONT_STACK}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE23_FOOTER_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE25_FOOTER, width / 2, height * FOOTER_Y);
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string
) {
  const maxWidth = width * COVER_WIDTH;
  let fontSize = width * COVER_SIZE;
  const minSize = width * 0.04;
  let lines: string[] = [];
  let pitch = fontSize * COVER_LEADING;
  let ascent = fontSize * 0.72;
  let descent = fontSize * 0.21;
  for (let step = 0; step < 40; step++) {
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    pitch = fontSize * COVER_LEADING;
    lines = text.trim() ? wrapLines(ctx, text, maxWidth) : [];
    ascent = inkAscent(ctx, fontSize);
    descent = inkDescent(ctx, fontSize);
    const block = ascent + Math.max(0, lines.length - 1) * pitch + descent;
    const inkTop = height * COVER_CENTER - block / 2;
    if ((inkTop >= height * 0.08 && inkTop + block <= height * 0.8) || fontSize <= minSize) break;
    fontSize = Math.max(minSize, fontSize - width * 0.002);
  }
  if (lines.length === 0) return;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE25_TEXT;
  const block = ascent + (lines.length - 1) * pitch + descent;
  const firstBaseline = height * COVER_CENTER - block / 2 + ascent;
  drawCentered(ctx, lines, width / 2, firstBaseline, pitch);
}

type OptionLine = { text: string };

function parseOptions(options: string): OptionLine[] {
  return options
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([A-Za-z0-9])\.\s*(.*)$/);
      if (!match) return { text: line };
      const letter = match[1]!.toLowerCase();
      const body = (match[2] ?? '').trim();
      return { text: body ? `${letter}. ${body}` : `${letter}.` };
    });
}

type QuestionMetrics = {
  fontSize: number;
  pitch: number;
  ascent: number;
  descent: number;
  questionLines: string[];
  optionLines: string[];
  extraGap: number;
  block: number;
};

function measureQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  question: string,
  optionSource: string,
  fontFamily: string,
  fontSize: number
): QuestionMetrics {
  const maxWidth = width * QUESTION_WIDTH;
  const pitch = fontSize * QUESTION_LEADING;
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  const questionLines = question.trim() ? wrapLines(ctx, question, maxWidth) : [];
  const optionLines = parseOptions(optionSource).flatMap((option) =>
    option.text ? wrapLines(ctx, option.text, maxWidth) : []
  );
  const ascent = inkAscent(ctx, fontSize);
  const descent = inkDescent(ctx, fontSize);
  const extraGap = questionLines.length && optionLines.length ? fontSize * OPTION_GAP_EM : 0;
  let baselines = 0;
  if (questionLines.length && optionLines.length) {
    baselines =
      (questionLines.length - 1) * pitch + pitch + extraGap + (optionLines.length - 1) * pitch;
  } else {
    const count = Math.max(questionLines.length, optionLines.length);
    baselines = Math.max(0, count - 1) * pitch;
  }
  const hasLines = questionLines.length > 0 || optionLines.length > 0;
  const block = (hasLines ? ascent : 0) + baselines + (hasLines ? descent : 0);
  return { fontSize, pitch, ascent, descent, questionLines, optionLines, extraGap, block };
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string
) {
  const { question, options } = splitCopycatQuestionAndOptions(text);
  if (!question.trim() && !options.trim()) return;
  const topFloor = height * 0.08;
  const preferredBottom = height * QUESTION_BOTTOM;
  const footerLimit = height * 0.82;
  let fontSize = width * QUESTION_SIZE;
  const minSize = width * 0.03;
  let metrics = measureQuestion(ctx, width, question, options, fontFamily, fontSize);
  while (fontSize > minSize && metrics.block > preferredBottom - topFloor) {
    fontSize = Math.max(minSize, fontSize - width * 0.0015);
    metrics = measureQuestion(ctx, width, question, options, fontFamily, fontSize);
    if (fontSize === minSize) break;
  }
  let inkBottom = preferredBottom;
  if (metrics.block > inkBottom - topFloor) {
    inkBottom = Math.min(footerLimit, topFloor + metrics.block);
  }
  const firstBaseline = inkBottom - metrics.block + metrics.ascent;
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE25_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let y = firstBaseline;
  metrics.questionLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, y);
    if (index < metrics.questionLines.length - 1) y += metrics.pitch;
  });
  if (!metrics.optionLines.length) return;
  if (metrics.questionLines.length) y += metrics.pitch + metrics.extraGap;
  metrics.optionLines.forEach((line, index) => {
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    ctx.fillText(line, width / 2, y);
    if (index < metrics.optionLines.length - 1) y += metrics.pitch;
  });
}

/**
 * Template 2's App Store mock, at the measured trydeepen placement:
 * centred, top at 47% of the height, 64% of the width, running off the bottom.
 * The heading is the template 2 label, in bold serif, in the upper band.
 */
function paintCta(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  promo: CanvasImageSource | null
) {
  const fontSize = width * CTA_HEADING_SIZE;
  const maxWidth = width * CTA_HEADING_WIDTH;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  const lines = wrapLines(ctx, IMAGE_TEMPLATE25_CTA_LABEL, maxWidth);
  const pitch = fontSize * COVER_LEADING;
  const ascent = inkAscent(ctx, fontSize);
  const descent = inkDescent(ctx, fontSize);
  const block = ascent + Math.max(0, lines.length - 1) * pitch + descent;
  const phoneTop = height * CTA_PHONE_TOP;
  let inkTop = height * CTA_HEADING_CENTER - block / 2;
  if (inkTop + block > phoneTop - height * 0.03) {
    inkTop = phoneTop - height * 0.03 - block;
  }
  if (inkTop < height * 0.05) inkTop = height * 0.05;
  ctx.fillStyle = IMAGE_TEMPLATE25_TEXT;
  drawCentered(ctx, lines, width / 2, inkTop + ascent, pitch);

  if (!promo) return;
  const promoWidth = width * CTA_PHONE_WIDTH;
  const promoHeight = promoWidth / IMAGE_TEMPLATE2_Q5_PROMO_ASPECT;
  const x = (width - promoWidth) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(promo, x, phoneTop, promoWidth, promoHeight);
}

export function paintTemplate25Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCover?: boolean;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    fontFamily?: string;
  }
) {
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE25_SLIDE_COUNT;
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE25_FONT_STACK;

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  setLetterSpacing(ctx, '0px');
  ctx.globalAlpha = 1;
  ctx.fillStyle = template25Background(options.tabIndex, isCta);
  ctx.fillRect(0, 0, width, height);

  if (isCta) {
    paintCta(ctx, width, height, fontFamily, options.promo ?? null);
    return;
  }

  if (isCover) {
    paintCover(ctx, width, height, options.text, fontFamily);
    paintFooter(ctx, width, height);
    return;
  }

  paintQuestion(ctx, width, height, options.text, fontFamily);
  paintFooter(ctx, width, height);
}
