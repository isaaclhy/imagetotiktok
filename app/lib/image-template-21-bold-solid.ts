import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/**
 * Flat full-bleed slideshow (image template 21), measured from the
 * @trydeepen "How jealous is your boyfriend, really?" slides at 3:4.
 *
 * No card, frame, bulge, or vignette. Cover is a vertical teal gradient.
 * Later slides cycle flat purple, teal, green, brown, and CTA purple.
 * Type is Helvetica/Arial Bold (Liberation Sans, Arimo, and Arial share
 * those metrics, so wraps stay put across machines).
 */
export const IMAGE_TEMPLATE21_QUESTION_COUNT = 4;
export const IMAGE_TEMPLATE21_SLIDE_COUNT = IMAGE_TEMPLATE21_QUESTION_COUNT + 2;
export const IMAGE_TEMPLATE21_CTA_TAB = IMAGE_TEMPLATE21_SLIDE_COUNT - 1;

export const IMAGE_TEMPLATE21_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE21_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
/**
 * Inter has real medium (500) and semibold (600) cuts. Liberation Sans and
 * Arial only have regular and bold, so they stay as fallbacks.
 */
export const IMAGE_TEMPLATE21_FONT_STACK =
  '"Inter", "Liberation Sans", Arimo, Arial, Helvetica, sans-serif';

/** First family from `--font-inter` (the self-hosted next/font face), or Inter. */
export function template21PrimaryFontFamily(): string {
  if (typeof document === 'undefined') return 'Inter';
  const raw = getComputedStyle(document.body).getPropertyValue('--font-inter').trim();
  if (!raw) return 'Inter';
  const quoted = raw.match(/^['"]([^'"]+)['"]/);
  const first = quoted?.[1] ?? raw.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || 'Inter';
}

/** Canvas stack that prefers the loaded self-hosted Inter face. */
export function template21CanvasFontStack(family = template21PrimaryFontFamily()): string {
  if (!family || family === 'Inter') return IMAGE_TEMPLATE21_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE21_FONT_STACK}`;
}

/** Cover gradient, top → middle → bottom. */
export const IMAGE_TEMPLATE21_COVER_TOP = '#156272';
export const IMAGE_TEMPLATE21_COVER_MID = '#126871';
export const IMAGE_TEMPLATE21_COVER_BOTTOM = '#145F74';

/** Flat slide colours, in cycle order after the cover gradient. */
export const IMAGE_TEMPLATE21_PURPLE = '#7C007C';
export const IMAGE_TEMPLATE21_TEAL = '#015F78';
export const IMAGE_TEMPLATE21_GREEN = '#017700';
export const IMAGE_TEMPLATE21_BROWN = '#7D3B01';
export const IMAGE_TEMPLATE21_CTA_PURPLE = '#810077';

/**
 * Six-step cycle: cover gradient, four question colours, CTA purple.
 * Index 0 is the gradient. The CTA slide always uses the closing purple.
 */
const CYCLE_SOLIDS = [
  null,
  IMAGE_TEMPLATE21_PURPLE,
  IMAGE_TEMPLATE21_TEAL,
  IMAGE_TEMPLATE21_GREEN,
  IMAGE_TEMPLATE21_BROWN,
  IMAGE_TEMPLATE21_CTA_PURPLE,
] as const;

/** How much white is mixed into the slide colour for the progress track. */
const PROGRESS_TRACK_MIX = 0.36;

/**
 * Cover is semibold, about 17% smaller than the first pass, so
 * "How jealous" is ~55% of the frame and still breaks into the same four lines.
 */
export const IMAGE_TEMPLATE21_COVER_WEIGHT = 600;
export const IMAGE_TEMPLATE21_COVER_SIZE = 0.095;
export const IMAGE_TEMPLATE21_COVER_WIDTH = 0.58;
export const IMAGE_TEMPLATE21_COVER_LINE_HEIGHT = 1.08;
export const IMAGE_TEMPLATE21_COVER_MIN_SIZE = 0.04;
export const IMAGE_TEMPLATE21_COVER_MAX_BLOCK = 0.58;

/**
 * Question block. At 2160×2880 the reference copy sits about y 830–1770,
 * which is 0.288–0.615 of the height. Sizes are fractions of the width.
 */
export const IMAGE_TEMPLATE21_BLOCK_TOP = 830 / 2880;
export const IMAGE_TEMPLATE21_SIDE_PAD = 0.085;
export const IMAGE_TEMPLATE21_QUESTION_SIZE = 0.04815;
/** Options are almost the question size, only a little smaller. */
export const IMAGE_TEMPLATE21_OPTION_SIZE = 0.0445;
/** Questions are medium. Answers are semibold. */
export const IMAGE_TEMPLATE21_QUESTION_WEIGHT = 500;
export const IMAGE_TEMPLATE21_OPTION_WEIGHT = 600;
export const IMAGE_TEMPLATE21_QUESTION_LINE_HEIGHT = 1.18;
export const IMAGE_TEMPLATE21_OPTION_LINE_HEIGHT = 1.7;
/** Space between the question and the first answer, in question ems. */
export const IMAGE_TEMPLATE21_OPTION_GAP = 0.75;
export const IMAGE_TEMPLATE21_QUESTION_MIN_SIZE = 0.03;

export const IMAGE_TEMPLATE21_PROGRESS_Y = 0.048;
export const IMAGE_TEMPLATE21_PROGRESS_H = 0.01;
export const IMAGE_TEMPLATE21_PROGRESS_INSET = 0.078;

/** Cover footer stays low. Question footers sit at 90% of the frame height. */
export const IMAGE_TEMPLATE21_FOOTER_Y = 0.942;
export const IMAGE_TEMPLATE21_QUESTION_FOOTER_Y = 0.9;
export const IMAGE_TEMPLATE21_FOOTER_SIZE = 0.03;
export const IMAGE_TEMPLATE21_FOOTER_WEIGHT = 400;

export function isImageTemplate21Id(templateId: number | null | undefined): boolean {
  return templateId === 21;
}

export type Template21Fill =
  | { kind: 'gradient' }
  | { kind: 'solid'; color: string };

export function template21SlideFill(tabIndex: number, isCta: boolean): Template21Fill {
  if (isCta) return { kind: 'solid', color: IMAGE_TEMPLATE21_CTA_PURPLE };
  const slot = ((tabIndex % CYCLE_SOLIDS.length) + CYCLE_SOLIDS.length) % CYCLE_SOLIDS.length;
  const color = CYCLE_SOLIDS[slot];
  if (!color) return { kind: 'gradient' };
  return { kind: 'solid', color };
}

/** White fill grows with the slide index and stays short of the end on the last question. */
export function template21ProgressRatio(tabIndex: number, slideCount: number): number {
  const count = Math.max(1, slideCount);
  return Math.max(0.04, Math.min(1, (tabIndex + 1) / count));
}

function mixWhite(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fill: Template21Fill
) {
  if (fill.kind === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, IMAGE_TEMPLATE21_COVER_TOP);
    gradient.addColorStop(0.5, IMAGE_TEMPLATE21_COVER_MID);
    gradient.addColorStop(1, IMAGE_TEMPLATE21_COVER_BOTTOM);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = fill.color;
  }
  ctx.fillRect(0, 0, width, height);
}

function trackColor(fill: Template21Fill): string {
  const base = fill.kind === 'solid' ? fill.color : IMAGE_TEMPLATE21_COVER_MID;
  return mixWhite(base, PROGRESS_TRACK_MIX);
}

function tracePill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const r = h / 2;
  ctx.beginPath();
  if (w <= h) {
    ctx.arc(x + w / 2, y + r, Math.max(0.5, w / 2), 0, Math.PI * 2);
    return;
  }
  const right = x + w;
  const bottom = y + h;
  ctx.moveTo(x + r, y);
  ctx.arcTo(right, y, right, bottom, r);
  ctx.arcTo(right, bottom, x, bottom, r);
  ctx.arcTo(x, bottom, x, y, r);
  ctx.arcTo(x, y, right, y, r);
  ctx.closePath();
}

function paintProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fill: Template21Fill,
  ratio: number
) {
  const barH = Math.max(8, Math.round(height * IMAGE_TEMPLATE21_PROGRESS_H));
  const x = width * IMAGE_TEMPLATE21_PROGRESS_INSET;
  const y = height * IMAGE_TEMPLATE21_PROGRESS_Y;
  const barW = width * (1 - IMAGE_TEMPLATE21_PROGRESS_INSET * 2);
  ctx.fillStyle = trackColor(fill);
  tracePill(ctx, x, y, barW, barH);
  ctx.fill();
  const fillW = Math.max(barH, barW * ratio);
  ctx.fillStyle = IMAGE_TEMPLATE21_TEXT;
  tracePill(ctx, x, y, Math.min(barW, fillW), barH);
  ctx.fill();
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

function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  paragraph: string,
  maxWidth: number
): string[] {
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
  return lines;
}

/** Reference answers use "A." even when the stored body uses "a." */
function displayOptionLine(line: string): string {
  const match = line.match(/^([a-z0-9])(\.\s*)([\s\S]*)$/i);
  if (!match) return line;
  return `${match[1]!.toUpperCase()}${match[2]}${match[3]}`;
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  yRatio: number
) {
  const size = Math.round(width * IMAGE_TEMPLATE21_FOOTER_SIZE);
  ctx.font = `${IMAGE_TEMPLATE21_FOOTER_WEIGHT} ${size}px ${fontFamily}`;
  ctx.fillStyle = IMAGE_TEMPLATE21_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE21_FOOTER, width / 2, height * yRatio);
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string
) {
  const maxWidth = width * IMAGE_TEMPLATE21_COVER_WIDTH;
  const maxBlock = height * IMAGE_TEMPLATE21_COVER_MAX_BLOCK;
  let fontSize = Math.round(width * IMAGE_TEMPLATE21_COVER_SIZE);
  const minSize = Math.round(width * IMAGE_TEMPLATE21_COVER_MIN_SIZE);
  let lines: string[] = [];
  let lineH = fontSize * IMAGE_TEMPLATE21_COVER_LINE_HEIGHT;
  for (let step = 0; step < 40; step++) {
    lineH = fontSize * IMAGE_TEMPLATE21_COVER_LINE_HEIGHT;
    ctx.font = `${IMAGE_TEMPLATE21_COVER_WEIGHT} ${fontSize}px ${fontFamily}`;
    lines = text.trim() ? wrapBlock(ctx, text, maxWidth) : [];
    const fits = lines.length <= 6 && lines.length * lineH <= maxBlock;
    if (fits || fontSize <= minSize) break;
    fontSize = Math.max(minSize, fontSize - 2);
  }
  ctx.font = `${IMAGE_TEMPLATE21_COVER_WEIGHT} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = IMAGE_TEMPLATE21_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const blockH = lines.length * lineH;
  let y = (height - blockH) / 2;
  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineH;
  }
}

type QuestionLayout = {
  questionSize: number;
  optionSize: number;
  questionLines: string[];
  optionLines: string[][];
  questionLineH: number;
  optionLineH: number;
  gap: number;
  height: number;
};

function measureQuestion(
  ctx: CanvasRenderingContext2D,
  question: string,
  optionLines: string[],
  maxWidth: number,
  questionSize: number,
  fontFamily: string
): QuestionLayout {
  const optionSize = Math.max(
    1,
    Math.round(questionSize * (IMAGE_TEMPLATE21_OPTION_SIZE / IMAGE_TEMPLATE21_QUESTION_SIZE))
  );
  ctx.font = `${IMAGE_TEMPLATE21_QUESTION_WEIGHT} ${questionSize}px ${fontFamily}`;
  const questionLines = question.trim() ? wrapBlock(ctx, question, maxWidth) : [];
  ctx.font = `${IMAGE_TEMPLATE21_OPTION_WEIGHT} ${optionSize}px ${fontFamily}`;
  const wrappedOptions = optionLines.map((line) => wrapParagraph(ctx, line, maxWidth));
  const questionLineH = questionSize * IMAGE_TEMPLATE21_QUESTION_LINE_HEIGHT;
  const optionLineH = optionSize * IMAGE_TEMPLATE21_OPTION_LINE_HEIGHT;
  const optionCount = wrappedOptions.reduce((sum, lines) => sum + lines.length, 0);
  const gap =
    questionLines.length > 0 && optionCount > 0 ? questionSize * IMAGE_TEMPLATE21_OPTION_GAP : 0;
  const height = questionLines.length * questionLineH + gap + optionCount * optionLineH;
  return {
    questionSize,
    optionSize,
    questionLines,
    optionLines: wrappedOptions,
    questionLineH,
    optionLineH,
    gap,
    height,
  };
}

function paintQuestionBlock(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  question: string,
  optionSource: string,
  fontFamily: string,
  bottomLimit: number
) {
  const left = width * IMAGE_TEMPLATE21_SIDE_PAD;
  const maxWidth = width - left * 2;
  const optionLines = optionSource
    .split('\n')
    .map((line) => displayOptionLine(line.trim()))
    .filter(Boolean);
  let questionSize = Math.round(width * IMAGE_TEMPLATE21_QUESTION_SIZE);
  const minSize = Math.round(width * IMAGE_TEMPLATE21_QUESTION_MIN_SIZE);
  let layout = measureQuestion(ctx, question, optionLines, maxWidth, questionSize, fontFamily);
  const top = height * IMAGE_TEMPLATE21_BLOCK_TOP;
  while (top + layout.height > bottomLimit && questionSize > minSize) {
    questionSize = Math.max(minSize, questionSize - 2);
    layout = measureQuestion(ctx, question, optionLines, maxWidth, questionSize, fontFamily);
    if (questionSize === minSize) break;
  }

  ctx.fillStyle = IMAGE_TEMPLATE21_TEXT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${IMAGE_TEMPLATE21_QUESTION_WEIGHT} ${layout.questionSize}px ${fontFamily}`;
  let y = top;
  for (const line of layout.questionLines) {
    ctx.fillText(line, left, y);
    y += layout.questionLineH;
  }
  y += layout.gap;
  ctx.font = `${IMAGE_TEMPLATE21_OPTION_WEIGHT} ${layout.optionSize}px ${fontFamily}`;
  for (const lines of layout.optionLines) {
    for (const line of lines) {
      ctx.fillText(line, left, y);
      y += layout.optionLineH;
    }
  }
  return y;
}

function paintCta(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  promo: CanvasImageSource | null
) {
  const { question, options } = splitCopycatQuestionAndOptions(text);
  const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
  const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
  const hasText = Boolean(question.trim() || options.trim());
  let textBottom = 0;
  if (hasText) {
    const reserved = imageTemplate2Q5PromoLayout(width, height, 0);
    textBottom = paintQuestionBlock(
      ctx,
      width,
      height,
      question,
      options,
      fontFamily,
      reserved.y - labelSize - labelGap - height * 0.02
    );
  }
  if (!promo) {
    ctx.font = `700 ${labelSize}px ${fontFamily}`;
    ctx.fillStyle = IMAGE_TEMPLATE21_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, height * 0.72);
    return;
  }
  const layout = imageTemplate2Q5PromoLayout(
    width,
    height,
    hasText ? textBottom + labelSize + labelGap : 0
  );
  ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
  ctx.font = `700 ${labelSize}px ${fontFamily}`;
  ctx.fillStyle = IMAGE_TEMPLATE21_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, layout.y - labelGap);
}

export function paintTemplate21Slide(
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
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE21_SLIDE_COUNT;
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE21_FONT_STACK;
  const fill = template21SlideFill(options.tabIndex, isCta);

  ctx.letterSpacing = '0px';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  paintBackground(ctx, width, height, fill);

  if (!isCover && !isCta) {
    paintProgress(ctx, width, height, fill, template21ProgressRatio(options.tabIndex, slideCount));
  }

  if (isCta) {
    paintCta(ctx, width, height, options.text, fontFamily, options.promo ?? null);
    return;
  }

  if (isCover) {
    paintCover(ctx, width, height, options.text, fontFamily);
    paintFooter(ctx, width, height, fontFamily, IMAGE_TEMPLATE21_FOOTER_Y);
    return;
  }

  const { question, options: optionText } = splitCopycatQuestionAndOptions(options.text);
  const footerSize = Math.round(width * IMAGE_TEMPLATE21_FOOTER_SIZE);
  paintQuestionBlock(
    ctx,
    width,
    height,
    question,
    optionText,
    fontFamily,
    height * IMAGE_TEMPLATE21_QUESTION_FOOTER_Y - footerSize
  );
  paintFooter(ctx, width, height, fontFamily, IMAGE_TEMPLATE21_QUESTION_FOOTER_Y);
}
