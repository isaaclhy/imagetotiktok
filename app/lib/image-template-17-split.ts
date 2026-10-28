import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';

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
/**
 * Lowest title size we prefer, as a fraction of slide width.
 * Longer copy shrinks toward this. If it still cannot fit, the fitter
 * keeps shrinking so the slide never clips.
 */
export const IMAGE_TEMPLATE17_TITLE_MIN_SIZE = 0.03;
/** Last line box stays above this fraction of the slide height. */
export const IMAGE_TEMPLATE17_TEXT_BOTTOM = 0.972;
/** Answer lines are a fraction of the fitted question size. */
export const IMAGE_TEMPLATE17_OPTION_SCALE = 0.84;
export const IMAGE_TEMPLATE17_OPTION_WEIGHT = 700;
export const IMAGE_TEMPLATE17_OPTION_LINE_HEIGHT = 1.12;
export const IMAGE_TEMPLATE17_OPTION_TRACKING = '-0.03em';
/** Space between the question and its options, in question ems. */
export const IMAGE_TEMPLATE17_OPTION_GAP = 0.45;
export const IMAGE_TEMPLATE17_DIM_START = 0.32;
export const IMAGE_TEMPLATE17_DIM_MID = 'rgba(0,0,0,0.42)';
export const IMAGE_TEMPLATE17_DIM_HEAVY = 'rgba(0,0,0,0.82)';
export const IMAGE_TEMPLATE17_DIM_END = '#000000';
export const IMAGE_TEMPLATE17_DIM_GRADIENT =
  `linear-gradient(to bottom, transparent 0%, ${IMAGE_TEMPLATE17_DIM_MID} 38%, ${IMAGE_TEMPLATE17_DIM_HEAVY} 72%, ${IMAGE_TEMPLATE17_DIM_END} 100%)`;

export function isImageTemplate17Id(templateId: number | null | undefined): boolean {
  return templateId === 17;
}

/** First family from `--font-inter` (the self-hosted next/font face), or Inter. */
export function template17PrimaryFontFamily(): string {
  if (typeof document === 'undefined') return 'Inter';
  const raw = getComputedStyle(document.body).getPropertyValue('--font-inter').trim();
  if (!raw) return 'Inter';
  const quoted = raw.match(/^['"]([^'"]+)['"]/);
  const first = quoted?.[1] ?? raw.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || 'Inter';
}

/** Canvas/CSS stack that prefers the loaded self-hosted Inter face. */
export function template17CanvasFontStack(family = template17PrimaryFontFamily()): string {
  if (!family || family === 'Inter') return IMAGE_TEMPLATE17_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE17_FONT_STACK}`;
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

function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  paragraph: string,
  maxWidth: number
): string[] {
  const words = paragraph.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
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
  return lines;
}

function wrapBlock(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.replace(/\r/g, '').split('\n');
  for (const paragraph of paragraphs) {
    lines.push(...wrapParagraph(ctx, paragraph, maxWidth));
  }
  return lines;
}

export type Template17TextLayout = {
  questionSize: number;
  optionSize: number;
  questionLineHeight: number;
  optionLineHeight: number;
  gap: number;
  top: number;
  /** Bottom of the last line box. */
  bottom: number;
  maxWidth: number;
  questionLines: string[];
  optionLines: string[];
  /** True when copy only fit below `IMAGE_TEMPLATE17_TITLE_MIN_SIZE`. */
  belowSensibleMinimum: boolean;
};

type Template17MeasuredBlock = {
  questionLines: string[];
  optionLines: string[];
  questionSize: number;
  optionSize: number;
  questionLineHeight: number;
  optionLineHeight: number;
  gap: number;
  height: number;
};

function withTemplate17Font(
  ctx: CanvasRenderingContext2D,
  run: () => void
): void {
  const previousSpacing = ctx.letterSpacing;
  const previousAlign = ctx.textAlign;
  const previousBaseline = ctx.textBaseline;
  try {
    run();
  } finally {
    ctx.letterSpacing = previousSpacing;
    ctx.textAlign = previousAlign;
    ctx.textBaseline = previousBaseline;
  }
}

function measureTemplate17Block(
  ctx: CanvasRenderingContext2D,
  maxWidth: number,
  question: string,
  optionSource: string[],
  questionSize: number,
  fontFamily: string
): Template17MeasuredBlock {
  const optionSize = Math.max(1, Math.round(questionSize * IMAGE_TEMPLATE17_OPTION_SCALE));
  ctx.font = `${IMAGE_TEMPLATE17_TITLE_WEIGHT} ${questionSize}px ${fontFamily}`;
  ctx.letterSpacing = IMAGE_TEMPLATE17_TITLE_TRACKING;
  const questionLines = question.trim() ? wrapBlock(ctx, question, maxWidth) : [];
  ctx.font = `${IMAGE_TEMPLATE17_OPTION_WEIGHT} ${optionSize}px ${fontFamily}`;
  ctx.letterSpacing = IMAGE_TEMPLATE17_OPTION_TRACKING;
  const optionLines = optionSource.flatMap((line) => wrapParagraph(ctx, line, maxWidth));
  const questionLineHeight = questionSize * IMAGE_TEMPLATE17_TITLE_LINE_HEIGHT;
  const optionLineHeight = optionSize * IMAGE_TEMPLATE17_OPTION_LINE_HEIGHT;
  const gap =
    questionLines.length > 0 && optionLines.length > 0
      ? questionSize * IMAGE_TEMPLATE17_OPTION_GAP
      : 0;
  const height =
    questionLines.length * questionLineHeight + gap + optionLines.length * optionLineHeight;
  return {
    questionLines,
    optionLines,
    questionSize,
    optionSize,
    questionLineHeight,
    optionLineHeight,
    gap,
    height,
  };
}

/**
 * Shrink the question (and the smaller option block under it) until the
 * wrapped copy sits between the brand lockup and the bottom safe edge.
 * Short titles that already fit stay at `IMAGE_TEMPLATE17_TITLE_SIZE`.
 */
export function layoutTemplate17Text(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string = IMAGE_TEMPLATE17_FONT_STACK
): Template17TextLayout {
  const top = height * IMAGE_TEMPLATE17_TITLE_TOP;
  const maxWidth = width * IMAGE_TEMPLATE17_TITLE_WIDTH;
  const maxHeight = Math.max(0, height * IMAGE_TEMPLATE17_TEXT_BOTTOM - top);
  const empty: Template17TextLayout = {
    questionSize: Math.round(width * IMAGE_TEMPLATE17_TITLE_SIZE),
    optionSize: Math.round(width * IMAGE_TEMPLATE17_TITLE_SIZE * IMAGE_TEMPLATE17_OPTION_SCALE),
    questionLineHeight: 0,
    optionLineHeight: 0,
    gap: 0,
    top,
    bottom: top,
    maxWidth,
    questionLines: [],
    optionLines: [],
    belowSensibleMinimum: false,
  };
  if (!(width > 0) || !(height > 0)) return empty;

  const { question, options } = splitCopycatQuestionAndOptions(text);
  const optionSource = options
    ? options.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];
  const sensibleMin = Math.max(1, Math.round(width * IMAGE_TEMPLATE17_TITLE_MIN_SIZE));
  const maxSize = Math.max(sensibleMin, Math.round(width * IMAGE_TEMPLATE17_TITLE_SIZE));

  let chosen: Template17MeasuredBlock | null = null;
  let belowSensibleMinimum = false;

  withTemplate17Font(ctx, () => {
    const fits = (size: number) =>
      measureTemplate17Block(ctx, maxWidth, question, optionSource, size, fontFamily).height <=
      maxHeight + 0.25;

    let lo = sensibleMin;
    let hi = maxSize;
    let best = sensibleMin;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fits(mid)) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    if (!fits(best)) {
      belowSensibleMinimum = true;
      best = sensibleMin;
      while (best > 1 && !fits(best)) best -= 1;
    }

    chosen = measureTemplate17Block(ctx, maxWidth, question, optionSource, best, fontFamily);
  });

  const block = chosen ?? {
    questionLines: [] as string[],
    optionLines: [] as string[],
    questionSize: sensibleMin,
    optionSize: Math.max(1, Math.round(sensibleMin * IMAGE_TEMPLATE17_OPTION_SCALE)),
    questionLineHeight: 0,
    optionLineHeight: 0,
    gap: 0,
    height: 0,
  };

  return {
    questionSize: block.questionSize,
    optionSize: block.optionSize,
    questionLineHeight: block.questionLineHeight,
    optionLineHeight: block.optionLineHeight,
    gap: block.gap,
    top,
    bottom: top + block.height,
    maxWidth,
    questionLines: block.questionLines,
    optionLines: block.optionLines,
    belowSensibleMinimum,
  };
}

/** Glyph box of a laid-out slide. Uses the same anchors as `paintTemplate17Slide`. */
export function measureTemplate17Ink(
  ctx: CanvasRenderingContext2D,
  width: number,
  layout: Template17TextLayout,
  fontFamily: string = IMAGE_TEMPLATE17_FONT_STACK
): { top: number; bottom: number; left: number; right: number } | null {
  const lines: Array<{ text: string; y: number; size: number; weight: number; tracking: string }> =
    [];
  let y = layout.top;
  for (const line of layout.questionLines) {
    lines.push({
      text: line,
      y,
      size: layout.questionSize,
      weight: IMAGE_TEMPLATE17_TITLE_WEIGHT,
      tracking: IMAGE_TEMPLATE17_TITLE_TRACKING,
    });
    y += layout.questionLineHeight;
  }
  if (layout.optionLines.length) {
    y += layout.gap;
    for (const line of layout.optionLines) {
      lines.push({
        text: line,
        y,
        size: layout.optionSize,
        weight: IMAGE_TEMPLATE17_OPTION_WEIGHT,
        tracking: IMAGE_TEMPLATE17_OPTION_TRACKING,
      });
      y += layout.optionLineHeight;
    }
  }
  if (lines.length === 0) return null;

  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  const x = width / 2;
  withTemplate17Font(ctx, () => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const line of lines) {
      ctx.font = `${line.weight} ${line.size}px ${fontFamily}`;
      ctx.letterSpacing = line.tracking;
      const metrics = ctx.measureText(line.text);
      top = Math.min(top, line.y - metrics.actualBoundingBoxAscent);
      bottom = Math.max(bottom, line.y + metrics.actualBoundingBoxDescent);
      left = Math.min(left, x - metrics.actualBoundingBoxLeft);
      right = Math.max(right, x + metrics.actualBoundingBoxRight);
    }
  });
  return { top, bottom, left, right };
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

function drawBrand(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  icon?: CanvasImageSource | null,
  fontFamily: string = IMAGE_TEMPLATE17_FONT_STACK
) {
  const seamY = height * IMAGE_TEMPLATE17_BRAND_Y;
  const iconSize = width * IMAGE_TEMPLATE17_ICON_SIZE;
  const brandSize = Math.round(width * IMAGE_TEMPLATE17_BRAND_SIZE);
  ctx.font = `600 ${brandSize}px ${fontFamily}`;
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
    fontFamily?: string;
  }
): void {
  const fontFamily = options.fontFamily || template17CanvasFontStack();
  ctx.fillStyle = IMAGE_TEMPLATE17_BG;
  ctx.fillRect(0, 0, width, height);
  drawCoverImage(ctx, width, height, options.image);
  drawFade(ctx, width, height);
  drawBrand(ctx, width, height, options.icon, fontFamily);

  const layout = layoutTemplate17Text(ctx, width, height, options.text, fontFamily);
  ctx.fillStyle = IMAGE_TEMPLATE17_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${IMAGE_TEMPLATE17_TITLE_WEIGHT} ${layout.questionSize}px ${fontFamily}`;
  ctx.letterSpacing = IMAGE_TEMPLATE17_TITLE_TRACKING;
  let y = layout.top;
  for (const line of layout.questionLines) {
    ctx.fillText(line, width / 2, y);
    y += layout.questionLineHeight;
  }
  if (layout.optionLines.length) {
    y += layout.gap;
    ctx.font = `${IMAGE_TEMPLATE17_OPTION_WEIGHT} ${layout.optionSize}px ${fontFamily}`;
    ctx.letterSpacing = IMAGE_TEMPLATE17_OPTION_TRACKING;
    for (const line of layout.optionLines) {
      ctx.fillText(line, width / 2, y);
      y += layout.optionLineHeight;
    }
  }
  ctx.letterSpacing = '0px';
}
