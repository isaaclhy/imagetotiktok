import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_TAB_INDEX,
  IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO,
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
] as const;

export const IMAGE_TEMPLATE14_TEXT = '#1A1A1A';
/** White-card variant. The frame behind it is a gradient. */
export const IMAGE_TEMPLATE14_WHITE = '#FFFFFF';
/** Area outside the rounded card when the card itself is colored. */
export const IMAGE_TEMPLATE14_FRAME_BG = '#000000';
/** Soft gradients used behind the white card. */
export const IMAGE_TEMPLATE14_GRADIENTS = [
  { from: '#C86BDB', to: '#F07AA8' },
  { from: '#E24B78', to: '#F0A15A' },
  { from: '#6FA3E8', to: '#E07AB8' },
  { from: '#E07A3A', to: '#D13B61' },
] as const;

export function template14GradientCss(from: string, to: string): string {
  return `linear-gradient(160deg, ${from} 0%, ${to} 100%)`;
}

/** Next gradient, in order, skipping the one just used. */
export function nextTemplate14Gradient(currentFrom?: string): { from: string; to: string } {
  const index = IMAGE_TEMPLATE14_GRADIENTS.findIndex(
    (gradient) => gradient.from.toLowerCase() === currentFrom?.trim().toLowerCase()
  );
  return IMAGE_TEMPLATE14_GRADIENTS[(index + 1) % IMAGE_TEMPLATE14_GRADIENTS.length]!;
}
/** Card inset from the frame, as a share of width and height. */
export const IMAGE_TEMPLATE14_CARD_INSET_X = 0.085;
export const IMAGE_TEMPLATE14_CARD_INSET_Y = 0.07;
/** Corner radius as a share of the frame width. */
export const IMAGE_TEMPLATE14_CARD_RADIUS_RATIO = 0.1;
export const IMAGE_TEMPLATE14_MARK = 'spill it';
export const IMAGE_TEMPLATE14_GRAIN_SRC = '/image-templates/template-14-grain.png';
export const IMAGE_TEMPLATE14_SLIDE_COUNT = 6;
export const IMAGE_TEMPLATE14_FONT_STACK =
  '"Libre Baskerville", Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE14_COVER_SIZE_RATIO = 0.072;
export const IMAGE_TEMPLATE14_QUESTION_SIZE_RATIO = 0.058;
export const IMAGE_TEMPLATE14_MARK_SIZE_RATIO = 0.028;
export const IMAGE_TEMPLATE14_MARK_Y_RATIO = 0.88;
export const IMAGE_TEMPLATE14_TEXT_MAX_WIDTH_RATIO = 0.78;
export const IMAGE_TEMPLATE14_LINE_HEIGHT = 1.28;

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

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
    /** When set, the card is white and this gradient fills the frame. */
    gradient?: { from: string; to: string } | null;
  }
): void {
  const card = template14CardRect(frameWidth, frameHeight);
  if (options.gradient) {
    const frameGradient = ctx.createLinearGradient(0, 0, frameWidth, frameHeight);
    frameGradient.addColorStop(0, options.gradient.from);
    frameGradient.addColorStop(1, options.gradient.to);
    ctx.fillStyle = frameGradient;
  } else {
    ctx.fillStyle = IMAGE_TEMPLATE14_FRAME_BG;
  }
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  ctx.save();
  traceRoundRect(ctx, card.x, card.y, card.width, card.height, card.radius);
  ctx.clip();
  ctx.fillStyle = options.gradient ? IMAGE_TEMPLATE14_WHITE : options.backgroundColor;
  ctx.fillRect(card.x, card.y, card.width, card.height);
  if (!options.gradient) {
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = 'overlay';
    const pattern = ctx.createPattern(options.grain, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(card.x, card.y, card.width, card.height);
    }
  }
  ctx.restore();

  const isCover = options.tabIndex === 0;
  const isQ5 = options.tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX;
  const fontSize = Math.round(
    frameWidth * (isCover ? IMAGE_TEMPLATE14_COVER_SIZE_RATIO : IMAGE_TEMPLATE14_QUESTION_SIZE_RATIO)
  );
  ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
  ctx.fillStyle = IMAGE_TEMPLATE14_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapLines(ctx, options.text, card.width * IMAGE_TEMPLATE14_TEXT_MAX_WIDTH_RATIO);
  const lineHeight = fontSize * IMAGE_TEMPLATE14_LINE_HEIGHT;
  const blockH = lines.length * lineHeight;
  const centerY =
    card.y + card.height * (isQ5 ? IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO : 0.5);
  let y = centerY - blockH / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, frameWidth / 2, y);
    y += lineHeight;
  }

  if (isQ5 && options.promo) {
    const labelSize = Math.round(card.height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = card.height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(
      card.width,
      card.height,
      centerY + blockH / 2 + labelSize + labelGap - card.y
    );
    const promoX = card.x + layout.x;
    const promoY = card.y + layout.y;
    ctx.save();
    traceRoundRect(ctx, card.x, card.y, card.width, card.height, card.radius);
    ctx.clip();
    ctx.drawImage(options.promo, promoX, promoY, layout.width, layout.height);
    ctx.restore();
    ctx.font = `700 ${labelSize}px "TikTok Sans", system-ui, sans-serif`;
    ctx.fillStyle = options.gradient ? IMAGE_TEMPLATE14_TEXT : 'rgba(255,255,255,0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, frameWidth / 2, promoY - labelGap);
    return;
  }

  const markSize = Math.round(frameWidth * IMAGE_TEMPLATE14_MARK_SIZE_RATIO);
  ctx.font = `400 ${markSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
  ctx.fillStyle = IMAGE_TEMPLATE14_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    IMAGE_TEMPLATE14_MARK,
    frameWidth / 2,
    card.y + card.height * IMAGE_TEMPLATE14_MARK_Y_RATIO
  );
}
