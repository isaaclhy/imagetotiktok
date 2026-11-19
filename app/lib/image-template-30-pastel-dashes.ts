import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import { paintImageTemplate2Q5Promo } from '@/app/lib/image-template-2-cover';

/**
 * Pastel dash slideshow (image template 30).
 *
 * Full-bleed flat colour, no card and no vignette. The colour changes per
 * slide. Question slides carry a small centred progress bar of rounded dashes.
 * The cover is the first segment, then one dash per question. The CTA is not
 * a dash. Completed segments (including the cover) use the accent, the current
 * question is the same colour and wider, and the rest stay faint. A five-question
 * set therefore has six dashes, and the first question is short + wide + four faint.
 *
 * Sans (the main look): bold warm-ink question, left aligned around a third
 * of the height, with lettered options "A.  yes". The cover is a centred bold
 * headline with one keyword on a soft pink marker. No progress bar on the cover.
 *
 * Serif: the same colour, dashes, and footer, with a regular serif question
 * and numbered options "1.  …". The plain cover is centred serif with no marker.
 *
 * Glow cover: a bright-blue rounded card on black, with a wide milky halo
 * rather than a tight rim, centred bold black sans, and the Spill It footer
 * on the card. Choosing it also switches the question colours to the brighter set.
 *
 * The last slide is template 2's "Download for more questions!" App Store mock.
 * Footer is the shared Spill It string. Type is TikTok Sans, or Liberation Serif
 * for the serif variant.
 */
export const IMAGE_TEMPLATE30_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE30_SLIDE_COUNT = IMAGE_TEMPLATE30_QUESTION_COUNT + 2;
export const IMAGE_TEMPLATE30_CTA_TAB = IMAGE_TEMPLATE30_SLIDE_COUNT - 1;

export const IMAGE_TEMPLATE30_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE30_INK = '#1A1A24';
/** Question body, warmed slightly from the cover ink toward a brown-plum. */
export const IMAGE_TEMPLATE30_QUESTION_INK = '#322830';
export const IMAGE_TEMPLATE30_FOOTER_COLOR = '#645655';
export const IMAGE_TEMPLATE30_MARKER = 'rgba(255, 142, 150, 0.72)';
export const IMAGE_TEMPLATE30_GLOW_CARD = '#3DB7FF';
export const IMAGE_TEMPLATE30_GLOW_INK = '#121212';
export const IMAGE_TEMPLATE30_CTA_TEXT = '#F7F4EF';

export const IMAGE_TEMPLATE30_SANS_STACK =
  '"TikTok Sans", "Inter", "Liberation Sans", Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE30_SERIF_STACK =
  '"Liberation Serif", "Times New Roman", Times, serif';

export type Template30Typeface = 'sans' | 'serif';
export type Template30Cover = 'highlight' | 'plain' | 'glow';

export const IMAGE_TEMPLATE30_DEFAULT_TYPEFACE: Template30Typeface = 'sans';
export const IMAGE_TEMPLATE30_DEFAULT_COVER: Template30Cover = 'highlight';

export const IMAGE_TEMPLATE30_TYPEFACE_OPTIONS: readonly {
  id: Template30Typeface;
  label: string;
}[] = [
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
] as const;

export const IMAGE_TEMPLATE30_COVER_OPTIONS: readonly {
  id: Template30Cover;
  label: string;
}[] = [
  { id: 'highlight', label: 'Highlight' },
  { id: 'plain', label: 'Plain' },
  { id: 'glow', label: 'Glow card' },
] as const;

export type Template30Look = {
  typeface: Template30Typeface;
  cover: Template30Cover;
};

export const IMAGE_TEMPLATE30_DEFAULT_LOOK: Template30Look = {
  typeface: IMAGE_TEMPLATE30_DEFAULT_TYPEFACE,
  cover: IMAGE_TEMPLATE30_DEFAULT_COVER,
};

type SlideTone = {
  bg: string;
  accent: string;
  faint: string;
};

/** Soft pastels from the main slideshow. Cover is peach; questions follow. */
const SANS_COVER: SlideTone = { bg: '#FFDAC0', accent: '#E07A86', faint: '#E8C4B0' };
const SANS_QUESTIONS: readonly SlideTone[] = [
  { bg: '#FEB7B1', accent: '#635CDD', faint: '#E3A39C' },
  { bg: '#FCFD97', accent: '#2E8A48', faint: '#E3E59A' },
  { bg: '#C7CEEA', accent: '#8E3D58', faint: '#B4BCD6' },
  { bg: '#F9C8DD', accent: '#7A45C4', faint: '#E6B6D0' },
  { bg: '#B5EAD8', accent: '#8A5A38', faint: '#A6D4C6' },
];

/** Serif post: sage cover, then the soft pink / salmon / blush / lilac cycle. */
const SERIF_COVER: SlideTone = { bg: '#E2F0CC', accent: '#6A8A48', faint: '#D0E0B4' };
const SERIF_QUESTIONS: readonly SlideTone[] = [
  { bg: '#F9C8DD', accent: '#7E90B8', faint: '#E6B4CC' },
  { bg: '#FEB7B1', accent: '#C75B68', faint: '#E8A39C' },
  { bg: '#FECCE7', accent: '#C45CB0', faint: '#E8B6D4' },
  { bg: '#D6AAFF', accent: '#7A4EC0', faint: '#C89AF0' },
  { bg: '#F7E38A', accent: '#C49A2A', faint: '#E6D48A' },
];

/**
 * Brighter question colours that travel with the glow-card cover.
 * Teal and orange are bright enough that a dark accent inverts the bar:
 * completed and current dashes stay light, and the remaining dashes are a
 * darker muted shade of the field.
 */
const BRIGHT_QUESTIONS: readonly SlideTone[] = [
  { bg: '#01C1A8', accent: '#FFFFFF', faint: '#2A6E64' },
  { bg: '#FFA757', accent: '#FFFFFF', faint: '#C17A48' },
  { bg: '#FFA6D6', accent: '#D43A86', faint: '#E898C8' },
  { bg: '#7FD0FF', accent: '#1A6FB0', faint: '#B7E4FA' },
  { bg: '#FFE14A', accent: '#C48A12', faint: '#E8D48A' },
];

const QUESTION_X = 0.125;
const QUESTION_TOP = 0.27;
const QUESTION_SIZE = 0.052;
const QUESTION_WIDTH = 0.76;
const QUESTION_LEADING = 1.22;
const QUESTION_WEIGHT_SANS = 700;
const QUESTION_WEIGHT_SERIF = 400;

const OPTION_SIZE = 0.038;
const OPTION_LEADING = 1.62;
const OPTION_GAP_EM = 0.62;
const OPTION_WEIGHT_SANS = 700;
const OPTION_WEIGHT_SERIF = 400;

const FOOTER_Y = 0.83;
const FOOTER_SIZE = 0.039;
const FOOTER_WEIGHT = 700;

const COVER_SIZE = 0.064;
const COVER_LEADING = 1.14;
const COVER_WIDTH = 0.7;
const COVER_CENTER = 0.42;
const COVER_WEIGHT_SANS = 800;
const COVER_WEIGHT_SERIF = 400;

const BAR_Y = 0.046;
const BAR_HEIGHT = 0.0085;
const BAR_WIDTH = 0.034;
const BAR_CURRENT_SCALE = 1.72;
const BAR_GAP = 0.013;

const GLOW_INSET_X = 0.069;
const GLOW_INSET_Y = 0.052;
/** Well above the old 0.055 rim, so the blue card reads as a rounded slab. */
const GLOW_RADIUS = 0.11;

const STOPWORDS = new Set([
  'is', 'it', 'to', 'for', 'your', 'the', 'a', 'an', 'of', 'and', 'do', 'this', 'that',
  'with', 'my', 'me', 'you', 'our', 'in', 'on', 'at', 'be', 'or', 'if', 'so', 'we',
  'he', 'she', 'his', 'her', 'him', 'was', 'are', 'from', 'about', 'what', 'how',
  'did', 'who', 'why', 'when', 'would', 'could', 'should', 'just', 'like', 'have',
  'has', 'had', 'not', 'but', 'can', 'will', 'than', 'then', 'them', 'they', 'their',
  'into', 'over', 'out', 'up', 'more', 'most', 'get', 'got',
]);

export function isImageTemplate30Id(templateId: number | null | undefined): boolean {
  return templateId === 30;
}

export function isTemplate30Typeface(value: string): value is Template30Typeface {
  return value === 'sans' || value === 'serif';
}

export function isTemplate30Cover(value: string): value is Template30Cover {
  return value === 'highlight' || value === 'plain' || value === 'glow';
}

export function template30LookLabel(look: Template30Look): string {
  const type = look.typeface === 'serif' ? 'Serif' : 'Sans';
  const cover =
    look.cover === 'glow' ? 'Glow card' : look.cover === 'plain' ? 'Plain' : 'Highlight';
  return `${type} · ${cover}`;
}

function questionTones(look: Template30Look): readonly SlideTone[] {
  if (look.cover === 'glow') return BRIGHT_QUESTIONS;
  if (look.typeface === 'serif') return SERIF_QUESTIONS;
  return SANS_QUESTIONS;
}

function coverTone(look: Template30Look): SlideTone {
  if (look.typeface === 'serif') return SERIF_COVER;
  return SANS_COVER;
}

export function template30Tone(tabIndex: number, isCta: boolean, look: Template30Look): SlideTone {
  if (isCta) return { bg: '#071018', accent: '#F7F4EF', faint: '#1A2830' };
  if (tabIndex <= 0) {
    if (look.cover === 'glow') return { bg: '#000000', accent: IMAGE_TEMPLATE30_GLOW_CARD, faint: '#000000' };
    return coverTone(look);
  }
  const tones = questionTones(look);
  const slot = (tabIndex - 1) % tones.length;
  return tones[slot] ?? tones[0]!;
}

export function template30Background(
  tabIndex: number,
  isCta = false,
  look: Template30Look = IMAGE_TEMPLATE30_DEFAULT_LOOK
): string {
  return template30Tone(tabIndex, isCta, look).bg;
}

/** First content word, so "Is it okay for your boyfriend…" marks "okay". */
export function template30HighlightWord(title: string): string | null {
  const words = title.match(/[A-Za-z][A-Za-z']*/g) ?? [];
  const content = words.filter((word) => word.length >= 3 && !STOPWORDS.has(word.toLowerCase()));
  if (content.length > 0) return content[0]!;
  if (words.length === 0) return null;
  return [...words].sort((a, b) => b.length - a.length)[0] ?? null;
}

export async function loadTemplate30Fonts(): Promise<void> {
  const loads = [
    document.fonts.load('500 48px "TikTok Sans"'),
    document.fonts.load('700 64px "TikTok Sans"'),
    document.fonts.load('800 80px "TikTok Sans"'),
    document.fonts.load('400 72px "Liberation Serif"'),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type ParsedOption = { label: string; text: string };

function splitQuestion(text: string): { question: string; options: string } {
  const split = splitCopycatQuestionAndOptions(text);
  if (split.options.trim()) return split;
  const lines = text.replace(/\r/g, '').split('\n');
  const index = lines.findIndex((line) => /^\s*(?:[a-d]|\d{1,2})[.)]\s+\S/i.test(line));
  if (index <= 0) return { question: text.trim(), options: '' };
  return {
    question: lines.slice(0, index).join('\n').trim(),
    options: lines.slice(index).join('\n').trim(),
  };
}

function parseOptions(source: string, numbered: boolean): ParsedOption[] {
  const lines = source
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.map((line, index) => {
    const match = line.match(/^([A-Za-z]|\d{1,2})[.)]\s*([\s\S]*)$/);
    const text = (match ? match[2] : line).trim();
    const letter = match?.[1];
    const label = numbered
      ? `${index + 1}.`
      : letter && /[A-Za-z]/.test(letter)
        ? `${letter.toUpperCase()}.`
        : `${index + 1}.`;
    return { label, text };
  });
}

function channelLuminance(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** Keep the measured grey on the soft pastels, and darken it on the bright fields. */
function footerColorFor(background: string): string {
  const grey = IMAGE_TEMPLATE30_FOOTER_COLOR;
  const darker = '#3C3532';
  const light = Math.max(relativeLuminance(grey), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(grey), relativeLuminance(background));
  const ratio = (light + 0.05) / (dark + 0.05);
  return ratio >= 4.15 ? grey : darker;
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  color: string
) {
  const size = width * FOOTER_SIZE;
  ctx.font = `${FOOTER_WEIGHT} ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE30_FOOTER, width / 2, height * FOOTER_Y);
}

function paintProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tabIndex: number,
  questionCount: number,
  accent: string,
  faint: string
) {
  const questions = Math.max(1, questionCount);
  // Index 0 is the cover. The CTA is not a segment.
  const count = questions + 1;
  const current = Math.min(questions, Math.max(1, tabIndex));
  const dashH = Math.max(8, height * BAR_HEIGHT);
  const dashW = width * BAR_WIDTH;
  const gap = width * BAR_GAP;
  const widths = Array.from({ length: count }, (_, index) =>
    index === current ? dashW * BAR_CURRENT_SCALE : dashW
  );
  const total = widths.reduce((sum, value) => sum + value, 0) + gap * Math.max(0, count - 1);
  let x = (width - total) / 2;
  const y = height * BAR_Y - dashH / 2;
  widths.forEach((dashWidth, index) => {
    ctx.fillStyle = index <= current ? accent : faint;
    roundRect(ctx, x, y, dashWidth, dashH, dashH / 2);
    ctx.fill();
    x += dashWidth + gap;
  });
}

function paintMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wordWidth: number,
  size: number
) {
  const padX = size * 0.16;
  const padY = size * 0.16;
  const left = x - padX;
  const top = y - padY;
  const w = wordWidth + padX * 2;
  const h = size + padY * 1.35;
  ctx.fillStyle = IMAGE_TEMPLATE30_MARKER;
  roundRect(ctx, left, top, w, h, Math.min(size * 0.18, h / 2));
  ctx.fill();
}

function paintCoverTitle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  fontFamily: string,
  weight: number,
  highlighted: boolean
) {
  const text = title.trim();
  if (!text) return;
  const maxWidth = width * COVER_WIDTH;
  let size = width * COVER_SIZE;
  const minSize = width * 0.04;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  setLetterSpacing(ctx, weight >= 700 ? '-0.02em' : '0px');

  const measure = (fontSize: number) => {
    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
    const lines = wrapBlock(ctx, text, maxWidth);
    const pitch = fontSize * COVER_LEADING;
    const block = Math.max(0, lines.length - 1) * pitch + fontSize;
    return { lines, pitch, block };
  };

  let laid = measure(size);
  while (size > minSize && (laid.block > height * 0.42 || laid.lines.length > 5)) {
    size = Math.max(minSize, size - width * 0.002);
    laid = measure(size);
    if (size === minSize) break;
  }

  const top = height * COVER_CENTER - laid.block / 2;
  const word = highlighted ? template30HighlightWord(text) : null;
  const wordRe = word ? new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i') : null;
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  ctx.fillStyle = IMAGE_TEMPLATE30_INK;

  laid.lines.forEach((line, index) => {
    const y = top + index * laid.pitch;
    const lineWidth = ctx.measureText(line).width;
    const lineLeft = width / 2 - lineWidth / 2;
    if (wordRe) {
      const match = wordRe.exec(line);
      if (match && match.index >= 0) {
        const prefix = line.slice(0, match.index);
        const wordWidth = ctx.measureText(match[0]).width;
        const wordX = lineLeft + ctx.measureText(prefix).width;
        paintMarker(ctx, wordX, y, wordWidth, size);
      }
    }
    ctx.fillStyle = IMAGE_TEMPLATE30_INK;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(line, width / 2, y);
  });
  setLetterSpacing(ctx, '0px');
}

function paintGlowCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  fontFamily: string
) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  const left = width * GLOW_INSET_X;
  const top = height * GLOW_INSET_Y;
  const cardW = width - left * 2;
  const cardH = height - top * 2;
  const radius = width * GLOW_RADIUS;
  // A pale bloom under the card. Shadow blur stays grey in this canvas, so the
  // halo is a blurred milky fill that the flat card covers.
  const paintBloom = (blurRatio: number, color: string, growRatio: number) => {
    const grow = width * growRatio;
    ctx.save();
    ctx.filter = `blur(${Math.max(1, width * blurRatio)}px)`;
    ctx.fillStyle = color;
    roundRect(ctx, left - grow, top - grow, cardW + grow * 2, cardH + grow * 2, radius + grow);
    ctx.fill();
    ctx.restore();
  };
  paintBloom(0.024, '#F7FCFF', 0.009);
  paintBloom(0.052, 'rgba(210, 236, 255, 0.8)', 0.007);
  paintBloom(0.102, 'rgba(160, 214, 255, 0.45)', 0);
  ctx.filter = 'none';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = IMAGE_TEMPLATE30_GLOW_CARD;
  roundRect(ctx, left, top, cardW, cardH, radius);
  ctx.fill();

  const text = title.trim();
  if (!text) return;
  const maxWidth = cardW * 0.78;
  let size = width * 0.058;
  const minSize = width * 0.036;
  const weight = 800;
  setLetterSpacing(ctx, '-0.02em');
  const measure = (fontSize: number) => {
    ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
    const lines = wrapBlock(ctx, text, maxWidth);
    const pitch = fontSize * 1.16;
    const block = Math.max(0, lines.length - 1) * pitch + fontSize;
    return { lines, pitch, block };
  };
  let laid = measure(size);
  while (size > minSize && laid.block > cardH * 0.62) {
    size = Math.max(minSize, size - width * 0.002);
    laid = measure(size);
    if (size === minSize) break;
  }
  const textTop = top + (cardH - laid.block) / 2;
  ctx.fillStyle = IMAGE_TEMPLATE30_GLOW_INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  laid.lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, textTop + index * laid.pitch);
  });
  setLetterSpacing(ctx, '0px');
}

type OptionLayout = { label: string; lines: string[] };

function layoutOptions(
  ctx: CanvasRenderingContext2D,
  fontFamily: string,
  weight: number,
  options: ParsedOption[],
  size: number,
  textWidth: number,
  labelGap: number
): OptionLayout[] {
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  return options.map((option) => ({
    label: option.label,
    lines: option.text
      ? wrapParagraph(ctx, option.text, Math.max(1, textWidth - labelGap))
      : [],
  }));
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  serif: boolean
) {
  const { question, options } = splitQuestion(text);
  if (!question.trim() && !options.trim()) return;

  const left = width * QUESTION_X;
  const questionWidth = width * QUESTION_WIDTH;
  const questionWeight = serif ? QUESTION_WEIGHT_SERIF : QUESTION_WEIGHT_SANS;
  const optionWeight = serif ? OPTION_WEIGHT_SERIF : OPTION_WEIGHT_SANS;
  const footerLimit = height * (FOOTER_Y - 0.04);
  let questionSize = width * QUESTION_SIZE;
  const minQuestion = width * 0.034;

  const questionLinesAt = (size: number) => {
    ctx.font = `${questionWeight} ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, serif ? '0px' : '-0.015em');
    return question.trim() ? wrapBlock(ctx, question, questionWidth) : [];
  };

  let questionLines = questionLinesAt(questionSize);
  const parsed = options.trim() ? parseOptions(options, serif) : [];
  let optionSize = width * OPTION_SIZE;
  const minOption = width * 0.026;

  const fit = () => {
    const pitch = questionSize * QUESTION_LEADING;
    const questionBlock =
      questionLines.length === 0
        ? 0
        : (questionLines.length - 1) * pitch + questionSize;
    const gap = questionLines.length && parsed.length ? questionSize * OPTION_GAP_EM : 0;
    ctx.font = `${optionWeight} ${optionSize}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    const labelGap = parsed.length
      ? Math.max(...parsed.map((option) => ctx.measureText(`${option.label}  `).width))
      : 0;
    const laid = layoutOptions(
      ctx,
      fontFamily,
      optionWeight,
      parsed,
      optionSize,
      questionWidth,
      labelGap
    );
    const optionPitch = optionSize * OPTION_LEADING;
    let rows = 0;
    laid.forEach((option) => {
      rows += Math.max(option.lines.length, option.label ? 1 : 0);
    });
    const optionsBlock = rows * optionPitch;
    const bottom = height * QUESTION_TOP + questionBlock + gap + optionsBlock;
    return { questionBlock, gap, labelGap, laid, optionPitch, bottom };
  };

  let metrics = fit();
  while ((questionSize > minQuestion || optionSize > minOption) && metrics.bottom > footerLimit) {
    if (questionSize > minQuestion) questionSize = Math.max(minQuestion, questionSize - width * 0.0015);
    if (optionSize > minOption) optionSize = Math.max(minOption, optionSize - width * 0.0012);
    questionLines = questionLinesAt(questionSize);
    metrics = fit();
    if (questionSize === minQuestion && optionSize === minOption) break;
  }

  ctx.fillStyle = IMAGE_TEMPLATE30_QUESTION_INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${questionWeight} ${questionSize}px ${fontFamily}`;
  setLetterSpacing(ctx, serif ? '0px' : '-0.015em');
  const questionPitch = questionSize * QUESTION_LEADING;
  questionLines.forEach((line, index) => {
    ctx.fillText(line, left, height * QUESTION_TOP + index * questionPitch);
  });
  setLetterSpacing(ctx, '0px');

  if (!parsed.length) return;
  let y = height * QUESTION_TOP + metrics.questionBlock + metrics.gap;
  ctx.font = `${optionWeight} ${optionSize}px ${fontFamily}`;
  metrics.laid.forEach((option) => {
    const rows = Math.max(option.lines.length, option.label ? 1 : 0);
    const label = `${option.label}  `;
    for (let row = 0; row < rows; row++) {
      if (row === 0) ctx.fillText(label, left, y);
      const line = option.lines[row] ?? '';
      if (line) ctx.fillText(line, left + metrics.labelGap, y);
      y += metrics.optionPitch;
    }
  });
}

function paintCtaBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#050608';
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(
    width * 0.48,
    height * 0.36,
    width * 0.02,
    width * 0.5,
    height * 0.42,
    width * 0.82
  );
  glow.addColorStop(0, '#0E5C8A');
  glow.addColorStop(0.45, '#083048');
  glow.addColorStop(1, 'rgba(5, 6, 8, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

export function paintTemplate30Slide(
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
    typeface?: Template30Typeface;
    cover?: Template30Cover;
    sansFamily?: string;
    serifFamily?: string;
  }
) {
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE30_SLIDE_COUNT;
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const look: Template30Look = {
    typeface: options.typeface ?? IMAGE_TEMPLATE30_DEFAULT_TYPEFACE,
    cover: options.cover ?? IMAGE_TEMPLATE30_DEFAULT_COVER,
  };
  const sans = options.sansFamily ?? IMAGE_TEMPLATE30_SANS_STACK;
  const serif = options.serifFamily ?? IMAGE_TEMPLATE30_SERIF_STACK;
  const bodyFamily = look.typeface === 'serif' ? serif : sans;
  const tone = template30Tone(options.tabIndex, isCta, look);
  const questionCount = Math.max(1, slideCount - 2);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  setLetterSpacing(ctx, '0px');

  if (isCta) {
    paintCtaBackground(ctx, width, height);
    paintImageTemplate2Q5Promo(ctx, width, height, {
      promo: options.promo ?? null,
      fontFamily: sans,
      textColor: IMAGE_TEMPLATE30_CTA_TEXT,
      fontWeight: 700,
    });
    return;
  }

  if (isCover && look.cover === 'glow') {
    paintGlowCover(ctx, width, height, options.text, sans);
    paintFooter(ctx, width, height, sans, footerColorFor(IMAGE_TEMPLATE30_GLOW_CARD));
    return;
  }

  ctx.fillStyle = tone.bg;
  ctx.fillRect(0, 0, width, height);

  if (isCover) {
    const serifCover = look.typeface === 'serif';
    paintCoverTitle(
      ctx,
      width,
      height,
      options.text,
      serifCover ? serif : sans,
      serifCover ? COVER_WEIGHT_SERIF : COVER_WEIGHT_SANS,
      look.cover === 'highlight'
    );
    paintFooter(ctx, width, height, sans, footerColorFor(tone.bg));
    return;
  }

  paintProgress(ctx, width, height, options.tabIndex, questionCount, tone.accent, tone.faint);
  paintQuestion(ctx, width, height, options.text, bodyFamily, look.typeface === 'serif');
  paintFooter(ctx, width, height, sans, footerColorFor(tone.bg));
}
