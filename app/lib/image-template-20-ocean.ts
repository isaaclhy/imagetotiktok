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
 * Ocean slideshow (image template 20).
 *
 * Full-bleed deep teal, no card. Measured from the reference slides at
 * 1080×1440. The field stays a flat #064B74 through the middle and only
 * darkens in the outer band (about the outer 15% of the width, a little
 * tighter on the top and bottom). Corners settle near #041620. Fine grain
 * sits on top of that field. There is no central hotspot.
 *
 * Cover + five questions. The last question keeps its copy and closes with
 * template 2's App Store promo: the "Download for more questions!" heading
 * and the same cropped phone (only the top is on screen; the rest runs off
 * the bottom, same width and position). There is no extra CTA-only slide.
 */
export const IMAGE_TEMPLATE20_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE20_SLIDE_COUNT = IMAGE_TEMPLATE20_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE20_CTA_TAB = IMAGE_TEMPLATE20_QUESTION_COUNT;
export const IMAGE_TEMPLATE20_COVER_SRC = '/image-templates/template-20-cover.jpg';

/**
 * Question and option ink. Brightest reference pixels sit near rgb(204, 206, 222):
 * a soft grey with a cool lavender cast, not pure white.
 */
export const IMAGE_TEMPLATE20_TEXT = '#CCCEDE';
/** Bold cover and CTA headline. Stroke interiors measure about rgb(218, 228, 235). */
export const IMAGE_TEMPLATE20_COVER_TEXT = '#DAE4EB';
/** Footer. Stroke interiors measure about rgb(167, 192, 207), dimmer than the body. */
export const IMAGE_TEMPLATE20_FOOTER_TEXT = '#A7C0CF';
export const IMAGE_TEMPLATE20_FONT_STACK =
  '"Liberation Serif", "Times New Roman", Times, serif';
export const IMAGE_TEMPLATE20_FOOTER_FONT_STACK =
  '"Poppins", "TikTok Sans", system-ui, sans-serif';
export const IMAGE_TEMPLATE20_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE20_CTA_LABEL = IMAGE_TEMPLATE2_Q5_PROMO_LABEL;

/** Median of the flat inner field on the reference slides. */
const FIELD_FLAT: Rgb = [6, 75, 116];
/** Side edges. The top and bottom stay a touch lighter than the left and right. */
const FIELD_EDGE_X: Rgb = [5, 35, 53];
const FIELD_EDGE_Y: Rgb = [5, 37, 55];
/** Darkest corner. Sits near #00172A. */
const FIELD_CORNER: Rgb = [4, 22, 32];

/**
 * How far the edge darkening reaches, as a fraction of that side.
 * 1 at the outer pixel, 0 once the field is flat. Horizontal is done by
 * ~17% of the width; vertical is tighter, done by ~13% of the height.
 */
const SHADE_X: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0.02, 0.85],
  [0.042, 0.675],
  [0.062, 0.5],
  [0.083, 0.35],
  [0.104, 0.2],
  [0.125, 0.125],
  [0.145, 0.05],
  [0.167, 0],
];
const SHADE_Y: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0.021, 0.789],
  [0.042, 0.553],
  [0.062, 0.342],
  [0.083, 0.158],
  [0.104, 0.079],
  [0.125, 0],
];

/** Cover title, as a fraction of frame width. Matches the reference ink. */
export const IMAGE_TEMPLATE20_COVER_SIZE = 0.061;
export const IMAGE_TEMPLATE20_COVER_LEADING = 1.46;
export const IMAGE_TEMPLATE20_COVER_WIDTH = 0.7;
/** Vertical centre of the cover ink block. The title sits in the middle of the slide. */
export const IMAGE_TEMPLATE20_COVER_CENTER = 0.5;

/**
 * Question body, as a fraction of frame width. Larger than the reference
 * measurement so a short question fills the slide and stays easy to read.
 * Long questions shrink only when they would hit the footer or the promo.
 */
export const IMAGE_TEMPLATE20_QUESTION_SIZE = 0.059;
export const IMAGE_TEMPLATE20_QUESTION_LEADING = 1.57;
export const IMAGE_TEMPLATE20_OPTION_LEADING = 1.72;
export const IMAGE_TEMPLATE20_LEFT = 0.146;
export const IMAGE_TEMPLATE20_TEXT_WIDTH = 0.7;
/** Visual centre of a question block that fits without being lifted. */
export const IMAGE_TEMPLATE20_QUESTION_CENTER = 0.46;
/** Extra air between the question and the first option, in ems. */
export const IMAGE_TEMPLATE20_OPTION_GAP = 1.02;
/**
 * Option words share one column. On the reference, "Roast me" / "Bring up my past"
 * / "Fake break up" / "Ignore me" all start 132px right of the letter at 2160
 * wide, which is 66px at the 1080 export.
 */
export const IMAGE_TEMPLATE20_OPTION_TAB = 66 / 1080;

export const IMAGE_TEMPLATE20_FOOTER_SIZE = 0.0352;
export const IMAGE_TEMPLATE20_FOOTER_Y = 0.862;

export function isImageTemplate20Id(templateId: number | null | undefined): boolean {
  return templateId === 20;
}

type Rgb = readonly [number, number, number];

function clampByte(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n | 0;
}

function shadeAt(stops: ReadonlyArray<readonly [number, number]>, distance: number): number {
  const first = stops[0]!;
  if (distance <= first[0]) return first[1];
  const last = stops[stops.length - 1]!;
  if (distance >= last[0]) return last[1];
  for (let i = 1; i < stops.length; i++) {
    const next = stops[i]!;
    const prev = stops[i - 1]!;
    if (distance > next[0]) continue;
    const span = next[0] - prev[0] || 1;
    const u = (distance - prev[0]) / span;
    return prev[1] + (next[1] - prev[1]) * u;
  }
  return last[1];
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Flat centre. Each edge darkens on its own, and the two stack in the corners. */
function fieldAt(shadeX: number, shadeY: number): Rgb {
  if (shadeX >= shadeY) return mixRgb(mixRgb(FIELD_FLAT, FIELD_EDGE_X, shadeX), FIELD_CORNER, shadeY);
  return mixRgb(mixRgb(FIELD_FLAT, FIELD_EDGE_Y, shadeY), FIELD_CORNER, shadeX);
}

function hash32(n: number): number {
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  return (n ^ (n >>> 16)) >>> 0;
}

/** Fine film grain, stronger on the bright field and quieter in the corners. */
function grainDelta(i: number, luma: number): number {
  const a = (hash32(i + 1) & 0xffff) / 65535;
  const b = (hash32(i + 0x9e3779b9) & 0xffff) / 65535;
  const c = (hash32(i + 0x85ebca6b) & 0xffff) / 65535;
  const unit = (a + b + c - 1.5) / 0.5;
  const sigma = 4.4 + (luma / 110) * 1.6;
  let delta = unit * sigma;
  if (a > 0.997 && luma > 60) delta += 16;
  return delta;
}

const backgroundCache = new Map<string, Uint8ClampedArray>();

function paintBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const key = `${width}x${height}`;
  let pixels = backgroundCache.get(key);
  if (!pixels) {
    pixels = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      const dy = Math.min(y + 0.5, height - (y + 0.5)) / height;
      const shadeY = shadeAt(SHADE_Y, dy);
      for (let x = 0; x < width; x++) {
        const dx = Math.min(x + 0.5, width - (x + 0.5)) / width;
        const [r, g, b] = fieldAt(shadeAt(SHADE_X, dx), shadeY);
        const luma = 0.2 * r + 0.7 * g + 0.1 * b;
        const delta = grainDelta(y * width + x, luma);
        const o = (y * width + x) * 4;
        pixels[o] = clampByte(r + delta);
        pixels[o + 1] = clampByte(g + delta);
        pixels[o + 2] = clampByte(b + delta);
        pixels[o + 3] = 255;
      }
    }
    backgroundCache.set(key, pixels);
  }
  const image = ctx.createImageData(width, height);
  image.data.set(pixels);
  ctx.putImageData(image, 0, 0);
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

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  balance = false
): string[] {
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (lines.length > 0) lines.push('');
      continue;
    }
    const wrapped: string[] = [];
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
          wrapped.push(current);
          current = chunk;
        }
      }
    }
    if (current) wrapped.push(current);
    lines.push(...(balance ? rebalanceShortLastLine(ctx, wrapped, maxWidth) : wrapped));
  }
  return lines;
}

/**
 * A one-word last line ("pack / something") reads as a mistake. Pull the
 * previous word down when that still fits, so the break lands between phrases.
 */
function rebalanceShortLastLine(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number
): string[] {
  if (lines.length < 2) return lines;
  const last = lines[lines.length - 1]!;
  if (!last || last.includes(' ')) return lines;
  if (ctx.measureText(last).width > maxWidth * 0.45) return lines;
  const prevWords = lines[lines.length - 2]!.split(' ');
  if (prevWords.length < 2) return lines;
  const moved = prevWords.pop()!;
  const candidateLast = `${moved} ${last}`;
  if (ctx.measureText(candidateLast).width > maxWidth) return lines;
  const next = lines.slice();
  next[next.length - 2] = prevWords.join(' ');
  next[next.length - 1] = candidateLast;
  return next;
}

function inkAscent(ctx: CanvasRenderingContext2D, sample = 'Hyg'): number {
  const box = ctx.measureText(sample);
  return box.actualBoundingBoxAscent || 0;
}

function inkDescent(ctx: CanvasRenderingContext2D, sample = 'Hyg'): number {
  const box = ctx.measureText(sample);
  return box.actualBoundingBoxDescent || 0;
}

type OptionLine = { letter: string; text: string };

function parseOptions(options: string): OptionLine[] {
  return options
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([A-Za-z0-9])\.\s*(.*)$/);
      if (!match) return { letter: '', text: line };
      return { letter: match[1]!.toUpperCase(), text: match[2] ?? '' };
    });
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  firstBaseline: number,
  leading: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let y = firstBaseline;
  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += leading;
  }
}

export function paintTemplate20Slide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    text: string;
    isCover?: boolean;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    fontFamily?: string;
    footerFontFamily?: string;
  }
) {
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE20_FONT_STACK;
  const footerFontFamily = options.footerFontFamily ?? IMAGE_TEMPLATE20_FOOTER_FONT_STACK;
  const isCover = Boolean(options.isCover) && !options.isCta;
  const isCta = Boolean(options.isCta);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  paintBackground(ctx, frameWidth, frameHeight);

  ctx.fillStyle = IMAGE_TEMPLATE20_TEXT;

  if (isCover) {
    paintCover(ctx, frameWidth, frameHeight, options.text, fontFamily);
    paintFooter(ctx, frameWidth, frameHeight, footerFontFamily);
    return;
  }

  if (isCta && options.promo) {
    paintCta(ctx, frameWidth, frameHeight, options.text, fontFamily, options.promo);
    return;
  }

  paintQuestion(ctx, frameWidth, frameHeight, options.text, fontFamily);
  paintFooter(ctx, frameWidth, frameHeight, footerFontFamily);
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string
) {
  const maxWidth = width * IMAGE_TEMPLATE20_COVER_WIDTH;
  let fontSize = Math.round(width * IMAGE_TEMPLATE20_COVER_SIZE);
  const minSize = Math.round(width * 0.04);
  let lines: string[] = [];
  let leading = fontSize * IMAGE_TEMPLATE20_COVER_LEADING;
  for (let step = 0; step < 24; step++) {
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    leading = fontSize * IMAGE_TEMPLATE20_COVER_LEADING;
    lines = wrapLines(ctx, text, maxWidth).filter((line) => line.length > 0);
    const block = Math.max(1, lines.length) * leading;
    if ((lines.length <= 4 && block <= height * 0.42) || fontSize <= minSize) break;
    fontSize = Math.max(minSize, fontSize - 2);
  }
  ctx.fillStyle = IMAGE_TEMPLATE20_COVER_TEXT;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  const ascent = inkAscent(ctx, 'H');
  const descent = inkDescent(ctx, 'Hgy');
  const blockInk =
    ascent + Math.max(0, lines.length - 1) * leading + descent;
  const inkTop = height * IMAGE_TEMPLATE20_COVER_CENTER - blockInk / 2;
  const firstBaseline = inkTop + ascent;
  drawCenteredLines(ctx, lines, width / 2, firstBaseline, leading);
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  footerFontFamily: string
) {
  const fontSize = Math.round(width * IMAGE_TEMPLATE20_FOOTER_SIZE);
  ctx.font = `600 ${fontSize}px ${footerFontFamily}`;
  ctx.fillStyle = IMAGE_TEMPLATE20_FOOTER_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const box = ctx.measureText(IMAGE_TEMPLATE20_FOOTER);
  const ascent = box.actualBoundingBoxAscent || fontSize * 0.72;
  const descent = box.actualBoundingBoxDescent || fontSize * 0.2;
  const baseline = height * IMAGE_TEMPLATE20_FOOTER_Y + (ascent - descent) / 2;
  ctx.fillText(IMAGE_TEMPLATE20_FOOTER, width / 2, baseline);
}

/**
 * Template 2's Q5 promo: a 90%-wide App Store mock whose top sits at 66% of
 * the frame (only the top of the phone stays on screen; the rest runs off
 * the bottom), with "Download for more questions!" just above it. A long
 * question pushes the mock down instead of covering the copy. The heading
 * stays in the ocean serif.
 */
function paintClosingPromo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  promo: CanvasImageSource,
  textBottom: number
) {
  const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
  const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
  const layout = imageTemplate2Q5PromoLayout(
    width,
    height,
    textBottom > 0 ? textBottom + labelSize + labelGap : 0
  );
  ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
  ctx.font = `700 ${labelSize}px ${fontFamily}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.fillStyle = IMAGE_TEMPLATE20_COVER_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(IMAGE_TEMPLATE20_CTA_LABEL, width / 2, layout.y - labelGap);
}

function paintCta(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  promo: CanvasImageSource
) {
  const resting = imageTemplate2Q5PromoLayout(width, height, 0);
  const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
  const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
  const ceiling =
    resting.y - labelGap - labelSize - height * IMAGE_TEMPLATE2_Q5_PROMO_TEXT_GAP_RATIO;
  const layout = text.trim()
    ? fitQuestion(ctx, width, height, text, fontFamily, ceiling)
    : null;
  if (layout) paintQuestionLines(ctx, layout);
  paintClosingPromo(ctx, width, height, fontFamily, promo, layout ? layout.bottom : 0);
}

type QuestionLayout = {
  fontSize: number;
  questionLines: string[];
  options: OptionLine[];
  questionLeading: number;
  optionLeading: number;
  firstBaseline: number;
  optionGap: number;
  optionInset: number;
  x: number;
  maxWidth: number;
  bottom: number;
  fontFamily: string;
};

function layoutQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  fontSize: number,
  inkTop: number
): QuestionLayout {
  const x = width * IMAGE_TEMPLATE20_LEFT;
  const maxWidth = width * IMAGE_TEMPLATE20_TEXT_WIDTH;
  const optionInset = measureOptionInset(ctx, fontSize, fontFamily, width);
  const { question, options } = splitCopycatQuestionAndOptions(text);
  const parsed = parseOptions(options);
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const questionLines = question.trim() ? wrapLines(ctx, question, maxWidth, true) : [];
  const questionLeading = fontSize * IMAGE_TEMPLATE20_QUESTION_LEADING;
  const optionLeading = fontSize * IMAGE_TEMPLATE20_OPTION_LEADING;
  const ascent = inkAscent(ctx);
  const descent = inkDescent(ctx);
  let optionLines = 0;
  for (const option of parsed) {
    optionLines += countOptionLines(
      ctx,
      option,
      fontSize,
      fontFamily,
      maxWidth,
      optionInset
    );
  }
  const optionGap = optionLines && questionLines.length ? fontSize * IMAGE_TEMPLATE20_OPTION_GAP : 0;
  const firstBaseline = inkTop + ascent;
  let endBaseline = firstBaseline;
  if (optionLines) {
    endBaseline =
      firstBaseline +
      questionLines.length * questionLeading +
      optionGap +
      (optionLines - 1) * optionLeading;
  } else if (questionLines.length) {
    endBaseline = firstBaseline + (questionLines.length - 1) * questionLeading;
  }
  const bottom = endBaseline + descent;
  return {
    fontSize,
    questionLines,
    options: parsed,
    questionLeading,
    optionLeading,
    firstBaseline,
    optionGap,
    optionInset,
    x,
    maxWidth,
    bottom,
    fontFamily,
  };
}

/** Room after the letter so "A." never collides with the option, even at the larger size. */
function measureOptionInset(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  fontFamily: string,
  frameWidth: number
): number {
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  const mark = ctx.measureText('M.').width;
  const gap = fontSize * 0.36;
  return Math.max(frameWidth * IMAGE_TEMPLATE20_OPTION_TAB, mark + gap);
}

function countOptionLines(
  ctx: CanvasRenderingContext2D,
  option: OptionLine,
  fontSize: number,
  fontFamily: string,
  maxWidth: number,
  optionInset: number
): number {
  if (!option.letter) {
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    return Math.max(1, wrapLines(ctx, option.text, maxWidth, true).length);
  }
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const avail = Math.max(1, maxWidth - optionInset);
  const wrapped = option.text.trim() ? wrapLines(ctx, option.text, avail, true) : [''];
  return Math.max(1, wrapped.length);
}

/**
 * Place the question at the target size, centred on the slide. Shrink only
 * when the block would cross the footer (or the promo ceiling). A closing
 * slide lifts the block so the cropped phone can stay at template 2's
 * resting position.
 */
function fitQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  ceiling: number | null
): QuestionLayout {
  const topFloor = height * (ceiling == null ? 0.08 : 0.05);
  const footerSize = width * IMAGE_TEMPLATE20_FOOTER_SIZE;
  const footerTop = height * IMAGE_TEMPLATE20_FOOTER_Y - footerSize * 0.85;
  const bottomLimit = ceiling ?? footerTop - height * 0.028;
  let fontSize = Math.round(width * IMAGE_TEMPLATE20_QUESTION_SIZE);
  const minSize = Math.round(width * (ceiling == null ? 0.036 : 0.03));

  const blockAt = (size: number) =>
    layoutQuestion(ctx, width, height, text, fontFamily, size, 0).bottom;

  let block = blockAt(fontSize);
  const room = Math.max(1, bottomLimit - topFloor);
  while (fontSize > minSize && block > room) {
    fontSize -= 2;
    block = blockAt(fontSize);
  }

  let inkTop = height * IMAGE_TEMPLATE20_QUESTION_CENTER - block / 2;
  if (inkTop < topFloor) inkTop = topFloor;
  if (inkTop + block > bottomLimit) inkTop = Math.max(topFloor, bottomLimit - block);
  return layoutQuestion(ctx, width, height, text, fontFamily, fontSize, inkTop);
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string
) {
  const layout = fitQuestion(ctx, width, height, text, fontFamily, null);
  paintQuestionLines(ctx, layout);
}

function paintQuestionLines(ctx: CanvasRenderingContext2D, layout: QuestionLayout) {
  ctx.fillStyle = IMAGE_TEMPLATE20_TEXT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 ${layout.fontSize}px ${layout.fontFamily}`;
  let y = layout.firstBaseline;
  for (const line of layout.questionLines) {
    ctx.fillText(line, layout.x, y);
    y += layout.questionLeading;
  }
  if (!layout.options.length) return;
  y += layout.optionGap;
  for (const option of layout.options) {
    if (!option.letter) {
      ctx.font = `400 ${layout.fontSize}px ${layout.fontFamily}`;
      const wrapped = wrapLines(ctx, option.text, layout.maxWidth, true);
      for (const line of wrapped) {
        ctx.fillText(line, layout.x, y);
        y += layout.optionLeading;
      }
      continue;
    }
    const mark = `${option.letter}.`;
    ctx.font = `700 ${layout.fontSize}px ${layout.fontFamily}`;
    ctx.fillText(mark, layout.x, y);
    const textX = layout.x + layout.optionInset;
    ctx.font = `400 ${layout.fontSize}px ${layout.fontFamily}`;
    const avail = Math.max(1, layout.x + layout.maxWidth - textX);
    const wrapped = option.text.trim() ? wrapLines(ctx, option.text, avail, true) : [''];
    wrapped.forEach((line, index) => {
      ctx.font = `400 ${layout.fontSize}px ${layout.fontFamily}`;
      ctx.fillText(line, index === 0 ? textX : textX, y);
      y += layout.optionLeading;
    });
  }
}
