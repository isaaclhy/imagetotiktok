import bank from '@/app/lib/video-template-7-love-letter.json';

/** Pexels searches for dim, almost-still backgrounds: bedrooms, blur, stairs. */
export const VIDEO_TEMPLATE7_PEXELS_QUERIES = [
  'dark bedroom night',
  'moody bedroom',
  'dim room night',
  'night window',
  'bokeh lights dark',
  'out of focus lights',
  'staircase night',
  'stairs dusk',
  'dark hallway',
  'candlelit bedroom',
  'dark ceiling room',
  'night apartment interior',
  'blurred city lights',
  'empty dark room',
  'bedroom lamp night',
] as const;

/** On-screen length. Text is present from the first frame to the last. */
export const VIDEO_TEMPLATE7_DURATION_SEC = 5;
export const VIDEO_TEMPLATE7_WIDTH = 1080;
export const VIDEO_TEMPLATE7_HEIGHT = 1920;

export type VideoTemplate7TextSource = 'letter' | 'quote' | 'custom';

/** Which bank a random pick draws from. Random is the default. */
export type VideoTemplate7Length = 'random' | 'quote' | 'short' | 'medium' | 'long';

export type VideoTemplate7LetterBand = 'short' | 'medium' | 'long';

const FONT = '"TikTok Sans", system-ui, -apple-system, sans-serif';
/**
 * Warm pale yellow for every line in the template: quotes, headlines,
 * signatures, and short, medium, and long letters. Opaque so small type
 * stays readable on the darkened brick.
 */
const TEXT_COLOR = '#F4E2A8';

const LETTER_MARGIN_X = 0.05;
const LETTER_MARGIN_Y = 0.022;
const LETTER_LINE_HEIGHT = 1.15;
const LETTER_MIN_SIZE_RATIO = 0.018;
const LETTER_MAX_SIZE_RATIO = 0.058;

/**
 * Blank line between a headline ("to my girl who works so hard,") and the body.
 * A fraction of the line height, so the break stays visible without a hole.
 */
const LETTER_PARAGRAPH_GAP = 0.62;

/** A one-liner holds for the original 5s. Shorter than that reads as a flash. */
const QUOTE_DURATION_SEC = VIDEO_TEMPLATE7_DURATION_SEC;
/** A ~100 word letter is meant to be read, so it stays up longer than the wall. */
const SHORT_LETTER_DURATION_SEC = 8;
const MEDIUM_LETTER_DURATION_SEC = 10;

const QUOTE_MAX_WIDTH = 0.9;
const QUOTE_LINE_HEIGHT = 1.22;
const QUOTE_SIZE_RATIO = 0.084;
const QUOTE_MIN_SIZE_RATIO = 0.05;

const DARKEN_ALPHA = 0.58;

const LETTERS = bank.letters;
const QUOTES = bank.quotes;

function pickDifferent(pool: readonly string[], current?: string): string {
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0] ?? '';
  let next = pool[Math.floor(Math.random() * pool.length)] ?? pool[0]!;
  if (current && next === current) {
    next = pool.find((entry) => entry !== current) ?? next;
  }
  return next;
}

export function videoTemplate7WordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Short is about 100–150 words, medium about 150–230, and everything longer is a wall. */
export function videoTemplate7LetterBand(text: string): VideoTemplate7LetterBand {
  const words = videoTemplate7WordCount(text);
  if (words <= 150) return 'short';
  if (words <= 240) return 'medium';
  return 'long';
}

function lettersInBand(band: VideoTemplate7LetterBand): readonly string[] {
  const pool = LETTERS.filter((entry) => videoTemplate7LetterBand(entry) === band);
  return pool.length > 0 ? pool : LETTERS;
}

export function pickVideoTemplate7Letter(
  current?: string,
  band?: VideoTemplate7LetterBand
): string {
  return pickDifferent(band ? lettersInBand(band) : LETTERS, current);
}

export function pickVideoTemplate7Quote(current?: string): string {
  return pickDifferent(QUOTES, current);
}

const LENGTH_BANDS = ['quote', 'short', 'medium', 'long'] as const;

export function pickVideoTemplate7Text(
  length: VideoTemplate7Length,
  current?: string
): { text: string; source: 'letter' | 'quote' } {
  const band =
    length === 'random'
      ? LENGTH_BANDS[Math.floor(Math.random() * LENGTH_BANDS.length)]!
      : length;
  if (band === 'quote') {
    return { text: pickVideoTemplate7Quote(current), source: 'quote' };
  }
  return { text: pickVideoTemplate7Letter(current, band), source: 'letter' };
}

/**
 * How long the words stay up. A 10-word quote holds for 5 seconds so it does
 * not flash. A short or medium letter holds longer so it can actually be read.
 * A long letter keeps the original 5 second wall-of-text hold.
 */
export function videoTemplate7DurationSec(
  text: string,
  source?: VideoTemplate7TextSource
): number {
  if (videoTemplate7Variant(source ?? 'custom', text) === 'quote') return QUOTE_DURATION_SEC;
  const band = videoTemplate7LetterBand(text);
  if (band === 'short') return SHORT_LETTER_DURATION_SEC;
  if (band === 'medium') return MEDIUM_LETTER_DURATION_SEC;
  return VIDEO_TEMPLATE7_DURATION_SEC;
}

export function videoTemplate7Variant(
  source: VideoTemplate7TextSource,
  text: string
): 'letter' | 'quote' {
  if (source === 'letter') return 'letter';
  if (source === 'quote') return 'quote';
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const lines = trimmed.split(/\n/).filter((line) => line.trim()).length;
  if ((lines <= 4 && words <= 36) || trimmed.length <= 160) return 'quote';
  return 'letter';
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
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

function quoteLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const explicit = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (explicit.length <= 1) return wrapLines(ctx, text, maxWidth);
  const lines: string[] = [];
  for (const line of explicit) {
    const wrapped = wrapLines(ctx, line, maxWidth);
    if (wrapped.length === 0) continue;
    lines.push(...wrapped);
  }
  return lines;
}

function paintGrade(ctx: CanvasRenderingContext2D, frameWidth: number, frameHeight: number) {
  ctx.fillStyle = `rgba(0, 0, 0, ${DARKEN_ALPHA})`;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const cx = frameWidth / 2;
  const cy = frameHeight * 0.46;
  const outer = Math.hypot(frameWidth * 0.52, frameHeight * 0.56);
  const vignette = ctx.createRadialGradient(cx, cy, frameWidth * 0.08, cx, cy, outer);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.38, 'rgba(0, 0, 0, 0.08)');
  vignette.addColorStop(0.62, 'rgba(0, 0, 0, 0.34)');
  vignette.addColorStop(0.82, 'rgba(0, 0, 0, 0.7)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
}

/** Faint, dense noise so the frame reads as film grain rather than speckle. */
function paintGrain(ctx: CanvasRenderingContext2D, frameWidth: number, frameHeight: number) {
  let image: ImageData;
  try {
    image = ctx.getImageData(0, 0, frameWidth, frameHeight);
  } catch {
    return;
  }
  const data = image.data;
  const specks = Math.round(frameWidth * frameHeight * 0.045);
  for (let n = 0; n < specks; n++) {
    const x = (Math.random() * frameWidth) | 0;
    const y = (Math.random() * frameHeight) | 0;
    const light = Math.random() < 0.5;
    const srcA = light ? 0.035 + Math.random() * 0.04 : 0.03 + Math.random() * 0.035;
    const src = light ? 230 : 12;
    const i = (y * frameWidth + x) * 4;
    const dstA = (data[i + 3] ?? 0) / 255;
    const outA = srcA + dstA * (1 - srcA);
    const dstR = data[i] ?? 0;
    const dstG = data[i + 1] ?? 0;
    const dstB = data[i + 2] ?? 0;
    const keep = dstA * (1 - srcA);
    data[i] = outA === 0 ? 0 : Math.round((src * srcA + dstR * keep) / outA);
    data[i + 1] = outA === 0 ? 0 : Math.round((src * srcA + dstG * keep) / outA);
    data[i + 2] = outA === 0 ? 0 : Math.round((src * srcA + dstB * keep) / outA);
    data[i + 3] = Math.round(outA * 255);
  }
  ctx.putImageData(image, 0, 0);
}

type LetterLine = { text: string; gapBefore: number };

function letterBandMetrics(words: number): {
  minRatio: number;
  maxRatio: number;
  lineHeight: number;
  marginX: number;
  marginY: number;
} {
  // Short letters sit larger, with air around the block, so ~100 words
  // does not shrink into a tiny wall or stretch edge to edge.
  if (words <= 150) {
    return {
      minRatio: 0.036,
      maxRatio: 0.056,
      lineHeight: 1.32,
      marginX: 0.09,
      marginY: 0.08,
    };
  }
  if (words <= 240) {
    return {
      minRatio: 0.028,
      maxRatio: 0.046,
      lineHeight: 1.24,
      marginX: 0.075,
      marginY: 0.055,
    };
  }
  return {
    minRatio: LETTER_MIN_SIZE_RATIO,
    maxRatio: LETTER_MAX_SIZE_RATIO,
    lineHeight: LETTER_LINE_HEIGHT,
    marginX: LETTER_MARGIN_X,
    marginY: LETTER_MARGIN_Y,
  };
}

function letterBlockHeight(lines: readonly LetterLine[], lineHeight: number): number {
  let height = 0;
  for (const line of lines) height += line.gapBefore + lineHeight;
  return height;
}

/** Keeps a blank line after a headline. A letter with no breaks wraps as one block. */
function layoutLetterLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  gapPx: number
): LetterLine[] {
  const parts = text.split('\n');
  const lines: LetterLine[] = [];
  let pending = 0;
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) {
      pending += gapPx;
      continue;
    }
    const wrapped = wrapLines(ctx, trimmed, maxWidth);
    wrapped.forEach((line, index) => {
      lines.push({ text: line, gapBefore: index === 0 ? pending : 0 });
      if (index === 0) pending = 0;
    });
  }
  return lines;
}

function drawLetterLines(
  ctx: CanvasRenderingContext2D,
  lines: LetterLine[],
  frameWidth: number,
  fontSize: number,
  lineHeight: number,
  centerY: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${fontSize}px ${FONT}`;
  const blockH = letterBlockHeight(lines, lineHeight);
  let y = centerY - blockH / 2 + lineHeight / 2;
  ctx.fillStyle = TEXT_COLOR;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = Math.max(2.2, fontSize * 0.09);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(1, fontSize * 0.045);
  for (const line of lines) {
    y += line.gapBefore;
    ctx.fillText(line.text, frameWidth / 2, y);
    y += lineHeight;
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  frameWidth: number,
  frameHeight: number,
  fontSize: number,
  lineHeight: number,
  color: string,
  centerY: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${fontSize}px ${FONT}`;
  const blockH = lines.length * lineHeight;
  let y = centerY - blockH / 2 + lineHeight / 2;

  const shadowY = Math.max(1, frameWidth * 0.00135);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  for (const line of lines) {
    ctx.fillText(line, frameWidth / 2 + shadowY * 0.35, y + shadowY);
    y += lineHeight;
  }

  y = centerY - blockH / 2 + lineHeight / 2;
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = Math.max(0.8, frameWidth * 0.0011);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = shadowY * 0.4;
  for (const line of lines) {
    ctx.fillText(line, frameWidth / 2, y);
    y += lineHeight;
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function layoutLetter(
  ctx: CanvasRenderingContext2D,
  text: string,
  frameWidth: number,
  frameHeight: number
): { lines: LetterLine[]; fontSize: number; lineHeight: number } {
  const metrics = letterBandMetrics(videoTemplate7WordCount(text));
  const maxW = frameWidth * (1 - metrics.marginX * 2);
  const maxH = frameHeight * (1 - metrics.marginY * 2);
  const minSize = Math.max(16, Math.round(frameWidth * metrics.minRatio));
  const maxSize = Math.round(frameWidth * metrics.maxRatio);
  let bestSize = minSize;
  let bestLines = layoutLetterLines(ctx, text, maxW, minSize * metrics.lineHeight * LETTER_PARAGRAPH_GAP);

  let lo = minSize;
  let hi = maxSize;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    ctx.font = `400 ${mid}px ${FONT}`;
    const lineHeight = mid * metrics.lineHeight;
    const lines = layoutLetterLines(ctx, text, maxW, lineHeight * LETTER_PARAGRAPH_GAP);
    const block = letterBlockHeight(lines, lineHeight);
    if (block <= maxH && lines.length > 0) {
      bestSize = mid;
      bestLines = lines;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const lineHeight = bestSize * metrics.lineHeight;
  ctx.font = `400 ${bestSize}px ${FONT}`;
  bestLines = layoutLetterLines(ctx, text, maxW, lineHeight * LETTER_PARAGRAPH_GAP);
  return { lines: bestLines, fontSize: bestSize, lineHeight };
}

function layoutQuote(
  ctx: CanvasRenderingContext2D,
  text: string,
  frameWidth: number,
  frameHeight: number
): { lines: string[]; fontSize: number; lineHeight: number } {
  const maxW = frameWidth * QUOTE_MAX_WIDTH;
  let fontSize = Math.round(frameWidth * QUOTE_SIZE_RATIO);
  const minSize = Math.round(frameWidth * QUOTE_MIN_SIZE_RATIO);
  let lines: string[] = [];
  while (fontSize >= minSize) {
    ctx.font = `400 ${fontSize}px ${FONT}`;
    lines = quoteLines(ctx, text, maxW);
    const widest = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
    const block = lines.length * fontSize * QUOTE_LINE_HEIGHT;
    if (widest <= maxW && block <= frameHeight * 0.5) break;
    fontSize -= 2;
  }
  if (lines.length === 0) {
    ctx.font = `400 ${fontSize}px ${FONT}`;
    lines = quoteLines(ctx, text, maxW);
  }
  return { lines, fontSize, lineHeight: fontSize * QUOTE_LINE_HEIGHT };
}

export function paintVideoTemplate7Overlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: { text: string; source?: VideoTemplate7TextSource }
) {
  if (frameWidth <= 0 || frameHeight <= 0) return;
  ctx.save();
  paintGrade(ctx, frameWidth, frameHeight);
  paintGrain(ctx, frameWidth, frameHeight);

  const text = options.text.toLowerCase().trim();
  if (text) {
    const variant = videoTemplate7Variant(options.source ?? 'custom', text);
    if (variant === 'quote') {
      const layout = layoutQuote(ctx, text, frameWidth, frameHeight);
      drawCenteredLines(
        ctx,
        layout.lines,
        frameWidth,
        frameHeight,
        layout.fontSize,
        layout.lineHeight,
        TEXT_COLOR,
        frameHeight * 0.5
      );
    } else {
      const layout = layoutLetter(ctx, text, frameWidth, frameHeight);
      drawLetterLines(
        ctx,
        layout.lines,
        frameWidth,
        layout.fontSize,
        layout.lineHeight,
        frameHeight * 0.5
      );
    }
  }
  ctx.restore();
}
