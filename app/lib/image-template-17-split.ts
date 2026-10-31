export const IMAGE_TEMPLATE17_BG = '#000000';
export const IMAGE_TEMPLATE17_PHOTO_PLACEHOLDER = '#2A2A2A';
export const IMAGE_TEMPLATE17_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE17_BRAND = 'SPILL IT';
export const IMAGE_TEMPLATE17_ICON_SRC = '/spill-it-icon.jpg';
export const IMAGE_TEMPLATE17_COVER_SRC = '/image-templates/template-17-cover.jpg';
export const IMAGE_TEMPLATE17_FONT_STACK =
  '"Inter", "TikTok Sans", system-ui, -apple-system, sans-serif';

/** Photo fades into a solid black title block so the text stays high-contrast. */
export const IMAGE_TEMPLATE17_BRAND_Y = 0.75;
export const IMAGE_TEMPLATE17_ICON_SIZE = 0.05;
export const IMAGE_TEMPLATE17_BRAND_SIZE = 0.023;
export const IMAGE_TEMPLATE17_BRAND_TRACKING = '0.14em';
export const IMAGE_TEMPLATE17_BRAND_GAP = 0.012;
export const IMAGE_TEMPLATE17_LINE_LENGTH = 0.055;
export const IMAGE_TEMPLATE17_LINE_GAP = 0.012;
export const IMAGE_TEMPLATE17_LINE_THICKNESS = 0.0025;
export const IMAGE_TEMPLATE17_TITLE_SIZE = 0.08;
export const IMAGE_TEMPLATE17_TITLE_WEIGHT = 800;
export const IMAGE_TEMPLATE17_TITLE_LINE_HEIGHT = 1.02;
export const IMAGE_TEMPLATE17_TITLE_TRACKING = '-0.045em';
export const IMAGE_TEMPLATE17_TITLE_WIDTH = 0.9;
export const IMAGE_TEMPLATE17_TITLE_TOP = 0.785;
export const IMAGE_TEMPLATE17_DIM_START = 0.32;
export const IMAGE_TEMPLATE17_DIM_MID = 'rgba(0,0,0,0.42)';
export const IMAGE_TEMPLATE17_DIM_HEAVY = 'rgba(0,0,0,0.82)';
export const IMAGE_TEMPLATE17_DIM_END = '#000000';
export const IMAGE_TEMPLATE17_DIM_GRADIENT =
  `linear-gradient(to bottom, transparent 0%, ${IMAGE_TEMPLATE17_DIM_MID} 38%, ${IMAGE_TEMPLATE17_DIM_HEAVY} 72%, ${IMAGE_TEMPLATE17_DIM_END} 100%)`;

/** Q1–Q5: same photo/fade/brand as the cover, with a white question card. */
export const IMAGE_TEMPLATE17_Q_BRAND_Y = 0.4;
export const IMAGE_TEMPLATE17_Q_CARD_INSET_X = 0.11;
export const IMAGE_TEMPLATE17_Q_CARD_TOP = 0.46;
export const IMAGE_TEMPLATE17_Q_CARD_BOTTOM = 0.07;
export const IMAGE_TEMPLATE17_Q_CARD_RADIUS = 0.036;
export const IMAGE_TEMPLATE17_Q_CARD_BG = '#FFFFFF';
export const IMAGE_TEMPLATE17_Q_CARD_TEXT = '#141414';
export const IMAGE_TEMPLATE17_Q_TEXT_SIZE = 0.05;
export const IMAGE_TEMPLATE17_Q_TEXT_INSET = 0.1;
export const IMAGE_TEMPLATE17_Q_LINE_HEIGHT = 1.12;

export function isImageTemplate17Id(templateId: number | null | undefined): boolean {
  return templateId === 17;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let current = words[0]!;
    for (let i = 1; i < words.length; i++) {
      const word = words[i]!;
      const candidate = `${current} ${word}`;
      if (ctx.measureText(candidate).width <= maxWidth) current = candidate;
      else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  image?: CanvasImageSource | null
) {
  if (!image) {
    ctx.fillStyle = IMAGE_TEMPLATE17_PHOTO_PLACEHOLDER;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const iw = 'width' in image ? Number(image.width) : width;
  const ih = 'height' in image ? Number(image.height) : height;
  const scale = Math.max(width / Math.max(iw, 1), height / Math.max(ih, 1));
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(image, (width - dw) / 2, (height - dh) * 0.22, dw, dh);
}

function drawFade(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const startY = height * IMAGE_TEMPLATE17_DIM_START;
  const gradient = ctx.createLinearGradient(0, startY, 0, height);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.38, IMAGE_TEMPLATE17_DIM_MID);
  gradient.addColorStop(0.72, IMAGE_TEMPLATE17_DIM_HEAVY);
  gradient.addColorStop(1, IMAGE_TEMPLATE17_DIM_END);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, startY, width, height - startY);
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

function drawBrand(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  icon?: CanvasImageSource | null,
  brandY = IMAGE_TEMPLATE17_BRAND_Y
) {
  const seamY = height * brandY;
  const iconSize = width * IMAGE_TEMPLATE17_ICON_SIZE;
  const brandSize = Math.round(width * IMAGE_TEMPLATE17_BRAND_SIZE);
  ctx.font = `600 ${brandSize}px ${IMAGE_TEMPLATE17_FONT_STACK}`;
  ctx.letterSpacing = IMAGE_TEMPLATE17_BRAND_TRACKING;
  const labelW = ctx.measureText(IMAGE_TEMPLATE17_BRAND).width;
  const gap = width * IMAGE_TEMPLATE17_BRAND_GAP;
  const lineW = width * IMAGE_TEMPLATE17_LINE_LENGTH;
  const lineGap = width * IMAGE_TEMPLATE17_LINE_GAP;
  const lineH = Math.max(1, width * IMAGE_TEMPLATE17_LINE_THICKNESS);
  const lockupW = iconSize + gap + labelW;
  const groupW = lineW + lineGap + lockupW + lineGap + lineW;
  const startX = (width - groupW) / 2;
  const iconX = startX + lineW + lineGap;
  const iconY = seamY - iconSize / 2;

  ctx.fillStyle = IMAGE_TEMPLATE17_TEXT;
  ctx.fillRect(startX, seamY - lineH / 2, lineW, lineH);
  ctx.fillRect(iconX + lockupW + lineGap, seamY - lineH / 2, lineW, lineH);

  if (icon) {
    ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);
  } else {
    ctx.fillStyle = '#7B5CFF';
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
  }

  ctx.fillStyle = IMAGE_TEMPLATE17_TEXT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE17_BRAND, iconX + iconSize + gap, seamY);
  ctx.letterSpacing = '0px';
}

export function paintTemplate17Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    icon?: CanvasImageSource | null;
    image?: CanvasImageSource | null;
  }
): void {
  ctx.fillStyle = IMAGE_TEMPLATE17_BG;
  ctx.fillRect(0, 0, width, height);
  drawCoverImage(ctx, width, height, options.image);
  drawFade(ctx, width, height);
  drawBrand(ctx, width, height, options.icon);

  const fontSize = Math.round(width * IMAGE_TEMPLATE17_TITLE_SIZE);
  ctx.fillStyle = IMAGE_TEMPLATE17_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${IMAGE_TEMPLATE17_TITLE_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE17_FONT_STACK}`;
  ctx.letterSpacing = IMAGE_TEMPLATE17_TITLE_TRACKING;
  const maxW = width * IMAGE_TEMPLATE17_TITLE_WIDTH;
  const lines = wrapLines(ctx, options.text, maxW);
  const lineH = fontSize * IMAGE_TEMPLATE17_TITLE_LINE_HEIGHT;
  let y = height * IMAGE_TEMPLATE17_TITLE_TOP;
  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineH;
  }
  ctx.letterSpacing = '0px';
}

export function paintTemplate17QuestionCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    icon?: CanvasImageSource | null;
    image?: CanvasImageSource | null;
  }
): void {
  ctx.fillStyle = IMAGE_TEMPLATE17_BG;
  ctx.fillRect(0, 0, width, height);
  drawCoverImage(ctx, width, height, options.image);
  drawFade(ctx, width, height);
  drawBrand(ctx, width, height, options.icon, IMAGE_TEMPLATE17_Q_BRAND_Y);

  const cardX = width * IMAGE_TEMPLATE17_Q_CARD_INSET_X;
  const cardY = height * IMAGE_TEMPLATE17_Q_CARD_TOP;
  const cardW = width - cardX * 2;
  const cardH = height * (1 - IMAGE_TEMPLATE17_Q_CARD_TOP - IMAGE_TEMPLATE17_Q_CARD_BOTTOM);
  const radius = width * IMAGE_TEMPLATE17_Q_CARD_RADIUS;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = width * 0.04;
  ctx.shadowOffsetY = width * 0.012;
  ctx.fillStyle = IMAGE_TEMPLATE17_Q_CARD_BG;
  traceRoundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  const fontSize = Math.round(width * IMAGE_TEMPLATE17_Q_TEXT_SIZE);
  ctx.fillStyle = IMAGE_TEMPLATE17_Q_CARD_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${IMAGE_TEMPLATE17_TITLE_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE17_FONT_STACK}`;
  ctx.letterSpacing = IMAGE_TEMPLATE17_TITLE_TRACKING;
  const maxW = cardW * (1 - IMAGE_TEMPLATE17_Q_TEXT_INSET * 2);
  const lines = wrapLines(ctx, options.text, maxW);
  const lineH = fontSize * IMAGE_TEMPLATE17_Q_LINE_HEIGHT;
  const blockH = lines.length * lineH;
  let y = cardY + cardH / 2 - blockH / 2 + lineH / 2;
  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineH;
  }
  ctx.letterSpacing = '0px';
}
