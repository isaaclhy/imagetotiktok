import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  paintImageTemplate2Q5Promo,
} from '@/app/lib/image-template-2-cover';

/**
 * Dark cats slideshow (image template 29).
 * Measured from a 3:4 couples-question post: solid full-bleed colour, no card,
 * frame, progress bar, grain, or vignette.
 *
 * Cover: mahogany field, grey header, thin rose rule, centred bold title, and
 * the two-cat sticker in the bottom right.
 * Questions: black, brown, forest, charcoal. Bold white question in the upper
 * third, then A–D. Each slide uses one accent for the letters (orange, pink,
 * teal, orange). Option words stay white.
 * The last slide is its own CTA: template 2's "Download for more questions!"
 * and App Store mock. The footer is the shared Spill It string on every slide
 * except the CTA.
 *
 * Studio uses four questions. Longer Copycat posts cycle the four colours.
 * Type is TikTok Sans.
 */
export const IMAGE_TEMPLATE29_QUESTION_COUNT = 4;
export const IMAGE_TEMPLATE29_SLIDE_COUNT = IMAGE_TEMPLATE29_QUESTION_COUNT + 2;
export const IMAGE_TEMPLATE29_CTA_TAB = IMAGE_TEMPLATE29_SLIDE_COUNT - 1;

export const IMAGE_TEMPLATE29_CATS_SRC = '/image-templates/template-29-cats.png';

export const IMAGE_TEMPLATE29_COVER_BG = '#2B111A';
/** Near-black, chocolate, forest, charcoal. Cycle when a post is longer. */
export const IMAGE_TEMPLATE29_QUESTION_COLORS = ['#0C0C0E', '#311B10', '#122319', '#1B1C21'] as const;
export const IMAGE_TEMPLATE29_CTA_BG = '#101114';

/**
 * Letter accents, one per question colour. Measured from the post: the letters
 * on a slide share a single hue (they do not ramp from red to yellow).
 */
export const IMAGE_TEMPLATE29_ACCENTS = ['#F0783C', '#F0486C', '#00D4C8', '#F0783C'] as const;

export const IMAGE_TEMPLATE29_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE29_HEADER_COLOR = '#BCB8B6';
export const IMAGE_TEMPLATE29_FOOTER_COLOR = '#A3A3A6';
export const IMAGE_TEMPLATE29_RULE = '#8A556C';
export const IMAGE_TEMPLATE29_RULE_HIGHLIGHT = '#D4B0BC';

export const IMAGE_TEMPLATE29_HEADER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE29_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;

export const IMAGE_TEMPLATE29_FONT_STACK =
  '"TikTok Sans", "Inter", "Liberation Sans", Arial, Helvetica, sans-serif';

const HEADER_Y = 0.097;
const HEADER_SIZE = 0.05;
const HEADER_MAX_WIDTH = 0.86;
const HEADER_WEIGHT = 700;

const TITLE_SIZE = 0.074;
const TITLE_WIDTH = 0.78;
const TITLE_CENTER_Y = 0.43;
const TITLE_TOP_LIMIT = 0.2;
const TITLE_BOTTOM_LIMIT = 0.64;
const TITLE_LEADING = 1.16;
const TITLE_WEIGHT = 800;

const CATS_WIDTH = 0.52;
const CATS_RIGHT = 0.006;
const CATS_BOTTOM = 0.004;

const QUESTION_X = 0.128;
const QUESTION_TOP = 0.285;
const QUESTION_SIZE = 0.056;
const QUESTION_WIDTH = 0.75;
const QUESTION_LEADING = 1.28;
const QUESTION_WEIGHT = 800;

const OPTION_TOP = 0.427;
const OPTION_SIZE = 0.046;
const OPTION_LEADING = 1.45;
const OPTION_WEIGHT = 800;
const OPTION_LABEL_GAP = 0.42;

const FOOTER_Y = 0.832;
const FOOTER_SIZE = 0.032;
const FOOTER_WEIGHT = 600;

export function isImageTemplate29Id(templateId: number | null | undefined): boolean {
  return templateId === 29;
}

export function template29Background(tabIndex: number, isCta = false): string {
  if (isCta) return IMAGE_TEMPLATE29_CTA_BG;
  if (tabIndex <= 0) return IMAGE_TEMPLATE29_COVER_BG;
  const slot = (tabIndex - 1) % IMAGE_TEMPLATE29_QUESTION_COLORS.length;
  return IMAGE_TEMPLATE29_QUESTION_COLORS[slot] ?? IMAGE_TEMPLATE29_QUESTION_COLORS[0];
}

export function template29Accent(tabIndex: number): string {
  const slot = Math.max(0, tabIndex - 1) % IMAGE_TEMPLATE29_ACCENTS.length;
  return IMAGE_TEMPLATE29_ACCENTS[slot] ?? IMAGE_TEMPLATE29_ACCENTS[0];
}

export async function loadTemplate29Fonts(): Promise<void> {
  const loads = [
    document.fonts.load(`600 48px "TikTok Sans"`),
    document.fonts.load(`700 48px "TikTok Sans"`),
    document.fonts.load(`800 80px "TikTok Sans"`),
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
  return lines;
}

type ParsedOption = { label: string; text: string };

function parseOption(line: string): ParsedOption | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([a-z])[.)]\s*([\s\S]*)$/i);
  if (!match) return { label: '', text: trimmed };
  return { label: `${match[1]!.toUpperCase()}.`, text: (match[2] ?? '').trim() };
}

function splitQuestion(text: string): { question: string; options: string } {
  const split = splitCopycatQuestionAndOptions(text);
  if (split.options.trim()) return split;
  const lines = text.replace(/\r/g, '').split('\n');
  const index = lines.findIndex((line) => /^\s*[a-d][.)]\s+\S/i.test(line));
  if (index <= 0) return { question: text.trim(), options: '' };
  return {
    question: lines.slice(0, index).join('\n').trim(),
    options: lines.slice(index).join('\n').trim(),
  };
}

function paintFooter(ctx: CanvasRenderingContext2D, width: number, height: number, fontFamily: string) {
  const size = width * FOOTER_SIZE;
  ctx.font = `${FOOTER_WEIGHT} ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE29_FOOTER_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE29_FOOTER, width / 2, height * FOOTER_Y);
}

function paintHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string
) {
  const maxWidth = width * HEADER_MAX_WIDTH;
  let size = width * HEADER_SIZE;
  ctx.font = `${HEADER_WEIGHT} ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  const measured = ctx.measureText(IMAGE_TEMPLATE29_HEADER).width;
  if (measured > maxWidth) size *= maxWidth / measured;
  ctx.font = `${HEADER_WEIGHT} ${size}px ${fontFamily}`;
  const textWidth = ctx.measureText(IMAGE_TEMPLATE29_HEADER).width;
  const centerY = height * HEADER_Y;
  ctx.fillStyle = IMAGE_TEMPLATE29_HEADER_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE29_HEADER, width / 2, centerY);

  const ruleWidth = textWidth;
  const ruleX = (width - ruleWidth) / 2;
  const ruleY = centerY + size * 1.05;
  const ruleH = Math.max(2, height * 0.0022);
  const gradient = ctx.createLinearGradient(ruleX, ruleY, ruleX + ruleWidth, ruleY);
  gradient.addColorStop(0, IMAGE_TEMPLATE29_RULE);
  gradient.addColorStop(0.5, IMAGE_TEMPLATE29_RULE_HIGHLIGHT);
  gradient.addColorStop(1, IMAGE_TEMPLATE29_RULE);
  ctx.fillStyle = gradient;
  ctx.fillRect(ruleX, ruleY, ruleWidth, ruleH);
}

function paintCoverTitle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  fontFamily: string
) {
  const text = title.trim();
  if (!text) return;
  const maxWidth = width * TITLE_WIDTH;
  const topLimit = height * TITLE_TOP_LIMIT;
  const bottomLimit = height * TITLE_BOTTOM_LIMIT;
  let size = width * TITLE_SIZE;
  const minSize = width * 0.038;
  let lines = [text];
  let pitch = size * TITLE_LEADING;

  const measure = () => {
    ctx.font = `${TITLE_WEIGHT} ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, '-0.015em');
    lines = wrapBlock(ctx, text, maxWidth);
    pitch = size * TITLE_LEADING;
    const block = Math.max(0, lines.length - 1) * pitch + size;
    return block;
  };

  let block = measure();
  while (size > minSize && (block > bottomLimit - topLimit || lines.length > 4)) {
    size = Math.max(minSize, size - width * 0.002);
    block = measure();
    if (size === minSize) break;
  }

  let top = height * TITLE_CENTER_Y - block / 2;
  if (top < topLimit) top = topLimit;
  if (top + block > bottomLimit) top = Math.max(topLimit, bottomLimit - block);

  ctx.fillStyle = IMAGE_TEMPLATE29_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${TITLE_WEIGHT} ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '-0.015em');
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, top + index * pitch);
  });
  setLetterSpacing(ctx, '0px');
}

function paintCats(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cats: CanvasImageSource
) {
  const boxW = width * CATS_WIDTH;
  const sourceW =
    'width' in cats && typeof cats.width === 'number' && cats.width > 0 ? cats.width : boxW;
  const sourceH =
    'height' in cats && typeof cats.height === 'number' && cats.height > 0
      ? cats.height
      : boxW * 0.76;
  const boxH = boxW * (sourceH / sourceW);
  const x = width - width * CATS_RIGHT - boxW;
  const y = height - height * CATS_BOTTOM - boxH;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(cats, x, y, boxW, boxH);
}

type OptionLayout = {
  label: string;
  lines: string[];
};

function layoutOptions(
  ctx: CanvasRenderingContext2D,
  fontFamily: string,
  optionSource: string,
  size: number,
  textWidth: number
): OptionLayout[] {
  const parsed = optionSource
    .split('\n')
    .map(parseOption)
    .filter((item): item is ParsedOption => item !== null);
  ctx.font = `${OPTION_WEIGHT} ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  return parsed.map((option) => ({
    label: option.label,
    lines: option.text ? wrapParagraph(ctx, option.text, Math.max(1, textWidth)) : option.label ? [''] : [],
  }));
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  accent: string
) {
  const { question, options } = splitQuestion(text);
  if (!question.trim() && !options.trim()) return;

  const left = width * QUESTION_X;
  const questionWidth = width * QUESTION_WIDTH;
  let questionSize = width * QUESTION_SIZE;
  const minQuestion = width * 0.034;
  const optionAnchor = height * OPTION_TOP;
  const questionCeiling = optionAnchor - height * 0.03;

  const questionLinesAt = (size: number) => {
    ctx.font = `${QUESTION_WEIGHT} ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    return question.trim() ? wrapBlock(ctx, question, questionWidth) : [];
  };

  let questionLines = questionLinesAt(questionSize);
  while (questionSize > minQuestion) {
    const pitch = questionSize * QUESTION_LEADING;
    const block = Math.max(0, questionLines.length - 1) * pitch + questionSize;
    if (height * QUESTION_TOP + block <= questionCeiling || !options.trim()) break;
    questionSize = Math.max(minQuestion, questionSize - width * 0.0015);
    questionLines = questionLinesAt(questionSize);
    if (questionSize === minQuestion) break;
  }

  ctx.fillStyle = IMAGE_TEMPLATE29_TEXT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${QUESTION_WEIGHT} ${questionSize}px ${fontFamily}`;
  const questionPitch = questionSize * QUESTION_LEADING;
  questionLines.forEach((line, index) => {
    ctx.fillText(line, left, height * QUESTION_TOP + index * questionPitch);
  });

  if (!options.trim()) return;

  let optionSize = width * OPTION_SIZE;
  const minOption = width * 0.028;
  const footerLimit = height * (FOOTER_Y - 0.045);

  const measureLabelGap = (size: number) => {
    ctx.font = `${OPTION_WEIGHT} ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    return ctx.measureText('A.').width + size * OPTION_LABEL_GAP;
  };

  let labelGap = measureLabelGap(optionSize);
  let laid = layoutOptions(
    ctx,
    fontFamily,
    options,
    optionSize,
    Math.max(1, questionWidth - labelGap)
  );

  const optionsBottom = (size: number, items: OptionLayout[]) => {
    const pitch = size * OPTION_LEADING;
    let rows = 0;
    items.forEach((option) => {
      rows += Math.max(option.lines.length, option.label ? 1 : 0);
    });
    return optionAnchor + rows * pitch;
  };

  while (optionSize > minOption && optionsBottom(optionSize, laid) > footerLimit) {
    optionSize = Math.max(minOption, optionSize - width * 0.0012);
    labelGap = measureLabelGap(optionSize);
    laid = layoutOptions(
      ctx,
      fontFamily,
      options,
      optionSize,
      Math.max(1, questionWidth - labelGap)
    );
    if (optionSize === minOption) break;
  }

  const pitch = optionSize * OPTION_LEADING;
  let y = optionAnchor;
  laid.forEach((option) => {
    const rows = Math.max(option.lines.length, option.label ? 1 : 0);
    for (let row = 0; row < rows; row++) {
      if (row === 0 && option.label) {
        ctx.fillStyle = accent;
        ctx.font = `${OPTION_WEIGHT} ${optionSize}px ${fontFamily}`;
        ctx.fillText(option.label, left, y);
      }
      const line = option.lines[row] ?? '';
      if (line) {
        ctx.fillStyle = IMAGE_TEMPLATE29_TEXT;
        ctx.font = `${OPTION_WEIGHT} ${optionSize}px ${fontFamily}`;
        ctx.fillText(line, option.label ? left + labelGap : left, y);
      }
      y += pitch;
    }
  });
}

export function paintTemplate29Slide(
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
    cats?: CanvasImageSource | null;
    fontFamily?: string;
  }
) {
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE29_SLIDE_COUNT;
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE29_FONT_STACK;

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = template29Background(options.tabIndex, isCta);
  ctx.fillRect(0, 0, width, height);

  if (isCta) {
    paintImageTemplate2Q5Promo(ctx, width, height, {
      promo: options.promo ?? null,
      fontFamily,
      textColor: IMAGE_TEMPLATE29_TEXT,
      fontWeight: 800,
    });
    return;
  }

  if (isCover) {
    paintHeader(ctx, width, height, fontFamily);
    paintCoverTitle(ctx, width, height, options.text, fontFamily);
    if (options.cats) paintCats(ctx, width, height, options.cats);
    return;
  }

  paintQuestion(ctx, width, height, options.text, fontFamily, template29Accent(options.tabIndex));
  paintFooter(ctx, width, height, fontFamily);
}
