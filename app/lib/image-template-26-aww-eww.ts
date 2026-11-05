import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import { IMAGE_TEMPLATE2_Q5_PROMO_ASPECT } from '@/app/lib/image-template-2-cover';

/**
 * Grey "aww or eww" slideshow (image template 26). 1080×1440.
 * Cover is a mid grey field, a small underlined header, and a two-tone
 * Ubuntu title. Question slides cycle solid greys with a thin progress
 * bar. The last slide is its own CTA with template 2's App Store phone.
 * The only illustration is an original bunny sticker on the cover.
 */
export const IMAGE_TEMPLATE26_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE26_HEADER = IMAGE_TEMPLATE2_APP_FOOTER;
export const IMAGE_TEMPLATE26_COVER_BG = '#5C5C5C';
export const IMAGE_TEMPLATE26_CTA_BG = '#D9D9D9';
export const IMAGE_TEMPLATE26_ORANGE = '#FFB45A';
export const IMAGE_TEMPLATE26_CTA_LABEL =
  'Want 1,000+ MORE?\nWe saved the best for the app';
export const IMAGE_TEMPLATE26_QUESTION_COLORS = [
  '#9A9A9A',
  '#000000',
  '#151515',
  '#2D2D2D',
  '#F0F0F0',
  '#5C5C5C',
  '#1A1A1A',
  '#C8C8C8',
  '#3A3A3A',
  '#E4E4E4',
] as const;

export const IMAGE_TEMPLATE26_FONT_STACK =
  'Ubuntu, "Segoe UI", Arial, Helvetica, sans-serif';
export const IMAGE_TEMPLATE26_BOLD_FONT_STACK =
  '"Ubuntu Bold", Ubuntu, "Segoe UI", Arial, Helvetica, sans-serif';

const AWW_EWW = ['A) aww', 'B) eww'] as const;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function isImageTemplate26Id(templateId: number | null | undefined): boolean {
  return templateId === 26;
}

export function template26PrimaryFontFamily(): string {
  return cssFamily('--font-ubuntu', 'Ubuntu');
}

export function template26BoldFontFamily(): string {
  return cssFamily('--font-ubuntu-bold', 'Ubuntu Bold');
}

export function template26CanvasFontStack(family = template26PrimaryFontFamily()): string {
  if (!family || family === 'Ubuntu') return IMAGE_TEMPLATE26_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE26_FONT_STACK}`;
}

export function template26BoldFontStack(family = template26BoldFontFamily()): string {
  if (!family || family === 'Ubuntu Bold') return IMAGE_TEMPLATE26_BOLD_FONT_STACK;
  return `"${family}", ${IMAGE_TEMPLATE26_BOLD_FONT_STACK}`;
}

export async function loadTemplate26Fonts(
  family = template26PrimaryFontFamily(),
  bold = template26BoldFontFamily()
): Promise<void> {
  const loads = [
    document.fonts.load(`400 48px ${quoteFamily(family)}`),
    document.fonts.load(`700 88px ${quoteFamily(bold)}`),
  ];
  await Promise.all(loads.map((pending) => pending.catch(() => undefined)));
  await document.fonts.ready;
}

export function template26Background(tabIndex: number, isCta = false): string {
  if (isCta) return IMAGE_TEMPLATE26_CTA_BG;
  if (tabIndex <= 0) return IMAGE_TEMPLATE26_COVER_BG;
  const slot = (tabIndex - 1) % IMAGE_TEMPLATE26_QUESTION_COLORS.length;
  return IMAGE_TEMPLATE26_QUESTION_COLORS[slot] ?? IMAGE_TEMPLATE26_QUESTION_COLORS[0];
}

/** First phrase in orange, the rest in white. A question mark is the preferred break. */
export function template26CoverLines(title: string): { orange: string; white: string } {
  const text = title.replace(/\s+/g, ' ').trim();
  if (!text) return { orange: '', white: '' };
  const marked = text.match(/^(.*?\?)\s+(.+)$/);
  if (marked) return { orange: marked[1]!.trim(), white: marked[2]!.trim() };
  const words = text.split(' ').filter(Boolean);
  if (words.length < 2) return { orange: text, white: '' };
  const mid = Math.ceil(words.length / 2);
  return {
    orange: words.slice(0, mid).join(' '),
    white: words.slice(mid).join(' '),
  };
}

/**
 * Feed options become "A) …" lines. A statement with no options falls back
 * to aww / eww. A real question with no options stays a question.
 */
export function template26AnswerLines(text: string): { question: string; options: string[] } {
  const split = splitCopycatQuestionAndOptions(text);
  const question = (split.question || text).trim();
  const fromFeed = parseOptionBodies(split.options);
  if (fromFeed.length > 0) {
    return {
      question,
      options: fromFeed.map((body, index) => `${LETTERS[index] ?? String(index + 1)}) ${body}`),
    };
  }
  if (!question.includes('?')) return { question, options: [...AWW_EWW] };
  return { question, options: [] };
}

export function paintTemplate26Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCover?: boolean;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    fontFamily?: string;
    boldFontFamily?: string;
  }
) {
  const slideCount = Math.max(1, options.slideCount ?? 7);
  const isCta = options.isCta ?? (options.tabIndex === slideCount - 1 && slideCount > 1);
  const isCover = options.isCover ?? (options.tabIndex === 0 && !isCta);
  const fontFamily = options.fontFamily ?? IMAGE_TEMPLATE26_FONT_STACK;
  const boldFontFamily = options.boldFontFamily ?? template26BoldFontStack();
  const background = template26Background(options.tabIndex, isCta);

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  setLetterSpacing(ctx, '0px');
  ctx.globalAlpha = 1;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  if (isCta) {
    paintCta(ctx, width, height, boldFontFamily, options.promo ?? null);
    return;
  }

  if (isCover) {
    paintCover(ctx, width, height, options.text, fontFamily, boldFontFamily);
    return;
  }

  paintProgress(ctx, width, height, (options.tabIndex + 1) / slideCount, background);
  paintQuestion(ctx, width, height, options.text, fontFamily, background);
  paintFooter(ctx, width, height, fontFamily, background);
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

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '').trim();
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const channels = hexToRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function isLightBackground(hex: string): boolean {
  return luminance(hex) > 0.22;
}

function textColor(background: string): string {
  return isLightBackground(background) ? '#1E1D25' : '#F4F4F4';
}

function footerColor(background: string): string {
  return isLightBackground(background) ? '#6E6E72' : '#9A9A9A';
}

function parseOptionBodies(options: string): string[] {
  if (!options.trim()) return [];
  const bodies: string[] = [];
  for (const line of options.split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const marked = trimmed.match(/^(?:[A-Za-z]|\d+)\s*[.)]\s+(.+)$/);
    const body = (marked ? marked[1] : trimmed).trim();
    if (body) bodies.push(body);
  }
  return bodies;
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

function inkAscent(ctx: CanvasRenderingContext2D, fontSize: number): number {
  const box = ctx.measureText('Hyg');
  return box.actualBoundingBoxAscent || fontSize * 0.75;
}

function paintProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ratio: number,
  background: string
) {
  const inset = width * 0.08;
  const y = height * 0.043;
  const barH = Math.max(6, height * 0.0062);
  const barW = width - inset * 2;
  const light = luminance(background) > 0.7;
  const track = light ? '#CFCFCF' : '#6E6E6E';
  const fill = light ? '#3A3A3A' : '#F2F2F0';
  ctx.fillStyle = track;
  ctx.fillRect(inset, y, barW, barH);
  const filled = Math.max(0, Math.min(1, ratio)) * barW;
  ctx.fillStyle = fill;
  ctx.fillRect(inset, y, filled, barH);
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fontFamily: string,
  background: string
) {
  const size = width * 0.03;
  ctx.font = `400 ${size}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = footerColor(background);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE26_FOOTER, width / 2, height * 0.94);
}

function paintCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  firstBaseline: number,
  pitch: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let y = firstBaseline;
  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += pitch;
  }
}

function paintCover(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  fontFamily: string,
  boldFontFamily: string
) {
  const headerSize = width * 0.033;
  ctx.font = `400 ${headerSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = '#F4F4F4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const headerY = height * 0.195;
  ctx.fillText(IMAGE_TEMPLATE26_HEADER, width / 2, headerY);
  const headerWidth = ctx.measureText(IMAGE_TEMPLATE26_HEADER).width;
  const rule = Math.max(2, width * 0.0026);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect((width - headerWidth) / 2, headerY + headerSize * 0.48, headerWidth, rule);

  const parts = template26CoverLines(title);
  const maxWidth = width * 0.86;
  let fontSize = width * 0.078;
  const minSize = width * 0.046;
  const layoutAt = (size: number) => {
    ctx.font = `700 ${size}px ${boldFontFamily}`;
    const orange = parts.orange ? wrapLines(ctx, parts.orange, maxWidth) : [];
    const white = parts.white ? wrapLines(ctx, parts.white, maxWidth) : [];
    const pitch = size * 1.16;
    const gap = orange.length && white.length ? size * 0.28 : 0;
    const ascent = inkAscent(ctx, size);
    const lines = orange.length + white.length;
    const block = (lines > 0 ? ascent : 0) + Math.max(0, lines - 1) * pitch + gap;
    return { orange, white, pitch, gap, ascent, block };
  };
  let layout = layoutAt(fontSize);
  while (fontSize > minSize && layout.block > height * 0.34) {
    fontSize = Math.max(minSize, fontSize - width * 0.002);
    layout = layoutAt(fontSize);
    if (fontSize === minSize) break;
  }
  ctx.font = `700 ${fontSize}px ${boldFontFamily}`;
  const center = height * 0.45;
  let baseline = center - layout.block / 2 + layout.ascent;
  if (layout.orange.length) {
    paintCenteredLines(ctx, layout.orange, width / 2, baseline, layout.pitch, IMAGE_TEMPLATE26_ORANGE);
    baseline += layout.orange.length * layout.pitch + layout.gap;
  }
  if (layout.white.length) {
    ctx.font = `700 ${fontSize}px ${boldFontFamily}`;
    paintCenteredLines(ctx, layout.white, width / 2, baseline, layout.pitch, '#FFFFFF');
  }

  paintBunny(ctx, width, height);
}

function paintQuestion(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  fontFamily: string,
  background: string
) {
  const { question, options } = template26AnswerLines(text);
  if (!question && options.length === 0) return;
  const margin = width * 0.082;
  const maxWidth = width * 0.82;
  const top = height * 0.38;
  const limit = height * 0.9;
  let fontSize = width * 0.044;
  const minSize = width * 0.03;
  const measure = (size: number) => {
    ctx.font = `400 ${size}px ${fontFamily}`;
    const questionLines = question ? wrapLines(ctx, question, maxWidth) : [];
    const optionLines = options.flatMap((option) => wrapLines(ctx, option, maxWidth));
    const pitch = size * 1.38;
    const gap = questionLines.length && optionLines.length ? size * 0.95 : 0;
    const block =
      questionLines.length * pitch +
      gap +
      optionLines.length * pitch;
    return { questionLines, optionLines, pitch, gap, block };
  };
  let layout = measure(fontSize);
  while (fontSize > minSize && top + layout.block > limit) {
    fontSize = Math.max(minSize, fontSize - width * 0.0015);
    layout = measure(fontSize);
    if (fontSize === minSize) break;
  }
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = textColor(background);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const ascent = inkAscent(ctx, fontSize);
  let y = top + ascent;
  for (const line of layout.questionLines) {
    ctx.fillText(line, margin, y);
    y += layout.pitch;
  }
  if (layout.optionLines.length) y += layout.gap;
  for (const line of layout.optionLines) {
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor(background);
    ctx.fillText(line, margin, y);
    y += layout.pitch;
  }
}

function paintCta(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  boldFontFamily: string,
  promo: CanvasImageSource | null
) {
  const maxWidth = width * 0.78;
  const fontSize = width * 0.052;
  ctx.font = `700 ${fontSize}px ${boldFontFamily}`;
  setLetterSpacing(ctx, '0px');
  const lines = wrapLines(ctx, IMAGE_TEMPLATE26_CTA_LABEL, maxWidth);
  const pitch = fontSize * 1.22;
  const ascent = inkAscent(ctx, fontSize);
  const first = height * 0.175 + ascent;
  paintCenteredLines(ctx, lines, width / 2, first, pitch, '#1E1D25');

  if (!promo) return;
  const promoWidth = width * 0.62;
  const promoHeight = promoWidth / IMAGE_TEMPLATE2_Q5_PROMO_ASPECT;
  const phoneTop = height * 0.42;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(promo, (width - promoWidth) / 2, phoneTop, promoWidth, promoHeight);
}

/**
 * Original bunny. White head, pink inner ears and cheeks, dark outline.
 * It peeks in from the bottom-left and is clipped by the frame.
 */
function paintBunny(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = (width / 1080) * 1.38;
  ctx.save();
  ctx.translate(width * -0.055, height * 0.745);
  ctx.scale(scale, scale);
  const outline = '#3A261C';
  const stroke = 11;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const ear = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 86, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = stroke;
    ctx.strokeStyle = outline;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 10, 16, 52, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F7A8C4';
    ctx.fill();
    ctx.restore();
  };
  ear(118, 78, -0.28);
  ear(196, 70, 0.16);

  ctx.beginPath();
  ctx.ellipse(168, 196, 118, 108, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = stroke;
  ctx.strokeStyle = outline;
  ctx.stroke();

  ctx.fillStyle = '#F4A3BE';
  ctx.beginPath();
  ctx.ellipse(96, 210, 24, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(238, 206, 24, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2A1A17';
  ctx.beginPath();
  ctx.ellipse(128, 184, 9, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(206, 180, 9, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(131, 180, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(209, 176, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#F29BB8';
  ctx.beginPath();
  ctx.ellipse(168, 214, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = outline;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(152, 230);
  ctx.quadraticCurveTo(168, 244, 184, 230);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(250, 268, 32, 24, 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = stroke;
  ctx.strokeStyle = outline;
  ctx.stroke();

  ctx.restore();
}
