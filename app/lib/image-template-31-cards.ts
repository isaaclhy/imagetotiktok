import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  imageTemplate2Q5PromoTextCeiling,
  paintImageTemplate2Q5Promo,
} from '@/app/lib/image-template-2-cover';

/** Grainy rounded cards — one solid color, serif question, italic options. */
export const IMAGE_TEMPLATE31_FRAME_BG = '#000000';
export const IMAGE_TEMPLATE31_GRAIN_SRC = '/image-templates/template-31-grain.png';

/** Colors sampled from the reference cards, lifted so black text stays readable. */
export const IMAGE_TEMPLATE31_COLORS = [
  '#E4577C',
  '#4A62B5',
  '#C49AD6',
  '#E24D73',
  '#E39A4A',
  '#5E9A86',
  '#A34B78',
  '#D6C07A',
] as const;

export const IMAGE_TEMPLATE31_CARD_INSET_X = 0.072;
export const IMAGE_TEMPLATE31_CARD_INSET_Y = 0.058;
export const IMAGE_TEMPLATE31_CARD_RADIUS_RATIO = 0.155;
/** Feather on the card's own edge. No second shape behind it. */
export const IMAGE_TEMPLATE31_EDGE_BLUR_RATIO = 0.014;

export const IMAGE_TEMPLATE31_FONT_STACK =
  'var(--font-libre-baskerville), "Libre Baskerville", Georgia, serif';
export const IMAGE_TEMPLATE31_MARK_FONT_STACK =
  'var(--font-inter), Inter, system-ui, sans-serif';

export const IMAGE_TEMPLATE31_COVER_SIZE_RATIO = 0.082;
export const IMAGE_TEMPLATE31_QUESTION_SIZE_RATIO = 0.064;
export const IMAGE_TEMPLATE31_QUESTION_MIN_SIZE_RATIO = 0.034;
export const IMAGE_TEMPLATE31_OPTION_SIZE_RATIO = 0.048;
export const IMAGE_TEMPLATE31_LINE_HEIGHT = 1.34;
export const IMAGE_TEMPLATE31_OPTION_LINE_HEIGHT = 1.42;
export const IMAGE_TEMPLATE31_OPTION_GAP = 0.85;
/** Top of the question on option slides, high enough that the choices fit underneath. */
export const IMAGE_TEMPLATE31_OPTION_TOP_RATIO = 0.16;
export const IMAGE_TEMPLATE31_CENTER_RATIO = 0.48;
export const IMAGE_TEMPLATE31_TEXT_MAX_WIDTH_RATIO = 0.78;
export const IMAGE_TEMPLATE31_OPTION_INSET_RATIO = 0.14;
export const IMAGE_TEMPLATE31_MARK = 'spill it';
export const IMAGE_TEMPLATE31_MARK_SIZE_RATIO = 0.028;
export const IMAGE_TEMPLATE31_MARK_Y_RATIO = 0.9;

const GRAIN_TILE_SCALE = 0.42;

export function pickTemplate31Color(exclude?: string): string {
  const pool = IMAGE_TEMPLATE31_COLORS.filter((color) => color !== exclude);
  const choices = pool.length > 0 ? pool : IMAGE_TEMPLATE31_COLORS;
  const index = Math.floor(Math.random() * choices.length);
  return choices[index] ?? IMAGE_TEMPLATE31_COLORS[0];
}

export function template31TextForBackground(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '');
  const value = Number.parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.42 ? '#FFFFFF' : '#1A1A1A';
}

export function template31CardRect(frameWidth: number, frameHeight: number) {
  const x = frameWidth * IMAGE_TEMPLATE31_CARD_INSET_X;
  const y = frameHeight * IMAGE_TEMPLATE31_CARD_INSET_Y;
  const width = frameWidth - x * 2;
  const height = frameHeight - y * 2;
  const radius = Math.min(
    frameWidth * IMAGE_TEMPLATE31_CARD_RADIUS_RATIO,
    width / 2,
    height / 2
  );
  return { x, y, width, height, radius };
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

function wrapPreservingBreaks(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = words[0]!;
    for (const word of words.slice(1)) {
      const next = `${current} ${word}`;
      if (ctx.measureText(next).width <= maxWidth) current = next;
      else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

/** "a. Clingy" → "A) Clingy" so option slides match the reference cards. */
function styleOptionLines(options: string): string {
  return options.replace(/^([a-z0-9])\.\s+/gim, (_, letter: string) => `${letter.toUpperCase()}) `);
}

function paintGrain(
  ctx: CanvasRenderingContext2D,
  card: { x: number; y: number; width: number; height: number },
  grain: CanvasImageSource
) {
  const pattern = ctx.createPattern(grain, 'repeat');
  if (!pattern) return;
  pattern.setTransform(new DOMMatrix().scale(GRAIN_TILE_SCALE));
  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(card.x, card.y, card.width, card.height);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = pattern;
  ctx.fillRect(card.x, card.y, card.width, card.height);
  ctx.restore();
}

export function paintTemplate31Slide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    backgroundColor: string;
    text: string;
    isCover: boolean;
    grain: CanvasImageSource | null;
    fontFamily: string;
    markFontFamily: string;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    labelFontFamily?: string;
  }
) {
  const card = template31CardRect(frameWidth, frameHeight);
  const textColor = template31TextForBackground(options.backgroundColor);

  ctx.fillStyle = IMAGE_TEMPLATE31_FRAME_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const layer = document.createElement('canvas');
  layer.width = frameWidth;
  layer.height = frameHeight;
  const cardCtx = layer.getContext('2d');
  if (!cardCtx) return;
  cardCtx.save();
  traceRoundRect(cardCtx, card.x, card.y, card.width, card.height, card.radius);
  cardCtx.clip();
  cardCtx.fillStyle = options.backgroundColor;
  cardCtx.fillRect(card.x, card.y, card.width, card.height);
  if (options.grain) paintGrain(cardCtx, card, options.grain);
  cardCtx.restore();
  // Feather the card into the black frame. The mask stays on this layer,
  // so the background outside the card stays solid black.
  cardCtx.save();
  cardCtx.globalCompositeOperation = 'destination-in';
  cardCtx.filter = `blur(${Math.max(8, Math.round(frameWidth * IMAGE_TEMPLATE31_EDGE_BLUR_RATIO))}px)`;
  cardCtx.fillStyle = '#ffffff';
  traceRoundRect(cardCtx, card.x, card.y, card.width, card.height, card.radius);
  cardCtx.fill();
  cardCtx.restore();
  ctx.drawImage(layer, 0, 0);

  const { question, options: optionText } = options.isCover
    ? { question: options.text, options: '' }
    : splitCopycatQuestionAndOptions(options.text);
  const styledOptions = styleOptionLines(optionText);
  const hasOptions = Boolean(styledOptions) && !options.isCover;
  const isCta = Boolean(options.isCta) && !options.isCover;
  const maxWidth = card.width * IMAGE_TEMPLATE31_TEXT_MAX_WIDTH_RATIO;
  let fontSize = Math.round(
    frameWidth *
      (options.isCover
        ? IMAGE_TEMPLATE31_COVER_SIZE_RATIO
        : IMAGE_TEMPLATE31_QUESTION_SIZE_RATIO)
  );
  const optionScale = IMAGE_TEMPLATE31_OPTION_SIZE_RATIO / IMAGE_TEMPLATE31_QUESTION_SIZE_RATIO;
  let optionSize = Math.round(fontSize * optionScale);
  const minSize = Math.round(frameWidth * IMAGE_TEMPLATE31_QUESTION_MIN_SIZE_RATIO);
  const promoCeiling = card.y + imageTemplate2Q5PromoTextCeiling(card.width, card.height);
  const textTop = card.y + card.height * (hasOptions ? IMAGE_TEMPLATE31_OPTION_TOP_RATIO : 0.14);
  const maxBlockH = isCta
    ? Math.max(minSize * 2, promoCeiling - textTop)
    : card.height * (hasOptions ? 0.58 : 0.7);

  ctx.font = `400 ${fontSize}px ${options.fontFamily}`;
  let questionLines = wrapPreservingBreaks(ctx, question, maxWidth);
  let questionLineH = fontSize * IMAGE_TEMPLATE31_LINE_HEIGHT;
  ctx.font = `400 ${optionSize}px ${options.fontFamily}`;
  let optionLines = hasOptions ? wrapPreservingBreaks(ctx, styledOptions, maxWidth) : [];
  let optionLineH = optionSize * IMAGE_TEMPLATE31_OPTION_LINE_HEIGHT;
  const optionGap = optionLines.length ? fontSize * IMAGE_TEMPLATE31_OPTION_GAP : 0;
  let blockH =
    questionLines.length * questionLineH + optionGap + optionLines.length * optionLineH;
  while (fontSize > minSize && blockH > maxBlockH) {
    fontSize -= 1;
    optionSize = Math.round(fontSize * optionScale);
    ctx.font = `400 ${fontSize}px ${options.fontFamily}`;
    questionLines = wrapPreservingBreaks(ctx, question, maxWidth);
    questionLineH = fontSize * IMAGE_TEMPLATE31_LINE_HEIGHT;
    ctx.font = `400 ${optionSize}px ${options.fontFamily}`;
    optionLines = hasOptions ? wrapPreservingBreaks(ctx, styledOptions, maxWidth) : [];
    optionLineH = optionSize * IMAGE_TEMPLATE31_OPTION_LINE_HEIGHT;
    blockH =
      questionLines.length * questionLineH + optionGap + optionLines.length * optionLineH;
  }

  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  let textBottom = card.y;

  if (hasOptions) {
    const textX = card.x + card.width * IMAGE_TEMPLATE31_OPTION_INSET_RATIO;
    ctx.textAlign = 'left';
    ctx.font = `400 ${fontSize}px ${options.fontFamily}`;
    let y = card.y + card.height * IMAGE_TEMPLATE31_OPTION_TOP_RATIO + questionLineH / 2;
    for (const line of questionLines) {
      ctx.fillText(line, textX, y);
      y += questionLineH;
    }
    y += optionGap - questionLineH / 2 + optionLineH / 2;
    ctx.font = `400 ${optionSize}px ${options.fontFamily}`;
    for (const line of optionLines) {
      ctx.fillText(line, textX, y);
      y += optionLineH;
    }
    textBottom = y - optionLineH / 2;
  } else {
    ctx.textAlign = 'center';
    ctx.font = `400 ${fontSize}px ${options.fontFamily}`;
    const centerY = isCta
      ? (textTop + promoCeiling) / 2
      : card.y + card.height * IMAGE_TEMPLATE31_CENTER_RATIO;
    let y = centerY - blockH / 2 + questionLineH / 2;
    for (const line of questionLines) {
      ctx.fillText(line, card.x + card.width / 2, y);
      y += questionLineH;
    }
    textBottom = y - questionLineH / 2;
  }

  if (isCta) {
    ctx.save();
    traceRoundRect(ctx, card.x, card.y, card.width, card.height, card.radius);
    ctx.clip();
    ctx.translate(card.x, card.y);
    paintImageTemplate2Q5Promo(ctx, card.width, card.height, {
      promo: options.promo ?? null,
      fontFamily: options.labelFontFamily ?? '"TikTok Sans", system-ui, sans-serif',
      textColor,
      textBottom: Math.max(0, textBottom - card.y),
      fontWeight: 700,
    });
    ctx.restore();
    return;
  }

  const markSize = Math.round(frameWidth * IMAGE_TEMPLATE31_MARK_SIZE_RATIO);
  ctx.font = `500 ${markSize}px ${options.markFontFamily}`;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.72;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '0.04em';
  ctx.fillText(
    IMAGE_TEMPLATE31_MARK,
    card.x + card.width / 2,
    card.y + card.height * IMAGE_TEMPLATE31_MARK_Y_RATIO
  );
  ctx.letterSpacing = '0px';
  ctx.globalAlpha = 1;
}
