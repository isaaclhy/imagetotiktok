import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  imageTemplate2Q5PromoTextCeiling,
  paintImageTemplate2Q5Promo,
} from '@/app/lib/image-template-2-cover';
import { IMAGE_TEMPLATE16_ICON_SRC } from '@/app/lib/image-template-16-notes';

/**
 * Pink tilted-card slideshow (image template 27). 1080×1440.
 * Hot pink field, one cream card with a dark-brown offset shadow. The card
 * geometry follows template 24's tilted card (same rotate, fill, then stroke).
 * Copycat covers use "Ask him #N and watch his face". The last question keeps
 * its card and closes with template 2's App Store promo (same mock,
 * "Download for more questions!" label, and crop). There is no extra CTA slide.
 */
export const IMAGE_TEMPLATE27_BG = '#E85FA8';
export const IMAGE_TEMPLATE27_CARD = '#FFF9EE';
export const IMAGE_TEMPLATE27_INK = '#2A1A17';
export const IMAGE_TEMPLATE27_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE27_ICON_SRC = IMAGE_TEMPLATE16_ICON_SRC;
export const IMAGE_TEMPLATE27_FONT_STACK =
  '"Lilita One", "Arial Rounded MT Bold", Nunito, Arial, sans-serif';
export const IMAGE_TEMPLATE27_UI_FONT_STACK =
  'Ubuntu, "Segoe UI", Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE27_UI_BOLD_FONT_STACK =
  '"Ubuntu Bold", Ubuntu, "Segoe UI", Arial, Helvetica, sans-serif';

export const TEMPLATE27_AUDIENCES = ['him', 'her', 'partner'] as const;
export type Template27Audience = (typeof TEMPLATE27_AUDIENCES)[number];
export type Template27AudiencePick = Template27Audience | 'auto';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function isImageTemplate27Id(templateId: number | null | undefined): boolean {
  return templateId === 27;
}

export function isTemplate27Audience(value: string): value is Template27Audience {
  return (TEMPLATE27_AUDIENCES as readonly string[]).includes(value);
}

export function isTemplate27AudiencePick(value: string): value is Template27AudiencePick {
  return value === 'auto' || isTemplate27Audience(value);
}

/** Boyfriend / girlfriend / partner words in a competitor cover, else him. */
export function inferTemplate27Audience(coverText: string): Template27Audience {
  const text = coverText.toLowerCase();
  const him = /\b(boyfriend|boyfriends|bf|him|boys?)\b/.test(text);
  const her = /\b(girlfriend|girlfriends|gf|her|girls?)\b/.test(text);
  const partner = /\b(partner|spouse|them)\b/.test(text);
  if (him && !her) return 'him';
  if (her && !him) return 'her';
  if (partner && !him && !her) return 'partner';
  if (him) return 'him';
  if (her) return 'her';
  if (partner) return 'partner';
  return 'him';
}

export function template27CoverLabel(audience: Template27Audience): string {
  if (audience === 'her') return 'ASK YOUR GIRLFRIEND';
  if (audience === 'partner') return 'ASK YOUR PARTNER';
  return 'ASK YOUR BOYFRIEND';
}

export function template27CoverTitle(audience: Template27Audience, n: number): string {
  const number = Math.min(5, Math.max(1, Math.round(n) || 1));
  if (audience === 'her') return `Ask her #${number} and watch her face`;
  if (audience === 'partner') return `Ask your partner #${number} and watch their face`;
  return `Ask him #${number} and watch his face`;
}

export function template27QuestionTilt(questionIndex: number): number {
  return questionIndex % 2 === 0 ? -3 : 3;
}

export function template27PrimaryFontFamily(): string {
  return cssFamily('--font-lilita-one', 'Lilita One');
}

export function template27UiFontFamily(): string {
  return cssFamily('--font-ubuntu', 'Ubuntu');
}

export function template27UiBoldFontFamily(): string {
  return cssFamily('--font-ubuntu-bold', 'Ubuntu Bold');
}

export function template27CanvasFontStack(family = template27PrimaryFontFamily()): string {
  if (!family || family === 'Lilita One') return IMAGE_TEMPLATE27_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE27_FONT_STACK}`;
}

export function template27UiFontStack(family = template27UiFontFamily()): string {
  if (!family || family === 'Ubuntu') return IMAGE_TEMPLATE27_UI_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE27_UI_FONT_STACK}`;
}

export function template27UiBoldFontStack(family = template27UiBoldFontFamily()): string {
  if (!family || family === 'Ubuntu Bold') return IMAGE_TEMPLATE27_UI_BOLD_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE27_UI_BOLD_FONT_STACK}`;
}

export async function loadTemplate27Fonts(
  display = template27PrimaryFontFamily(),
  ui = template27UiFontFamily(),
  uiBold = template27UiBoldFontFamily()
): Promise<void> {
  const loads = [
    document.fonts.load(`400 96px ${quoteFamily(display)}`),
    document.fonts.load(`700 40px ${quoteFamily(uiBold)}`),
    document.fonts.load(`400 32px ${quoteFamily(ui)}`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

export function paintTemplate27Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCover?: boolean;
    isCta?: boolean;
    audience?: Template27Audience;
    promo?: CanvasImageSource | null;
    icon?: CanvasImageSource | null;
    fontFamily?: string;
    uiFontFamily?: string;
    uiBoldFontFamily?: string;
  }
) {
  const slideCount = Math.max(1, options.slideCount ?? 7);
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE27_FONT_STACK;
  const uiFontFamily = options.uiFontFamily ?? IMAGE_TEMPLATE27_UI_FONT_STACK;
  const uiBoldFontFamily = options.uiBoldFontFamily ?? template27UiBoldFontStack();
  const audience = options.audience ?? 'him';

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  setLetterSpacing(ctx, '0px');
  ctx.globalAlpha = 1;
  ctx.fillStyle = IMAGE_TEMPLATE27_BG;
  ctx.fillRect(0, 0, width, height);

  const questionIndex = Math.max(0, options.tabIndex - 1);
  const rotation = isCover ? -4 : template27QuestionTilt(questionIndex);
  const cardW = width * 0.84;
  const cardH = height * (isCover ? 0.54 : 0.6);
  let centerY = height * (isCover ? 0.4 : 0.42);
  let paintedW = cardW;
  let paintedH = cardH;
  if (isCta) {
    const fitted = fitCardAbovePromo(width, height, cardW, cardH, rotation);
    centerY = fitted.centerY;
    paintedW = fitted.cardW;
    paintedH = fitted.cardH;
  }
  const label = isCover ? template27CoverLabel(audience) : `QUESTION ${options.tabIndex}`;
  paintCard(ctx, width, centerY, paintedW, paintedH, rotation, (card) => {
    paintCardCopy(
      card,
      paintedW,
      paintedH,
      options.text,
      label,
      fontFamily,
      uiFontFamily,
      uiBoldFontFamily,
      isCover
    );
  });

  if (isCta) {
    const visualBottom = cardVisualBottom(width, centerY, paintedW, paintedH, rotation);
    const ceiling = imageTemplate2Q5PromoTextCeiling(width, height);
    paintImageTemplate2Q5Promo(ctx, width, height, {
      promo: options.promo ?? null,
      fontFamily: uiBoldFontFamily,
      textColor: '#FFFFFF',
      fontWeight: 700,
      textBottom: visualBottom > ceiling ? visualBottom : 0,
    });
    return;
  }

  const rad = (rotation * Math.PI) / 180;
  const cardBottom = centerY + cardH / 2 + Math.abs(Math.sin(rad)) * (cardW / 2);
  paintSwipePill(
    ctx,
    width,
    Math.min(height * 0.84, cardBottom + height * 0.065),
    uiBoldFontFamily
  );
  paintFooter(ctx, width, height, uiBoldFontFamily, options.icon ?? null);
}

function cssFamily(variable: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const raw = getComputedStyle(document.body).getPropertyValue(variable).trim();
  if (!raw) return fallback;
  const quoted = raw.match(/^['"]([^'"]+)['"]/);
  const first = quoted?.[1] ?? raw.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  return first || fallback;
}

function quoteFamily(family: string): string {
  if (family.startsWith('"') || family.startsWith("'")) return family;
  return family.includes(' ') ? `"${family}"` : family;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Same construction as template 24's question card: a solid offset shadow
 * card, then the fill and a thick stroke, then the caller paints inside
 * the rotated card (origin at the card centre).
 */
function paintCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  centerY: number,
  cardW: number,
  cardH: number,
  rotation: number,
  paintInside: (ctx: CanvasRenderingContext2D) => void
) {
  const radius = Math.min(cardW * 0.055, width * 0.04);
  const stroke = Math.max(8, width * (12 / 1080));
  const shadowX = width * (24 / 1080);
  const shadowY = width * (30 / 1080);
  const radians = (rotation * Math.PI) / 180;
  const cx = width / 2;

  ctx.save();
  ctx.translate(cx + shadowX, centerY + shadowY);
  ctx.rotate(radians);
  ctx.fillStyle = IMAGE_TEMPLATE27_INK;
  roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, centerY);
  ctx.rotate(radians);
  ctx.fillStyle = IMAGE_TEMPLATE27_CARD;
  roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, radius);
  ctx.fill();
  ctx.lineWidth = stroke;
  ctx.strokeStyle = IMAGE_TEMPLATE27_INK;
  ctx.lineJoin = 'round';
  ctx.stroke();
  paintInside(ctx);
  ctx.restore();
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
      } else hi = mid - 1;
    }
    parts.push(rest.slice(0, best));
    rest = rest.slice(best);
  }
  return parts;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, '').split('\n')) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let current = '';
    for (const word of words) {
      for (const chunk of breakOverflowToken(ctx, word, maxWidth)) {
        if (!current) {
          current = chunk;
          continue;
        }
        const next = `${current} ${chunk}`;
        if (ctx.measureText(next).width <= maxWidth) current = next;
        else {
          lines.push(current);
          current = chunk;
        }
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function optionLines(text: string): { question: string; options: string[] } {
  const split = splitCopycatQuestionAndOptions(text);
  const question = (split.question || text).trim();
  const options: string[] = [];
  for (const line of split.options.split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const marked = trimmed.match(/^(?:[A-Za-z]|\d+)\s*[.)]\s+(.+)$/);
    const body = (marked ? marked[1] : trimmed).trim();
    if (!body) continue;
    options.push(`${LETTERS[options.length] ?? String(options.length + 1)}) ${body}`);
  }
  return { question, options };
}

function paintCardCopy(
  ctx: CanvasRenderingContext2D,
  cardW: number,
  cardH: number,
  text: string,
  label: string,
  fontFamily: string,
  uiFontFamily: string,
  uiBoldFontFamily: string,
  isCover: boolean
) {
  const padX = cardW * 0.09;
  const maxWidth = cardW - padX * 2;
  const labelSize = Math.min(cardW * 0.042, cardH * 0.055);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = IMAGE_TEMPLATE27_INK;
  ctx.font = `700 ${labelSize}px ${uiBoldFontFamily}`;
  setLetterSpacing(ctx, `${labelSize * 0.16}px`);
  const labelY = -cardH / 2 + cardH * 0.12;
  ctx.fillText(label, 0, labelY);
  setLetterSpacing(ctx, '0px');

  const { question, options } = optionLines(text);
  const regionTop = labelY + labelSize * 0.9;
  const regionBottom = cardH / 2 - cardH * 0.1;
  const regionH = Math.max(cardH * 0.3, regionBottom - regionTop);
  let fontSize = Math.min(cardW * (isCover ? 0.105 : 0.078), regionH * 0.28);
  const minSize = cardW * 0.04;
  const fit = (size: number) => {
    ctx.font = `400 ${size}px ${fontFamily}`;
    const title = question ? wrapLines(ctx, question, maxWidth) : [];
    const optionSize = size * 0.62;
    ctx.font = `400 ${optionSize}px ${uiFontFamily}`;
    const optionWrapped = options.flatMap((option) => wrapLines(ctx, option, maxWidth));
    const titlePitch = size * 1.12;
    const optionPitch = optionSize * 1.35;
    const gap = title.length && optionWrapped.length ? size * 0.45 : 0;
    const block = title.length * titlePitch + gap + optionWrapped.length * optionPitch;
    return { title, optionWrapped, titlePitch, optionPitch, optionSize, gap, block };
  };
  let layout = fit(fontSize);
  while (fontSize > minSize && layout.block > regionH) {
    fontSize = Math.max(minSize, fontSize * 0.94);
    layout = fit(fontSize);
    if (fontSize === minSize) break;
  }
  let y = regionTop + (regionH - layout.block) / 2 + layout.titlePitch / 2;
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = IMAGE_TEMPLATE27_INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const line of layout.title) {
    ctx.fillText(line, 0, y);
    y += layout.titlePitch;
  }
  if (!layout.optionWrapped.length) return;
  y += layout.gap;
  ctx.font = `400 ${layout.optionSize}px ${uiFontFamily}`;
  ctx.textAlign = 'left';
  const optionX = -maxWidth / 2;
  for (const line of layout.optionWrapped) {
    ctx.fillText(line, optionX, y);
    y += layout.optionPitch;
  }
}

function paintSwipePill(
  ctx: CanvasRenderingContext2D,
  width: number,
  centerY: number,
  fontFamily: string
) {
  const size = width * 0.032;
  const label = 'swipe';
  ctx.font = `700 ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const metrics = ctx.measureText(label);
  const ascent = metrics.actualBoundingBoxAscent;
  const descent = metrics.actualBoundingBoxDescent;
  const inkLeft = metrics.actualBoundingBoxLeft;
  const inkRight = metrics.actualBoundingBoxRight;
  const hasInk =
    Number.isFinite(ascent) &&
    Number.isFinite(descent) &&
    ascent + descent > 0 &&
    Number.isFinite(inkLeft) &&
    Number.isFinite(inkRight) &&
    inkLeft + inkRight > 0;
  const textInkW = hasInk ? inkLeft + inkRight : metrics.width;
  const lineWidth = Math.max(2.5, size * 0.12);
  const arrowLen = size * 0.42;
  const head = size * 0.24;
  const gap = size * 0.38;
  const padX = size * 0.95;
  const arrowVisualW = arrowLen + lineWidth;
  const content = textInkW + gap + arrowVisualW;
  const pillW = content + padX * 2;
  const pillH = size * 2.2;
  const x = (width - pillW) / 2;
  const y = centerY - pillH / 2;
  ctx.fillStyle = IMAGE_TEMPLATE27_INK;
  roundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();

  const contentLeft = x + padX;
  const textX = contentLeft + (hasInk ? inkLeft : 0);
  const baseline = hasInk ? centerY + (ascent - descent) / 2 : centerY;
  ctx.fillStyle = IMAGE_TEMPLATE27_CARD;
  if (!hasInk) ctx.textBaseline = 'middle';
  ctx.fillText(label, textX, baseline);

  const shaftStart = contentLeft + textInkW + gap + lineWidth / 2;
  const shaftEnd = shaftStart + arrowLen;
  ctx.strokeStyle = IMAGE_TEMPLATE27_CARD;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(shaftStart, centerY);
  ctx.lineTo(shaftEnd, centerY);
  ctx.moveTo(shaftEnd - head, centerY - head);
  ctx.lineTo(shaftEnd, centerY);
  ctx.lineTo(shaftEnd - head, centerY + head);
  ctx.stroke();
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  icon: CanvasImageSource | null
) {
  const size = width * 0.05;
  const fontSize = width * 0.03;
  const label = IMAGE_TEMPLATE27_FOOTER;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  const textW = ctx.measureText(label).width;
  const gap = width * 0.016;
  const total = size + gap + textW;
  const x = (width - total) / 2;
  const cy = height * 0.935;
  const ix = x;
  const iy = cy - size / 2;
  ctx.save();
  roundRect(ctx, ix, iy, size, size, size * 0.22);
  ctx.clip();
  if (icon) {
    ctx.drawImage(icon, ix, iy, size, size);
  } else {
    ctx.fillStyle = '#7C4DFF';
    ctx.fillRect(ix, iy, size, size);
  }
  ctx.restore();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.fillText(label, x + size + gap, cy);
}

function rotatedHalfHeight(cardW: number, cardH: number, rotationDeg: number): number {
  const rad = (Math.abs(rotationDeg) * Math.PI) / 180;
  return Math.abs(Math.cos(rad)) * (cardH / 2) + Math.abs(Math.sin(rad)) * (cardW / 2);
}

function cardVisualBottom(
  width: number,
  centerY: number,
  cardW: number,
  cardH: number,
  rotationDeg: number
): number {
  return centerY + rotatedHalfHeight(cardW, cardH, rotationDeg) + width * (30 / 1080);
}

/** Shrink and lift the question card so it stays above template 2's resting promo. */
function fitCardAbovePromo(
  width: number,
  height: number,
  cardW: number,
  cardH: number,
  rotationDeg: number
): { centerY: number; cardW: number; cardH: number } {
  const ceiling = imageTemplate2Q5PromoTextCeiling(width, height) - height * 0.012;
  const topPad = height * 0.075;
  const shadowY = width * (30 / 1080);
  let scale = 1;
  while (scale > 0.52) {
    const half = rotatedHalfHeight(cardW * scale, cardH * scale, rotationDeg);
    if (half * 2 + shadowY <= ceiling - topPad) break;
    scale = Math.max(0.52, scale - 0.03);
    if (scale === 0.52) break;
  }
  const paintedW = cardW * scale;
  const paintedH = cardH * scale;
  const half = rotatedHalfHeight(paintedW, paintedH, rotationDeg);
  const roomTop = topPad + half;
  const roomBottom = ceiling - shadowY - half;
  const centerY = roomBottom > roomTop ? (roomTop + roomBottom) / 2 : roomTop;
  return { centerY, cardW: paintedW, cardH: paintedH };
}
