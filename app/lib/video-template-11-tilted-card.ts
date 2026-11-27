/**
 * Spill It video template 11 — a tilted pastel question card over a looping clip.
 * One export plays the questions in order (one card at a time). Nighty and Fab
 * do not list this template.
 */

export const TILTED_CARD_TEMPLATE_ID = 11;
export const TILTED_CARD_TITLE = 'Tilted card';

export const TILTED_CARD_WIDTH = 1080;
export const TILTED_CARD_HEIGHT = 1920;
export const TILTED_CARD_FPS = 24;
/** How long each question stays on the card before the next one. */
export const TILTED_CARD_HOLD_SEC = 4;
export const TILTED_CARD_MAX_QUESTIONS = 6;

export const TILTED_CARD_DEFAULT_APP_NAME = 'SPILL IT';
export const TILTED_CARD_DEFAULT_FILL = '#F9C6D0';
export const TILTED_CARD_DEFAULT_ROTATION = -3.5;
export const TILTED_CARD_ROTATION_MIN = -10;
export const TILTED_CARD_ROTATION_MAX = 10;

/** Shipped sunset-beach clip, same file the older question videos already use. */
export const TILTED_CARD_DEFAULT_VIDEO =
  '/vecteezy_two-people-sitting-under-a-palm-tree-at-sunset_40457382.mp4';

export const TILTED_CARD_PEXELS_QUERIES = [
  'sunset beach',
  'tropical beach sunset',
  'palm tree beach sunset',
] as const;

export const TILTED_CARD_PRESETS = [
  { id: 'pink', label: 'Pink', hex: '#F9C6D0' },
  { id: 'purple', label: 'Purple', hex: '#8C19FF' },
  { id: 'blush', label: 'Blush', hex: '#FF8FB1' },
  { id: 'peach', label: 'Peach', hex: '#FFB38A' },
] as const;

export const TILTED_CARD_INK = '#1C1416';
export const TILTED_CARD_PAPER = '#FFF8F4';

const SANS = '"TikTok Sans", system-ui, sans-serif';
const SERIF = '"Playfair Display", "Libre Baskerville", Georgia, serif';

export const TILTED_CARD_QUESTION_BANK = [
  "What's something small I did early on that made you fall for me?",
  "What's a habit of mine you hope I never grow out of?",
  'When did you first think this might actually last?',
  "What's something I do that still catches you off guard?",
  "What's a tiny thing I do that makes you feel looked after?",
  'What did I get right before I even knew I was trying?',
  "What's a moment with me you still replay?",
  'What should I never stop doing for you?',
  "What's something ordinary I do that feels like us?",
  'When do you feel closest to me without either of us saying it?',
] as const;

export type TiltedCardPaintOptions = {
  appName: string;
  question: string;
  fill: string;
  rotationDeg: number;
  serifFamily?: string;
  sansFamily?: string;
  /** When false, draw the card on top of pixels already in the canvas. */
  clear?: boolean;
};

export function isTiltedCardVideoTemplateId(id: number | null | undefined): boolean {
  return id === TILTED_CARD_TEMPLATE_ID;
}

export function clampTiltedCardRotation(degrees: number): number {
  if (!Number.isFinite(degrees)) return TILTED_CARD_DEFAULT_ROTATION;
  return Math.min(TILTED_CARD_ROTATION_MAX, Math.max(TILTED_CARD_ROTATION_MIN, degrees));
}

export function normalizeHexColor(value: string, fallback = TILTED_CARD_DEFAULT_FILL): string {
  const match = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.exec(value.trim());
  if (!match) return fallback;
  let hex = match[1]!;
  if (hex.length === 3) hex = hex.split('').map((channel) => channel + channel).join('');
  return `#${hex.toUpperCase()}`;
}

function linearChannel(hex: string, index: number): number {
  const normalized = normalizeHexColor(hex, '#000000').slice(1);
  const value = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  return (
    0.2126 * linearChannel(hex, 0) +
    0.7152 * linearChannel(hex, 1) +
    0.0722 * linearChannel(hex, 2)
  );
}

function contrastRatio(a: number, b: number): number {
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Dark ink on light fills, paper on dark fills such as Spill It purple. */
export function tiltedCardTextColor(fill: string): string {
  const background = relativeLuminance(normalizeHexColor(fill));
  const dark = contrastRatio(background, relativeLuminance(TILTED_CARD_INK));
  const light = contrastRatio(background, relativeLuminance(TILTED_CARD_PAPER));
  return dark >= light ? TILTED_CARD_INK : TILTED_CARD_PAPER;
}

/** Inset line that stays visible on both the pink card and the purple card. */
export function tiltedCardBorderColor(fill: string): string {
  return tiltedCardTextColor(fill) === TILTED_CARD_INK
    ? 'rgba(28, 20, 22, 0.82)'
    : 'rgba(255, 248, 244, 0.88)';
}

export function tiltedCardQuestions(questions: readonly string[]): string[] {
  return questions.map((question) => question.trim()).filter(Boolean).slice(0, TILTED_CARD_MAX_QUESTIONS);
}

export function tiltedCardDurationSec(questions: readonly string[]): number {
  return Math.max(1, tiltedCardQuestions(questions).length) * TILTED_CARD_HOLD_SEC;
}

export function tiltedCardQuestionAt(questions: readonly string[], elapsedSec: number): string {
  const list = tiltedCardQuestions(questions);
  if (list.length === 0) return TILTED_CARD_QUESTION_BANK[0];
  const index = Math.min(list.length - 1, Math.max(0, Math.floor(elapsedSec / TILTED_CARD_HOLD_SEC)));
  return list[index] ?? list[0]!;
}

export function pickTiltedCardQuestions(count = 4, exclude?: readonly string[]): string[] {
  const blocked = new Set((exclude ?? []).map((question) => question.trim()));
  const pool = TILTED_CARD_QUESTION_BANK.filter((question) => !blocked.has(question));
  const source = pool.length >= count ? [...pool] : [...TILTED_CARD_QUESTION_BANK];
  for (let i = source.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = source[i]!;
    source[i] = source[j]!;
    source[j] = swap;
  }
  return source.slice(0, Math.min(count, source.length));
}

export function defaultTiltedCardQuestions(): string[] {
  return TILTED_CARD_QUESTION_BANK.slice(0, 4);
}

function traceRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(Math.max(0, radius), width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in ctx) spaced.letterSpacing = value;
}

export function paintTiltedCardOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: TiltedCardPaintOptions
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  setLetterSpacing(ctx, '0px');
  if (options.clear !== false) ctx.clearRect(0, 0, width, height);

  const fill = normalizeHexColor(options.fill);
  const ink = tiltedCardTextColor(fill);
  const cardW = width * 0.8;
  const cardH = cardW * (4 / 3);
  const radius = width * 0.042;
  const rotation = (clampTiltedCardRotation(options.rotationDeg) * Math.PI) / 180;
  const sans = options.sansFamily || SANS;
  const serif = options.serifFamily || SERIF;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(rotation);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.24)';
  ctx.shadowBlur = width * 0.028;
  ctx.shadowOffsetX = width * 0.004;
  ctx.shadowOffsetY = width * 0.014;
  traceRoundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, radius);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const inset = width * 0.016;
  ctx.lineWidth = Math.max(2, width * 0.0032);
  ctx.strokeStyle = tiltedCardBorderColor(fill);
  traceRoundRect(
    ctx,
    -cardW / 2 + inset,
    -cardH / 2 + inset,
    cardW - inset * 2,
    cardH - inset * 2,
    Math.max(radius - inset * 0.65, width * 0.02)
  );
  ctx.stroke();

  const padX = cardW * 0.09;
  const maxTextW = cardW - padX * 2;
  const left = -cardW / 2 + padX;
  const brand = (options.appName.trim() || TILTED_CARD_DEFAULT_APP_NAME).toUpperCase();

  let brandSize = Math.round(width * 0.026);
  const minBrand = Math.round(width * 0.016);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = ink;
  while (brandSize > minBrand) {
    ctx.font = `700 ${brandSize}px ${sans}`;
    setLetterSpacing(ctx, `${Math.round(brandSize * 0.16)}px`);
    if (ctx.measureText(brand).width <= maxTextW) break;
    brandSize -= 1;
  }
  ctx.font = `700 ${brandSize}px ${sans}`;
  setLetterSpacing(ctx, `${Math.round(brandSize * 0.16)}px`);
  const brandTop = -cardH / 2 + cardH * 0.072;
  ctx.fillText(brand, left, brandTop);
  setLetterSpacing(ctx, '0px');

  const question = options.question.trim();
  if (question) {
    const contentTop = brandTop + brandSize * 2.15;
    const contentBottom = cardH / 2 - cardH * 0.08;
    const contentH = Math.max(brandSize, contentBottom - contentTop);
    let fontSize = Math.round(width * 0.058);
    const minSize = Math.round(width * 0.032);
    let lines: string[] = [];
    let lineH = fontSize * 1.12;
    while (fontSize >= minSize) {
      ctx.font = `700 ${fontSize}px ${serif}`;
      lines = wrapLines(ctx, question, maxTextW);
      lineH = fontSize * 1.12;
      if (lines.length * lineH <= contentH) break;
      fontSize -= 2;
    }
    const blockH = lines.length * lineH;
    const idealTop = -blockH / 2;
    const textTop = Math.max(contentTop, Math.min(idealTop, contentBottom - blockH));
    ctx.font = `700 ${fontSize}px ${serif}`;
    ctx.fillStyle = ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let y = textTop;
    for (const line of lines) {
      ctx.fillText(line, left, y);
      y += lineH;
    }
  }

  ctx.restore();
}
