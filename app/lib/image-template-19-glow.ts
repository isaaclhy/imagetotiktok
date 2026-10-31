import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/**
 * Red spotlight slideshow (image template 19), measured from the @trydeepen
 * "5 questions you should ask him" slides at 3:4.
 *
 * The red is one flat brick-red circle, centered, with diameter about the
 * slide width. It stays solid through most of the radius and feathers to
 * black over the outer band. It is not a bright-centered glow.
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

/** Gaussian-ish noise strength on the flat red, and the little that shows on black. */
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

function paintDisc(ctx: CanvasRenderingContext2D, frameWidth: number, frameHeight: number) {
  const cx = frameWidth / 2;
  const cy = frameHeight * IMAGE_TEMPLATE19_DISC_CY;
  const radius = frameWidth * IMAGE_TEMPLATE19_DISC_RADIUS;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  const tScale = IMAGE_TEMPLATE19_DISC_RADIUS / 0.5;
  for (const [t, [r, g, b]] of DISC_STOPS) {
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
    const sigma = GRAIN_SIGMA_BLACK + (r / 168) * (GRAIN_SIGMA - GRAIN_SIGMA_BLACK);
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
  }
) {
  const fontFamily = options.fontFamily ?? '"Times New Roman", Times, Georgia, serif';
  const labelFontFamily = options.labelFontFamily ?? IMAGE_TEMPLATE19_LABEL_FONT_STACK;
  ctx.letterSpacing = '0px';
  ctx.fillStyle = IMAGE_TEMPLATE19_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  paintDisc(ctx, frameWidth, frameHeight);
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
