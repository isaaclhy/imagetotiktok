import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/**
 * Spotlight slideshow (image template 19), measured from the @trydeepen
 * "5 questions you should ask him" slides at 3:4.
 *
 * One flat disc, centered, with diameter about the slide width. It stays
 * solid through most of the radius and feathers to black over the outer
 * band. It is not a bright-centered glow. Red is the measured reference;
 * the other colours are that same ramp with the hue replaced.
 */
export const IMAGE_TEMPLATE19_BG = '#000000';
export const IMAGE_TEMPLATE19_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE19_LABEL = IMAGE_TEMPLATE2_APP_FOOTER;
/** Mid grey on black, about half white, matching the reference footer. */
export const IMAGE_TEMPLATE19_LABEL_COLOR = '#8F8F8F';
export const IMAGE_TEMPLATE19_FONT_STACK =
  '"Times New Roman", Times, "Liberation Serif", Georgia, serif';
export const IMAGE_TEMPLATE19_LABEL_FONT_STACK =
  '"TikTok Sans", system-ui, -apple-system, sans-serif';

/** Circle centre, as a fraction of the frame height. */
export const IMAGE_TEMPLATE19_DISC_CY = 0.5;
/**
 * Gradient radius as a fraction of frame width. 0.52 puts the last stop
 * just past the left and right edges, so the feather dies at the frame.
 */
export const IMAGE_TEMPLATE19_DISC_RADIUS = 0.52;

/** Cover titles are larger than question body, matching the reference slides. */
export const IMAGE_TEMPLATE19_COVER_TEXT_SIZE = 0.084;
export const IMAGE_TEMPLATE19_TEXT_SIZE = 0.06;
/**
 * CTA copy is a hair smaller so "changed the way you view love?" stays on
 * one line inside the same measure that keeps "so “Me”?" on its own line.
 */
export const IMAGE_TEMPLATE19_CTA_TEXT_SIZE = 0.056;
/** Cover measure stays narrow so "5 questions" / "you should ask him" breaks like the reference. */
export const IMAGE_TEMPLATE19_COVER_TEXT_WIDTH = 0.74;
/**
 * Just under the width of "What's something I do that's so", so that phrase
 * breaks before "so" the way the reference question does.
 */
export const IMAGE_TEMPLATE19_TEXT_WIDTH = 0.745;
export const IMAGE_TEMPLATE19_TEXT_Y = 0.5;
export const IMAGE_TEMPLATE19_LINE_HEIGHT = 1.22;
export const IMAGE_TEMPLATE19_LABEL_Y = 0.928;
export const IMAGE_TEMPLATE19_LABEL_SIZE = 0.034;
export const IMAGE_TEMPLATE19_CTA_TEXT_Y = 0.36;

/** Cover plus five questions. The last question is the CTA. No extra tab. */
export const IMAGE_TEMPLATE19_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE19_SLIDE_COUNT = IMAGE_TEMPLATE19_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE19_CTA_TAB = IMAGE_TEMPLATE19_QUESTION_COUNT;

export const IMAGE_TEMPLATE19_COLORS = [
  'red',
  'royal-blue',
  'emerald',
  'purple',
  'orange',
  'hot-pink',
  'teal',
  'gold',
] as const;

export type Template19ColorId = (typeof IMAGE_TEMPLATE19_COLORS)[number];
/** Dropdown value. Shuffle is one concrete colour for the whole slideshow. */
export type Template19ColorOptionId = Template19ColorId | 'shuffle';

export const IMAGE_TEMPLATE19_COLOR_OPTIONS: ReadonlyArray<{
  id: Template19ColorOptionId;
  label: string;
}> = [
  { id: 'red', label: 'Red' },
  { id: 'royal-blue', label: 'Royal blue' },
  { id: 'emerald', label: 'Emerald green' },
  { id: 'purple', label: 'Purple' },
  { id: 'orange', label: 'Orange' },
  { id: 'hot-pink', label: 'Hot pink' },
  { id: 'teal', label: 'Teal' },
  { id: 'gold', label: 'Gold/amber' },
  { id: 'shuffle', label: 'Shuffle' },
];

export const IMAGE_TEMPLATE19_DEFAULT_COLOR: Template19ColorOptionId = 'red';

export function isImageTemplate19Id(templateId: number | null | undefined): boolean {
  return templateId === 19;
}

export function isTemplate19ColorId(value: string): value is Template19ColorId {
  return (IMAGE_TEMPLATE19_COLORS as readonly string[]).includes(value);
}

export function isTemplate19ColorOptionId(value: string): value is Template19ColorOptionId {
  return value === 'shuffle' || isTemplate19ColorId(value);
}

/** One colour for a shuffled slideshow. The same id is painted on every slide. */
export function pickTemplate19ShuffleColor(random: () => number = Math.random): Template19ColorId {
  const index = Math.floor(random() * IMAGE_TEMPLATE19_COLORS.length);
  return IMAGE_TEMPLATE19_COLORS[index] ?? 'red';
}

export function resolveTemplate19PaintColor(
  option: Template19ColorOptionId | null | undefined,
  shuffled: Template19ColorId = 'red'
): Template19ColorId {
  if (option === 'shuffle') return isTemplate19ColorId(shuffled) ? shuffled : 'red';
  if (option && isTemplate19ColorId(option)) return option;
  return 'red';
}

export function template19ColorLabel(color: Template19ColorId): string {
  return IMAGE_TEMPLATE19_COLOR_OPTIONS.find((option) => option.id === color)?.label ?? 'Red';
}

export function template19ColourLabel(color: Template19ColorId): string {
  return `Colour: ${template19ColorLabel(color)}`;
}

/** Another preset, skipping `current` when another preset exists. */
export function pickDifferentTemplate19Color(
  current: Template19ColorId,
  random: () => number = Math.random
): Template19ColorId {
  const pool = IMAGE_TEMPLATE19_COLORS.filter((color) => color !== current);
  const source = pool.length > 0 ? pool : IMAGE_TEMPLATE19_COLORS;
  const index = Math.floor(random() * source.length);
  return source[index] ?? 'red';
}

/**
 * Colour along the radius, in units of half the frame width (1 = the side edges).
 * Sampled from the reference disc, then lifted a few points in the feather so
 * the painted mean matches the photographed red.
 */
const DISC_STOPS: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
  [0, [168, 41, 38]],
  [0.58, [167, 40, 37]],
  [0.64, [166, 41, 38]],
  [0.68, [161, 40, 36]],
  [0.72, [152, 37, 35]],
  [0.76, [134, 33, 30]],
  [0.8, [112, 27, 25]],
  [0.84, [86, 21, 19]],
  [0.88, [59, 14, 13]],
  [0.92, [35, 9, 8]],
  [0.96, [18, 4, 3]],
  [1.04, [0, 0, 0]],
];

type DiscRgb = readonly [number, number, number];

/**
 * OKLCH hue for each preset, degrees. The red ramp's lightness and chroma
 * are kept and only the hue changes, so every disc is the same flat shape.
 * Chroma is pulled back only where sRGB cannot hold the brick red's chroma
 * at that hue (emerald, orange, teal, gold). Those stay at the red's
 * lightness, which keeps them dark enough for the white type.
 */
const TEMPLATE19_COLOR_HUE: Record<Exclude<Template19ColorId, 'red'>, number> = {
  'royal-blue': 264,
  emerald: 146,
  purple: 316,
  orange: 48,
  'hot-pink': 348,
  teal: 188,
  gold: 82,
};

function srgbChannelToLinear(channel: number): number {
  const x = channel / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function linearChannelToSrgb(channel: number): number {
  const x = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, x * 255)));
}

function linearToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToLinear(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function linearInGamut(rgb: { r: number; g: number; b: number }): boolean {
  return rgb.r >= -1e-4 && rgb.g >= -1e-4 && rgb.b >= -1e-4 && rgb.r <= 1 + 1e-4 && rgb.g <= 1 + 1e-4 && rgb.b <= 1 + 1e-4;
}

/** Same OKLCH lightness as `rgb`, hue replaced. Chroma shrinks only to fit sRGB. */
function hueShiftRgb(rgb: DiscRgb, hueDeg: number): DiscRgb {
  if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) return [0, 0, 0];
  const lab = linearToOklab(
    srgbChannelToLinear(rgb[0]),
    srgbChannelToLinear(rgb[1]),
    srgbChannelToLinear(rgb[2])
  );
  const chroma = Math.hypot(lab.a, lab.b);
  const rad = (hueDeg * Math.PI) / 180;
  let lo = 0;
  let hi = chroma;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const linear = oklabToLinear(lab.L, mid * Math.cos(rad), mid * Math.sin(rad));
    if (linearInGamut(linear)) lo = mid;
    else hi = mid;
  }
  const linear = oklabToLinear(lab.L, lo * Math.cos(rad), lo * Math.sin(rad));
  return [
    linearChannelToSrgb(linear.r),
    linearChannelToSrgb(linear.g),
    linearChannelToSrgb(linear.b),
  ];
}

function hueShiftedDiscStops(hueDeg: number): ReadonlyArray<readonly [number, DiscRgb]> {
  return DISC_STOPS.map(([t, rgb]) => [t, hueShiftRgb(rgb, hueDeg)] as const);
}

const DISC_STOPS_BY_COLOR: Record<Template19ColorId, ReadonlyArray<readonly [number, DiscRgb]>> = {
  red: DISC_STOPS,
  'royal-blue': hueShiftedDiscStops(TEMPLATE19_COLOR_HUE['royal-blue']),
  emerald: hueShiftedDiscStops(TEMPLATE19_COLOR_HUE.emerald),
  purple: hueShiftedDiscStops(TEMPLATE19_COLOR_HUE.purple),
  orange: hueShiftedDiscStops(TEMPLATE19_COLOR_HUE.orange),
  'hot-pink': hueShiftedDiscStops(TEMPLATE19_COLOR_HUE['hot-pink']),
  teal: hueShiftedDiscStops(TEMPLATE19_COLOR_HUE.teal),
  gold: hueShiftedDiscStops(TEMPLATE19_COLOR_HUE.gold),
};

function discStopsFor(color: Template19ColorId | undefined): ReadonlyArray<readonly [number, DiscRgb]> {
  if (color && color in DISC_STOPS_BY_COLOR) return DISC_STOPS_BY_COLOR[color];
  return DISC_STOPS;
}

/** Gaussian-ish noise strength on the flat disc, and the little that shows on black. */
const GRAIN_SIGMA = 17;
const GRAIN_SIGMA_BLACK = 2.5;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (lines.length > 0) lines.push('');
      continue;
    }
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
  }
  return lines;
}

/**
 * The reference cover breaks as a short first line and a longer second line
 * ("5 questions" / "you should ask him"). Greedy wrapping does the opposite.
 * When a slide is exactly two lines, move words down while the second line
 * still fits and stays at least as wide as the first.
 */
function preferLongerSecondLine(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number
): string[] {
  if (lines.length !== 2 || !lines[0] || !lines[1]) return lines;
  const words1 = lines[0].split(' ');
  const words2 = lines[1].split(' ');
  while (words1.length > 1) {
    const moved = words1[words1.length - 1]!;
    const next1 = words1.slice(0, -1).join(' ');
    const next2 = `${moved} ${words2.join(' ')}`;
    if (ctx.measureText(next2).width > maxWidth) break;
    if (ctx.measureText(next2).width < ctx.measureText(next1).width) break;
    words1.pop();
    words2.unshift(moved);
  }
  return [words1.join(' '), words2.join(' ')];
}

function paintDisc(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  color: Template19ColorId | undefined
) {
  const cx = frameWidth / 2;
  const cy = frameHeight * IMAGE_TEMPLATE19_DISC_CY;
  const radius = frameWidth * IMAGE_TEMPLATE19_DISC_RADIUS;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  const tScale = IMAGE_TEMPLATE19_DISC_RADIUS / 0.5;
  for (const [t, [r, g, b]] of discStopsFor(color)) {
    const stop = Math.min(1, t / tScale);
    glow.addColorStop(stop, `rgb(${r}, ${g}, ${b})`);
  }
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
}

function hash32(n: number): number {
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  return (n ^ (n >>> 16)) >>> 0;
}

/** Unit-ish noise from three uniform hashes. Std is about 1. */
function grainUnit(i: number): number {
  const a = (hash32(i + 1) & 0xffff) / 65535;
  const b = (hash32(i + 0x9e3779b9) & 0xffff) / 65535;
  const c = (hash32(i + 0x85ebca6b) & 0xffff) / 65535;
  return (a + b + c - 1.5) / 0.5;
}

function paintGrain(ctx: CanvasRenderingContext2D, frameWidth: number, frameHeight: number) {
  const image = ctx.getImageData(0, 0, frameWidth, frameHeight);
  const data = image.data;
  const pixels = frameWidth * frameHeight;
  for (let i = 0; i < pixels; i++) {
    const o = i * 4;
    const r = data[o]!;
    const peak = Math.max(r, data[o + 1]!, data[o + 2]!);
    const sigma = GRAIN_SIGMA_BLACK + (peak / 168) * (GRAIN_SIGMA - GRAIN_SIGMA_BLACK);
    const delta = grainUnit(i) * sigma;
    data[o] = Math.max(0, Math.min(255, r + delta));
    data[o + 1] = Math.max(0, Math.min(255, data[o + 1]! + delta));
    data[o + 2] = Math.max(0, Math.min(255, data[o + 2]! + delta));
  }
  ctx.putImageData(image, 0, 0);
}

export function paintTemplate19Slide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    text: string;
    fontFamily?: string;
    labelFontFamily?: string;
    isCover?: boolean;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    /** Concrete disc colour. Defaults to the measured red. */
    color?: Template19ColorId;
  }
) {
  const fontFamily = options.fontFamily ?? '"Times New Roman", Times, Georgia, serif';
  const labelFontFamily = options.labelFontFamily ?? IMAGE_TEMPLATE19_LABEL_FONT_STACK;
  ctx.letterSpacing = '0px';
  ctx.fillStyle = IMAGE_TEMPLATE19_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  paintDisc(ctx, frameWidth, frameHeight, options.color);
  paintGrain(ctx, frameWidth, frameHeight);

  const showPromo = Boolean(options.isCta && options.promo);
  const isCover = Boolean(options.isCover) && !options.isCta;
  const maxW =
    frameWidth * (isCover ? IMAGE_TEMPLATE19_COVER_TEXT_WIDTH : IMAGE_TEMPLATE19_TEXT_WIDTH);
  const maxBlock = frameHeight * (options.isCta ? 0.26 : 0.38);
  const textY = options.isCta ? IMAGE_TEMPLATE19_CTA_TEXT_Y : IMAGE_TEMPLATE19_TEXT_Y;
  const startRatio = isCover
    ? IMAGE_TEMPLATE19_COVER_TEXT_SIZE
    : options.isCta
      ? IMAGE_TEMPLATE19_CTA_TEXT_SIZE
      : IMAGE_TEMPLATE19_TEXT_SIZE;
  let fontSize = Math.round(frameWidth * startRatio);
  const minSize = Math.round(frameWidth * 0.042);
  let lines: string[] = [];
  let lineH = fontSize * IMAGE_TEMPLATE19_LINE_HEIGHT;

  for (let step = 0; step < 20; step++) {
    lineH = fontSize * IMAGE_TEMPLATE19_LINE_HEIGHT;
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    lines = preferLongerSecondLine(ctx, wrapLines(ctx, options.text, maxW), maxW);
    const fits = lines.length <= 3 && lines.length * lineH <= maxBlock;
    if (fits || fontSize <= minSize) break;
    fontSize = Math.max(minSize, fontSize - 2);
  }

  ctx.fillStyle = IMAGE_TEMPLATE19_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const blockH = lines.length * lineH;
  let y = frameHeight * textY - blockH / 2 + lineH / 2;
  for (const line of lines) {
    ctx.fillText(line, frameWidth / 2, y);
    y += lineH;
  }

  if (showPromo && options.promo) {
    const labelSize = Math.round(frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(
      frameWidth,
      frameHeight,
      y + labelSize + labelGap
    );
    ctx.drawImage(options.promo, layout.x, layout.y, layout.width, layout.height);
    ctx.font = `700 ${labelSize}px ${labelFontFamily}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, frameWidth / 2, layout.y - labelGap);
    return;
  }

  const labelSize = Math.round(frameWidth * IMAGE_TEMPLATE19_LABEL_SIZE);
  ctx.fillStyle = IMAGE_TEMPLATE19_LABEL_COLOR;
  ctx.font = `600 ${labelSize}px ${labelFontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE19_LABEL, frameWidth / 2, frameHeight * IMAGE_TEMPLATE19_LABEL_Y);
}
