import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_TAB_INDEX,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/** Flat card colors sampled from the reference slides, plus a few in the same family. */
export const IMAGE_TEMPLATE14_COLORS = [
  '#B97BCE',
  '#D13B61',
  '#E3943A',
  '#C45C8A',
  '#6FA3C4',
  '#D4A24A',
  '#9B1B30',
  '#0B1C3A',
] as const;

export const IMAGE_TEMPLATE14_TEXT = '#1A1A1A';
export const IMAGE_TEMPLATE14_TEXT_ON_DARK = '#FFFFFF';
/** Area outside the rounded card. */
export const IMAGE_TEMPLATE14_FRAME_BG = '#000000';
/** Card inset from the frame, as a share of width and height. */
export const IMAGE_TEMPLATE14_CARD_INSET_X = 0.085;
export const IMAGE_TEMPLATE14_CARD_INSET_Y = 0.07;
/** Corner radius as a share of the frame width. */
export const IMAGE_TEMPLATE14_CARD_RADIUS_RATIO = 0.12;
/** Soft rim sits just outside the sharp card. */
export const IMAGE_TEMPLATE14_EDGE_SCALE = 1.012;
/** Feather on the card silhouette only, as a share of frame width. */
export const IMAGE_TEMPLATE14_EDGE_BLUR_RATIO = 0.014;
export const IMAGE_TEMPLATE14_MARK = 'spill it';
export const IMAGE_TEMPLATE14_GRAIN_SRC = '/image-templates/template-14-grain.png';
export const IMAGE_TEMPLATE14_SLIDE_COUNT = 6;
export const IMAGE_TEMPLATE14_FONT_STACK =
  '"Libre Baskerville", Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE14_COVER_SIZE_RATIO = 0.072;
export const IMAGE_TEMPLATE14_QUESTION_SIZE_RATIO = 0.062;
export const IMAGE_TEMPLATE14_QUESTION_MIN_SIZE_RATIO = 0.04;
export const IMAGE_TEMPLATE14_OPTION_SIZE_RATIO = 0.044;
export const IMAGE_TEMPLATE14_OPTION_GAP = 0.45;
/** Question + options start here on the card — eye level, not vertically centered. */
export const IMAGE_TEMPLATE14_OPTION_TOP_RATIO = 0.2;
/** Last-slide question sits in the upper half of the card, above the App Store promo. */
export const IMAGE_TEMPLATE14_CTA_TEXT_CENTER_RATIO = 0.36;
export const IMAGE_TEMPLATE14_CTA_TEXT_MAX_HEIGHT_RATIO = 0.46;
export const IMAGE_TEMPLATE14_MARK_SIZE_RATIO = 0.028;
export const IMAGE_TEMPLATE14_MARK_Y_RATIO = 0.88;
export const IMAGE_TEMPLATE14_TEXT_MAX_WIDTH_RATIO = 0.78;
export const IMAGE_TEMPLATE14_LINE_HEIGHT = 1.28;

/** Keep the usual question size; only pull the last-slide type down if it is very long. */
export function template14QuestionSizeRatio(text: string, isCta = false): number {
  if (!isCta) return IMAGE_TEMPLATE14_QUESTION_SIZE_RATIO;
  const chars = text.replace(/\s+/g, ' ').trim().length;
  if (chars > 160) return 0.05;
  if (chars > 110) return 0.054;
  return IMAGE_TEMPLATE14_QUESTION_SIZE_RATIO;
}

export function template14CardRect(frameWidth: number, frameHeight: number): {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
} {
  const x = frameWidth * IMAGE_TEMPLATE14_CARD_INSET_X;
  const y = frameHeight * IMAGE_TEMPLATE14_CARD_INSET_Y;
  return {
    x,
    y,
    width: frameWidth - x * 2,
    height: frameHeight - y * 2,
    radius: Math.min(
      frameWidth * IMAGE_TEMPLATE14_CARD_RADIUS_RATIO,
      (frameWidth - x * 2) / 2,
      (frameHeight - y * 2) / 2
    ),
  };
}

function traceRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/** Next card color, in order, skipping the one just used. */
export function nextTemplate14Color(current?: string): string {
  const index = IMAGE_TEMPLATE14_COLORS.findIndex(
    (color) => color.toLowerCase() === current?.trim().toLowerCase()
  );
  return IMAGE_TEMPLATE14_COLORS[(index + 1) % IMAGE_TEMPLATE14_COLORS.length]!;
}

function parseHexColor(color: string): { r: number; g: number; b: number } | null {
  const hex = color.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0]! + hex[0]!, 16),
      g: parseInt(hex[1]! + hex[1]!, 16),
      b: parseInt(hex[2]! + hex[2]!, 16),
    };
  }
  return null;
}

/** Dark cards (navy, ruby, etc.) use white type; lighter cards keep near-black. */
export function template14TextForBackground(backgroundColor: string): string {
  const rgb = parseHexColor(backgroundColor);
  if (!rgb) return IMAGE_TEMPLATE14_TEXT;
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance < 0.45 ? IMAGE_TEMPLATE14_TEXT_ON_DARK : IMAGE_TEMPLATE14_TEXT;
}

function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
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
  if (current) lines.push(current);
  return lines;
}

function wrapPreservingBreaks(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    lines.push(...wrapLine(ctx, paragraph, maxWidth));
  }
  return lines;
}

function paintCardFill(
  ctx: CanvasRenderingContext2D,
  card: { x: number; y: number; width: number; height: number; radius: number },
  color: string,
  grain?: CanvasImageSource
): void {
  ctx.save();
  traceRoundRect(ctx, card.x, card.y, card.width, card.height, card.radius);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillRect(card.x, card.y, card.width, card.height);
  if (grain) {
    ctx.globalAlpha = 0.85;
    ctx.globalCompositeOperation = 'multiply';
    const pattern = ctx.createPattern(grain, 'repeat');
    if (pattern) {
      const matrix = new DOMMatrix().scale(0.45);
      pattern.setTransform(matrix);
      ctx.fillStyle = pattern;
      ctx.fillRect(card.x, card.y, card.width, card.height);
    }
  }
  ctx.restore();
}

/** Soft rim under a sharp card face — matches the flamingo-style defocused corners. */
function paintSoftCard(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  card: { x: number; y: number; width: number; height: number; radius: number },
  color: string,
  grain?: CanvasImageSource
): void {
  const blurPx = Math.max(6, frameWidth * IMAGE_TEMPLATE14_EDGE_BLUR_RATIO);
  const layer = document.createElement('canvas');
  layer.width = frameWidth;
  layer.height = frameHeight;
  const layerCtx = layer.getContext('2d');
  if (layerCtx) {
    layerCtx.translate(frameWidth / 2, frameHeight / 2);
    layerCtx.scale(IMAGE_TEMPLATE14_EDGE_SCALE, IMAGE_TEMPLATE14_EDGE_SCALE);
    layerCtx.translate(-frameWidth / 2, -frameHeight / 2);
    paintCardFill(layerCtx, card, color);
    ctx.save();
    ctx.filter = `blur(${blurPx}px)`;
    ctx.drawImage(layer, 0, 0);
    ctx.filter = 'none';
    ctx.restore();
  }
  paintCardFill(ctx, card, color, grain);
}

/** Cover, question, or Q5 slide. Q5 draws Template 2's label and App Store image. */
export function paintTemplate14Slide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    backgroundColor: string;
    text: string;
    tabIndex: number;
    grain: CanvasImageSource;
    promo?: CanvasImageSource | null;
    leftAlign?: boolean;
    skipMark?: boolean;
  }
): void {
  const card = template14CardRect(frameWidth, frameHeight);
  ctx.fillStyle = IMAGE_TEMPLATE14_FRAME_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  paintSoftCard(ctx, frameWidth, frameHeight, card, options.backgroundColor, options.grain);

  const isCover = options.tabIndex === 0;
  const isQ5 = options.tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX;
  const textColor = template14TextForBackground(options.backgroundColor);
  const { question, options: optionText } = isCover
    ? { question: options.text, options: '' }
    : splitCopycatQuestionAndOptions(options.text);
  const maxWidth = card.width * IMAGE_TEMPLATE14_TEXT_MAX_WIDTH_RATIO;
  let fontSize = Math.round(
    frameWidth *
      (isCover
        ? IMAGE_TEMPLATE14_COVER_SIZE_RATIO
        : template14QuestionSizeRatio(question, isQ5))
  );
  const optionSize = Math.round(frameWidth * IMAGE_TEMPLATE14_OPTION_SIZE_RATIO);
  const minSize = Math.round(frameWidth * IMAGE_TEMPLATE14_QUESTION_MIN_SIZE_RATIO);
  const maxBlockH = isQ5
    ? card.height * IMAGE_TEMPLATE14_CTA_TEXT_MAX_HEIGHT_RATIO
    : card.height * 0.72;
  ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
  let questionLines = wrapPreservingBreaks(ctx, question, maxWidth);
  let questionLineH = fontSize * IMAGE_TEMPLATE14_LINE_HEIGHT;
  ctx.font = `400 ${optionSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
  const optionLines = optionText ? wrapPreservingBreaks(ctx, optionText, maxWidth) : [];
  const optionLineH = optionSize * IMAGE_TEMPLATE14_LINE_HEIGHT;
  const optionGap = optionLines.length ? fontSize * IMAGE_TEMPLATE14_OPTION_GAP : 0;
  let blockH =
    questionLines.length * questionLineH + optionGap + optionLines.length * optionLineH;
  while (fontSize > minSize && blockH > maxBlockH) {
    fontSize -= 1;
    ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
    questionLines = wrapPreservingBreaks(ctx, question, maxWidth);
    questionLineH = fontSize * IMAGE_TEMPLATE14_LINE_HEIGHT;
    blockH =
      questionLines.length * questionLineH + optionGap + optionLines.length * optionLineH;
  }
  const alignLeft = Boolean((options.leftAlign || optionLines.length > 0) && !isCover);
  ctx.fillStyle = textColor;
  ctx.textAlign = alignLeft ? 'left' : 'center';
  ctx.textBaseline = 'middle';
  const centerY =
    card.y + card.height * (isQ5 ? IMAGE_TEMPLATE14_CTA_TEXT_CENTER_RATIO : 0.5);
  const textX = alignLeft ? card.x + card.width * 0.11 : frameWidth / 2;
  let y =
    optionLines.length && !isCover
      ? card.y + card.height * IMAGE_TEMPLATE14_OPTION_TOP_RATIO + questionLineH / 2
      : centerY - blockH / 2 + questionLineH / 2;
  ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
  for (const line of questionLines) {
    ctx.fillText(line, textX, y);
    y += questionLineH;
  }
  if (optionLines.length) {
    y += optionGap - questionLineH / 2 + optionLineH / 2;
    ctx.font = `400 ${optionSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
    for (const line of optionLines) {
      ctx.fillText(line, textX, y);
      y += optionLineH;
    }
  }

  if (isQ5 && options.promo) {
    const labelSize = Math.round(frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(
      frameWidth,
      frameHeight,
      centerY + blockH / 2 + labelSize + labelGap
    );
    ctx.drawImage(options.promo, layout.x, layout.y, layout.width, layout.height);
    ctx.font = `700 ${labelSize}px "TikTok Sans", system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, frameWidth / 2, layout.y - labelGap);
    return;
  }

  if (options.skipMark) return;

  const markSize = Math.round(frameWidth * IMAGE_TEMPLATE14_MARK_SIZE_RATIO);
  ctx.font = `400 ${markSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    IMAGE_TEMPLATE14_MARK,
    frameWidth / 2,
    card.y + card.height * IMAGE_TEMPLATE14_MARK_Y_RATIO
  );
}
