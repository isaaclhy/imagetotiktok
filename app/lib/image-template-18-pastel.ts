import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

/**
 * Pastel question slideshow (image template 18).
 * Cover + five questions. Q5 is the last question and closes with template 2's
 * App Store promo — there is no extra empty CTA tab.
 *
 * Styles share that slide count and question bank. "Pastel" is the original
 * look. The other styles are the @trydeepen card treatments measured from the
 * 2160×2880 posts (export is 1080×1440, so pixel sizes are halved).
 */
export const IMAGE_TEMPLATE18_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE18_SLIDE_COUNT = IMAGE_TEMPLATE18_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE18_CTA_TAB = IMAGE_TEMPLATE18_QUESTION_COUNT;
export const IMAGE_TEMPLATE18_COVER_SRC = '/image-templates/template-18-cover.png';

export const IMAGE_TEMPLATE18_TEXT = '#3A342F';
export const IMAGE_TEMPLATE18_FONT_STACK =
  '"Liberation Serif", "Times New Roman", Times, serif';
export const IMAGE_TEMPLATE18_FONT_CSS =
  '"Liberation Serif", "Times New Roman", Times, serif';
export const IMAGE_TEMPLATE18_SANS_STACK = '"Poppins", "TikTok Sans", system-ui, sans-serif';
export const IMAGE_TEMPLATE18_PASTEL_FONT_STACK =
  '"Libre Baskerville", Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE18_FONT_WEIGHT = 400;
export const IMAGE_TEMPLATE18_LINE_HEIGHT = 1.28;
export const IMAGE_TEMPLATE18_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;

/** Full-bleed frame behind the bulged card. */
export const IMAGE_TEMPLATE18_CANVAS_BG = '#000000';
/**
 * Black gap at the middle of each side, as a fraction of frame width.
 * The same pixel thickness is used on the top and bottom.
 */
export const IMAGE_TEMPLATE18_CARD_MARGIN = 0.025;
/**
 * How far the middle of each side bows outward from the straight edge,
 * as a fraction of frame width. About 1% — a slight convex bow, not a wave.
 */
export const IMAGE_TEMPLATE18_CARD_BULGE = 0.01;
/** Corner radius on a 1080-wide frame. The bulged card is square; only the red rounded style uses a radius. */
export const IMAGE_TEMPLATE18_CARD_RADIUS_AT_1080 = 10;

/**
 * Bulged-card outline measured on pastel_0438_s02 at 1080×1440.
 * Mid-side x is 17..1062, centre top/bottom y is 39..1400, and the
 * sin bow adds 25px of sideways bulge and 17px of vertical bulge.
 */
export const IMAGE_TEMPLATE18_EDGE_LEFT = 17 / 1080;
export const IMAGE_TEMPLATE18_EDGE_RIGHT = 1062 / 1080;
export const IMAGE_TEMPLATE18_EDGE_TOP = 39 / 1440;
export const IMAGE_TEMPLATE18_EDGE_BOTTOM = 1400 / 1440;
export const IMAGE_TEMPLATE18_BULGE_X = 25 / 1080;
export const IMAGE_TEMPLATE18_BULGE_Y = 17 / 1440;

export const IMAGE_TEMPLATE18_PROGRESS_H = 0.0065;
export const IMAGE_TEMPLATE18_PROGRESS_GAP = 0.012;
/** The active segment is only partly filled, like a story bar mid-slide. */
export const IMAGE_TEMPLATE18_PROGRESS_ACTIVE = 0.62;
export const IMAGE_TEMPLATE18_PROGRESS_TRACK = 'rgba(55, 42, 36, 0.18)';

export const IMAGE_TEMPLATE18_FOOTER_SIZE = 0.026;

/**
 * One pastel per studio slide, in the order of the reference posts:
 * mint cover, then light blue, lavender, pink, beige, and a yellow close.
 * Accent colours tint that slide's progress bar.
 */
export const IMAGE_TEMPLATE18_SLIDES = [
  { bg: '#C7E8D8', accent: '#C4A15A' },
  { bg: '#C5E6EF', accent: '#C4A15A' },
  { bg: '#DDD6EE', accent: '#6E56B0' },
  { bg: '#F3D0DC', accent: '#C4475A' },
  { bg: '#E8DCC6', accent: '#2F8F86' },
  { bg: '#F6E7A4', accent: '#C46A3A' },
] as const;

export type Template18StyleId =
  | 'pastel'
  | 'pastel-true'
  | 'dark-moody'
  | 'deep-red'
  | 'red-rounded';

export const IMAGE_TEMPLATE18_STYLE_OPTIONS: ReadonlyArray<{
  id: Template18StyleId;
  label: string;
}> = [
  { id: 'pastel', label: 'Pastel' },
  { id: 'pastel-true', label: 'Pastel (true)' },
  { id: 'dark-moody', label: 'Dark moody' },
  { id: 'deep-red', label: 'Deep red' },
  { id: 'red-rounded', label: 'Red rounded card' },
];

export const IMAGE_TEMPLATE18_DEFAULT_STYLE: Template18StyleId = 'pastel';

/**
 * Scanline contrast. At 2160-wide the posts alternate 2 light rows and 2 dark
 * rows (FFT period 4). Dark rows are the light rows multiplied by about 0.67
 * (measured ~0.70–0.75 on the bright pastels, ~0.67 on the dark brown's red
 * channel). 0.70 sits in that range and keeps the stripes visible without
 * crushing the pastel light rows.
 */
export const IMAGE_TEMPLATE18_SCANLINE_FACTOR = 0.73;

/**
 * Bright cards photograph closer to 0.80 once the 2 px rows are JPEG-softened.
 * Dark cards stay nearer the measured 0.67–0.73 multiply.
 */
export function template18ScanlineFactor(style: Template18StyleId): number {
  if (style === 'pastel' || style === 'pastel-true') return 0.82;
  return IMAGE_TEMPLATE18_SCANLINE_FACTOR;
}

/**
 * Real @trydeepen pastel centres, sampled on the dark scanline row
 * (mint #96C0B4, blue #93BAC1, …). The fill below is the light row: the
 * photographed bright stripe, so a 0.70 multiply lands on those hexes.
 * Order matches the 6 studio slides; the olive close is the CTA.
 * Mauve sits on Q4 (the real post's fifth card); beige is the spare tone
 * used when a slide index falls past mauve.
 */
export const IMAGE_TEMPLATE18_PASTEL_TRUE_SLIDES = [
  { bg: '#C6EEE3', accent: '#C4A15A', sample: '#96C0B4' },
  { bg: '#BDEAEE', accent: '#C4A15A', sample: '#93BAC1' },
  { bg: '#D6D9E9', accent: '#7A6E9A', sample: '#A7ACC0' },
  { bg: '#EDD5E7', accent: '#C45A78', sample: '#BFA6B9' },
  { bg: '#E9D8E8', accent: '#9A7896', sample: '#C0AABF' },
  { bg: '#E7E0CF', accent: '#8A7A58', sample: '#C0B5A1' },
  { bg: '#E7E6AD', accent: '#A09040', sample: '#BFBE7D' },
] as const;

/**
 * Dark-moody light-row fills. The stated centres (brown #301F15, wine #2C191B,
 * forest #17261F, plum #271732, slate #1F1E23, navy #19223F) are the dark
 * scanline. These fills are the measured bright stripe (~+24 RGB).
 */
export const IMAGE_TEMPLATE18_DARK_SLIDES = [
  { bg: '#49382E', sample: '#301F15' },
  { bg: '#433032', sample: '#2C191B' },
  { bg: '#2E3D36', sample: '#17261F' },
  { bg: '#3F2F4A', sample: '#271732' },
  { bg: '#37363B', sample: '#1F1E23' },
  { bg: '#313A57', sample: '#19223F' },
] as const;

/** Deep-red light-row centres. Stated range #5C0100–#6E1312 is the dark stripe. */
export const IMAGE_TEMPLATE18_DEEP_RED_SLIDES = [
  { bg: '#7B2316', sample: '#5C1209' },
  { bg: '#801E16', sample: '#5E140B' },
  { bg: '#7A2018', sample: '#60160D' },
  { bg: '#8C241C', sample: '#6E1312' },
  { bg: '#6E1A14', sample: '#5C0100' },
  { bg: '#7E2218', sample: '#6A0F0E' },
] as const;

export const IMAGE_TEMPLATE18_ROUNDED_CARD = '#740605';
export const IMAGE_TEMPLATE18_ROUNDED_FRAME_INNER = '#2B1615';
export const IMAGE_TEMPLATE18_ROUNDED_FRAME_OUTER = '#1C0706';

export const IMAGE_TEMPLATE18_PASTEL_TRUE_TEXT = '#2C2A28';
export const IMAGE_TEMPLATE18_OFFWHITE = '#F4F1EA';
export const IMAGE_TEMPLATE18_WHITE = '#FFFFFF';

export function isImageTemplate18Id(templateId: number | null | undefined): boolean {
  return templateId === 18;
}

export function isTemplate18StyleId(value: string): value is Template18StyleId {
  return IMAGE_TEMPLATE18_STYLE_OPTIONS.some((option) => option.id === value);
}

/** Bulged-card styles keep the black frame. The red card sits on a maroon frame. */
export function template18CanvasBackground(style: Template18StyleId = 'pastel'): string {
  return style === 'red-rounded' ? IMAGE_TEMPLATE18_ROUNDED_FRAME_OUTER : IMAGE_TEMPLATE18_CANVAS_BG;
}

export function template18HasProgress(style: Template18StyleId): boolean {
  return style === 'pastel' || style === 'pastel-true';
}

/**
 * Scanlines are part of every bulged-card style. Only the original pastel
 * exposes them as a toggle (default on). The rounded red card has none.
 */
export function resolveTemplate18Scanlines(
  style: Template18StyleId,
  toggle = true
): boolean {
  if (style === 'red-rounded') return false;
  if (style === 'pastel') return toggle;
  return true;
}

type Template18Tone = { bg: string; accent: string };

function toneAt(slides: ReadonlyArray<{ bg: string; accent?: string }>, index: number, fallbackAccent: string): Template18Tone {
  const count = slides.length;
  const safe = ((index % count) + count) % count;
  const slide = slides[safe]!;
  return { bg: slide.bg, accent: slide.accent ?? fallbackAccent };
}

export function template18SlideStyle(
  tabIndex: number,
  style: Template18StyleId = 'pastel'
): Template18Tone {
  if (style === 'pastel-true') return toneAt(IMAGE_TEMPLATE18_PASTEL_TRUE_SLIDES, tabIndex, '#C4A15A');
  if (style === 'dark-moody') return toneAt(IMAGE_TEMPLATE18_DARK_SLIDES, tabIndex, '#FFFFFF');
  if (style === 'deep-red') return toneAt(IMAGE_TEMPLATE18_DEEP_RED_SLIDES, tabIndex, '#FFFFFF');
  if (style === 'red-rounded') return { bg: IMAGE_TEMPLATE18_ROUNDED_CARD, accent: '#FFFFFF' };
  return toneAt(IMAGE_TEMPLATE18_SLIDES, tabIndex, '#C4A15A');
}

/** CTA slides use the closing colour so the promo sits on the same ground. */
export function template18Background(
  tabIndex: number,
  isCta: boolean,
  style: Template18StyleId = 'pastel'
): string {
  if (style === 'red-rounded') return IMAGE_TEMPLATE18_ROUNDED_CARD;
  if (style === 'pastel-true') {
    if (isCta) return IMAGE_TEMPLATE18_PASTEL_TRUE_SLIDES[IMAGE_TEMPLATE18_PASTEL_TRUE_SLIDES.length - 1]!.bg;
    return template18SlideStyle(tabIndex, style).bg;
  }
  if (isCta && style === 'pastel') return IMAGE_TEMPLATE18_SLIDES[IMAGE_TEMPLATE18_SLIDES.length - 1]!.bg;
  return template18SlideStyle(tabIndex, style).bg;
}

export function template18Accent(
  tabIndex: number,
  isCta: boolean,
  style: Template18StyleId = 'pastel'
): string {
  if (style === 'pastel-true' && isCta) {
    return IMAGE_TEMPLATE18_PASTEL_TRUE_SLIDES[IMAGE_TEMPLATE18_PASTEL_TRUE_SLIDES.length - 1]!.accent;
  }
  if (style === 'pastel' && isCta) return IMAGE_TEMPLATE18_SLIDES[IMAGE_TEMPLATE18_SLIDES.length - 1]!.accent;
  return template18SlideStyle(tabIndex, style).accent;
}

/** Darkest text pixels sampled from the pastel reference slides, one per studio colour. */
const IMAGE_TEMPLATE18_PASTEL_TRUE_TEXT_SLIDES = [
  '#262F24',
  '#3B374B',
  '#3A3452',
  '#453247',
  '#3E3042',
  '#463C30',
  '#3A381E',
] as const;

/** Footer ink, lighter and tinted to the same slide. */
const IMAGE_TEMPLATE18_PASTEL_TRUE_FOOTER_SLIDES = [
  '#3A4B46',
  '#5B6A77',
  '#555E6C',
  '#77606F',
  '#6A5866',
  '#6A6452',
  '#565428',
] as const;

function slideHex(slides: readonly string[], tabIndex: number): string {
  const count = slides.length;
  const index = ((tabIndex % count) + count) % count;
  return slides[index]!;
}

export function template18TextColor(style: Template18StyleId, tabIndex = 0): string {
  if (style === 'pastel') return IMAGE_TEMPLATE18_TEXT;
  if (style === 'pastel-true') return slideHex(IMAGE_TEMPLATE18_PASTEL_TRUE_TEXT_SLIDES, tabIndex);
  if (style === 'dark-moody') return '#F6F7F5';
  if (style === 'deep-red') return '#F6EBEE';
  return '#F3DBDC';
}

export function template18FooterColor(style: Template18StyleId, tabIndex = 0): string {
  if (style === 'pastel') return IMAGE_TEMPLATE18_TEXT;
  if (style === 'pastel-true') return slideHex(IMAGE_TEMPLATE18_PASTEL_TRUE_FOOTER_SLIDES, tabIndex);
  if (style === 'dark-moody') return '#F4F5F3';
  if (style === 'deep-red') return '#F3E4E6';
  return '#F3DBDC';
}

export type Template18Card = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  radius: number;
  bulgeX: number;
  bulgeY: number;
  shape: 'bulge' | 'round';
};

/**
 * Corner box of an almost-rectangular card.
 * Each side's midpoint bows outward by `bulge` (1% of width), so the black
 * margin is thinnest there and only a little wider at the corners.
 * The red rounded style is a separate shape: nearly-square corners (~2.5% of
 * width) on a maroon frame, with no bow.
 */
export function template18Card(
  width: number,
  height: number,
  style: Template18StyleId = 'pastel'
): Template18Card {
  if (style === 'red-rounded') {
    const insetX = width * 0.055;
    const insetY = height * 0.045;
    return {
      left: insetX,
      right: width - insetX,
      top: insetY,
      bottom: height - insetY,
      radius: width * 0.018,
      bulgeX: 0,
      bulgeY: 0,
      shape: 'round',
    };
  }
  const bulgeX = width * IMAGE_TEMPLATE18_BULGE_X;
  const bulgeY = height * IMAGE_TEMPLATE18_BULGE_Y;
  const leftCenter = width * IMAGE_TEMPLATE18_EDGE_LEFT;
  const rightCenter = width * IMAGE_TEMPLATE18_EDGE_RIGHT;
  const topCenter = height * IMAGE_TEMPLATE18_EDGE_TOP;
  const bottomCenter = height * IMAGE_TEMPLATE18_EDGE_BOTTOM;
  return {
    left: leftCenter + bulgeX,
    right: rightCenter - bulgeX,
    top: topCenter + bulgeY,
    bottom: bottomCenter - bulgeY,
    radius: 0,
    bulgeX,
    bulgeY,
    shape: 'bulge',
  };
}

/** Promo geometry in full-frame coordinates, sized to the card so it stays on the card. */
export function template18PromoLayout(
  width: number,
  height: number,
  style: Template18StyleId = 'pastel'
): { x: number; y: number; width: number; height: number } {
  const card = template18Card(width, height, style);
  const innerW = card.right - card.left;
  const innerH = card.bottom - card.top;
  const layout = imageTemplate2Q5PromoLayout(innerW, innerH, 0);
  return {
    x: card.left + layout.x,
    y: card.top + layout.y,
    width: layout.width,
    height: layout.height,
  };
}

export type Template18Kind = 'cover' | 'question' | 'cta';

export function template18Kind(tabIndex: number, isCta: boolean): Template18Kind {
  if (tabIndex <= 0) return 'cover';
  if (isCta) return 'cta';
  return 'question';
}

type Template18Band = {
  top: number;
  bottom: number;
  maxWidth: number;
  preferred: number;
  min: number;
};

function template18LineHeight(style: Template18StyleId): number {
  return style === 'pastel' ? IMAGE_TEMPLATE18_LINE_HEIGHT : 1.42;
}

function template18CoverPreferred(style: Template18StyleId): number {
  if (style === 'pastel') return 0.072;
  if (style === 'dark-moody') return 0.07;
  if (style === 'deep-red') return 0.062;
  if (style === 'pastel-true') return 0.07;
  return 0.05;
}

function template18QuestionPreferred(style: Template18StyleId): number {
  if (style === 'pastel-true') return 0.052;
  if (style === 'dark-moody') return 0.05;
  if (style === 'deep-red') return 0.05;
  if (style === 'red-rounded') return 0.044;
  return 0.056;
}

/** Vertical centre of the text block, as a fraction of the frame height. */
function template18TextCenter(style: Template18StyleId, kind: Template18Kind): number | null {
  if (style === 'pastel' || kind === 'cta') return null;
  if (style === 'pastel-true') return kind === 'cover' ? 0.504 : 0.492;
  if (style === 'dark-moody') return kind === 'cover' ? 0.477 : 0.483;
  if (style === 'deep-red') return kind === 'cover' ? 0.475 : 0.455;
  if (style === 'red-rounded') return kind === 'cover' ? 0.508 : 0.538;
  return 0.48;
}

function template18TextBand(
  width: number,
  height: number,
  kind: Template18Kind,
  style: Template18StyleId
): Template18Band {
  const card = template18Card(width, height, style);
  const maxWidth =
    (card.right - card.left) *
    (style === 'pastel'
      ? 0.84
      : style === 'deep-red'
        ? 0.56
        : style === 'dark-moody' && kind === 'cover'
          ? 0.62
          : style === 'pastel-true' && kind === 'cover'
            ? 0.72
            : 0.74);
  const hasBar = template18HasProgress(style);
  const belowBar = hasBar ? card.top + height * 0.055 : card.top + height * 0.07;
  const aboveFooter =
    style === 'pastel' ? card.bottom - height * 0.07 : height * 0.8;
  if (style !== 'pastel' && kind !== 'cta') {
    const center = (template18TextCenter(style, kind) ?? 0.47) * height;
    const half = height * 0.22;
    return {
      top: center - half,
      bottom: center + half,
      maxWidth,
      preferred: kind === 'cover' ? template18CoverPreferred(style) : template18QuestionPreferred(style),
      min: 0.02,
    };
  }
  if (kind === 'cover') {
    return {
      top: card.top + height * 0.07,
      bottom: aboveFooter,
      maxWidth,
      preferred: template18CoverPreferred(style),
      min: 0.034,
    };
  }
  if (kind === 'cta') {
    const promo = template18PromoLayout(width, height, style);
    const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    return {
      top: belowBar,
      bottom: promo.y - labelGap - labelSize - height * 0.02,
      maxWidth,
      preferred: style === 'pastel' ? 0.05 : 0.042,
      min: 0.026,
    };
  }
  return {
    top: belowBar,
    bottom: aboveFooter,
    maxWidth,
    preferred: 0.056,
    min: 0.03,
  };
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

function wrapTemplate18Lines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.replace(/\r/g, '').split('\n');
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
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
  }
  return lines;
}

export type Template18TextLayout = {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  top: number;
  maxWidth: number;
  fontWeight: number;
};

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value;
}

export function layoutTemplate18Text(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  kind: Template18Kind,
  fontFamily: string = IMAGE_TEMPLATE18_FONT_STACK,
  style: Template18StyleId = 'pastel'
): Template18TextLayout {
  const band = template18TextBand(width, height, kind, style);
  const fontWeight = IMAGE_TEMPLATE18_FONT_WEIGHT;
  const leading = template18LineHeight(style);
  const empty: Template18TextLayout = {
    lines: [],
    fontSize: Math.round(width * band.preferred),
    lineHeight: Math.round(width * band.preferred) * leading,
    top: band.top,
    maxWidth: band.maxWidth,
    fontWeight,
  };
  const source = text.trim();
  if (!source || !(width > 0) || !(height > 0) || band.bottom <= band.top) return empty;

  const maxSize = Math.max(1, Math.round(width * band.preferred));
  const minSize = Math.max(1, Math.round(width * band.min));
  const room = band.bottom - band.top;
  let chosenSize = minSize;
  let chosenLines: string[] = [];

  const measure = (size: number) => {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    setLetterSpacing(ctx, '0px');
    const lines = wrapTemplate18Lines(ctx, source, band.maxWidth);
    const block = lines.length * size * leading;
    return { lines, block };
  };

  let lo = minSize;
  let hi = maxSize;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const { lines, block } = measure(mid);
    if (lines.length > 0 && block <= room + 0.5) {
      chosenSize = mid;
      chosenLines = lines;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (chosenLines.length === 0) {
    const fitted = measure(minSize);
    chosenLines = fitted.lines;
    chosenSize = minSize;
  }

  const lineHeight = chosenSize * leading;
  const block = chosenLines.length * lineHeight;
  const top = band.top + Math.max(0, (room - block) / 2);
  return {
    lines: chosenLines,
    fontSize: chosenSize,
    lineHeight,
    top,
    maxWidth: band.maxWidth,
    fontWeight,
  };
}

/**
 * Rounded card whose sides bow outward.
 * Each edge uses sin² so the tangent is flat where it meets the corner arc.
 */
export function traceTemplate18Card(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: Template18StyleId = 'pastel'
): void {
  const card = template18Card(width, height, style);
  if (card.shape === 'round') {
    const w = card.right - card.left;
    const h = card.bottom - card.top;
    ctx.roundRect(card.left, card.top, w, h, card.radius);
    return;
  }
  const { left, right, top, bottom, bulgeX, bulgeY } = card;
  const spanX = right - left;
  const spanY = bottom - top;
  const steps = 72;
  const bow = (t: number) => Math.sin(Math.PI * t);
  ctx.moveTo(left, top);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    ctx.lineTo(left + t * spanX, top - bow(t) * bulgeY);
  }
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    ctx.lineTo(right + bow(t) * bulgeX, top + t * spanY);
  }
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    ctx.lineTo(right - t * spanX, bottom + bow(t) * bulgeY);
  }
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    ctx.lineTo(left - bow(t) * bulgeX, bottom - t * spanY);
  }
  ctx.closePath();
}

/**
 * Radial darkening clipped by the caller.
 * Default pastel keeps the original ramp (corners near the outer stop).
 * Pastel-true corners are about 28% darker, dark-moody about 25%, and deep
 * red falls off to near-black (#070005).
 */
export function drawTemplate18Vignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: Template18StyleId = 'pastel'
): void {
  const card = template18Card(width, height, style);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.hypot(cx - card.left, cy - card.top);
  if (style === 'red-rounded') return;
  const gradient = ctx.createRadialGradient(cx, cy, outer * 0.05, cx, cy, outer);
  // Sampled on the pastel reference: flat through the inner half, then a
  // smooth ring down to about 0.75 at the sharp corner. Deep red stops a
  // little sooner so the corner stays near #53130D instead of black.
  const corner = style === 'deep-red' ? 0.24 : 0.27;
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.52, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.64, 'rgba(0,0,0,0.04)');
  gradient.addColorStop(0.74, 'rgba(0,0,0,0.1)');
  gradient.addColorStop(0.84, 'rgba(0,0,0,0.16)');
  gradient.addColorStop(0.93, 'rgba(0,0,0,0.21)');
  gradient.addColorStop(1, `rgba(0,0,0,${corner})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

let grainTile: CanvasImageSource | null = null;

function template18GrainTile(): CanvasImageSource | null {
  if (grainTile) return grainTile;
  const doc = (globalThis as { document?: { createElement: (tag: string) => HTMLCanvasElement } }).document;
  if (!doc) return null;
  const size = 180;
  const canvas = doc.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  if (!g) return null;
  const image = g.createImageData(size, size);
  let seed = 0x5e1d13;
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const n = 112 + (seed & 31);
    data[i] = n;
    data[i + 1] = n;
    data[i + 2] = n;
    data[i + 3] = 255;
  }
  g.putImageData(image, 0, 0);
  grainTile = canvas;
  return grainTile;
}

function drawTemplate18Grain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  alpha: number
) {
  const tile = template18GrainTile();
  if (!tile) return;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  const pattern = ctx.createPattern(tile, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

export function drawTemplate18Progress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  questionIndex: number,
  questionCount: number,
  accent: string,
  style: Template18StyleId = 'pastel'
): void {
  if (!template18HasProgress(style)) return;
  if (questionCount <= 0 || questionIndex <= 0) return;
  const card = template18Card(width, height, style);
  if (style === 'pastel-true') {
    const barH = Math.max(6, Math.round((height * 6) / 1440));
    const y = (height * 102) / 1440;
    const x = (width * 48) / 1080;
    const trackW = (width * 984) / 1080;
    const radius = barH / 2;
    ctx.fillStyle = 'rgba(70, 96, 118, 0.42)';
    ctx.beginPath();
    ctx.roundRect(x, y, trackW, barH, radius);
    ctx.fill();
    const filled = Math.max(0, Math.min(1, (questionIndex - 1 + 1.45) / questionCount));
    if (filled > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, trackW, barH, radius);
      ctx.clip();
      ctx.fillStyle = 'rgb(150, 115, 45)';
      ctx.fillRect(x, y, Math.max(barH, trackW * filled), barH);
      ctx.restore();
    }
    return;
  }
  const inset = card.left + width * 0.06;
  const gap = width * IMAGE_TEMPLATE18_PROGRESS_GAP;
  const barH = Math.max(3, Math.round(height * IMAGE_TEMPLATE18_PROGRESS_H));
  const y = card.top + height * 0.026;
  const totalW = card.right - card.left - width * 0.12;
  const segW = (totalW - gap * (questionCount - 1)) / questionCount;
  const radius = barH / 2;
  for (let i = 0; i < questionCount; i++) {
    const x = inset + i * (segW + gap);
    ctx.fillStyle = IMAGE_TEMPLATE18_PROGRESS_TRACK;
    ctx.beginPath();
    ctx.roundRect(x, y, segW, barH, radius);
    ctx.fill();
    const ratio =
      i < questionIndex - 1 ? 1 : i === questionIndex - 1 ? IMAGE_TEMPLATE18_PROGRESS_ACTIVE : 0;
    if (ratio <= 0) continue;
    const fillW = ratio >= 1 ? segW : Math.max(barH, segW * ratio);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, segW, barH, radius);
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(x, y, fillW, barH);
    ctx.restore();
  }
}

/**
 * 1 px light + 1 px dark at 1080 wide (2 + 2 at 2160). Drawn as real rows at
 * the export resolution so the PNG stays crisp. Multiply hits every pixel
 * already on the card, including the question, the footer, and the promo.
 */
export function drawTemplate18Scanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  factor = IMAGE_TEMPLATE18_SCANLINE_FACTOR
): void {
  const row = Math.max(1, Math.round(width / 1080));
  const period = row * 2;
  const v = Math.max(0, Math.min(255, Math.round(255 * factor)));
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgb(${v},${v},${v})`;
  for (let y = row; y < height; y += period) {
    ctx.fillRect(0, y, width, row);
  }
  ctx.restore();
}

function drawRoundedSoftEdge(ctx: CanvasRenderingContext2D, card: Template18Card, width: number) {
  const w = card.right - card.left;
  const h = card.bottom - card.top;
  const steps = 22;
  const maxGrow = width * 0.04;
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const grow = t * maxGrow;
    const r = Math.round(116 * (1 - t) + 48 * t);
    const g = Math.round(6 * (1 - t) + 5 * t);
    const b = Math.round(5 * (1 - t) + 5 * t);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.roundRect(
      card.left - grow,
      card.top - grow,
      w + grow * 2,
      h + grow * 2,
      card.radius + grow * 0.35
    );
    ctx.fill();
  }
}

/** 1–2 px yellow fringe on the left edge and blue on the right, like the reference. */
function drawTemplate18Fringe(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const bg = (idx: number) => data[idx]! < 14 && data[idx + 1]! < 14 && data[idx + 2]! < 18;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 2; x < width - 2; x++) {
      const i = (y * width + x) * 4;
      if (bg(i)) continue;
      const left = bg((y * width + (x - 1)) * 4);
      const right = bg((y * width + (x + 1)) * 4);
      if (left && x < width * 0.5) {
        data[i] = Math.round(data[i]! * 0.45 + 210 * 0.55);
        data[i + 1] = Math.round(data[i + 1]! * 0.45 + 170 * 0.55);
        data[i + 2] = Math.round(data[i + 2]! * 0.7 + 20 * 0.3);
      } else if (right && x > width * 0.5) {
        data[i] = Math.round(data[i]! * 0.55 + 16 * 0.45);
        data[i + 1] = Math.round(data[i + 1]! * 0.45 + 175 * 0.55);
        data[i + 2] = Math.round(data[i + 2]! * 0.35 + 214 * 0.65);
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}

function drawTemplate18Frame(ctx: CanvasRenderingContext2D, width: number, height: number, style: Template18StyleId) {
  if (style === 'red-rounded') {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.2,
      width / 2,
      height / 2,
      Math.hypot(width, height) * 0.55
    );
    gradient.addColorStop(0, IMAGE_TEMPLATE18_ROUNDED_FRAME_INNER);
    gradient.addColorStop(1, IMAGE_TEMPLATE18_ROUNDED_FRAME_OUTER);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawRoundedSoftEdge(ctx, template18Card(width, height, style), width);
    return;
  }
  ctx.fillStyle = IMAGE_TEMPLATE18_CANVAS_BG;
  ctx.fillRect(0, 0, width, height);
}

function template18FooterY(height: number, card: Template18Card, style: Template18StyleId): number {
  if (style === 'pastel') return card.bottom - height * 0.042;
  return height * 0.852;
}

function template18FooterSize(width: number, style: Template18StyleId): number {
  const ratio = style === 'pastel' ? IMAGE_TEMPLATE18_FOOTER_SIZE : 0.034;
  return Math.round(width * ratio);
}

export function paintTemplate18Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    slideCount?: number;
    isCta?: boolean;
    promo?: CanvasImageSource | null;
    fontFamily?: string;
    style?: Template18StyleId;
    /** Honoured for the original pastel style. Other styles follow the reference. */
    scanlines?: boolean;
  }
): void {
  const style = options.style ?? IMAGE_TEMPLATE18_DEFAULT_STYLE;
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE18_SLIDE_COUNT;
  const isCta = options.isCta ?? options.tabIndex === IMAGE_TEMPLATE18_CTA_TAB;
  const kind = template18Kind(options.tabIndex, isCta);
  const questionCount = Math.max(0, slideCount - 1);
  const textColor = template18TextColor(style, options.tabIndex);
  const bodyFont =
    options.fontFamily ||
    (style === 'pastel' ? IMAGE_TEMPLATE18_PASTEL_FONT_STACK : IMAGE_TEMPLATE18_FONT_STACK);
  const scanlines = resolveTemplate18Scanlines(style, options.scanlines !== false);

  drawTemplate18Frame(ctx, width, height, style);
  if (style === 'red-rounded') drawTemplate18Grain(ctx, width, height, 0.2);

  ctx.save();
  ctx.beginPath();
  traceTemplate18Card(ctx, width, height, style);
  ctx.clip();
  ctx.fillStyle = template18Background(options.tabIndex, isCta, style);
  ctx.fillRect(0, 0, width, height);
  drawTemplate18Vignette(ctx, width, height, style);
  if (style === 'deep-red') drawTemplate18Grain(ctx, width, height, 0.22);
  else if (style === 'red-rounded') drawTemplate18Grain(ctx, width, height, 0.14);

  if (kind !== 'cover') {
    drawTemplate18Progress(
      ctx,
      width,
      height,
      options.tabIndex,
      questionCount,
      template18Accent(options.tabIndex, isCta, style),
      style
    );
  }

  const layout = layoutTemplate18Text(ctx, width, height, options.text, kind, bodyFont, style);
  if (layout.lines.length > 0) {
    ctx.fillStyle = textColor;
    ctx.font = `${layout.fontWeight} ${layout.fontSize}px ${bodyFont}`;
    setLetterSpacing(ctx, '0px');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    let y = layout.top;
    const italicLast = style === 'deep-red' && kind === 'cover' && layout.lines.length > 1;
    layout.lines.forEach((line, index) => {
      const italic = italicLast && index === layout.lines.length - 1;
      if (italic) {
        ctx.save();
        ctx.font = `italic ${layout.fontWeight} ${layout.fontSize}px ${bodyFont}`;
        ctx.fillText(line, width / 2, y);
        ctx.restore();
      } else {
        ctx.fillText(line, width / 2, y);
      }
      y += layout.lineHeight;
    });
  }

  const card = template18Card(width, height, style);

  if (kind === 'cta' && options.promo) {
    const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const promo = template18PromoLayout(width, height, style);
    ctx.drawImage(options.promo, promo.x, promo.y, promo.width, promo.height);
    setLetterSpacing(ctx, '0px');
    ctx.font = `${style === 'pastel' ? 700 : 600} ${labelSize}px ${
      style === 'pastel' ? '"TikTok Sans", system-ui, sans-serif' : IMAGE_TEMPLATE18_SANS_STACK
    }`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, promo.y - labelGap);
    if (scanlines) drawTemplate18Scanlines(ctx, width, height, template18ScanlineFactor(style));
    ctx.restore();
    if (style !== 'red-rounded') drawTemplate18Fringe(ctx, width, height);
    return;
  }

  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = template18FooterColor(style, options.tabIndex);
  ctx.font = `${style === 'pastel' ? 700 : 600} ${template18FooterSize(width, style)}px ${
    style === 'pastel' ? '"TikTok Sans", system-ui, sans-serif' : IMAGE_TEMPLATE18_SANS_STACK
  }`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE18_FOOTER, width / 2, template18FooterY(height, card, style));
  if (scanlines) drawTemplate18Scanlines(ctx, width, height, template18ScanlineFactor(style));
  ctx.restore();
  if (style !== 'red-rounded') drawTemplate18Fringe(ctx, width, height);
}
