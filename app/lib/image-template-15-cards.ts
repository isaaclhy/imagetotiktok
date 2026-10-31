import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/** White question card; frame behind it is picked from this set. */
export const IMAGE_TEMPLATE15_FRAME_COLORS = [
  '#CDB892',
  '#E8A0B0',
  '#7EB8C9',
  '#E3943A',
  '#B97BCE',
  '#6FA3C4',
  '#D13B61',
  '#8FBC8F',
  '#F0C27A',
  '#5B7C99',
] as const;
export const IMAGE_TEMPLATE15_FRAME_BG = IMAGE_TEMPLATE15_FRAME_COLORS[0];
export const IMAGE_TEMPLATE15_CARD_BG = '#FFFFFF';

export function pickTemplate15FrameColor(exclude?: string): string {
  const skip = exclude?.trim().toLowerCase();
  const pool = IMAGE_TEMPLATE15_FRAME_COLORS.filter(
    (color) => color.toLowerCase() !== skip
  );
  const colors = pool.length > 0 ? pool : IMAGE_TEMPLATE15_FRAME_COLORS;
  const index =
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint32Array(1))[0]! % colors.length
      : Math.floor(Math.random() * colors.length);
  return colors[index]!;
}
export const IMAGE_TEMPLATE15_CARD_BORDER = '#1A1A1A';
export const IMAGE_TEMPLATE15_TEXT = '#141414';
export const IMAGE_TEMPLATE15_MARK = 'SPILL IT';
export const IMAGE_TEMPLATE15_FONT_STACK =
  '"Playfair Display", Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE15_QUESTION_FONT_STACK = IMAGE_TEMPLATE15_FONT_STACK;

export const IMAGE_TEMPLATE15_CARD_INSET_X = 0.11;
export const IMAGE_TEMPLATE15_CARD_INSET_Y = 0.1;
export const IMAGE_TEMPLATE15_CARD_RADIUS_RATIO = 0.05;
export const IMAGE_TEMPLATE15_CARD_BORDER_RATIO = 0.016;
export const IMAGE_TEMPLATE15_MARK_SIZE_RATIO = 0.028;
export const IMAGE_TEMPLATE15_MARK_TOP_RATIO = 0.085;
export const IMAGE_TEMPLATE15_MARK_TRACKING = '0.14em';
export const IMAGE_TEMPLATE15_COVER_SIZE_RATIO = 0.088;
export const IMAGE_TEMPLATE15_QUESTION_SIZE_RATIO = 0.048;
/** Top of the question + options, just under the mark — card eye-level band. */
export const IMAGE_TEMPLATE15_QUESTION_TOP_RATIO = 0.2;
export const IMAGE_TEMPLATE15_LINE_HEIGHT = 1.22;
export const IMAGE_TEMPLATE15_TEXT_INSET_X = 0.12;

export function template15CardRect(
  frameWidth: number,
  frameHeight: number
): { x: number; y: number; width: number; height: number; radius: number } {
  const x = frameWidth * IMAGE_TEMPLATE15_CARD_INSET_X;
  const y = frameHeight * IMAGE_TEMPLATE15_CARD_INSET_Y;
  return {
    x,
    y,
    width: frameWidth - x * 2,
    height: frameHeight - y * 2,
    radius: Math.min(
      frameWidth * IMAGE_TEMPLATE15_CARD_RADIUS_RATIO,
      (frameWidth - x * 2) / 2,
      (frameHeight - y * 2) / 2
    ),
  };
}

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number
) {
  const iw =
    'naturalWidth' in image && typeof image.naturalWidth === 'number' && image.naturalWidth > 0
      ? image.naturalWidth
      : 'width' in image && typeof image.width === 'number'
        ? image.width
        : width;
  const ih =
    'naturalHeight' in image && typeof image.naturalHeight === 'number' && image.naturalHeight > 0
      ? image.naturalHeight
      : 'height' in image && typeof image.height === 'number'
        ? image.height
        : height;
  const scale = Math.max(width / Math.max(iw, 1), height / Math.max(ih, 1));
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);
}

function traceRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
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

export function paintTemplate15QuestionCard(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    text: string;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    frameBg?: string;
  }
) {
  ctx.fillStyle = options.frameBg?.trim() || IMAGE_TEMPLATE15_FRAME_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const card = template15CardRect(frameWidth, frameHeight);
  const border = Math.max(2, frameWidth * IMAGE_TEMPLATE15_CARD_BORDER_RATIO);
  ctx.save();
  traceRoundRect(ctx, card.x, card.y, card.width, card.height, card.radius);
  ctx.fillStyle = IMAGE_TEMPLATE15_CARD_BORDER;
  ctx.fill();
  ctx.restore();
  ctx.save();
  traceRoundRect(
    ctx,
    card.x + border,
    card.y + border,
    card.width - border * 2,
    card.height - border * 2,
    Math.max(0, card.radius - border)
  );
  ctx.fillStyle = IMAGE_TEMPLATE15_CARD_BG;
  ctx.fill();
  ctx.restore();

  const markSize = Math.round(frameWidth * IMAGE_TEMPLATE15_MARK_SIZE_RATIO);
  ctx.fillStyle = IMAGE_TEMPLATE15_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${markSize}px ${IMAGE_TEMPLATE15_QUESTION_FONT_STACK}`;
  ctx.letterSpacing = '0px';
  ctx.fillText(
    IMAGE_TEMPLATE15_MARK,
    frameWidth / 2,
    card.y + card.height * IMAGE_TEMPLATE15_MARK_TOP_RATIO
  );
  ctx.letterSpacing = '0px';

  const fontSize = Math.round(frameWidth * IMAGE_TEMPLATE15_QUESTION_SIZE_RATIO);
  ctx.font = `500 ${fontSize}px ${IMAGE_TEMPLATE15_QUESTION_FONT_STACK}`;
  const maxW = card.width * (1 - IMAGE_TEMPLATE15_TEXT_INSET_X * 2);
  const lines = wrapLines(ctx, options.text, maxW);
  const lineHeight = fontSize * IMAGE_TEMPLATE15_LINE_HEIGHT;
  const x = card.x + card.width * IMAGE_TEMPLATE15_TEXT_INSET_X;
  const topY = card.y + card.height * IMAGE_TEMPLATE15_QUESTION_TOP_RATIO;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const blockH = lines.length * lineHeight;
  let y = topY;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }

  if (options.isCta && options.promo) {
    const labelSize = Math.round(frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(
      frameWidth,
      frameHeight,
      topY + blockH + labelSize + labelGap
    );
    ctx.drawImage(options.promo, layout.x, layout.y, layout.width, layout.height);
    ctx.font = `700 ${labelSize}px ${IMAGE_TEMPLATE15_QUESTION_FONT_STACK}`;
    ctx.fillStyle = IMAGE_TEMPLATE15_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, frameWidth / 2, layout.y - labelGap);
  }
}

export function paintTemplate15Cover(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: { image?: CanvasImageSource | null; text: string }
) {
  ctx.fillStyle = IMAGE_TEMPLATE15_FRAME_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  if (options.image) {
    drawImageCover(ctx, options.image, frameWidth, frameHeight);
  }
  const fontSize = Math.round(frameWidth * IMAGE_TEMPLATE15_COVER_SIZE_RATIO);
  ctx.font = `500 ${fontSize}px ${IMAGE_TEMPLATE15_QUESTION_FONT_STACK}`;
  const maxW = frameWidth * 0.78;
  const lines = wrapLines(ctx, options.text, maxW);
  const lineHeight = fontSize * 1.2;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const x = frameWidth / 2;
  const centerY = frameHeight * 0.5;
  const blockH = lines.length * lineHeight;
  let y = centerY - blockH / 2 + lineHeight / 2;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = Math.max(6, frameWidth * 0.012);
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  ctx.shadowBlur = 0;

  const markY = frameHeight * 0.91;
  const heartSize = Math.round(frameWidth * 0.036);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${heartSize}px ${IMAGE_TEMPLATE15_QUESTION_FONT_STACK}`;
  ctx.fillText('♥ ♥ ♥', frameWidth / 2, markY - heartSize * 1.35);
  ctx.font = `700 ${Math.round(frameWidth * 0.03)}px ${IMAGE_TEMPLATE15_QUESTION_FONT_STACK}`;
  ctx.textBaseline = 'bottom';
  ctx.fillText('Spill It', frameWidth / 2, markY);
}
