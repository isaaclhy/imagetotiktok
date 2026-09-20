import { imageTemplate8Q5BannerLayout } from '@/app/lib/image-template-8-cover';
import {
  drawImageTemplate11LuxuryOverlay,
  IMAGE_TEMPLATE11_CSS_FILTER,
} from '@/app/lib/image-template-11-cover';

/** Delicate book serif — matches the vintage couples reference. */
export const IMAGE_TEMPLATE10_FONT_FAMILY =
  'var(--font-libre-baskerville), "Libre Baskerville", "Iowan Old Style", Palatino, Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE10_FONT_FAMILY_CANVAS = 'Libre Baskerville';

/** Same size for cover + Q1–Q5 — matches the delicate reference caption. */
export const IMAGE_TEMPLATE10_QUESTION_SIZE_RATIO = 0.03;
export const IMAGE_TEMPLATE10_TITLE_SIZE_RATIO = IMAGE_TEMPLATE10_QUESTION_SIZE_RATIO;
export const IMAGE_TEMPLATE10_SUBTITLE_SIZE_RATIO = 0.022;
export const IMAGE_TEMPLATE10_TITLE_WEIGHT = 400;
export const IMAGE_TEMPLATE10_SUBTITLE_WEIGHT = 400;
export const IMAGE_TEMPLATE10_LETTER_SPACING = '0.01em';
export const IMAGE_TEMPLATE10_LINE_HEIGHT_MULT = 1.35;
/** Question text wraps within this fraction of frame width. */
export const IMAGE_TEMPLATE10_QUESTION_MAX_WIDTH_RATIO = 0.5;
/** Keep text inset from frame edges when clamping. */
export const IMAGE_TEMPLATE10_TEXT_EDGE_PADDING = 0.04;
/** Extra gap below the Q5 CTA banner before question text may start. */
export const IMAGE_TEMPLATE10_Q5_CTA_CLEARANCE = 0.03;
/** Q1–Q5 placement band — center 50% of the frame, both axes. */
export const IMAGE_TEMPLATE10_TITLE_BAND_START = 0.25;
export const IMAGE_TEMPLATE10_TITLE_BAND_END = 0.75;
export const IMAGE_TEMPLATE10_QUESTION_COUNT = 5;

export type ImageTemplate10QuestionAnchor = { x: number; y: number };

/** Random center point inside the middle 50% horizontally and vertically. */
export function pickImageTemplate10QuestionAnchor(): ImageTemplate10QuestionAnchor {
  const span = IMAGE_TEMPLATE10_TITLE_BAND_END - IMAGE_TEMPLATE10_TITLE_BAND_START;
  return {
    x: IMAGE_TEMPLATE10_TITLE_BAND_START + Math.random() * span,
    y: IMAGE_TEMPLATE10_TITLE_BAND_START + Math.random() * span,
  };
}

export function pickImageTemplate10QuestionAnchors(
  count = IMAGE_TEMPLATE10_QUESTION_COUNT
): ImageTemplate10QuestionAnchor[] {
  return Array.from({ length: count }, () => pickImageTemplate10QuestionAnchor());
}

/**
 * Bottom of the Q5 search + banner CTA as a fraction of frame height.
 * Question text must stay below this so it isn’t covered.
 */
export function imageTemplate10Q5CtaBottomRatio(
  frameWidth = 1080,
  frameHeight = 1440
): number {
  const layout = imageTemplate8Q5BannerLayout(frameWidth, frameHeight);
  return (layout.y + layout.height) / frameHeight + IMAGE_TEMPLATE10_Q5_CTA_CLEARANCE;
}

/**
 * Clamp an anchor so a centered text box of `blockWidth` × `blockHeight`
 * stays fully inside the frame (with edge padding / optional top inset).
 */
export function clampImageTemplate10TextCenter(
  anchor: ImageTemplate10QuestionAnchor,
  frameWidth: number,
  frameHeight: number,
  blockWidth: number,
  blockHeight: number,
  options?: {
    paddingRatio?: number;
    /** Fraction of frame height that must stay clear above the text block. */
    topInsetRatio?: number;
  }
): ImageTemplate10QuestionAnchor {
  const paddingRatio = options?.paddingRatio ?? IMAGE_TEMPLATE10_TEXT_EDGE_PADDING;
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
export function clampImageTemplate10PreviewAnchor(
  anchor: ImageTemplate10QuestionAnchor,
  estimatedLineCount = 4,
  options?: { topInsetRatio?: number }
): ImageTemplate10QuestionAnchor {
  const blockW = IMAGE_TEMPLATE10_QUESTION_MAX_WIDTH_RATIO;
  const blockH =
    IMAGE_TEMPLATE10_QUESTION_SIZE_RATIO *
    IMAGE_TEMPLATE10_LINE_HEIGHT_MULT *
    Math.max(1, estimatedLineCount);
  return clampImageTemplate10TextCenter(anchor, 1, 1, blockW, blockH, options);
}

/** Same dark luxury romantic grade as the celebrity template. */
export const IMAGE_TEMPLATE10_CSS_FILTER = IMAGE_TEMPLATE11_CSS_FILTER;

/** Same luxury overlay as the celebrity template. */
export function drawImageTemplate10FilmOverlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number
) {
  drawImageTemplate11LuxuryOverlay(ctx, frameWidth, frameHeight);
}

/** Shared preview vignette layers for templates 10 & 11. */
export const IMAGE_TEMPLATE10_LUXURY_PREVIEW_OVERLAY = [
  'linear-gradient(135deg, rgba(120,70,50,0.12), rgba(40,20,50,0.14))',
  'radial-gradient(ellipse at 50% 42%, rgba(255,210,180,0.06) 0%, rgba(0,0,0,0) 55%)',
  'radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 30%, rgba(10,4,12,0.35) 72%, rgba(4,1,6,0.62) 100%)',
].join(', ');
