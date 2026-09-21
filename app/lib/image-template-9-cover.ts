import {
  IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
  IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
} from '@/app/lib/image-template-2-cover';
import { imageTemplate8Q5BannerLayout } from '@/app/lib/image-template-8-cover';

/** Smaller than Template 2 cover title (0.062). */
export const IMAGE_TEMPLATE9_TITLE_SIZE_RATIO = 0.04;
export const IMAGE_TEMPLATE9_TITLE_WEIGHT = IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT;
export const IMAGE_TEMPLATE9_TITLE_MAX_WIDTH_RATIO = 0.25;
/** Keep text inset from frame edges when clamping. */
export const IMAGE_TEMPLATE9_TEXT_EDGE_PADDING = 0.04;
/** Extra gap below the Q5 CTA banner before question text may start. */
export const IMAGE_TEMPLATE9_Q5_CTA_CLEARANCE = 0.03;
/** Placement band — center 50% of the frame, both axes. */
export const IMAGE_TEMPLATE9_TITLE_BAND_START = 0.25;
export const IMAGE_TEMPLATE9_TITLE_BAND_END = 0.75;
/** @deprecated Use IMAGE_TEMPLATE9_TITLE_BAND_START. */
export const IMAGE_TEMPLATE9_TITLE_BAND_TOP = IMAGE_TEMPLATE9_TITLE_BAND_START;
/** @deprecated Use IMAGE_TEMPLATE9_TITLE_BAND_END. */
export const IMAGE_TEMPLATE9_TITLE_BAND_BOTTOM = IMAGE_TEMPLATE9_TITLE_BAND_END;

export const IMAGE_TEMPLATE9_QUESTION_COUNT = 5;

export type ImageTemplate9TitleAnchor = { x: number; y: number };

/** Zoomed crop of the cover photo — different region per question tab. */
export type ImageTemplate9QuestionCrop = {
  /** Focal point in the source image (0–1). */
  x: number;
  y: number;
  /** >1 = tighter crop of the full photo. */
  zoom: number;
};

/**
 * Q1–Q5 each show a different cropped region of the same cover image
 * so the carousel doesn’t feel like the same full frame five times.
 */
export const IMAGE_TEMPLATE9_QUESTION_CROPS: readonly ImageTemplate9QuestionCrop[] = [
  { x: 0.28, y: 0.26, zoom: 1.55 },
  { x: 0.74, y: 0.3, zoom: 1.5 },
  { x: 0.5, y: 0.48, zoom: 1.7 },
  { x: 0.26, y: 0.72, zoom: 1.52 },
  { x: 0.72, y: 0.74, zoom: 1.58 },
];

export function imageTemplate9QuestionCrop(
  questionIndex: number
): ImageTemplate9QuestionCrop {
  return (
    IMAGE_TEMPLATE9_QUESTION_CROPS[questionIndex] ??
    IMAGE_TEMPLATE9_QUESTION_CROPS[0]!
  );
}

/** Source rect for a zoomed cover-style crop centered on `crop`'s focal point. */
export function imageTemplate9CropSourceRect(
  imgWidth: number,
  imgHeight: number,
  destWidth: number,
  destHeight: number,
  crop: ImageTemplate9QuestionCrop
): { sx: number; sy: number; sw: number; sh: number } {
  const destAspect = destWidth / destHeight;
  let baseW: number;
  let baseH: number;
  if (imgWidth / imgHeight > destAspect) {
    baseH = imgHeight;
    baseW = imgHeight * destAspect;
  } else {
    baseW = imgWidth;
    baseH = imgWidth / destAspect;
  }
  const zoom = Math.max(1, crop.zoom);
  const sw = Math.min(imgWidth, baseW / zoom);
  const sh = Math.min(imgHeight, baseH / zoom);
  const sx = Math.max(0, Math.min(imgWidth - sw, crop.x * imgWidth - sw / 2));
  const sy = Math.max(0, Math.min(imgHeight - sh, crop.y * imgHeight - sh / 2));
  return { sx, sy, sw, sh };
}

export function drawImageTemplate9CoverPhoto(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  frameWidth: number,
  frameHeight: number,
  crop?: ImageTemplate9QuestionCrop | null
) {
  const imgW =
    'naturalWidth' in img && typeof img.naturalWidth === 'number' && img.naturalWidth > 0
      ? img.naturalWidth
      : img.width;
  const imgH =
    'naturalHeight' in img && typeof img.naturalHeight === 'number' && img.naturalHeight > 0
      ? img.naturalHeight
      : img.height;
  if (imgW < 1 || imgH < 1) return;

  if (crop) {
    const { sx, sy, sw, sh } = imageTemplate9CropSourceRect(
      imgW,
      imgH,
      frameWidth,
      frameHeight,
      crop
    );
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, frameWidth, frameHeight);
    return;
  }

  const scale = Math.max(frameWidth / imgW, frameHeight / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  ctx.drawImage(img, (frameWidth - drawW) / 2, (frameHeight - drawH) / 2, drawW, drawH);
}

/**
 * Bottom of the Q5 search + banner CTA as a fraction of frame height.
 * Question text must stay below this so it isn’t covered.
 */
export function imageTemplate9Q5CtaBottomRatio(
  frameWidth = 1080,
  frameHeight = 1440
): number {
  const layout = imageTemplate8Q5BannerLayout(frameWidth, frameHeight);
  return (layout.y + layout.height) / frameHeight + IMAGE_TEMPLATE9_Q5_CTA_CLEARANCE;
}

/**
 * Clamp an anchor so a centered text box stays fully inside the frame
 * (with edge padding / optional top inset for the Q5 CTA).
 */
export function clampImageTemplate9TextCenter(
  anchor: ImageTemplate9TitleAnchor,
  frameWidth: number,
  frameHeight: number,
  blockWidth: number,
  blockHeight: number,
  options?: {
    paddingRatio?: number;
    /** Fraction of frame height that must stay clear above the text block. */
    topInsetRatio?: number;
  }
): ImageTemplate9TitleAnchor {
  const paddingRatio = options?.paddingRatio ?? IMAGE_TEMPLATE9_TEXT_EDGE_PADDING;
  const topInsetRatio = options?.topInsetRatio ?? 0;
  const padX = frameWidth * paddingRatio;
  const padY = frameHeight * paddingRatio;
  const halfW = blockWidth / 2;
  const halfH = blockHeight / 2;
  const minX = padX + halfW;
  const maxX = frameWidth - padX - halfW;
  const minY = Math.max(padY, frameHeight * topInsetRatio) + halfH;
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

/** Preview helper — clamp using max text width + an estimated line count. */
export function clampImageTemplate9PreviewAnchor(
  anchor: ImageTemplate9TitleAnchor,
  estimatedLineCount = 4,
  options?: { topInsetRatio?: number }
): ImageTemplate9TitleAnchor {
  const blockW = IMAGE_TEMPLATE9_TITLE_MAX_WIDTH_RATIO;
  const blockH =
    IMAGE_TEMPLATE9_TITLE_SIZE_RATIO *
    IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT *
    Math.max(1, estimatedLineCount);
  return clampImageTemplate9TextCenter(anchor, 1, 1, blockW, blockH, options);
}

/** Random center point inside the middle 50% horizontally and vertically. */
export function pickImageTemplate9TitleAnchor(): ImageTemplate9TitleAnchor {
  const span = IMAGE_TEMPLATE9_TITLE_BAND_END - IMAGE_TEMPLATE9_TITLE_BAND_START;
  return {
    x: IMAGE_TEMPLATE9_TITLE_BAND_START + Math.random() * span,
    y: IMAGE_TEMPLATE9_TITLE_BAND_START + Math.random() * span,
  };
}

export function pickImageTemplate9QuestionAnchors(
  count = IMAGE_TEMPLATE9_QUESTION_COUNT
): ImageTemplate9TitleAnchor[] {
  return Array.from({ length: count }, () => pickImageTemplate9TitleAnchor());
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
    /** Keep the text block below this fraction of frame height (e.g. Q5 CTA). */
    topInsetRatio?: number;
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
    blockH,
    options.topInsetRatio != null && options.topInsetRatio > 0
      ? { topInsetRatio: options.topInsetRatio }
      : undefined
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
