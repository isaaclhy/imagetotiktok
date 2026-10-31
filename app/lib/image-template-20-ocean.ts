import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import { IMAGE_TEMPLATE2_Q5_PROMO_LABEL } from '@/app/lib/image-template-2-cover';

/**
 * Ocean slideshow (image template 20).
 *
 * Full-bleed deep teal, no card. Measured from the 2160×2880 reference slides
 * and scaled to the 1080×1440 export. The field is flat through the middle
 * and falls off in an ellipse that touches the middle of each edge, so the
 * corners go to a near-black blue. Fine grain sits on top of that field.
 *
 * Cover + five questions. The last question keeps its copy and closes with
 * template 2's App Store promo. There is no extra empty CTA tab.
 */
export const IMAGE_TEMPLATE20_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE20_SLIDE_COUNT = IMAGE_TEMPLATE20_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE20_CTA_TAB = IMAGE_TEMPLATE20_QUESTION_COUNT;
export const IMAGE_TEMPLATE20_COVER_SRC = '/image-templates/template-20-cover.jpg';

/** Cool off-white. Cover stroke interiors on the reference sit near rgb(218, 229, 237). */
export const IMAGE_TEMPLATE20_TEXT = '#DAE5ED';
export const IMAGE_TEMPLATE20_FONT_STACK =
  '"Liberation Serif", "Times New Roman", Times, serif';
export const IMAGE_TEMPLATE20_FOOTER_FONT_STACK =
  '"Poppins", "TikTok Sans", system-ui, sans-serif';
export const IMAGE_TEMPLATE20_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE20_CTA_LABEL = IMAGE_TEMPLATE2_Q5_PROMO_LABEL;

/**
 * Elliptical distance, 1 at the middle of each edge. Stops follow the
 * reference midline: flat through ~0.55, then a soft falloff to the frame.
 */
const FIELD: ReadonlyArray<readonly [number, readonly [number, number, number]]> = [
  [0, [8, 78, 118]],
  [0.55, [8, 78, 118]],
  [0.68, [6, 74, 112]],
  [0.75, [6, 70, 105]],
  [0.82, [6, 61, 92]],
  [0.88, [6, 52, 76]],
  [0.93, [6, 44, 66]],
  [0.97, [5, 36, 55]],
  [1, [4, 32, 46]],
  [1.2, [5, 26, 38]],
  [1.45, [6, 24, 35]],
];

/** Cover title, as a fraction of frame width. Matches the reference ink. */
export const IMAGE_TEMPLATE20_COVER_SIZE = 0.061;
export const IMAGE_TEMPLATE20_COVER_LEADING = 1.46;
export const IMAGE_TEMPLATE20_COVER_WIDTH = 0.7;
/** Vertical centre of the cover ink block. */
export const IMAGE_TEMPLATE20_COVER_CENTER = 0.55;

/** Question body. Left edge and ink top measured on the reference questions. */
export const IMAGE_TEMPLATE20_QUESTION_SIZE = 0.0426;
export const IMAGE_TEMPLATE20_QUESTION_LEADING = 1.57;
export const IMAGE_TEMPLATE20_OPTION_LEADING = 1.72;
export const IMAGE_TEMPLATE20_LEFT = 0.146;
export const IMAGE_TEMPLATE20_TEXT_WIDTH = 0.7;
export const IMAGE_TEMPLATE20_QUESTION_TOP = 0.322;
/** Extra air between the question and the first option, in ems. */
export const IMAGE_TEMPLATE20_OPTION_GAP = 1.02;

export const IMAGE_TEMPLATE20_FOOTER_SIZE = 0.0352;
export const IMAGE_TEMPLATE20_FOOTER_Y = 0.862;

export const IMAGE_TEMPLATE20_CTA_SIZE = 0.0555;
export const IMAGE_TEMPLATE20_PROMO_WIDTH = 0.64;
export const IMAGE_TEMPLATE20_PROMO_TOP = 0.448;
export const IMAGE_TEMPLATE20_CTA_GAP = 0.016;

const PROMO_ASPECT = 611 / 1024;

export function isImageTemplate20Id(templateId: number | null | undefined): boolean {
  return templateId === 20;
}

type Rgb = readonly [number, number, number];

function clampByte(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n | 0;
}

function fieldColor(t: number): Rgb {
  const stops = FIELD;
  if (t <= stops[0]![0]) return stops[0]![1];
  const last = stops[stops.length - 1]!;
  if (t >= last[0]) return last[1];
  for (let i = 1; i < stops.length; i++) {
    const next = stops[i]!;
    const prev = stops[i - 1]!;
    if (t > next[0]) continue;
    const span = next[0] - prev[0] || 1;
    const u = (t - prev[0]) / span;
    return [
      prev[1][0] + (next[1][0] - prev[1][0]) * u,
      prev[1][1] + (next[1][1] - prev[1][1]) * u,
      prev[1][2] + (next[1][2] - prev[1][2]) * u,
    ];
  }
  return last[1];
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
    const hx = width / 2;
    const hy = height / 2;
    for (let y = 0; y < height; y++) {
      // Vertical falloff is a little slower than the sides on the reference.
      const ny = ((y + 0.5 - hy) / hy) * 0.975;
      const ny2 = ny * ny;
      for (let x = 0; x < width; x++) {
        const nx = (x + 0.5 - hx) / hx;
        const t = Math.sqrt(nx * nx + ny2);
        const [r, g, b] = fieldColor(t);
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
  ctx.fillStyle = IMAGE_TEMPLATE20_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const box = ctx.measureText(IMAGE_TEMPLATE20_FOOTER);
  const ascent = box.actualBoundingBoxAscent || fontSize * 0.72;
  const descent = box.actualBoundingBoxDescent || fontSize * 0.2;
  const baseline = height * IMAGE_TEMPLATE20_FOOTER_Y + (ascent - descent) / 2;
  ctx.fillText(IMAGE_TEMPLATE20_FOOTER, width / 2, baseline);
}

function promoLayout(width: number, height: number, top: number) {
  const promoWidth = width * IMAGE_TEMPLATE20_PROMO_WIDTH;
  const promoHeight = promoWidth / PROMO_ASPECT;
  const x = (width - promoWidth) / 2;
  return { x, y: top, width: promoWidth, height: promoHeight };
}

function paintCta(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  promo: CanvasImageSource
) {
  const labelSize = Math.round(width * IMAGE_TEMPLATE20_CTA_SIZE);
  const gap = height * IMAGE_TEMPLATE20_CTA_GAP;
  let promoTop = height * IMAGE_TEMPLATE20_PROMO_TOP;
  const question = text.trim();
  if (question) {
    const fitted = fitQuestionAbove(
      ctx,
      width,
      height,
      question,
      fontFamily,
      promoTop - gap - labelSize * 1.15
    );
    paintQuestionLines(ctx, width, fitted);
    const blockBottom = fitted.bottom;
    const minTop = blockBottom + gap + labelSize + gap;
    if (minTop > promoTop) promoTop = minTop;
  }

  const layout = promoLayout(width, height, promoTop);
  ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);

  ctx.font = `700 ${labelSize}px ${fontFamily}`;
  ctx.fillStyle = IMAGE_TEMPLATE20_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const descent = inkDescent(ctx, 'Hgy');
  ctx.fillText(IMAGE_TEMPLATE20_CTA_LABEL, width / 2, layout.y - gap - descent);
}

type QuestionLayout = {
  fontSize: number;
  questionLines: string[];
  options: OptionLine[];
  questionLeading: number;
  optionLeading: number;
  firstBaseline: number;
  optionGap: number;
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
  const { question, options } = splitCopycatQuestionAndOptions(text);
  const parsed = parseOptions(options);
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  const questionLines = question.trim() ? wrapLines(ctx, question, maxWidth) : [];
  const questionLeading = fontSize * IMAGE_TEMPLATE20_QUESTION_LEADING;
  const optionLeading = fontSize * IMAGE_TEMPLATE20_OPTION_LEADING;
  const ascent = inkAscent(ctx);
  const descent = inkDescent(ctx);
  const optionGap = parsed.length && questionLines.length ? fontSize * IMAGE_TEMPLATE20_OPTION_GAP : 0;
  const firstBaseline = inkTop + ascent;
  const questionBlock = questionLines.length * questionLeading;
  const optionBlock = parsed.length * optionLeading;
  const bottom =
    firstBaseline -
    ascent +
    questionBlock +
    optionGap +
    optionBlock -
    (parsed.length ? optionLeading - descent - ascent : questionLeading - descent - ascent);
  return {
    fontSize,
    questionLines,
    options: parsed,
    questionLeading,
    optionLeading,
    firstBaseline,
    optionGap,
    x,
    maxWidth,
    bottom,
    fontFamily,
  };
}

function fitQuestionAbove(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  limit: number
): QuestionLayout {
  let fontSize = Math.round(width * IMAGE_TEMPLATE20_QUESTION_SIZE);
  const minSize = Math.round(width * 0.028);
  let inkTop = height * 0.1;
  let layout = layoutQuestion(ctx, width, height, text, fontFamily, fontSize, inkTop);
  while (layout.bottom > limit && fontSize > minSize) {
    fontSize -= 2;
    inkTop = height * 0.08;
    layout = layoutQuestion(ctx, width, height, text, fontFamily, fontSize, inkTop);
  }
  return layout;
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string
) {
  const fontSize = Math.round(width * IMAGE_TEMPLATE20_QUESTION_SIZE);
  const layout = layoutQuestion(
    ctx,
    width,
    height,
    text,
    fontFamily,
    fontSize,
    height * IMAGE_TEMPLATE20_QUESTION_TOP
  );
  paintQuestionLines(ctx, width, layout);
}

function paintQuestionLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  layout: QuestionLayout
) {
  void width;
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
      const wrapped = wrapLines(ctx, option.text, layout.maxWidth);
      for (const line of wrapped) {
        ctx.fillText(line, layout.x, y);
        y += layout.optionLeading;
      }
      continue;
    }
    const mark = `${option.letter}.`;
    ctx.font = `700 ${layout.fontSize}px ${layout.fontFamily}`;
    ctx.fillText(mark, layout.x, y);
    const markWidth = ctx.measureText(mark).width;
    ctx.font = `400 ${layout.fontSize}px ${layout.fontFamily}`;
    const space = ctx.measureText(' ').width;
    const textX = layout.x + markWidth + space;
    const avail = Math.max(1, layout.x + layout.maxWidth - textX);
    const wrapped = option.text.trim() ? wrapLines(ctx, option.text, avail) : [''];
    wrapped.forEach((line, index) => {
      ctx.font = `400 ${layout.fontSize}px ${layout.fontFamily}`;
      ctx.fillText(line, index === 0 ? textX : textX, y);
      y += layout.optionLeading;
    });
  }
}
