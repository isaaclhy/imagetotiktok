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

const FONT = '"TikTok Sans", system-ui, -apple-system, sans-serif';
/** White at about 92% so the letter stays soft on a dark frame. */
const LETTER_COLOR = 'rgba(255, 255, 255, 0.92)';
/** Pale yellow / beige used on the short-quote posts. */
const QUOTE_COLOR = '#F4E2A8';

const LETTER_MARGIN_X = 0.05;
const LETTER_MARGIN_Y = 0.022;
const LETTER_LINE_HEIGHT = 1.15;
const LETTER_MIN_SIZE_RATIO = 0.018;
const LETTER_MAX_SIZE_RATIO = 0.058;

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

export function pickVideoTemplate7Letter(current?: string): string {
  return pickDifferent(LETTERS, current);
}

export function pickVideoTemplate7Quote(current?: string): string {
  return pickDifferent(QUOTES, current);
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

function drawLetterLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  frameWidth: number,
  fontSize: number,
  lineHeight: number,
  centerY: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${fontSize}px ${FONT}`;
  const blockH = lines.length * lineHeight;
  let y = centerY - blockH / 2 + lineHeight / 2;
  ctx.fillStyle = LETTER_COLOR;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = Math.max(2.2, fontSize * 0.09);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(1, fontSize * 0.045);
  for (const line of lines) {
    ctx.fillText(line, frameWidth / 2, y);
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
): { lines: string[]; fontSize: number; lineHeight: number } {
  const maxW = frameWidth * (1 - LETTER_MARGIN_X * 2);
  const maxH = frameHeight * (1 - LETTER_MARGIN_Y * 2);
  const minSize = Math.max(16, Math.round(frameWidth * LETTER_MIN_SIZE_RATIO));
  const maxSize = Math.round(frameWidth * LETTER_MAX_SIZE_RATIO);
  let bestSize = minSize;
  let bestLines = wrapLines(ctx, text, maxW);

  let lo = minSize;
  let hi = maxSize;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    ctx.font = `400 ${mid}px ${FONT}`;
    const lines = wrapLines(ctx, text, maxW);
    const block = lines.length * mid * LETTER_LINE_HEIGHT;
    if (block <= maxH && lines.length > 0) {
      bestSize = mid;
      bestLines = lines;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  ctx.font = `400 ${bestSize}px ${FONT}`;
  bestLines = wrapLines(ctx, text, maxW);
  return {
    lines: bestLines,
    fontSize: bestSize,
    lineHeight: bestSize * LETTER_LINE_HEIGHT,
  };
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
        QUOTE_COLOR,
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
