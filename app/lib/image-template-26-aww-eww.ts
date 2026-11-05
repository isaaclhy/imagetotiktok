import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  imageTemplate2Q5PromoTextCeiling,
  paintImageTemplate2Q5Promo,
} from '@/app/lib/image-template-2-cover';

/**
 * Grey "aww or eww" slideshow (image template 26). 1080×1440.
 * Cover is a mid grey field, a small underlined header, and a two-tone
 * Ubuntu title. Question slides cycle solid greys with a thin progress
 * bar. The last question keeps its copy and closes with template 2's App
 * Store promo (same mock, "Download for more questions!" label, and crop).
 * There is no extra CTA-only slide. The only illustration is an original
 * bunny sticker on the cover; its placement and features come from a seed.
 */
export const IMAGE_TEMPLATE26_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE26_HEADER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE26_COVER_BG = '#5C5C5C';
export const IMAGE_TEMPLATE26_ORANGE = '#FFB45A';
/** Stable cover bunny when a caller does not pass a seed. */
export const IMAGE_TEMPLATE26_DEFAULT_BUNNY_SEED = 1;

const BUNNY_SLOT_NAMES = [
  'bottom left',
  'bottom right',
  'bottom',
  'lower left',
  'lower right',
  'top left',
  'top right',
  'top',
  'upper left',
  'upper right',
] as const;

/** A different sticker than `avoid`, for the Randomize control and a new post. */
export function rollTemplate26BunnySeed(avoid?: number): number {
  let next = 0;
  do {
    next = (Math.floor(Math.random() * 0x100000000) >>> 0) || 1;
  } while (next === avoid);
  return next;
}

/** Short label for the Randomize control. Stable for a seed. */
export function template26BunnyLabel(seed: number): string {
  const look = bunnyLookFromSeed(seed);
  const extra = look.accessory === 'none' ? look.eye : look.accessory;
  return `Bunny: ${BUNNY_SLOT_NAMES[look.slot]}, ${extra}`;
}
export const IMAGE_TEMPLATE26_QUESTION_COLORS = [
  '#9A9A9A',
  '#000000',
  '#151515',
  '#2D2D2D',
  '#F0F0F0',
  '#5C5C5C',
  '#1A1A1A',
  '#C8C8C8',
  '#3A3A3A',
  '#E4E4E4',
] as const;

export const IMAGE_TEMPLATE26_FONT_STACK =
  'Ubuntu, "Segoe UI", Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE26_BOLD_FONT_STACK =
  '"Ubuntu Bold", Ubuntu, "Segoe UI", Arial, Helvetica, sans-serif';

const AWW_EWW = ['A) aww', 'B) eww'] as const;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function isImageTemplate26Id(templateId: number | null | undefined): boolean {
  return templateId === 26;
}

export function template26PrimaryFontFamily(): string {
  return cssFamily('--font-ubuntu', 'Ubuntu');
}

export function template26BoldFontFamily(): string {
  return cssFamily('--font-ubuntu-bold', 'Ubuntu Bold');
}

export function template26CanvasFontStack(family = template26PrimaryFontFamily()): string {
  if (!family || family === 'Ubuntu') return IMAGE_TEMPLATE26_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE26_FONT_STACK}`;
}

export function template26BoldFontStack(family = template26BoldFontFamily()): string {
  if (!family || family === 'Ubuntu Bold') return IMAGE_TEMPLATE26_BOLD_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE26_BOLD_FONT_STACK}`;
}

export async function loadTemplate26Fonts(
  family = template26PrimaryFontFamily(),
  bold = template26BoldFontFamily()
): Promise<void> {
  const loads = [
    document.fonts.load(`400 48px ${quoteFamily(family)}`),
    document.fonts.load(`700 88px ${quoteFamily(bold)}`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

export function template26Background(tabIndex: number): string {
  if (tabIndex <= 0) return IMAGE_TEMPLATE26_COVER_BG;
  const slot = (tabIndex - 1) % IMAGE_TEMPLATE26_QUESTION_COLORS.length;
  return IMAGE_TEMPLATE26_QUESTION_COLORS[slot] ?? IMAGE_TEMPLATE26_QUESTION_COLORS[0];
}

/** First phrase in orange, the rest in white. A question mark is the preferred break. */
export function template26CoverLines(title: string): { orange: string; white: string } {
  const text = title.replace(/\s+/g, ' ').trim();
  if (!text) return { orange: '', white: '' };
  const marked = text.match(/^(.*?\?)\s+(.+)$/);
  if (marked) return { orange: marked[1]!.trim(), white: marked[2]!.trim() };
  const words = text.split(' ').filter(Boolean);
  if (words.length < 2) return { orange: text, white: '' };
  const mid = Math.ceil(words.length / 2);
  return {
    orange: words.slice(0, mid).join(' '),
    white: words.slice(mid).join(' '),
  };
}

/**
 * Feed options become "A) …" lines. A statement with no options falls back
 * to aww / eww. A real question with no options stays a question.
 */
export function template26AnswerLines(text: string): { question: string; options: string[] } {
  const split = splitCopycatQuestionAndOptions(text);
  const question = (split.question || text).trim();
  const fromFeed = parseOptionBodies(split.options);
  if (fromFeed.length > 0) {
    return {
      question,
      options: fromFeed.map((body, index) => `${LETTERS[index] ?? String(index + 1)}) ${body}`),
    };
  }
  if (!question.includes('?')) return { question, options: [...AWW_EWW] };
  return { question, options: [] };
}

export function paintTemplate26Slide(
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
    boldFontFamily?: string;
    /** Cover bunny. The same seed always paints the same sticker. */
    bunnySeed?: number;
  }
) {
  const slideCount = Math.max(1, options.slideCount ?? 7);
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE26_FONT_STACK;
  const boldFontFamily = options.boldFontFamily ?? template26BoldFontStack();
  const background = template26Background(options.tabIndex);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  setLetterSpacing(ctx, '0px');
  ctx.globalAlpha = 1;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  if (isCover) {
    paintCover(
      ctx,
      width,
      height,
      options.text,
      fontFamily,
      boldFontFamily,
      options.bunnySeed ?? IMAGE_TEMPLATE26_DEFAULT_BUNNY_SEED
    );
    return;
  }

  paintProgress(ctx, width, height, (options.tabIndex + 1) / slideCount, background);
  const textBottom = paintQuestion(
    ctx,
    width,
    height,
    options.text,
    fontFamily,
    background,
    isCta ? imageTemplate2Q5PromoTextCeiling(width, height) : undefined
  );
  if (isCta) {
    paintImageTemplate2Q5Promo(ctx, width, height, {
      promo: options.promo ?? null,
      fontFamily: boldFontFamily,
      textColor: textColor(background),
      textBottom,
      fontWeight: 700,
    });
    return;
  }
  paintFooter(ctx, width, height, fontFamily, background);
}

function cssFamily(variable: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const raw = getComputedStyle(document.body).getPropertyValue(variable).trim();
  if (!raw) return fallback;
  const quoted = raw.match(/^['"]([^'"]+)['"]/);
  const first = quoted?.[1] ?? raw.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || fallback;
}

function quoteFamily(family: string): string {
  if (family.startsWith('"') || family.startsWith("'")) return family;
  return family.includes(' ') ? `"${family}"` : family;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '').trim();
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const channels = hexToRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function isLightBackground(hex: string): boolean {
  return luminance(hex) > 0.22;
}

function textColor(background: string): string {
  return isLightBackground(background) ? '#1E1D25' : '#F4F4F4';
}

function footerColor(background: string): string {
  return isLightBackground(background) ? '#6E6E72' : '#9A9A9A';
}

function parseOptionBodies(options: string): string[] {
  if (!options.trim()) return [];
  const bodies: string[] = [];
  for (const line of options.split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const marked = trimmed.match(/^(?:[A-Za-z]|\d+)\s*[.)]\s+(.+)$/);
    const body = (marked ? marked[1] : trimmed).trim();
    if (body) bodies.push(body);
  }
  return bodies;
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
      } else hi = mid - 1;
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
    if (words.length === 0) continue;
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
          lines.push(current);
          current = chunk;
        }
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function inkAscent(ctx: CanvasRenderingContext2D, fontSize: number): number {
  const box = ctx.measureText('Hyg');
  return box.actualBoundingBoxAscent || fontSize * 0.75;
}

function paintProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ratio: number,
  background: string
) {
  const inset = width * 0.08;
  const y = height * 0.043;
  const barH = Math.max(6, height * 0.0062);
  const barW = width - inset * 2;
  const light = luminance(background) > 0.7;
  const track = light ? '#CFCFCF' : '#6E6E6E';
  const fill = light ? '#3A3A3A' : '#F2F2F0';
  ctx.fillStyle = track;
  ctx.fillRect(inset, y, barW, barH);
  const filled = Math.max(0, Math.min(1, ratio)) * barW;
  ctx.fillStyle = fill;
  ctx.fillRect(inset, y, filled, barH);
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  background: string
) {
  const size = width * 0.03;
  ctx.font = `400 ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = footerColor(background);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE26_FOOTER, width / 2, height * 0.94);
}

function paintCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  firstBaseline: number,
  pitch: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let y = firstBaseline;
  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += pitch;
  }
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  fontFamily: string,
  boldFontFamily: string,
  bunnySeed: number
) {
  const headerSize = width * 0.033;
  ctx.font = `400 ${headerSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = '#F4F4F4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const headerY = height * 0.195;
  ctx.fillText(IMAGE_TEMPLATE26_HEADER, width / 2, headerY);
  const headerWidth = ctx.measureText(IMAGE_TEMPLATE26_HEADER).width;
  const rule = Math.max(2, width * 0.0026);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect((width - headerWidth) / 2, headerY + headerSize * 0.48, headerWidth, rule);

  const parts = template26CoverLines(title);
  const maxWidth = width * 0.86;
  let fontSize = width * 0.078;
  const minSize = width * 0.046;
  const layoutAt = (size: number) => {
    ctx.font = `700 ${size}px ${boldFontFamily}`;
    const orange = parts.orange ? wrapLines(ctx, parts.orange, maxWidth) : [];
    const white = parts.white ? wrapLines(ctx, parts.white, maxWidth) : [];
    const pitch = size * 1.16;
    const gap = orange.length && white.length ? size * 0.28 : 0;
    const ascent = inkAscent(ctx, size);
    const lines = orange.length + white.length;
    const block = (lines > 0 ? ascent : 0) + Math.max(0, lines - 1) * pitch + gap;
    return { orange, white, pitch, gap, ascent, block };
  };
  let layout = layoutAt(fontSize);
  while (fontSize > minSize && layout.block > height * 0.34) {
    fontSize = Math.max(minSize, fontSize - width * 0.002);
    layout = layoutAt(fontSize);
    if (fontSize === minSize) break;
  }
  ctx.font = `700 ${fontSize}px ${boldFontFamily}`;
  const center = height * 0.45;
  let baseline = center - layout.block / 2 + layout.ascent;
  if (layout.orange.length) {
    paintCenteredLines(ctx, layout.orange, width / 2, baseline, layout.pitch, IMAGE_TEMPLATE26_ORANGE);
    baseline += layout.orange.length * layout.pitch + layout.gap;
  }
  if (layout.white.length) {
    ctx.font = `700 ${fontSize}px ${boldFontFamily}`;
    paintCenteredLines(ctx, layout.white, width / 2, baseline, layout.pitch, '#FFFFFF');
  }

  ctx.font = `700 ${fontSize}px ${boldFontFamily}`;
  const titleLines = [...layout.orange, ...layout.white];
  let titleWidth = 0;
  for (const line of titleLines) titleWidth = Math.max(titleWidth, ctx.measureText(line).width);
  const obstacles: TextRect[] = [
    {
      x: (width - headerWidth) / 2 - width * 0.04,
      y: headerY - headerSize * 1.15,
      w: headerWidth + width * 0.08,
      h: headerSize * 1.85,
    },
  ];
  if (layout.block > 0 && titleWidth > 0) {
    const titleTop = center - layout.block / 2;
    obstacles.push({
      x: (width - titleWidth) / 2 - width * 0.045,
      y: titleTop - height * 0.02,
      w: titleWidth + width * 0.09,
      h: layout.block + height * 0.04,
    });
  }
  paintBunny(ctx, width, height, bunnySeed, obstacles);
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  background: string,
  /** When set, the block is lifted so it ends above this y (closing promo). */
  ceiling?: number
): number {
  const { question, options } = template26AnswerLines(text);
  if (!question && options.length === 0) return 0;
  const margin = width * 0.082;
  const maxWidth = width * 0.82;
  const naturalTop = height * 0.38;
  const limit = ceiling ?? height * 0.9;
  const fitTop = ceiling == null ? naturalTop : height * 0.14;
  let fontSize = width * 0.044;
  const minSize = width * 0.03;
  const measure = (size: number) => {
    ctx.font = `400 ${size}px ${fontFamily}`;
    const questionLines = question ? wrapLines(ctx, question, maxWidth) : [];
    const optionLines = options.flatMap((option) => wrapLines(ctx, option, maxWidth));
    const pitch = size * 1.38;
    const gap = questionLines.length && optionLines.length ? size * 0.95 : 0;
    const block =
      questionLines.length * pitch +
      gap +
      optionLines.length * pitch;
    return { questionLines, optionLines, pitch, gap, block };
  };
  let layout = measure(fontSize);
  while (fontSize > minSize && fitTop + layout.block > limit) {
    fontSize = Math.max(minSize, fontSize - width * 0.0015);
    layout = measure(fontSize);
    if (fontSize === minSize) break;
  }
  const top =
    ceiling == null || naturalTop + layout.block <= limit
      ? naturalTop
      : Math.max(fitTop, limit - layout.block);
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = textColor(background);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const ascent = inkAscent(ctx, fontSize);
  let y = top + ascent;
  for (const line of layout.questionLines) {
    ctx.fillText(line, margin, y);
    y += layout.pitch;
  }
  if (layout.optionLines.length) y += layout.gap;
  for (const line of layout.optionLines) {
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor(background);
    ctx.fillText(line, margin, y);
    y += layout.pitch;
  }
  const lastBaseline = y - layout.pitch;
  const descent = ctx.measureText('yg').actualBoundingBoxDescent || fontSize * 0.25;
  return lastBaseline + descent;
}

type TextRect = { x: number; y: number; w: number; h: number };

type BunnyEye = 'oval' | 'round' | 'happy' | 'wink' | 'wide';
type BunnyMouth = 'smile' | 'o' | 'cat' | 'flat' | 'tongue';
type BunnyAccessory = 'none' | 'bow' | 'glasses' | 'blush' | 'flower';

type BunnyLook = {
  slot: number;
  scale: number;
  rotation: number;
  flip: boolean;
  earW: number;
  earH: number;
  earTiltL: number;
  earTiltR: number;
  earColor: string;
  cheekColor: string;
  noseColor: string;
  eye: BunnyEye;
  mouth: BunnyMouth;
  accessory: BunnyAccessory;
};

type BunnySlot = {
  edge: 'top' | 'bottom' | 'left' | 'right';
  along: number;
  /** Fraction of the sticker kept inside the frame along the peek axis. */
  visible: number;
  scaleMul: number;
};

const BUNNY_SLOTS: readonly BunnySlot[] = [
  { edge: 'bottom', along: 0.12, visible: 0.72, scaleMul: 1 },
  { edge: 'bottom', along: 0.88, visible: 0.72, scaleMul: 1 },
  { edge: 'bottom', along: 0.5, visible: 0.58, scaleMul: 0.92 },
  { edge: 'left', along: 0.84, visible: 0.58, scaleMul: 0.95 },
  { edge: 'right', along: 0.84, visible: 0.58, scaleMul: 0.95 },
  { edge: 'top', along: 0.14, visible: 0.78, scaleMul: 0.58 },
  { edge: 'top', along: 0.86, visible: 0.78, scaleMul: 0.58 },
  { edge: 'top', along: 0.5, visible: 0.72, scaleMul: 0.52 },
  { edge: 'left', along: 0.1, visible: 0.55, scaleMul: 0.64 },
  { edge: 'right', along: 0.1, visible: 0.55, scaleMul: 0.64 },
];

const BUNNY_EAR_COLORS = ['#F7A8C4', '#F4A3BE', '#F08BB0', '#E8A0B8', '#F6B7A2', '#F3C4D0'] as const;
const BUNNY_CHEEK_COLORS = ['#F4A3BE', '#F7B3C8', '#F0A0B4', '#F8C2B0', '#EFA8C0'] as const;
const BUNNY_NOSE_COLORS = ['#F29BB8', '#E98AAA', '#F0A3A0', '#F4B0C4'] as const;
const BUNNY_EYES: readonly BunnyEye[] = ['oval', 'round', 'happy', 'wink', 'wide'];
const BUNNY_MOUTHS: readonly BunnyMouth[] = ['smile', 'o', 'cat', 'flat', 'tongue'];
const BUNNY_ACCESSORIES: readonly BunnyAccessory[] = ['none', 'none', 'bow', 'glasses', 'blush', 'flower'];
const BUNNY_OUTLINE = '#3A261C';
const BUNNY_STROKE = 11;

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickFrom<T>(rand: () => number, list: readonly T[]): T {
  return list[Math.floor(rand() * list.length)]!;
}

function bunnyLookFromSeed(seed: number): BunnyLook {
  const rand = mulberry32(seed || IMAGE_TEMPLATE26_DEFAULT_BUNNY_SEED);
  return {
    slot: Math.floor(rand() * BUNNY_SLOTS.length),
    scale: 1.12 + rand() * 0.48,
    rotation: (rand() - 0.5) * 0.9,
    flip: rand() < 0.5,
    earW: 28 + rand() * 18,
    earH: 68 + rand() * 34,
    earTiltL: -0.08 - rand() * 0.48,
    earTiltR: 0.05 + rand() * 0.5,
    earColor: pickFrom(rand, BUNNY_EAR_COLORS),
    cheekColor: pickFrom(rand, BUNNY_CHEEK_COLORS),
    noseColor: pickFrom(rand, BUNNY_NOSE_COLORS),
    eye: pickFrom(rand, BUNNY_EYES),
    mouth: pickFrom(rand, BUNNY_MOUTHS),
    accessory: pickFrom(rand, BUNNY_ACCESSORIES),
  };
}

function ellipseAabb(cx: number, cy: number, rx: number, ry: number, rot: number) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const hw = Math.hypot(rx * c, ry * s);
  const hh = Math.hypot(rx * s, ry * c);
  return { minX: cx - hw, minY: cy - hh, maxX: cx + hw, maxY: cy + hh };
}

function unionAabb(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number }
) {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

function bunnyLocalBounds(look: BunnyLook) {
  const pad = BUNNY_STROKE / 2 + (look.accessory === 'bow' || look.accessory === 'flower' ? 28 : 6);
  let box = ellipseAabb(118, 78, look.earW + pad, look.earH + pad, look.earTiltL);
  box = unionAabb(box, ellipseAabb(196, 70, look.earW * 0.92 + pad, look.earH * 0.96 + pad, look.earTiltR));
  box = unionAabb(box, ellipseAabb(168, 196, 118 + pad, 108 + pad, 0));
  box = unionAabb(box, ellipseAabb(250, 268, 32 + pad, 24 + pad, 0.45));
  return box;
}

function rotatedRelBounds(
  local: { minX: number; minY: number; maxX: number; maxY: number },
  scale: number,
  rotation: number
) {
  const cx = (local.minX + local.maxX) / 2;
  const cy = (local.minY + local.maxY) / 2;
  const c = Math.cos(rotation);
  const s = Math.sin(rotation);
  const corners: Array<[number, number]> = [
    [local.minX, local.minY],
    [local.maxX, local.minY],
    [local.maxX, local.maxY],
    [local.minX, local.maxY],
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of corners) {
    const dx = (x - cx) * scale;
    const dy = (y - cy) * scale;
    const rx = dx * c - dy * s;
    const ry = dx * s + dy * c;
    minX = Math.min(minX, rx);
    minY = Math.min(minY, ry);
    maxX = Math.max(maxX, rx);
    maxY = Math.max(maxY, ry);
  }
  return { minX, minY, maxX, maxY };
}

function worldBox(
  cx: number,
  cy: number,
  rel: { minX: number; minY: number; maxX: number; maxY: number }
) {
  return { l: cx + rel.minX, t: cy + rel.minY, r: cx + rel.maxX, b: cy + rel.maxY };
}

function hitsText(
  box: { l: number; t: number; r: number; b: number },
  obstacles: readonly TextRect[],
  pad: number
) {
  return obstacles.some(
    (obstacle) =>
      box.r > obstacle.x - pad &&
      box.l < obstacle.x + obstacle.w + pad &&
      box.b > obstacle.y - pad &&
      box.t < obstacle.y + obstacle.h + pad
  );
}

function visiblyInside(
  box: { l: number; t: number; r: number; b: number },
  width: number,
  height: number
) {
  const w = Math.min(box.r, width) - Math.max(box.l, 0);
  const h = Math.min(box.b, height) - Math.max(box.t, 0);
  return w > width * 0.08 && h > height * 0.04;
}

function anchorBunny(
  slot: BunnySlot,
  rel: { minX: number; minY: number; maxX: number; maxY: number },
  width: number,
  height: number
) {
  const boxW = rel.maxX - rel.minX;
  const boxH = rel.maxY - rel.minY;
  if (slot.edge === 'bottom' || slot.edge === 'top') {
    const minCx = boxW * 0.28;
    const maxCx = Math.max(minCx, width - boxW * 0.28);
    const cx = minCx + (maxCx - minCx) * slot.along;
    // Bottom peeks clip the chin. Top peeks clip the ear tips so the face hangs in.
    const cy =
      slot.edge === 'bottom'
        ? height - boxH * slot.visible - rel.minY
        : -boxH * (1 - slot.visible) - rel.minY;
    return { cx, cy };
  }
  const minCy = boxH * 0.28;
  const maxCy = Math.max(minCy, height - boxH * 0.28);
  const cy = minCy + (maxCy - minCy) * slot.along;
  const cx =
    slot.edge === 'left'
      ? -boxW * (1 - slot.visible) - rel.minX
      : width + boxW * (1 - slot.visible) - boxW - rel.minX;
  return { cx, cy };
}

function separateFromText(
  slot: BunnySlot,
  cx: number,
  cy: number,
  rel: { minX: number; minY: number; maxX: number; maxY: number },
  obstacles: readonly TextRect[],
  width: number,
  height: number,
  pad: number
) {
  if (slot.edge === 'top') {
    const box = worldBox(cx, cy, rel);
    if (!hitsText(box, obstacles, pad) && visiblyInside(box, width, height)) return { cx, cy };
    return null;
  }
  let x = cx;
  let y = cy;
  const stepX = width * 0.02;
  const stepY = height * 0.02;
  for (let i = 0; i < 28; i++) {
    const box = worldBox(x, y, rel);
    if (!hitsText(box, obstacles, pad) && visiblyInside(box, width, height)) return { cx: x, cy: y };
    if (slot.edge === 'bottom') y += stepY;
    else if (slot.edge === 'left') x -= stepX;
    else x += stepX;
    if (i === 8 || i === 16) {
      if (slot.edge === 'left' || slot.edge === 'right') y += stepY * 4;
      else x += (slot.along < 0.5 ? -1 : 1) * stepX * 4;
    }
  }
  return null;
}

function resolveBunnyPlacement(
  look: BunnyLook,
  width: number,
  height: number,
  obstacles: readonly TextRect[]
) {
  const local = bunnyLocalBounds(look);
  const pad = width * 0.02;
  const order = [look.slot, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const slotIndex of order) {
    const slot = BUNNY_SLOTS[slotIndex % BUNNY_SLOTS.length]!;
    let scale = look.scale * slot.scaleMul * (width / 1080);
    for (let shrink = 0; shrink < 6; shrink++) {
      const rel = rotatedRelBounds(local, scale, look.rotation);
      const anchored = anchorBunny(slot, rel, width, height);
      const cleared = separateFromText(slot, anchored.cx, anchored.cy, rel, obstacles, width, height, pad);
      if (cleared) return { ...cleared, scale, local };
      scale *= 0.9;
    }
  }
  const scale = 1.15 * (width / 1080);
  const rel = rotatedRelBounds(local, scale, look.rotation);
  const slot = BUNNY_SLOTS[0]!;
  const anchored = anchorBunny(slot, rel, width, height);
  let y = anchored.cy;
  for (let i = 0; i < 20; i++) {
    const box = worldBox(anchored.cx, y, rel);
    if (!hitsText(box, obstacles, pad)) break;
    y += height * 0.025;
  }
  return { cx: anchored.cx, cy: y, scale, local };
}

/**
 * Original bunny. White head, pink inner ears and cheeks, dark outline.
 * Position, size, rotation, ears, expression, and an optional accessory
 * come from the seed. The sticker peeks in from a frame edge and is kept
 * clear of the cover header and title.
 */
function paintBunny(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  obstacles: readonly TextRect[]
) {
  const look = bunnyLookFromSeed(seed);
  const placed = resolveBunnyPlacement(look, width, height, obstacles);
  const originX = (placed.local.minX + placed.local.maxX) / 2;
  const originY = (placed.local.minY + placed.local.maxY) / 2;
  ctx.save();
  ctx.translate(placed.cx, placed.cy);
  ctx.rotate(look.rotation);
  ctx.scale(look.flip ? -placed.scale : placed.scale, placed.scale);
  ctx.translate(-originX, -originY);
  drawBunny(ctx, look);
  ctx.restore();
}

function drawBunny(ctx: CanvasRenderingContext2D, look: BunnyLook) {
  const outline = BUNNY_OUTLINE;
  const stroke = BUNNY_STROKE;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const ear = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, look.earW, look.earH, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = stroke;
    ctx.strokeStyle = outline;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, look.earH * 0.12, look.earW * 0.44, look.earH * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = look.earColor;
    ctx.fill();
    ctx.restore();
  };
  ear(118, 78, look.earTiltL);
  ear(196, 70, look.earTiltR);

  if (look.accessory === 'bow') drawBow(ctx, 214, 8, look.earColor, outline);
  if (look.accessory === 'flower') drawFlower(ctx, 78, 36, look.earColor, outline);

  ctx.beginPath();
  ctx.ellipse(168, 196, 118, 108, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = stroke;
  ctx.strokeStyle = outline;
  ctx.stroke();

  const cheekRx = look.accessory === 'blush' ? 32 : 24;
  const cheekRy = look.accessory === 'blush' ? 20 : 16;
  ctx.fillStyle = look.cheekColor;
  ctx.beginPath();
  ctx.ellipse(96, 210, cheekRx, cheekRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(238, 206, cheekRx, cheekRy, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, look, outline);
  if (look.accessory === 'glasses') drawGlasses(ctx, outline);

  ctx.fillStyle = look.noseColor;
  ctx.beginPath();
  ctx.ellipse(168, 214, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  drawMouth(ctx, look, outline);

  ctx.beginPath();
  ctx.ellipse(250, 268, 32, 24, 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = stroke;
  ctx.strokeStyle = outline;
  ctx.stroke();
}

function drawEyes(ctx: CanvasRenderingContext2D, look: BunnyLook, outline: string) {
  const left = { x: 128, y: 184 };
  const right = { x: 206, y: 180 };
  const pupil = (x: number, y: number, rx: number, ry: number) => {
    ctx.fillStyle = '#2A1A17';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + 3, y - 4, Math.max(2.5, rx * 0.34), 0, Math.PI * 2);
    ctx.fill();
  };
  if (look.eye === 'happy') {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(left.x, left.y + 6, 14, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(right.x, right.y + 6, 14, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    return;
  }
  if (look.eye === 'wink') {
    pupil(right.x, right.y, 9, 12);
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(left.x, left.y + 6, 14, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    return;
  }
  const rx = look.eye === 'round' ? 11 : look.eye === 'wide' ? 13 : 9;
  const ry = look.eye === 'round' ? 11 : look.eye === 'wide' ? 16 : 12;
  pupil(left.x, left.y, rx, ry);
  pupil(right.x, right.y, rx, ry);
}

function drawMouth(ctx: CanvasRenderingContext2D, look: BunnyLook, outline: string) {
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  if (look.mouth === 'o') {
    ctx.ellipse(168, 234, 10, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  if (look.mouth === 'flat') {
    ctx.moveTo(152, 232);
    ctx.lineTo(184, 232);
    ctx.stroke();
    return;
  }
  if (look.mouth === 'cat') {
    ctx.moveTo(148, 228);
    ctx.quadraticCurveTo(158, 242, 168, 228);
    ctx.quadraticCurveTo(178, 242, 188, 228);
    ctx.stroke();
    return;
  }
  ctx.moveTo(152, 230);
  ctx.quadraticCurveTo(168, look.mouth === 'tongue' ? 246 : 244, 184, 230);
  ctx.stroke();
  if (look.mouth === 'tongue') {
    ctx.beginPath();
    ctx.ellipse(168, 242, 8, 10, 0, 0, Math.PI);
    ctx.fillStyle = '#F08BB0';
    ctx.fill();
  }
}

function drawGlasses(ctx: CanvasRenderingContext2D, outline: string) {
  ctx.strokeStyle = outline;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(128, 184, 24, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(206, 180, 24, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(152, 182);
  ctx.lineTo(182, 178);
  ctx.stroke();
}

function drawBow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  outline: string
) {
  ctx.fillStyle = color;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x - 16, y, 16, 11, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + 16, y, 16, 11, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  outline: string
) {
  ctx.fillStyle = color;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(angle) * 12, y + Math.sin(angle) * 12, 8, 11, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#FFE08A';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
