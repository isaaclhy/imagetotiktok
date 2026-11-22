import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/**
 * Flamingo cards slideshow (image template 31).
 * Measured from @flamingoappreels carousels: black frame, heavily rounded
 * coloured card with paper grain + soft edge vignette, black Libre Baskerville
 * type, and a small lowercase sans brand at the bottom.
 *
 * Cover: centred title.
 * Questions: left-aligned. Options render as A) B) C) when present.
 * Cover + five questions. The last question closes with template 2's App Store
 * promo — there is no extra empty CTA tab.
 */
export const IMAGE_TEMPLATE31_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE31_SLIDE_COUNT = IMAGE_TEMPLATE31_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE31_CTA_TAB = IMAGE_TEMPLATE31_QUESTION_COUNT;

export const IMAGE_TEMPLATE31_FRAME_BG = '#000000';
export const IMAGE_TEMPLATE31_TEXT = '#111111';
export const IMAGE_TEMPLATE31_MARK = 'spill it';
/** Dense mid-grey noise — flamingo cards read as heavy film grain, not soft dust. */
export const IMAGE_TEMPLATE31_GRAIN_SRC = '/image-templates/template-31-grain.png';

/** Sampled from flamingoappreels rose + lavender posts. */
export const IMAGE_TEMPLATE31_COLORS = [
  '#C04963',
  '#B17FCA',
  '#BF4862',
  '#A67BC4',
  '#C45A72',
  '#9B6BB5',
] as const;

export const IMAGE_TEMPLATE31_DEFAULT_COLOR: string = IMAGE_TEMPLATE31_COLORS[0]!;

export const IMAGE_TEMPLATE31_SERIF_STACK =
  '"Libre Baskerville", Georgia, "Times New Roman", Times, serif';
export const IMAGE_TEMPLATE31_SANS_STACK =
  '"TikTok Sans", Helvetica, Arial, "Helvetica Neue", sans-serif';

/** Card inset from the black frame — tight so cover type can sit large. */
export const IMAGE_TEMPLATE31_CARD_INSET_X = 0.055;
export const IMAGE_TEMPLATE31_CARD_INSET_Y = 0.048;
/** Corner radius as a share of frame width — large squircle like the IG posts. */
export const IMAGE_TEMPLATE31_CARD_RADIUS_RATIO = 0.155;
export const IMAGE_TEMPLATE31_EDGE_SCALE = 1.012;
export const IMAGE_TEMPLATE31_EDGE_BLUR_RATIO = 0.018;
/** Overlay pass strength — high enough that grain stays visible on cover colour. */
export const IMAGE_TEMPLATE31_GRAIN_ALPHA = 0.55;
/** Second multiply pass for the darker speckles flamingo cards show. */
export const IMAGE_TEMPLATE31_GRAIN_MULTIPLY_ALPHA = 0.42;
export const IMAGE_TEMPLATE31_GRAIN_SCALE = 0.85;

/** Cover titles are large — flamingo wraps a short hook across ~2 wide lines. */
const COVER_SIZE = 0.07;
const COVER_MIN_SIZE = 0.05;
const COVER_LEADING = 1.16;
const COVER_WIDTH = 0.9;
const COVER_CENTER_Y = 0.44;

const QUESTION_SIZE = 0.048;
const QUESTION_MIN_SIZE = 0.034;
const QUESTION_LEADING = 1.28;
const QUESTION_WIDTH = 0.78;
/** Open questions sit in the upper half, matching the no-options reference. */
const QUESTION_TOP = 0.22;
const QUESTION_CENTER_Y = 0.42;

const OPTION_SIZE = 0.042;
const OPTION_LEADING = 1.5;
const OPTION_GAP_EM = 0.7;

const MARK_SIZE = 0.026;
const MARK_Y = 0.9;
const CTA_TEXT_CENTER = 0.34;
const CTA_MAX_HEIGHT = 0.42;

export function isImageTemplate31Id(templateId: number | null | undefined): boolean {
  return templateId === 31;
}

export function pickTemplate31Color(exclude?: string): string {
  const pool = IMAGE_TEMPLATE31_COLORS.filter((color) => color !== exclude);
  const choices = pool.length > 0 ? pool : [...IMAGE_TEMPLATE31_COLORS];
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return choices[buf[0]! % choices.length]!;
}

export function template31CardRect(frameWidth: number, frameHeight: number): {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
} {
  const x = frameWidth * IMAGE_TEMPLATE31_CARD_INSET_X;
  const y = frameHeight * IMAGE_TEMPLATE31_CARD_INSET_Y;
  return {
    x,
    y,
    width: frameWidth - x * 2,
    height: frameHeight - y * 2,
    radius: Math.min(
      frameWidth * IMAGE_TEMPLATE31_CARD_RADIUS_RATIO,
      (frameWidth - x * 2) / 2,
      (frameHeight - y * 2) / 2
    ),
  };
}

export async function loadTemplate31Fonts(): Promise<void> {
  const loads = [
    document.fonts.load(`400 72px "Libre Baskerville"`),
    document.fonts.load(`400 48px "TikTok Sans"`),
    document.fonts.load(`700 40px "TikTok Sans"`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function traceRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
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

function wrapPreservingBreaks(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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

/** Flamingo options use "A) …" rather than "a. …". */
function formatFlamingoOptions(optionBlock: string): string {
  return optionBlock
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => {
      const match = line.trim().match(/^([a-z0-9])[.)]\s*([\s\S]*)$/i);
      if (!match) return line;
      return `${match[1]!.toUpperCase()}) ${match[2]!.trim()}`;
    })
    .join('\n');
}

function splitQuestion(text: string): { question: string; options: string } {
  const split = splitCopycatQuestionAndOptions(text);
  if (split.options.trim()) {
    return { question: split.question, options: formatFlamingoOptions(split.options) };
  }
  const lines = text.replace(/\r/g, '').split('\n');
  const index = lines.findIndex((line) => /^\s*[a-d][.)]\s+\S/i.test(line));
  if (index <= 0) return { question: text.trim(), options: '' };
  return {
    question: lines.slice(0, index).join('\n').trim(),
    options: formatFlamingoOptions(lines.slice(index).join('\n')),
  };
}

function paintCardFill(
  ctx: CanvasRenderingContext2D,
  card: { x: number; y: number; width: number; height: number; radius: number },
  color: string,
  grain?: CanvasImageSource | null
) {
  ctx.save();
  traceRoundRect(ctx, card.x, card.y, card.width, card.height, card.radius);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(card.x, card.y, card.width, card.height);

  // Soft edge vignette — centre stays brighter, rim darkens like the IG cards.
  const cx = card.x + card.width / 2;
  const cy = card.y + card.height / 2;
  const radius = Math.hypot(card.width, card.height) * 0.58;
  const vignette = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.72, 'rgba(0,0,0,0.04)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = vignette;
  ctx.fillRect(card.x, card.y, card.width, card.height);

  if (grain) {
    const pattern = ctx.createPattern(grain, 'repeat');
    if (pattern) {
      if ('setTransform' in pattern && typeof DOMMatrix !== 'undefined') {
        const matrix = new DOMMatrix().scale(IMAGE_TEMPLATE31_GRAIN_SCALE);
        pattern.setTransform(matrix);
      }
      // Overlay lifts contrast so the film grain reads on lavender and rose.
      ctx.globalAlpha = IMAGE_TEMPLATE31_GRAIN_ALPHA;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = pattern;
      ctx.fillRect(card.x, card.y, card.width, card.height);
      // Multiply darkens the speckles so the field looks paper-rough, not soft.
      ctx.globalAlpha = IMAGE_TEMPLATE31_GRAIN_MULTIPLY_ALPHA;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(card.x, card.y, card.width, card.height);
    }
  }
  ctx.restore();
}

function blurAxis(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  horizontal: boolean
): void {
  const diameter = radius * 2 + 1;
  if (horizontal) {
    for (let y = 0; y < height; y++) {
      const row = y * width * 4;
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let sa = 0;
      for (let k = -radius; k <= radius; k++) {
        const i = row + Math.min(width - 1, Math.max(0, k)) * 4;
        sr += src[i]!;
        sg += src[i + 1]!;
        sb += src[i + 2]!;
        sa += src[i + 3]!;
      }
      for (let x = 0; x < width; x++) {
        const out = row + x * 4;
        dst[out] = sr / diameter;
        dst[out + 1] = sg / diameter;
        dst[out + 2] = sb / diameter;
        dst[out + 3] = sa / diameter;
        const leave = row + Math.min(width - 1, Math.max(0, x - radius)) * 4;
        const enter = row + Math.min(width - 1, Math.max(0, x + radius + 1)) * 4;
        sr += src[enter]! - src[leave]!;
        sg += src[enter + 1]! - src[leave + 1]!;
        sb += src[enter + 2]! - src[leave + 2]!;
        sa += src[enter + 3]! - src[leave + 3]!;
      }
    }
    return;
  }
  for (let x = 0; x < width; x++) {
    let sr = 0;
    let sg = 0;
    let sb = 0;
    let sa = 0;
    for (let k = -radius; k <= radius; k++) {
      const i = (Math.min(height - 1, Math.max(0, k)) * width + x) * 4;
      sr += src[i]!;
      sg += src[i + 1]!;
      sb += src[i + 2]!;
      sa += src[i + 3]!;
    }
    for (let y = 0; y < height; y++) {
      const out = (y * width + x) * 4;
      dst[out] = sr / diameter;
      dst[out + 1] = sg / diameter;
      dst[out + 2] = sb / diameter;
      dst[out + 3] = sa / diameter;
      const leave = (Math.min(height - 1, Math.max(0, y - radius)) * width + x) * 4;
      const enter = (Math.min(height - 1, Math.max(0, y + radius + 1)) * width + x) * 4;
      sr += src[enter]! - src[leave]!;
      sg += src[enter + 1]! - src[leave + 1]!;
      sb += src[enter + 2]! - src[leave + 2]!;
      sa += src[enter + 3]! - src[leave + 3]!;
    }
  }
}

function premultiply(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]! / 255;
    data[i] = data[i]! * a;
    data[i + 1] = data[i + 1]! * a;
    data[i + 2] = data[i + 2]! * a;
  }
}

function unpremultiply(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!;
    if (a === 0) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      continue;
    }
    data[i] = (data[i]! * 255) / a;
    data[i + 1] = (data[i + 1]! * 255) / a;
    data[i + 2] = (data[i + 2]! * 255) / a;
  }
}

function blurCanvas(canvas: HTMLCanvasElement, radius: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || radius < 1) return;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tmp = new Uint8ClampedArray(image.data.length);
  premultiply(image.data);
  blurAxis(image.data, tmp, canvas.width, canvas.height, radius, true);
  blurAxis(tmp, image.data, canvas.width, canvas.height, radius, false);
  blurAxis(image.data, tmp, canvas.width, canvas.height, radius, true);
  blurAxis(tmp, image.data, canvas.width, canvas.height, radius, false);
  unpremultiply(image.data);
  ctx.putImageData(image, 0, 0);
}

function paintSoftCard(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  card: { x: number; y: number; width: number; height: number; radius: number },
  color: string,
  grain?: CanvasImageSource | null
) {
  const radius = Math.max(10, Math.round(frameWidth * IMAGE_TEMPLATE31_EDGE_BLUR_RATIO));
  const pad = radius * 3;
  const cx = card.x + card.width / 2;
  const cy = card.y + card.height / 2;
  const scaledW = card.width * IMAGE_TEMPLATE31_EDGE_SCALE;
  const scaledH = card.height * IMAGE_TEMPLATE31_EDGE_SCALE;
  const layerW = Math.ceil(scaledW) + pad * 2;
  const layerH = Math.ceil(scaledH) + pad * 2;
  const originX = cx - scaledW / 2 - pad;
  const originY = cy - scaledH / 2 - pad;
  const layer =
    typeof document !== 'undefined'
      ? document.createElement('canvas')
      : (null as unknown as HTMLCanvasElement);
  if (layer) {
    layer.width = layerW;
    layer.height = layerH;
    const layerCtx = layer.getContext('2d');
    if (layerCtx) {
      layerCtx.translate(cx - originX, cy - originY);
      layerCtx.scale(IMAGE_TEMPLATE31_EDGE_SCALE, IMAGE_TEMPLATE31_EDGE_SCALE);
      layerCtx.translate(-cx, -cy);
      paintCardFill(layerCtx, card, color, null);
      blurCanvas(layer, radius);
      // Keep the soft rim dark and thin — flamingo cards don't bloom a coloured halo.
      ctx.globalAlpha = 0.28;
      ctx.drawImage(layer, originX, originY);
      ctx.globalAlpha = 1;
    }
  }
  paintCardFill(ctx, card, color, grain);
}

function paintMark(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  card: { y: number; height: number },
  sansFamily: string
) {
  const size = Math.round(frameWidth * MARK_SIZE);
  ctx.font = `400 ${size}px ${sansFamily}`;
  setLetterSpacing(ctx, '0.4px');
  ctx.fillStyle = IMAGE_TEMPLATE31_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE31_MARK, frameWidth / 2, card.y + card.height * MARK_Y);
  setLetterSpacing(ctx, '0px');
}

export function paintTemplate31Slide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCover?: boolean;
    isCta?: boolean;
    color?: string;
    grain?: CanvasImageSource | null;
    promo?: CanvasImageSource | null;
    serifFamily?: string;
    sansFamily?: string;
  }
): void {
  const color = options.color ?? IMAGE_TEMPLATE31_DEFAULT_COLOR;
  const serif = options.serifFamily ?? IMAGE_TEMPLATE31_SERIF_STACK;
  const sans = options.sansFamily ?? IMAGE_TEMPLATE31_SANS_STACK;
  const isCover = options.isCover ?? options.tabIndex === 0;
  const isCta = Boolean(options.isCta);

  const card = template31CardRect(frameWidth, frameHeight);
  ctx.fillStyle = IMAGE_TEMPLATE31_FRAME_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  paintSoftCard(ctx, frameWidth, frameHeight, card, color, options.grain);

  const raw = options.text.trim();
  const { question, options: optionText } = isCover
    ? { question: raw, options: '' }
    : splitQuestion(raw);
  const hasOptions = optionText.trim().length > 0;
  const maxWidth = card.width * (isCover ? COVER_WIDTH : QUESTION_WIDTH);

  let fontSize = Math.round(frameWidth * (isCover ? COVER_SIZE : QUESTION_SIZE));
  const minSize = Math.round(frameWidth * (isCover ? COVER_MIN_SIZE : QUESTION_MIN_SIZE));
  const optionSize = Math.round(frameWidth * OPTION_SIZE);
  const leading = isCover ? COVER_LEADING : QUESTION_LEADING;
  const maxBlockH = isCta
    ? card.height * CTA_MAX_HEIGHT
    : isCover
      ? card.height * 0.55
      : card.height * 0.7;

  ctx.font = `400 ${fontSize}px ${serif}`;
  setLetterSpacing(ctx, '0px');
  let questionLines = wrapPreservingBreaks(ctx, question, maxWidth);
  let questionLineH = fontSize * leading;
  ctx.font = `400 ${optionSize}px ${serif}`;
  const optionLines = hasOptions ? wrapPreservingBreaks(ctx, optionText, maxWidth) : [];
  const optionLineH = optionSize * OPTION_LEADING;
  const optionGap = optionLines.length ? fontSize * OPTION_GAP_EM : 0;
  let blockH =
    questionLines.length * questionLineH + optionGap + optionLines.length * optionLineH;

  while (fontSize > minSize && (blockH > maxBlockH || (isCover && questionLines.length > 5))) {
    fontSize -= 1;
    ctx.font = `400 ${fontSize}px ${serif}`;
    questionLines = wrapPreservingBreaks(ctx, question, maxWidth);
    questionLineH = fontSize * leading;
    blockH =
      questionLines.length * questionLineH + optionGap + optionLines.length * optionLineH;
  }

  const alignLeft = !isCover;
  ctx.fillStyle = IMAGE_TEMPLATE31_TEXT;
  ctx.textAlign = alignLeft ? 'left' : 'center';
  ctx.textBaseline = 'middle';

  const textX = alignLeft ? card.x + card.width * 0.11 : frameWidth / 2;
  let startY: number;
  if (isCta) {
    startY = card.y + card.height * CTA_TEXT_CENTER - blockH / 2 + questionLineH / 2;
  } else if (isCover) {
    startY = card.y + card.height * COVER_CENTER_Y - blockH / 2 + questionLineH / 2;
  } else if (hasOptions) {
    startY = card.y + card.height * QUESTION_TOP + questionLineH / 2;
  } else {
    startY = card.y + card.height * QUESTION_CENTER_Y - blockH / 2 + questionLineH / 2;
  }

  let y = startY;
  ctx.font = `400 ${fontSize}px ${serif}`;
  for (const line of questionLines) {
    ctx.fillText(line, textX, y);
    y += questionLineH;
  }
  if (optionLines.length) {
    y += optionGap - questionLineH / 2 + optionLineH / 2;
    ctx.font = `400 ${optionSize}px ${serif}`;
    for (const line of optionLines) {
      ctx.fillText(line, textX, y);
      y += optionLineH;
    }
  }

  if (isCta && options.promo) {
    const labelSize = Math.round(frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const contentBottom = startY + blockH / 2;
    const layout = imageTemplate2Q5PromoLayout(
      frameWidth,
      frameHeight,
      contentBottom + labelSize + labelGap
    );
    ctx.drawImage(options.promo, layout.x, layout.y, layout.width, layout.height);
    ctx.font = `700 ${labelSize}px ${sans}`;
    ctx.fillStyle = IMAGE_TEMPLATE31_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, frameWidth / 2, layout.y - labelGap);
    return;
  }

  paintMark(ctx, frameWidth, card, sans);
}
