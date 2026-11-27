import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import { paintImageTemplate2Q5Promo } from '@/app/lib/image-template-2-cover';

/**
 * Wavy olive stripes with a pink blob (image template 32).
 *
 * Full-bleed diagonal ribbons, olive and pale mint, with a paper grain.
 * A large pink squircle sits in the centre with a hard dark-olive shadow
 * down and to the right. Cover type is Fraunces Black, centred, with a
 * small italic "[spill it]" under it. Question slides reuse the same field
 * and blob. Lettered or numbered choices sit under the question in a lighter
 * weight of the same serif. The last slide is template 2's App Store mock.
 */
export const IMAGE_TEMPLATE32_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE32_SLIDE_COUNT = IMAGE_TEMPLATE32_QUESTION_COUNT + 2;
export const IMAGE_TEMPLATE32_CTA_TAB = IMAGE_TEMPLATE32_SLIDE_COUNT - 1;

export const IMAGE_TEMPLATE32_OLIVE = '#6E7C3B';
export const IMAGE_TEMPLATE32_MINT = '#E2EACE';
export const IMAGE_TEMPLATE32_PINK = '#F2ACD0';
export const IMAGE_TEMPLATE32_INK = '#1F2A14';
export const IMAGE_TEMPLATE32_SHADOW = '#444E21';
export const IMAGE_TEMPLATE32_MARK = '[spill it]';

export const IMAGE_TEMPLATE32_FONT_STACK =
  '"Fraunces", "Libre Baskerville", Georgia, "Times New Roman", serif';

/** Stripe axis, degrees. Negative rises toward the upper right. */
const STRIPE_ANGLE = -16;
const STRIPE_THICKNESS = 0.15;
const STRIPE_AMPLITUDE = 0.36;
const STRIPE_WAVELENGTH = 0.96;
const STRIPE_PHASE = 1.15;

const BLOB_CX = 0.5;
const BLOB_CY = 0.498;
const BLOB_RX = 0.425;
const BLOB_RY = 0.305;
const BLOB_SHADOW_X = 0.016;
const BLOB_SHADOW_Y = 0.013;

const COVER_SIZE = 0.09;
const COVER_LEADING = 0.96;
const COVER_WIDTH = 0.76;
const MARK_SIZE = 0.036;
const MARK_GAP = 0.38;

const QUESTION_SIZE = 0.052;
const QUESTION_LEADING = 1.12;
const QUESTION_WIDTH = 0.7;
const OPTION_SIZE = 0.034;
const OPTION_LEADING = 1.38;
const OPTION_GAP = 0.7;

export function isImageTemplate32Id(templateId: number | null | undefined): boolean {
  return templateId === 32;
}

export async function loadTemplate32Fonts(): Promise<void> {
  const loads = [
    document.fonts.load('900 80px "Fraunces"'),
    document.fonts.load('500 48px "Fraunces"'),
    document.fonts.load('italic 600 40px "Fraunces"'),
    document.fonts.load('700 36px "TikTok Sans"'),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function clampByte(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

/** Mulberry32. Same grain on every slide so the field doesn't shimmer. */
function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintStripes(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = IMAGE_TEMPLATE32_MINT;
  ctx.fillRect(0, 0, width, height);
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const angle = (STRIPE_ANGLE * Math.PI) / 180;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const nx = -dy;
  const ny = dx;
  const thickness = width * STRIPE_THICKNESS;
  const amplitude = thickness * STRIPE_AMPLITUDE;
  const wavelength = width * STRIPE_WAVELENGTH;
  const freq = (Math.PI * 2) / wavelength;
  const olive = [110, 124, 59];
  const mint = [226, 234, 206];
  const rand = mulberry32(32);
  for (let y = 0; y < height; y++) {
    const yNy = y * ny;
    const yDy = y * dy;
    for (let x = 0; x < width; x++) {
      const along = x * dx + yDy;
      const across = x * nx + yNy;
      const wave = Math.sin(along * freq + STRIPE_PHASE);
      const band = Math.floor((across + wave * amplitude) / thickness);
      const color = (band & 1) === 0 ? olive : mint;
      const grain = (Math.floor(rand() * 5) - 2) * 8;
      const i = (y * width + x) * 4;
      data[i] = clampByte(color[0] + grain);
      data[i + 1] = clampByte(color[1] + grain);
      data[i + 2] = clampByte(color[2] + grain);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function blobPoint(t: number, cx: number, cy: number, rx: number, ry: number) {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const n = 2.7;
  const sx = Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
  const sy = Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
  const wobble =
    1 +
    0.048 * Math.sin(3 * t + 0.45) +
    0.034 * Math.sin(5 * t - 0.7) +
    0.026 * Math.sin(6 * t + 1.35) +
    0.018 * Math.sin(8 * t + 0.2);
  return { x: cx + rx * sx * wobble, y: cy + ry * sy * wobble };
}

function traceBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  const steps = 220;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const point = blobPoint((i / steps) * Math.PI * 2, cx, cy, rx, ry);
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.closePath();
}

function paintBlob(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width * BLOB_CX;
  const cy = height * BLOB_CY;
  const rx = width * BLOB_RX;
  const ry = height * BLOB_RY;
  ctx.fillStyle = IMAGE_TEMPLATE32_SHADOW;
  traceBlob(ctx, cx + width * BLOB_SHADOW_X, cy + height * BLOB_SHADOW_Y, rx, ry);
  ctx.fill();
  ctx.fillStyle = IMAGE_TEMPLATE32_PINK;
  traceBlob(ctx, cx, cy, rx, ry);
  ctx.fill();

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const rand = mulberry32(32032);
  const minX = Math.max(0, Math.floor(cx - rx * 1.2));
  const maxX = Math.min(width, Math.ceil(cx + rx * 1.2));
  const minY = Math.max(0, Math.floor(cy - ry * 1.2));
  const maxY = Math.min(height, Math.ceil(cy + ry * 1.2));
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const i = (y * width + x) * 4;
      const red = data[i]!;
      const green = data[i + 1]!;
      if (red < 190 || red < green + 20) continue;
      const grain = (Math.floor(rand() * 3) - 1) * 8;
      data[i] = clampByte(data[i] + grain);
      data[i + 1] = clampByte(data[i + 1] + grain);
      data[i + 2] = clampByte(data[i + 2] + grain);
    }
  }
  ctx.putImageData(image, 0, 0);
}

function wrapParagraph(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0]!;
  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function wrapBlock(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, '').split('\n')) {
    const wrapped = wrapParagraph(ctx, paragraph, maxWidth);
    if (wrapped.length === 0) lines.push('');
    else lines.push(...wrapped);
  }
  return lines;
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

function parseOptions(source: string): ParsedOption[] {
  return source
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^([A-Za-z]|\d{1,2})[.)]\s*([\s\S]*)$/);
      const text = (match ? match[2] : line).trim();
      const marker = match?.[1];
      const label =
        marker && /[A-Za-z]/.test(marker)
          ? `${marker.toUpperCase()}.`
          : marker && /\d/.test(marker)
            ? `${marker}.`
            : `${String.fromCharCode(65 + index)}.`;
      return { label, text };
    });
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  fontFamily: string
) {
  const text = title.trim();
  const cx = width * BLOB_CX;
  const maxWidth = width * COVER_WIDTH;
  let size = width * COVER_SIZE;
  const minSize = width * 0.046;
  const measure = (fontSize: number) => {
    ctx.font = `900 ${fontSize}px ${fontFamily}`;
    const lines = text ? wrapBlock(ctx, text, maxWidth) : [];
    const pitch = fontSize * COVER_LEADING;
    const block = lines.length === 0 ? 0 : (lines.length - 1) * pitch + fontSize;
    return { lines, pitch, block };
  };
  let laid = measure(size);
  while (size > minSize && (laid.lines.length > 3 || laid.block > height * 0.34)) {
    size = Math.max(minSize, size - width * 0.002);
    laid = measure(size);
    if (size === minSize) break;
  }
  const markSize = width * MARK_SIZE;
  const gap = size * MARK_GAP;
  const total = laid.block + (text ? gap + markSize : 0);
  let y = height * BLOB_CY - total / 2;
  ctx.fillStyle = IMAGE_TEMPLATE32_INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  setLetterSpacing(ctx, '-0.02em');
  ctx.font = `900 ${size}px ${fontFamily}`;
  laid.lines.forEach((line, index) => {
    ctx.fillText(line, cx, y + index * laid.pitch);
  });
  setLetterSpacing(ctx, '0px');
  if (!text) return;
  ctx.font = `italic 600 ${markSize}px ${fontFamily}`;
  ctx.fillText(IMAGE_TEMPLATE32_MARK, cx, y + laid.block + gap);
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string
) {
  const { question, options } = splitQuestion(text);
  if (!question.trim() && !options.trim()) return;
  const cx = width * BLOB_CX;
  const maxWidth = width * QUESTION_WIDTH;
  const parsed = options.trim() ? parseOptions(options) : [];
  let questionSize = width * QUESTION_SIZE;
  let optionSize = width * OPTION_SIZE;
  const minQuestion = width * 0.032;
  const minOption = width * 0.022;
  const topLimit = height * (BLOB_CY - BLOB_RY * 0.72);
  const bottomLimit = height * (BLOB_CY + BLOB_RY * 0.72);

  const layout = () => {
    ctx.font = `900 ${questionSize}px ${fontFamily}`;
    setLetterSpacing(ctx, '-0.015em');
    const questionLines = question.trim() ? wrapBlock(ctx, question, maxWidth) : [];
    const questionPitch = questionSize * QUESTION_LEADING;
    const questionBlock =
      questionLines.length === 0 ? 0 : (questionLines.length - 1) * questionPitch + questionSize;
    const gap = questionLines.length && parsed.length ? questionSize * OPTION_GAP : 0;
    ctx.font = `500 ${optionSize}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    const optionPitch = optionSize * OPTION_LEADING;
    const optionLines = parsed.map((option) => {
      const label = `${option.label}  `;
      const labelWidth = ctx.measureText(label).width;
      const lines = option.text
        ? wrapParagraph(ctx, option.text, Math.max(optionSize, maxWidth - labelWidth))
        : [];
      return { label, labelWidth, lines };
    });
    let rows = 0;
    optionLines.forEach((option) => {
      rows += Math.max(option.lines.length, 1);
    });
    const optionBlock = rows === 0 ? 0 : (rows - 1) * optionPitch + optionSize;
    return { questionLines, questionPitch, questionBlock, gap, optionLines, optionPitch, optionBlock };
  };

  let laid = layout();
  while (
    (questionSize > minQuestion || optionSize > minOption) &&
    laid.questionBlock + laid.gap + laid.optionBlock > bottomLimit - topLimit
  ) {
    if (questionSize > minQuestion) questionSize = Math.max(minQuestion, questionSize - width * 0.0015);
    if (optionSize > minOption) optionSize = Math.max(minOption, optionSize - width * 0.001);
    laid = layout();
    if (questionSize === minQuestion && optionSize === minOption) break;
  }

  const total = laid.questionBlock + laid.gap + laid.optionBlock;
  let y = height * BLOB_CY - total / 2;
  ctx.fillStyle = IMAGE_TEMPLATE32_INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `900 ${questionSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '-0.015em');
  laid.questionLines.forEach((line, index) => {
    ctx.fillText(line, cx, y + index * laid.questionPitch);
  });
  setLetterSpacing(ctx, '0px');
  if (!laid.optionLines.length) return;

  y += laid.questionBlock + laid.gap;
  ctx.font = `500 ${optionSize}px ${fontFamily}`;
  ctx.textAlign = 'left';
  const labelWidth = Math.max(...laid.optionLines.map((option) => option.labelWidth));
  const sample = laid.optionLines.reduce((widest, option) => {
    const line = option.lines.reduce(
      (best, item) => (ctx.measureText(item).width > ctx.measureText(best).width ? item : best),
      ''
    );
    const widthOf = labelWidth + ctx.measureText(line).width;
    return widthOf > widest ? widthOf : widest;
  }, labelWidth);
  const left = cx - sample / 2;
  laid.optionLines.forEach((option) => {
    const rows = Math.max(option.lines.length, 1);
    for (let row = 0; row < rows; row++) {
      if (row === 0) ctx.fillText(option.label, left, y);
      const line = option.lines[row] ?? '';
      if (line) ctx.fillText(line, left + labelWidth, y);
      y += laid.optionPitch;
    }
  });
}

export function paintTemplate32Slide(
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
    labelFontFamily?: string;
  }
) {
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE32_SLIDE_COUNT;
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE32_FONT_STACK;

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  setLetterSpacing(ctx, '0px');
  paintStripes(ctx, width, height);

  if (isCta) {
    paintImageTemplate2Q5Promo(ctx, width, height, {
      promo: options.promo ?? null,
      fontFamily: options.labelFontFamily ?? fontFamily,
      textColor: IMAGE_TEMPLATE32_INK,
      fontWeight: 900,
    });
    return;
  }

  paintBlob(ctx, width, height);
  if (isCover) paintCover(ctx, width, height, options.text, fontFamily);
  else paintQuestion(ctx, width, height, options.text, fontFamily);
}
