import {
  IMAGE_TEMPLATE3_TYPE_PILL_LABELS,
  type ConcreteQuestionType,
} from '@/app/lib/constants';

export const IMAGE_TEMPLATE3_COVER_FONT_STACK =
  '"TikTok Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Title block — upper third, TikTok reference layout. */
export const IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO = 0.12;
export const IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO = 0.88;
/** Question type label — preview position. */
export const IMAGE_TEMPLATE3_COVER_TYPE_LABEL_Y_RATIO = 0.63;
/** Question type label — export/download position (lower than preview). */
export const IMAGE_TEMPLATE3_COVER_TYPE_LABEL_EXPORT_Y_RATIO = 0.73;

/** Lighter weights — stroke carries most of the visual weight (TikTok-style). */
export const IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT = 600;
export const IMAGE_TEMPLATE3_COVER_TYPE_LABEL_FONT_WEIGHT = 500;

export function imageTemplate3CoverTitleFontSizePx(frameWidth: number): number {
  return Math.max(28, Math.round(frameWidth * 0.052));
}

export function imageTemplate3CoverTypeLabelFontSizePx(frameWidth: number): number {
  return Math.max(18, Math.round(frameWidth * 0.03));
}

export function imageTemplate3TypePillLabel(type: ConcreteQuestionType): string {
  return IMAGE_TEMPLATE3_TYPE_PILL_LABELS[type];
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

function drawStrokedCenteredText(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  text: string,
  fontSize: number,
  fontWeight: number,
  strokeOptions?: { minPx?: number; ratio?: number }
) {
  ctx.font = `${fontWeight} ${fontSize}px ${IMAGE_TEMPLATE3_COVER_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const strokeW = Math.max(strokeOptions?.minPx ?? 6, fontSize * (strokeOptions?.ratio ?? 0.16));
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = strokeW;
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = Math.max(2, fontSize * 0.07);
  ctx.shadowOffsetY = Math.max(1, fontSize * 0.03);
  ctx.strokeText(text, cx, y);
  ctx.fillText(text, cx, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/** TikTok-style title + question-type label (no pill background). */
export function drawImageTemplate3CoverOverlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  title: string,
  typeLabel: string
) {
  const trimmedTitle = title.trim();
  if (trimmedTitle) {
    const fontSize = imageTemplate3CoverTitleFontSizePx(frameWidth);
    const maxWidth = frameWidth * IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO;
    ctx.font = `${IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE3_COVER_FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapLines(ctx, trimmedTitle, maxWidth);
    const lineHeight = fontSize * 1.14;
    let y = frameHeight * IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO + lineHeight / 2;
    for (const line of lines) {
      drawStrokedCenteredText(
        ctx,
        frameWidth / 2,
        y,
        line,
        fontSize,
        IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT,
        {
          minPx: 6,
          ratio: 0.15,
        }
      );
      y += lineHeight;
    }
  }

  const label = typeLabel.trim().toLowerCase();
  if (!label) return;

  const labelFontSize = imageTemplate3CoverTypeLabelFontSizePx(frameWidth);
  const labelY = frameHeight * IMAGE_TEMPLATE3_COVER_TYPE_LABEL_EXPORT_Y_RATIO;
  drawStrokedCenteredText(
    ctx,
    frameWidth / 2,
    labelY,
    label,
    labelFontSize,
    IMAGE_TEMPLATE3_COVER_TYPE_LABEL_FONT_WEIGHT,
    {
      minPx: 8,
      ratio: 0.2,
    }
  );
}
