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

/** Bracketed line under the cover title. */
export const IMAGE_TEMPLATE3_COVER_SUBTITLE_FONT_WEIGHT = 500;
export const IMAGE_TEMPLATE3_COVER_SUBTITLE_GAP_EM = 0.5;

export function imageTemplate3CoverSubtitleFontSizePx(frameWidth: number): number {
  return Math.max(18, Math.round(frameWidth * 0.032));
}

export const IMAGE_TEMPLATE3_COVER_SUBTITLES = [
  'would you rather edition',
  "bc it's fun",
  'with you partner or ppl you love',
  'I wish I never asked',
  'the answers are disappointing',
  "because it's fun",
  'for deeper connection',
  'progressively more unhinged',
  'progressively more difficult',
  'good luck to him',
] as const;

export function pickRandomImageTemplate3CoverSubtitle(): string {
  return IMAGE_TEMPLATE3_COVER_SUBTITLES[
    Math.floor(Math.random() * IMAGE_TEMPLATE3_COVER_SUBTITLES.length)
  ]!;
}

/** Subtitles are stored bare and always rendered wrapped in parentheses. */
export function formatImageTemplate3CoverSubtitle(subtitle: string): string {
  const trimmed = subtitle.trim().replace(/^\(+|\)+$/g, '').trim();
  return trimmed ? `(${trimmed})` : '';
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
  strokeOptions?: { minPx?: number; ratio?: number; enabled?: boolean }
) {
  ctx.font = `${fontWeight} ${fontSize}px ${IMAGE_TEMPLATE3_COVER_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const stroked = strokeOptions?.enabled !== false;
  ctx.fillStyle = '#ffffff';
  // Without the stroke the shadow is all that separates white text from the photo.
  ctx.shadowColor = stroked ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = Math.max(2, fontSize * (stroked ? 0.07 : 0.16));
  ctx.shadowOffsetY = Math.max(1, fontSize * (stroked ? 0.03 : 0.045));
  if (stroked) {
    const strokeW = Math.max(strokeOptions?.minPx ?? 6, fontSize * (strokeOptions?.ratio ?? 0.16));
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(text, cx, y);
  }
  ctx.fillText(text, cx, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

export type ImageTemplate3CoverOverlayOptions = {
  /** Template 4 centers the title vertically instead of sitting it in the upper third. */
  centerTitle?: boolean;
  /** Black outline around the title; off for a cleaner shadow-only look. */
  strokeTitle?: boolean;
  /** Bare text for the bracketed line under the title; parentheses are added here. */
  subtitle?: string;
};

/** TikTok-style stroked title with an optional bracketed subtitle. */
export function drawImageTemplate3CoverOverlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  title: string,
  options?: ImageTemplate3CoverOverlayOptions
) {
  const trimmedTitle = title.trim();
  const subtitle = formatImageTemplate3CoverSubtitle(options?.subtitle ?? '');
  const stroked = options?.strokeTitle !== false;
  const subtitleSize = imageTemplate3CoverSubtitleFontSizePx(frameWidth);
  const subtitleBlock = subtitle
    ? subtitleSize * (1 + IMAGE_TEMPLATE3_COVER_SUBTITLE_GAP_EM)
    : 0;

  let y = 0;
  if (trimmedTitle) {
    const fontSize = imageTemplate3CoverTitleFontSizePx(frameWidth);
    const maxWidth = frameWidth * IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO;
    ctx.font = `${IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE3_COVER_FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapLines(ctx, trimmedTitle, maxWidth);
    const lineHeight = fontSize * 1.14;
    // Centering accounts for the subtitle so the whole block sits mid-frame.
    y = options?.centerTitle
      ? (frameHeight - (lines.length * lineHeight + subtitleBlock)) / 2 + lineHeight / 2
      : frameHeight * IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO + lineHeight / 2;
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
          enabled: stroked,
        }
      );
      y += lineHeight;
    }
    // Last iteration advanced past the final line; step back to its baseline.
    y -= lineHeight / 2;
  } else {
    y = frameHeight * IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO;
  }

  if (!subtitle) return;

  drawStrokedCenteredText(
    ctx,
    frameWidth / 2,
    y + subtitleSize * IMAGE_TEMPLATE3_COVER_SUBTITLE_GAP_EM + subtitleSize / 2,
    subtitle,
    subtitleSize,
    IMAGE_TEMPLATE3_COVER_SUBTITLE_FONT_WEIGHT,
    { minPx: 4, ratio: 0.12, enabled: stroked }
  );
}
