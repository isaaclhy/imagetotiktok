import {
  IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
  IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
} from '@/app/lib/image-template-2-cover';

/** Smaller than Template 2 cover title (0.062). */
export const IMAGE_TEMPLATE9_TITLE_SIZE_RATIO = 0.04;
export const IMAGE_TEMPLATE9_TITLE_WEIGHT = IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT;
export const IMAGE_TEMPLATE9_TITLE_MAX_WIDTH_RATIO = 0.25;
/** Keep text inset from frame edges when clamping. */
export const IMAGE_TEMPLATE9_TEXT_EDGE_PADDING = 0.04;
/** Placement band — center 50% of the frame, both axes. */
export const IMAGE_TEMPLATE9_TITLE_BAND_START = 0.25;
export const IMAGE_TEMPLATE9_TITLE_BAND_END = 0.75;
/** @deprecated Use IMAGE_TEMPLATE9_TITLE_BAND_START. */
export const IMAGE_TEMPLATE9_TITLE_BAND_TOP = IMAGE_TEMPLATE9_TITLE_BAND_START;
/** @deprecated Use IMAGE_TEMPLATE9_TITLE_BAND_END. */
export const IMAGE_TEMPLATE9_TITLE_BAND_BOTTOM = IMAGE_TEMPLATE9_TITLE_BAND_END;

export type ImageTemplate9TitleAnchor = { x: number; y: number };

/**
 * Clamp an anchor so a centered text box stays fully inside the frame
 * (with edge padding).
 */
export function clampImageTemplate9TextCenter(
  anchor: ImageTemplate9TitleAnchor,
  frameWidth: number,
  frameHeight: number,
  blockWidth: number,
  blockHeight: number,
  options?: {
    paddingRatio?: number;
  }
): ImageTemplate9TitleAnchor {
  const paddingRatio = options?.paddingRatio ?? IMAGE_TEMPLATE9_TEXT_EDGE_PADDING;
  const padX = frameWidth * paddingRatio;
  const padY = frameHeight * paddingRatio;
  const halfW = blockWidth / 2;
  const halfH = blockHeight / 2;
  const minX = padX + halfW;
  const maxX = frameWidth - padX - halfW;
  const minY = padY + halfH;
  const maxY = frameHeight - padY - halfH;
  const centerX = frameWidth * anchor.x;
  const centerY = frameHeight * anchor.y;
  return {
    x:
      frameWidth > 0
        ? (minX <= maxX
            ? Math.min(maxX, Math.max(minX, centerX))
            : frameWidth / 2) / frameWidth
        : 0.5,
    y:
      frameHeight > 0
        ? (minY <= maxY
            ? Math.min(maxY, Math.max(minY, centerY))
            : frameHeight / 2) / frameHeight
        : 0.5,
  };
}

/** Random center point inside the middle 50% horizontally and vertically. */
export function pickImageTemplate9TitleAnchor(): ImageTemplate9TitleAnchor {
  const span = IMAGE_TEMPLATE9_TITLE_BAND_END - IMAGE_TEMPLATE9_TITLE_BAND_START;
  return {
    x: IMAGE_TEMPLATE9_TITLE_BAND_START + Math.random() * span,
    y: IMAGE_TEMPLATE9_TITLE_BAND_START + Math.random() * span,
  };
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

export function drawImageTemplate9Title(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    title: string;
    anchor: ImageTemplate9TitleAnchor;
    fontFamily: string;
    textColor?: string;
  }
): void {
  const title = options.title.trim().replace(/\n/g, ' ');
  if (!title) return;

  const fontSize = Math.round(frameWidth * IMAGE_TEMPLATE9_TITLE_SIZE_RATIO);
  ctx.font = `${IMAGE_TEMPLATE9_TITLE_WEIGHT} ${fontSize}px ${options.fontFamily}`;
  ctx.letterSpacing = IMAGE_TEMPLATE2_COVER_LETTER_SPACING;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxTextWidth = frameWidth * IMAGE_TEMPLATE9_TITLE_MAX_WIDTH_RATIO;
  const lines = wrapLines(ctx, title, maxTextWidth);
  if (lines.length === 0) return;

  const lineHeight = fontSize * IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT;
  const blockH = lines.length * lineHeight;
  const clamped = clampImageTemplate9TextCenter(
    options.anchor,
    frameWidth,
    frameHeight,
    maxTextWidth,
    blockH
  );
  const centerX = frameWidth * clamped.x;
  const centerY = frameHeight * clamped.y;
  let y = centerY - blockH / 2 + lineHeight / 2;

  ctx.fillStyle = options.textColor ?? '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = Math.max(4, Math.round(fontSize * 0.35));
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(1, Math.round(fontSize * 0.06));

  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += lineHeight;
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.letterSpacing = '0px';
}
