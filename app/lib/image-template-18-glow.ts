import { IMAGE_TEMPLATE14_GRAIN_SRC } from '@/app/lib/image-template-14-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/** Black frame with a soft red spotlight and centered serif text. */
export const IMAGE_TEMPLATE18_BG = '#000000';
export const IMAGE_TEMPLATE18_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE18_LABEL = 'Spill It';
export const IMAGE_TEMPLATE18_LABEL_COLOR = 'rgba(255,255,255,0.5)';
export const IMAGE_TEMPLATE18_FONT_STACK =
  'var(--font-libre-baskerville), "Libre Baskerville", Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE18_LABEL_FONT_STACK =
  '"TikTok Sans", system-ui, -apple-system, sans-serif';
export const IMAGE_TEMPLATE18_GRAIN_SRC = IMAGE_TEMPLATE14_GRAIN_SRC;

/** Spotlight sits above center so the label has black space beneath it. */
export const IMAGE_TEMPLATE18_GLOW_Y = 0.4;
export const IMAGE_TEMPLATE18_GLOW_RADIUS = 0.56;
export const IMAGE_TEMPLATE18_TEXT_Y = 0.4;
export const IMAGE_TEMPLATE18_TEXT_SIZE = 0.064;
export const IMAGE_TEMPLATE18_TEXT_WIDTH = 0.72;
export const IMAGE_TEMPLATE18_LINE_HEIGHT = 1.28;
export const IMAGE_TEMPLATE18_LABEL_Y = 0.78;
export const IMAGE_TEMPLATE18_LABEL_SIZE = 0.028;
/** Last slide lifts the question so the template 2 promo can sit underneath. */
export const IMAGE_TEMPLATE18_CTA_TEXT_Y = 0.32;

const GLOW_STOPS: ReadonlyArray<readonly [number, string]> = [
  [0, '#E15A64'],
  [0.14, '#C43848'],
  [0.32, '#8A2030'],
  [0.52, '#3A1018'],
  [0.72, '#000000'],
];

export const IMAGE_TEMPLATE18_GLOW_BACKGROUND = `radial-gradient(circle ${IMAGE_TEMPLATE18_GLOW_RADIUS * 100}cqw at 50% ${IMAGE_TEMPLATE18_GLOW_Y * 100}%, ${GLOW_STOPS.map(
  ([stop, color]) => `${color} ${stop * 100}%`
).join(', ')})`;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      if (lines.length > 0) lines.push('');
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

function paintGlow(ctx: CanvasRenderingContext2D, frameWidth: number, frameHeight: number) {
  const cx = frameWidth / 2;
  const cy = frameHeight * IMAGE_TEMPLATE18_GLOW_Y;
  const radius = frameWidth * IMAGE_TEMPLATE18_GLOW_RADIUS;
  const glow = ctx.createRadialGradient(cx, cy, frameWidth * 0.02, cx, cy, radius);
  for (const [stop, color] of GLOW_STOPS) glow.addColorStop(stop, color);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
}

function paintGrain(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  grain: CanvasImageSource
) {
  const pattern = ctx.createPattern(grain, 'repeat');
  if (!pattern) return;
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.globalCompositeOperation = 'overlay';
  pattern.setTransform(new DOMMatrix().scale(0.55));
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  ctx.restore();
}

export function paintTemplate18Slide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    text: string;
    grain?: CanvasImageSource | null;
    fontFamily?: string;
    labelFontFamily?: string;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
  }
) {
  ctx.fillStyle = IMAGE_TEMPLATE18_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
  paintGlow(ctx, frameWidth, frameHeight);
  if (options.grain) paintGrain(ctx, frameWidth, frameHeight, options.grain);

  const isCta = Boolean(options.isCta && options.promo);
  const maxW = frameWidth * IMAGE_TEMPLATE18_TEXT_WIDTH;
  const maxBlock = frameHeight * (isCta ? 0.28 : 0.36);
  const textY = isCta ? IMAGE_TEMPLATE18_CTA_TEXT_Y : IMAGE_TEMPLATE18_TEXT_Y;
  let fontSize = Math.round(frameWidth * IMAGE_TEMPLATE18_TEXT_SIZE);
  let lines: string[] = [];
  let lineH = fontSize * IMAGE_TEMPLATE18_LINE_HEIGHT;
  const minSize = Math.round(frameWidth * 0.04);

  for (let step = 0; step < 12; step++) {
    lineH = fontSize * IMAGE_TEMPLATE18_LINE_HEIGHT;
    ctx.font = `400 ${fontSize}px ${options.fontFamily ?? '"Libre Baskerville", Georgia, serif'}`;
    lines = wrapLines(ctx, options.text, maxW);
    if (lines.length * lineH <= maxBlock || fontSize <= minSize) break;
    fontSize = Math.max(minSize, fontSize - 2);
  }

  ctx.fillStyle = IMAGE_TEMPLATE18_TEXT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${fontSize}px ${options.fontFamily ?? '"Libre Baskerville", Georgia, serif'}`;
  const blockH = lines.length * lineH;
  let y = frameHeight * textY - blockH / 2 + lineH / 2;
  for (const line of lines) {
    ctx.fillText(line, frameWidth / 2, y);
    y += lineH;
  }

  if (options.isCta && options.promo) {
    const labelSize = Math.round(frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(
      frameWidth,
      frameHeight,
      y + labelSize + labelGap
    );
    ctx.drawImage(options.promo, layout.x, layout.y, layout.width, layout.height);
    ctx.font = `700 ${labelSize}px ${options.labelFontFamily ?? IMAGE_TEMPLATE18_LABEL_FONT_STACK}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, frameWidth / 2, layout.y - labelGap);
    return;
  }

  const labelSize = Math.round(frameWidth * IMAGE_TEMPLATE18_LABEL_SIZE);
  ctx.fillStyle = IMAGE_TEMPLATE18_LABEL_COLOR;
  ctx.font = `500 ${labelSize}px ${options.labelFontFamily ?? IMAGE_TEMPLATE18_LABEL_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE18_LABEL, frameWidth / 2, frameHeight * IMAGE_TEMPLATE18_LABEL_Y);
}
