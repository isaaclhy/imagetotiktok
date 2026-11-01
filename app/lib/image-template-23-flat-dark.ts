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
 * Flat full-bleed slideshow (image template 23).
 * Measured from a 3:4 "let it slide" post: one solid colour per slide,
 * no card, frame, progress bar, grain, or vignette.
 *
 * Cover + seven questions. The last question keeps its copy and closes with
 * template 2's App Store promo (the mock reading "Download for more questions!",
 * same width and crop). There is no extra CTA-only slide. Question colours
 * cycle when a post has more than seven questions. Type is Roboto.
 * The footer is Poppins SemiBold, same string as template 2, and the promo
 * replaces it on the last question.
 */
export const IMAGE_TEMPLATE23_QUESTION_COUNT = 7;
export const IMAGE_TEMPLATE23_SLIDE_COUNT = IMAGE_TEMPLATE23_QUESTION_COUNT + 1;
/** Last question. The App Store mock sits on this slide. */
export const IMAGE_TEMPLATE23_CTA_TAB = IMAGE_TEMPLATE23_QUESTION_COUNT;

export const IMAGE_TEMPLATE23_COVER_BG = '#252531';
export const IMAGE_TEMPLATE23_QUESTION_COLORS = [
  '#241033',
  '#132B2F',
  '#1E1B4A',
  '#311B0E',
  '#121828',
  '#0B1E3E',
  '#122319',
] as const;

/** Near-white at about 95% opacity. */
export const IMAGE_TEMPLATE23_TEXT = 'rgba(245, 245, 248, 0.95)';
/** White at about 78% opacity. */
export const IMAGE_TEMPLATE23_FOOTER_COLOR = 'rgba(255, 255, 255, 0.78)';

export const IMAGE_TEMPLATE23_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE23_COVER_SUBTITLE = 'these are tough';

export const IMAGE_TEMPLATE23_FONT_STACK =
  '"Roboto", "Liberation Sans", Arimo, Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE23_FOOTER_FONT_STACK =
  '"Poppins", "TikTok Sans", system-ui, sans-serif';

/** First family from `--font-roboto` (the self-hosted next/font face), or Roboto. */
export function template23PrimaryFontFamily(): string {
  if (typeof document === 'undefined') return 'Roboto';
  const raw = getComputedStyle(document.body).getPropertyValue('--font-roboto').trim();
  if (!raw) return 'Roboto';
  const quoted = raw.match(/^['"]([^'"]+)['"]/);
  const first = quoted?.[1] ?? raw.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || 'Roboto';
}

/** Canvas stack that prefers the loaded self-hosted Roboto face. */
export function template23CanvasFontStack(family = template23PrimaryFontFamily()): string {
  if (!family || family === 'Roboto') return IMAGE_TEMPLATE23_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE23_FONT_STACK}`;
}

/**
 * Wait for the Roboto cuts this template paints, plus the Poppins footer.
 * Pass the same family `paintTemplate23Slide` will use.
 */
export async function loadTemplate23Fonts(fontFamily: string): Promise<void> {
  const quoted = fontFamily.includes(' ') || fontFamily.startsWith('"') ? fontFamily : `"${fontFamily}"`;
  const loads = [
    document.fonts.load(`700 73px ${quoted}`),
    document.fonts.load(`italic 400 71px ${quoted}`),
    document.fonts.load(`400 54px ${quoted}`),
    document.fonts.load(`700 49px ${quoted}`),
    document.fonts.load(`600 41px "Poppins"`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

export function isImageTemplate23Id(templateId: number | null | undefined): boolean {
  return templateId === 23;
}

/** Solid colour for the tab. The closing promo uses the last question's colour. */
export function template23Background(tabIndex: number): string {
  if (tabIndex <= 0) return IMAGE_TEMPLATE23_COVER_BG;
  const slot =
    (tabIndex - 1) % IMAGE_TEMPLATE23_QUESTION_COLORS.length;
  return IMAGE_TEMPLATE23_QUESTION_COLORS[slot] ?? IMAGE_TEMPLATE23_QUESTION_COLORS[0];
}

/** Cover title. Left edge, bold, wrapping inside ~62% of the width. */
const COVER_X = 0.1;
const COVER_SIZE = 0.068;
const COVER_LINE_PITCH = 0.102;
const COVER_MAX_WIDTH = 0.62;
const COVER_WEIGHT = 700;

/** Italic subtitle under the title. Gap is from the title em-box to the subtitle top. */
const COVER_SUBTITLE_GAP = 0.1;
const COVER_SUBTITLE_SIZE = 0.066;
/** Distance from the subtitle em top to its alphabetic baseline, as a fraction of size. */
const COVER_SUBTITLE_ASCENT = 0.76;
const COVER_CENTER_Y = 0.49;

/** Question block. Left edge, regular weight, centred on the same axis as the cover. */
const QUESTION_X = 0.158;
const QUESTION_MAX_WIDTH = 0.7;
const QUESTION_SIZE = 0.05;
const QUESTION_LINE_PITCH = 0.075;
const QUESTION_WEIGHT = 400;
const OPTION_GAP = 0.05;
const OPTION_SIZE = 0.045;
const OPTION_LINE_PITCH = 0.08;
/** Shared column for option words and wrapped lines. Two spaces after "a."–"d.". */
const OPTION_TEXT_X = 0.22;
const OPTION_LABEL_WEIGHT = 700;

const FOOTER_Y = 0.862;
const FOOTER_SIZE = 0.038;
const FOOTER_WEIGHT = 600;

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

function emSpan(lineCount: number, linePitch: number, fontSize: number): number {
  if (lineCount <= 0) return 0;
  return (lineCount - 1) * linePitch + fontSize;
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const size = width * FOOTER_SIZE;
  ctx.font = `${FOOTER_WEIGHT} ${size}px ${IMAGE_TEMPLATE23_FOOTER_FONT_STACK}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE23_FOOTER_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE23_FOOTER, width / 2, height * FOOTER_Y);
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  subtitle: string,
  fontFamily: string
) {
  const left = width * COVER_X;
  const maxWidth = width * COVER_MAX_WIDTH;
  const subtitleText = subtitle.trim();
  let scale = 1;
  const minScale = 0.55;

  const layoutAt = (nextScale: number) => {
    const titleSize = width * COVER_SIZE * nextScale;
    const titlePitch = width * COVER_LINE_PITCH * nextScale;
    let subtitleSize = width * COVER_SUBTITLE_SIZE * nextScale;
    const gap = width * COVER_SUBTITLE_GAP * nextScale;
    if (subtitleText) {
      ctx.font = `italic 400 ${subtitleSize}px ${fontFamily}`;
      setLetterSpacing(ctx, '0px');
      const measured = ctx.measureText(subtitleText).width;
      const maxSubtitle = width * 0.8;
      if (measured > maxSubtitle) subtitleSize *= maxSubtitle / measured;
    }
    ctx.font = `${COVER_WEIGHT} ${titleSize}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    const lines = title.trim() ? wrapBlock(ctx, title, maxWidth) : [];
    const titleSpan = emSpan(lines.length, titlePitch, titleSize);
    const ascent = subtitleText ? subtitleSize * COVER_SUBTITLE_ASCENT : 0;
    const span = titleSpan + (subtitleText ? gap + ascent : 0);
    const titleTop = height * COVER_CENTER_Y - span / 2;
    const subtitleBaseline = titleTop + titleSpan + (subtitleText ? gap + ascent : 0);
    return { lines, titleSize, titlePitch, subtitleSize, gap, titleTop, subtitleBaseline };
  };

  let layout = layoutAt(scale);
  while (
    scale > minScale &&
    (layout.titleTop < height * 0.06 || layout.subtitleBaseline > height * 0.8)
  ) {
    scale = Math.max(minScale, scale - 0.04);
    layout = layoutAt(scale);
    if (scale === minScale) break;
  }

  ctx.fillStyle = IMAGE_TEMPLATE23_TEXT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${COVER_WEIGHT} ${layout.titleSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  let y = layout.titleTop;
  layout.lines.forEach((line, index) => {
    ctx.fillText(line, left, y);
    y += index === layout.lines.length - 1 ? layout.titleSize : layout.titlePitch;
  });

  if (!subtitleText) return;
  ctx.font = `italic 400 ${layout.subtitleSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(subtitleText, left, layout.subtitleBaseline);
}

type ParsedOption = { label: string; text: string };

function parseOption(line: string): ParsedOption | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([a-z0-9])\.\s*([\s\S]*)$/i);
  if (!match) return { label: '', text: trimmed };
  return { label: `${match[1]!.toLowerCase()}.`, text: (match[2] ?? '').trim() };
}

type QuestionLayout = {
  questionSize: number;
  questionPitch: number;
  optionSize: number;
  optionPitch: number;
  gap: number;
  questionLines: string[];
  options: { label: string; lines: string[] }[];
  top: number;
};

function layoutQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  question: string,
  optionSource: string,
  fontFamily: string,
  scale: number
): QuestionLayout {
  const questionSize = width * QUESTION_SIZE * scale;
  const questionPitch = width * QUESTION_LINE_PITCH * scale;
  const optionSize = width * OPTION_SIZE * scale;
  const optionPitch = width * OPTION_LINE_PITCH * scale;
  const gap = width * OPTION_GAP * scale;
  const questionWidth = width * QUESTION_MAX_WIDTH;
  const optionWidth = width * (QUESTION_X + QUESTION_MAX_WIDTH - OPTION_TEXT_X);

  ctx.font = `${QUESTION_WEIGHT} ${questionSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  const questionLines = question.trim() ? wrapBlock(ctx, question, questionWidth) : [];

  const parsed = optionSource
    .split('\n')
    .map(parseOption)
    .filter((item): item is ParsedOption => item !== null);

  ctx.font = `${QUESTION_WEIGHT} ${optionSize}px ${fontFamily}`;
  const options = parsed.map((option) => ({
    label: option.label,
    lines: option.text
      ? wrapParagraph(ctx, option.text, Math.max(1, option.label ? optionWidth : questionWidth))
      : option.label
        ? ['']
        : [],
  }));

  const optionLineCount = options.reduce((sum, option) => sum + Math.max(option.lines.length, option.label ? 1 : 0), 0);
  const questionSpan = emSpan(questionLines.length, questionPitch, questionSize);
  const optionSpan = emSpan(optionLineCount, optionPitch, optionSize);
  const hasGap = questionLines.length > 0 && optionLineCount > 0;
  const block = questionSpan + (hasGap ? gap : 0) + optionSpan;
  const top = height * COVER_CENTER_Y - block / 2;
  return {
    questionSize,
    questionPitch,
    optionSize,
    optionPitch,
    gap: hasGap ? gap : 0,
    questionLines,
    options,
    top,
  };
}

function questionBlockBottom(layout: QuestionLayout): number {
  const optionLineCount = layout.options.reduce(
    (sum, option) => sum + Math.max(option.lines.length, option.label ? 1 : 0),
    0
  );
  return (
    layout.top +
    emSpan(layout.questionLines.length, layout.questionPitch, layout.questionSize) +
    layout.gap +
    emSpan(optionLineCount, layout.optionPitch, layout.optionSize)
  );
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  question: string,
  optionSource: string,
  fontFamily: string,
  /**
   * When set, the block is lifted (and shrunk only if it still will not fit)
   * so it ends above this y. Used by the closing slide so the promo can stay
   * at template 2's resting size. Omitted on ordinary question slides.
   */
  ceiling?: number
): number {
  const footerTop = height * FOOTER_Y - width * FOOTER_SIZE * 0.7;
  const topFloor = height * (ceiling == null ? 0.08 : 0.05);
  let scale = 1;
  const minScale = ceiling == null ? 0.62 : 0.48;
  let layout = layoutQuestion(ctx, width, height, question, optionSource, fontFamily, scale);
  if (ceiling == null) {
    while (
      scale > minScale &&
      (layout.top < topFloor || questionBlockBottom(layout) > footerTop)
    ) {
      scale = Math.max(minScale, scale - 0.04);
      layout = layoutQuestion(ctx, width, height, question, optionSource, fontFamily, scale);
      if (scale === minScale) break;
    }
  } else {
    const room = ceiling - topFloor;
    while (scale > minScale && questionBlockBottom(layout) - layout.top > room) {
      scale = Math.max(minScale, scale - 0.04);
      layout = layoutQuestion(ctx, width, height, question, optionSource, fontFamily, scale);
      if (scale === minScale) break;
    }
    const block = questionBlockBottom(layout) - layout.top;
    if (layout.top + block > ceiling) {
      layout = { ...layout, top: Math.max(topFloor, ceiling - block) };
    }
  }

  const left = width * QUESTION_X;
  const optionX = width * OPTION_TEXT_X;
  ctx.fillStyle = IMAGE_TEMPLATE23_TEXT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.font = `${QUESTION_WEIGHT} ${layout.questionSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  let y = layout.top;
  layout.questionLines.forEach((line, index) => {
    ctx.fillText(line, left, y);
    y += index === layout.questionLines.length - 1 ? layout.questionSize : layout.questionPitch;
  });
  y += layout.gap;

  const optionRows = layout.options.flatMap((option) => {
    const count = Math.max(option.lines.length, option.label ? 1 : 0);
    return Array.from({ length: count }, (_, index) => ({
      label: index === 0 ? option.label : '',
      text: option.lines[index] ?? '',
      hang: Boolean(option.label),
    }));
  });
  optionRows.forEach((row, index) => {
    if (row.label) {
      ctx.font = `${OPTION_LABEL_WEIGHT} ${layout.optionSize}px ${fontFamily}`;
      setLetterSpacing(ctx, '0px');
      ctx.fillText(row.label, left, y);
    }
    if (row.text) {
      ctx.font = `${QUESTION_WEIGHT} ${layout.optionSize}px ${fontFamily}`;
      setLetterSpacing(ctx, '0px');
      ctx.fillText(row.text, row.hang ? optionX : left, y);
    }
    if (index < optionRows.length - 1) y += layout.optionPitch;
  });
  return questionBlockBottom(layout);
}

/**
 * Template 2's Q5 promo: a 90%-wide App Store mock whose top sits at 66% of
 * the frame (the rest runs off the bottom), with the label just above it.
 * A long question pushes the mock down instead of covering the copy.
 */
function paintClosingPromo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  promo: CanvasImageSource | null,
  textBottom: number
) {
  const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
  const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
  const layout = imageTemplate2Q5PromoLayout(
    width,
    height,
    textBottom > 0 ? textBottom + labelSize + labelGap : 0
  );
  if (promo) ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
  ctx.font = `700 ${labelSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE23_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, layout.y - labelGap);
}

export function paintTemplate23Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCover?: boolean;
    isCta?: boolean;
    /** Cover italic line. Defaults to "these are tough". Ignored on other slides. */
    coverSubtitle?: string;
    promo?: CanvasImageSource | null;
    fontFamily?: string;
  }
) {
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE23_SLIDE_COUNT;
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE23_FONT_STACK;

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = template23Background(options.tabIndex);
  ctx.fillRect(0, 0, width, height);

  if (isCta) {
    const { question, options: optionText } = splitCopycatQuestionAndOptions(options.text);
    const resting = imageTemplate2Q5PromoLayout(width, height, 0);
    const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const ceiling =
      resting.y - labelGap - labelSize - height * IMAGE_TEMPLATE2_Q5_PROMO_TEXT_GAP_RATIO;
    const textBottom =
      question.trim() || optionText.trim()
        ? paintQuestion(ctx, width, height, question, optionText, fontFamily, ceiling)
        : 0;
    paintClosingPromo(ctx, width, height, fontFamily, options.promo ?? null, textBottom);
    return;
  }

  if (isCover) {
    paintCover(
      ctx,
      width,
      height,
      options.text,
      options.coverSubtitle ?? IMAGE_TEMPLATE23_COVER_SUBTITLE,
      fontFamily
    );
    paintFooter(ctx, width, height);
    return;
  }

  const { question, options: optionText } = splitCopycatQuestionAndOptions(options.text);
  paintQuestion(ctx, width, height, question, optionText, fontFamily);
  paintFooter(ctx, width, height);
}
