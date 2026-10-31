import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/**
 * Red rounded card slideshow (image template 22).
 * Moved out of image template 18's "Red rounded card" style. The paint is the
 * same path that style used: a red rounded rectangle on a dark maroon frame,
 * no scanlines, no vignette, no fringe.
 *
 * Cover + five questions. Q5 is the last question and closes with template 2's
 * App Store promo — there is no extra empty CTA tab. Questions come from the
 * same question bank as template 18.
 */
export const IMAGE_TEMPLATE22_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE22_SLIDE_COUNT = IMAGE_TEMPLATE22_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE22_CTA_TAB = IMAGE_TEMPLATE22_QUESTION_COUNT;
export const IMAGE_TEMPLATE22_COVER_SRC = '/image-templates/template-22-cover.png';

export const IMAGE_TEMPLATE22_CARD = '#740605';
export const IMAGE_TEMPLATE22_FRAME_INNER = '#2B1615';
export const IMAGE_TEMPLATE22_FRAME_OUTER = '#1C0706';
export const IMAGE_TEMPLATE22_TEXT = '#F3DBDC';
export const IMAGE_TEMPLATE22_FONT_STACK =
  '"Liberation Serif", "Times New Roman", Times, serif';
export const IMAGE_TEMPLATE22_SANS_STACK = '"Poppins", "TikTok Sans", system-ui, sans-serif';
export const IMAGE_TEMPLATE22_FONT_WEIGHT = 400;
export const IMAGE_TEMPLATE22_LINE_HEIGHT = 1.42;
export const IMAGE_TEMPLATE22_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE22_FOOTER_Y = 0.852;
export const IMAGE_TEMPLATE22_FOOTER_SIZE = 0.034;

/** Cover titles sit just below the middle of the frame. */
export const IMAGE_TEMPLATE22_COVER_CENTER = 0.508;
/** Questions sit a little lower, matching the rounded red posts. */
export const IMAGE_TEMPLATE22_QUESTION_CENTER = 0.538;
export const IMAGE_TEMPLATE22_COVER_SIZE = 0.05;
export const IMAGE_TEMPLATE22_QUESTION_SIZE = 0.044;
export const IMAGE_TEMPLATE22_CTA_SIZE = 0.042;

export function isImageTemplate22Id(templateId: number | null | undefined): boolean {
  return templateId === 22;
}

export type Template22Card = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  radius: number;
};

/**
 * Nearly-square corners (~1.8% of width) inset from a maroon frame.
 * Same box the template 18 red-rounded style used.
 */
export function template22Card(width: number, height: number): Template22Card {
  const insetX = width * 0.055;
  const insetY = height * 0.045;
  return {
    left: insetX,
    right: width - insetX,
    top: insetY,
    bottom: height - insetY,
    radius: width * 0.018,
  };
}

export function template22PromoLayout(
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } {
  const card = template22Card(width, height);
  const innerW = card.right - card.left;
  const innerH = card.bottom - card.top;
  const layout = imageTemplate2Q5PromoLayout(innerW, innerH, 0);
  return {
    x: card.left + layout.x,
    y: card.top + layout.y,
    width: layout.width,
    height: layout.height,
  };
}

export type Template22Kind = 'cover' | 'question' | 'cta';

export function template22Kind(tabIndex: number, isCta: boolean): Template22Kind {
  if (tabIndex <= 0) return 'cover';
  if (isCta) return 'cta';
  return 'question';
}

type Template22Band = {
  top: number;
  bottom: number;
  maxWidth: number;
  preferred: number;
  min: number;
};

function template22TextCenter(kind: Template22Kind): number | null {
  if (kind === 'cta') return null;
  return kind === 'cover' ? IMAGE_TEMPLATE22_COVER_CENTER : IMAGE_TEMPLATE22_QUESTION_CENTER;
}

function template22TextBand(width: number, height: number, kind: Template22Kind): Template22Band {
  const card = template22Card(width, height);
  const maxWidth = (card.right - card.left) * 0.74;
  if (kind !== 'cta') {
    const center = (template22TextCenter(kind) ?? 0.47) * height;
    const half = height * 0.22;
    return {
      top: center - half,
      bottom: center + half,
      maxWidth,
      preferred: kind === 'cover' ? IMAGE_TEMPLATE22_COVER_SIZE : IMAGE_TEMPLATE22_QUESTION_SIZE,
      min: 0.02,
    };
  }
  const promo = template22PromoLayout(width, height);
  const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
  const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
  return {
    top: card.top + height * 0.07,
    bottom: promo.y - labelGap - labelSize - height * 0.02,
    maxWidth,
    preferred: IMAGE_TEMPLATE22_CTA_SIZE,
    min: 0.026,
  };
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

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.replace(/\r/g, '').split('\n');
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
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
  }
  return lines;
}

export type Template22TextLayout = {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  top: number;
  maxWidth: number;
  fontWeight: number;
  align?: 'center' | 'left';
  x?: number;
  optionStart?: number;
  optionGap?: number;
};

/** Inset of a choice block from each side of the card, as a fraction of card width. */
const CHOICE_PAD = 0.08;
/** Extra air between the question and the first option, as a fraction of the font size. */
const CHOICE_GAP = 0.62;

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function layoutChoices(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  kind: Template22Kind,
  fontFamily: string
): Template22TextLayout {
  const { question, options } = splitCopycatQuestionAndOptions(text);
  const card = template22Card(width, height);
  const innerW = Math.max(1, card.right - card.left);
  const pad = innerW * CHOICE_PAD;
  const maxWidth = Math.max(1, innerW - pad * 2);
  const x = Math.round(card.left + pad);
  const fontWeight = IMAGE_TEMPLATE22_FONT_WEIGHT;
  const leading = IMAGE_TEMPLATE22_LINE_HEIGHT;
  let topLimit: number;
  let bottomLimit: number;
  let preferred: number;
  let minRatio: number;
  if (kind === 'cta') {
    const band = template22TextBand(width, height, 'cta');
    topLimit = band.top;
    bottomLimit = band.bottom;
    preferred = band.preferred;
    minRatio = band.min;
  } else {
    topLimit = card.top + height * 0.07;
    bottomLimit = height * 0.8;
    preferred = IMAGE_TEMPLATE22_QUESTION_SIZE;
    minRatio = 0.02;
  }
  const room = bottomLimit - topLimit;
  const maxSize = Math.max(1, Math.round(width * preferred));
  const minSize = Math.max(1, Math.round(width * minRatio));
  const empty: Template22TextLayout = {
    lines: [],
    fontSize: maxSize,
    lineHeight: maxSize * leading,
    top: topLimit,
    maxWidth,
    fontWeight,
    align: 'left',
    x,
    optionStart: -1,
    optionGap: 0,
  };
  if (!text.trim() || !(width > 0) || !(height > 0) || room <= 0) return empty;

  const optionSource = options
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const measure = (size: number) => {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    const questionLines = question.trim() ? wrapLines(ctx, question, maxWidth) : [];
    const optionLines = optionSource.flatMap((line) => wrapLines(ctx, line, maxWidth));
    const lineHeight = size * leading;
    const optionGap =
      questionLines.length > 0 && optionLines.length > 0 ? size * CHOICE_GAP : 0;
    const block = questionLines.length * lineHeight + optionGap + optionLines.length * lineHeight;
    return { questionLines, optionLines, lineHeight, optionGap, block };
  };

  let chosenSize = minSize;
  let chosen = measure(minSize);
  let lo = minSize;
  let hi = maxSize;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const next = measure(mid);
    if (
      (next.questionLines.length > 0 || next.optionLines.length > 0) &&
      next.block <= room + 0.5
    ) {
      chosenSize = mid;
      chosen = next;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const lines = [...chosen.questionLines, ...chosen.optionLines];
  const block = chosen.block;
  let top = topLimit + Math.max(0, (room - block) / 2);
  const center = template22TextCenter(kind);
  if (center != null) {
    const ideal = center * height - block / 2;
    const maxTop = Math.max(topLimit, bottomLimit - block);
    top = Math.min(maxTop, Math.max(topLimit, ideal));
  }

  return {
    lines,
    fontSize: chosenSize,
    lineHeight: chosen.lineHeight,
    top,
    maxWidth,
    fontWeight,
    align: 'left',
    x,
    optionStart: chosen.optionLines.length > 0 ? chosen.questionLines.length : -1,
    optionGap: chosen.optionGap,
  };
}

function layoutText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  kind: Template22Kind,
  fontFamily: string
): Template22TextLayout {
  const band = template22TextBand(width, height, kind);
  const fontWeight = IMAGE_TEMPLATE22_FONT_WEIGHT;
  const leading = IMAGE_TEMPLATE22_LINE_HEIGHT;
  const empty: Template22TextLayout = {
    lines: [],
    fontSize: Math.round(width * band.preferred),
    lineHeight: Math.round(width * band.preferred) * leading,
    top: band.top,
    maxWidth: band.maxWidth,
    fontWeight,
  };
  const source = text.trim();
  if (!source || !(width > 0) || !(height > 0) || band.bottom <= band.top) return empty;

  const maxSize = Math.max(1, Math.round(width * band.preferred));
  const minSize = Math.max(1, Math.round(width * band.min));
  const room = band.bottom - band.top;
  let chosenSize = minSize;
  let chosenLines: string[] = [];

  const measure = (size: number) => {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    const lines = wrapLines(ctx, source, band.maxWidth);
    const block = lines.length * size * leading;
    return { lines, block };
  };

  let lo = minSize;
  let hi = maxSize;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const { lines, block } = measure(mid);
    if (lines.length > 0 && block <= room + 0.5) {
      chosenSize = mid;
      chosenLines = lines;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (chosenLines.length === 0) {
    const fitted = measure(minSize);
    chosenLines = fitted.lines;
    chosenSize = minSize;
  }

  const lineHeight = chosenSize * leading;
  const block = chosenLines.length * lineHeight;
  const top = band.top + Math.max(0, (room - block) / 2);
  return {
    lines: chosenLines,
    fontSize: chosenSize,
    lineHeight,
    top,
    maxWidth: band.maxWidth,
    fontWeight,
  };
}

function traceCard(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const card = template22Card(width, height);
  const w = card.right - card.left;
  const h = card.bottom - card.top;
  ctx.roundRect(card.left, card.top, w, h, card.radius);
}

let grainTile: CanvasImageSource | null = null;

function grainTileSource(): CanvasImageSource | null {
  if (grainTile) return grainTile;
  const doc = (globalThis as { document?: { createElement: (tag: string) => HTMLCanvasElement } })
    .document;
  if (!doc) return null;
  const size = 180;
  const canvas = doc.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return null;
  const image = g.createImageData(size, size);
  let seed = 0x5e1d13;
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const n = 112 + (seed & 31);
    data[i] = n;
    data[i + 1] = n;
    data[i + 2] = n;
    data[i + 3] = 255;
  }
  g.putImageData(image, 0, 0);
  grainTile = canvas;
  return grainTile;
}

function drawGrain(ctx: CanvasRenderingContext2D, width: number, height: number, alpha: number) {
  const tile = grainTileSource();
  if (!tile) return;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  const pattern = ctx.createPattern(tile, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

function drawSoftEdge(ctx: CanvasRenderingContext2D, card: Template22Card, width: number) {
  const w = card.right - card.left;
  const h = card.bottom - card.top;
  const steps = 22;
  const maxGrow = width * 0.04;
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const grow = t * maxGrow;
    const r = Math.round(116 * (1 - t) + 48 * t);
    const g = Math.round(6 * (1 - t) + 5 * t);
    const b = Math.round(5 * (1 - t) + 5 * t);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.roundRect(
      card.left - grow,
      card.top - grow,
      w + grow * 2,
      h + grow * 2,
      card.radius + grow * 0.35
    );
    ctx.fill();
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.2,
    width / 2,
    height / 2,
    Math.hypot(width, height) * 0.55
  );
  gradient.addColorStop(0, IMAGE_TEMPLATE22_FRAME_INNER);
  gradient.addColorStop(1, IMAGE_TEMPLATE22_FRAME_OUTER);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  drawSoftEdge(ctx, template22Card(width, height), width);
}

export function paintTemplate22Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    fontFamily?: string;
  }
): void {
  const isCta = options.isCta ?? options.tabIndex === IMAGE_TEMPLATE22_CTA_TAB;
  const kind = template22Kind(options.tabIndex, isCta);
  const bodyFont = options.fontFamily || IMAGE_TEMPLATE22_FONT_STACK;

  drawFrame(ctx, width, height);
  drawGrain(ctx, width, height, 0.2);

  ctx.save();
  ctx.beginPath();
  traceCard(ctx, width, height);
  ctx.clip();
  ctx.fillStyle = IMAGE_TEMPLATE22_CARD;
  ctx.fillRect(0, 0, width, height);
  drawGrain(ctx, width, height, 0.14);

  const hasChoices =
    kind !== 'cover' && splitCopycatQuestionAndOptions(options.text).options.trim().length > 0;
  const layout = hasChoices
    ? layoutChoices(ctx, width, height, options.text, kind, bodyFont)
    : layoutText(ctx, width, height, options.text, kind, bodyFont);
  if (layout.lines.length > 0) {
    ctx.fillStyle = IMAGE_TEMPLATE22_TEXT;
    ctx.font = `${layout.fontWeight} ${layout.fontSize}px ${bodyFont}`;
    setLetterSpacing(ctx, '0px');
    ctx.textBaseline = 'top';
    if (layout.align === 'left') {
      ctx.textAlign = 'left';
      let y = layout.top;
      const optionStart = layout.optionStart ?? -1;
      const optionGap = layout.optionGap ?? 0;
      layout.lines.forEach((line, index) => {
        if (index === optionStart) y += optionGap;
        ctx.fillText(line, layout.x ?? 0, y);
        y += layout.lineHeight;
      });
    } else {
      ctx.textAlign = 'center';
      let y = layout.top;
      layout.lines.forEach((line) => {
        ctx.fillText(line, width / 2, y);
        y += layout.lineHeight;
      });
    }
  }

  if (kind === 'cta' && options.promo) {
    const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const promo = template22PromoLayout(width, height);
    ctx.drawImage(options.promo, promo.x, promo.y, promo.width, promo.height);
    setLetterSpacing(ctx, '0px');
    ctx.font = `600 ${labelSize}px ${IMAGE_TEMPLATE22_SANS_STACK}`;
    ctx.fillStyle = IMAGE_TEMPLATE22_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, promo.y - labelGap);
    ctx.restore();
    return;
  }

  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = IMAGE_TEMPLATE22_TEXT;
  ctx.font = `600 ${Math.round(width * IMAGE_TEMPLATE22_FOOTER_SIZE)}px ${IMAGE_TEMPLATE22_SANS_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE22_FOOTER, width / 2, height * IMAGE_TEMPLATE22_FOOTER_Y);
  ctx.restore();
}
