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
 */
export const IMAGE_TEMPLATE18_QUESTION_COUNT = 5;
export const IMAGE_TEMPLATE18_SLIDE_COUNT = IMAGE_TEMPLATE18_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE18_CTA_TAB = IMAGE_TEMPLATE18_QUESTION_COUNT;
export const IMAGE_TEMPLATE18_COVER_SRC = '/image-templates/template-18-cover.png';

export const IMAGE_TEMPLATE18_TEXT = '#3A342F';
export const IMAGE_TEMPLATE18_FONT_STACK =
  '"Libre Baskerville", Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE18_FONT_CSS =
  'var(--font-libre-baskerville), "Libre Baskerville", Georgia, "Times New Roman", serif';
export const IMAGE_TEMPLATE18_SANS_STACK = '"TikTok Sans", system-ui, sans-serif';
export const IMAGE_TEMPLATE18_FONT_WEIGHT = 400;
export const IMAGE_TEMPLATE18_LINE_HEIGHT = 1.28;
export const IMAGE_TEMPLATE18_FOOTER = IMAGE_TEMPLATE2_APP_FOOTER;

/** Full-bleed frame behind the card. */
export const IMAGE_TEMPLATE18_CANVAS_BG = '#000000';
/**
 * Corner of the card, before the outward bulge.
 * Edge midpoints push past this toward the canvas so the sides bow out.
 */
export const IMAGE_TEMPLATE18_CARD_INSET_X = 0.052;
export const IMAGE_TEMPLATE18_CARD_INSET_Y = 0.04;
/** Cubic control offset. The visible bow is about three quarters of this. */
export const IMAGE_TEMPLATE18_CARD_BULGE_X = 0.018;
export const IMAGE_TEMPLATE18_CARD_BULGE_Y = 0.013;
/** Corner radius as a fraction of the frame width. */
export const IMAGE_TEMPLATE18_CARD_RADIUS = 0.062;

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

export function isImageTemplate18Id(templateId: number | null | undefined): boolean {
  return templateId === 18;
}

export function template18SlideStyle(tabIndex: number): {
  bg: string;
  accent: string;
} {
  const slides = IMAGE_TEMPLATE18_SLIDES;
  const index = ((tabIndex % slides.length) + slides.length) % slides.length;
  return slides[index]!;
}

/** CTA slides always use the yellow close so the promo sits on the same ground. */
export function template18Background(tabIndex: number, isCta: boolean): string {
  if (isCta) return IMAGE_TEMPLATE18_SLIDES[IMAGE_TEMPLATE18_SLIDES.length - 1]!.bg;
  return template18SlideStyle(tabIndex).bg;
}

export function template18Accent(tabIndex: number, isCta: boolean): string {
  if (isCta) return IMAGE_TEMPLATE18_SLIDES[IMAGE_TEMPLATE18_SLIDES.length - 1]!.accent;
  return template18SlideStyle(tabIndex).accent;
}

export type Template18Card = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  radius: number;
  bulgeX: number;
  bulgeY: number;
};

/** Axis-aligned corner box. Edge midpoints bulge outward from these sides. */
export function template18Card(width: number, height: number): Template18Card {
  const left = width * IMAGE_TEMPLATE18_CARD_INSET_X;
  const right = width - left;
  const top = height * IMAGE_TEMPLATE18_CARD_INSET_Y;
  const bottom = height - top;
  return {
    left,
    right,
    top,
    bottom,
    radius: Math.min(width * IMAGE_TEMPLATE18_CARD_RADIUS, (right - left) * 0.22),
    bulgeX: width * IMAGE_TEMPLATE18_CARD_BULGE_X,
    bulgeY: height * IMAGE_TEMPLATE18_CARD_BULGE_Y,
  };
}

/** Promo geometry in full-frame coordinates, sized to the card so it stays on the pastel. */
export function template18PromoLayout(
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } {
  const card = template18Card(width, height);
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

function template18TextBand(
  width: number,
  height: number,
  kind: Template18Kind
): Template18Band {
  const card = template18Card(width, height);
  const maxWidth = (card.right - card.left) * 0.84;
  const belowBar = card.top + height * 0.055;
  const aboveFooter = card.bottom - height * 0.07;
  if (kind === 'cover') {
    return {
      top: card.top + height * 0.07,
      bottom: aboveFooter,
      maxWidth,
      preferred: 0.072,
      min: 0.034,
    };
  }
  if (kind === 'cta') {
    const promo = template18PromoLayout(width, height);
    const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    return {
      top: belowBar,
      bottom: promo.y - labelGap - labelSize - height * 0.02,
      maxWidth,
      preferred: 0.05,
      min: 0.028,
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
};

export function layoutTemplate18Text(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  kind: Template18Kind,
  fontFamily: string = IMAGE_TEMPLATE18_FONT_STACK
): Template18TextLayout {
  const band = template18TextBand(width, height, kind);
  const empty: Template18TextLayout = {
    lines: [],
    fontSize: Math.round(width * band.preferred),
    lineHeight: Math.round(width * band.preferred) * IMAGE_TEMPLATE18_LINE_HEIGHT,
    top: band.top,
    maxWidth: band.maxWidth,
  };
  const source = text.trim();
  if (!source || !(width > 0) || !(height > 0) || band.bottom <= band.top) return empty;

  const maxSize = Math.max(1, Math.round(width * band.preferred));
  const minSize = Math.max(1, Math.round(width * band.min));
  const room = band.bottom - band.top;
  let chosenSize = minSize;
  let chosenLines: string[] = [];

  const measure = (size: number) => {
    ctx.font = `${IMAGE_TEMPLATE18_FONT_WEIGHT} ${size}px ${fontFamily}`;
    ctx.letterSpacing = '0px';
    const lines = wrapTemplate18Lines(ctx, source, band.maxWidth);
    const block = lines.length * size * IMAGE_TEMPLATE18_LINE_HEIGHT;
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

  const lineHeight = chosenSize * IMAGE_TEMPLATE18_LINE_HEIGHT;
  const block = chosenLines.length * lineHeight;
  const top = band.top + Math.max(0, (room - block) / 2);
  return {
    lines: chosenLines,
    fontSize: chosenSize,
    lineHeight,
    top,
    maxWidth: band.maxWidth,
  };
}

/**
 * Rounded card whose sides bow outward.
 * Each edge uses sin² so the tangent is flat where it meets the corner arc.
 */
export function traceTemplate18Card(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const { left, right, top, bottom, radius, bulgeX, bulgeY } = template18Card(width, height);
  const r = radius;
  const edgeSteps = 48;
  const cornerSteps = 20;
  const bow = (t: number) => Math.sin(Math.PI * t) ** 2;

  const points: Array<[number, number]> = [];
  const push = (x: number, y: number) => {
    const last = points[points.length - 1];
    if (last && Math.abs(last[0] - x) < 0.01 && Math.abs(last[1] - y) < 0.01) return;
    points.push([x, y]);
  };

  for (let i = 0; i <= edgeSteps; i++) {
    const t = i / edgeSteps;
    const x = left + r + t * (right - left - 2 * r);
    push(x, top - bow(t) * bulgeY);
  }
  for (let i = 1; i <= cornerSteps; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * (i / cornerSteps);
    push(right - r + Math.cos(a) * r, top + r + Math.sin(a) * r);
  }
  for (let i = 1; i <= edgeSteps; i++) {
    const t = i / edgeSteps;
    const y = top + r + t * (bottom - top - 2 * r);
    push(right + bow(t) * bulgeX, y);
  }
  for (let i = 1; i <= cornerSteps; i++) {
    const a = 0 + (Math.PI / 2) * (i / cornerSteps);
    push(right - r + Math.cos(a) * r, bottom - r + Math.sin(a) * r);
  }
  for (let i = 1; i <= edgeSteps; i++) {
    const t = i / edgeSteps;
    const x = right - r - t * (right - left - 2 * r);
    push(x, bottom + bow(t) * bulgeY);
  }
  for (let i = 1; i <= cornerSteps; i++) {
    const a = Math.PI / 2 + (Math.PI / 2) * (i / cornerSteps);
    push(left + r + Math.cos(a) * r, bottom - r + Math.sin(a) * r);
  }
  for (let i = 1; i <= edgeSteps; i++) {
    const t = i / edgeSteps;
    const y = bottom - r - t * (bottom - top - 2 * r);
    push(left - bow(t) * bulgeX, y);
  }
  for (let i = 1; i <= cornerSteps; i++) {
    const a = Math.PI + (Math.PI / 2) * (i / cornerSteps);
    push(left + r + Math.cos(a) * r, top + r + Math.sin(a) * r);
  }

  const first = points[0];
  if (!first) return;
  ctx.moveTo(first[0], first[1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i]!;
    ctx.lineTo(point[0], point[1]);
  }
  ctx.closePath();
}

/**
 * Radial darkening clipped by the caller.
 * Corners of the card land near the outer stop (~45–50% darker than the centre).
 */
export function drawTemplate18Vignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const card = template18Card(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.hypot(cx - card.left, cy - card.top);
  const gradient = ctx.createRadialGradient(cx, cy, outer * 0.05, cx, cy, outer);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.36, 'rgba(0,0,0,0.02)');
  gradient.addColorStop(0.55, 'rgba(0,0,0,0.1)');
  gradient.addColorStop(0.72, 'rgba(0,0,0,0.22)');
  gradient.addColorStop(0.86, 'rgba(0,0,0,0.36)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function drawTemplate18Progress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  questionIndex: number,
  questionCount: number,
  accent: string
): void {
  if (questionCount <= 0 || questionIndex <= 0) return;
  const card = template18Card(width, height);
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
  }
): void {
  const slideCount = options.slideCount ?? IMAGE_TEMPLATE18_SLIDE_COUNT;
  const isCta = options.isCta ?? options.tabIndex === IMAGE_TEMPLATE18_CTA_TAB;
  const kind = template18Kind(options.tabIndex, isCta);
  const fontFamily = options.fontFamily || IMAGE_TEMPLATE18_FONT_STACK;
  const questionCount = Math.max(0, slideCount - 1);

  ctx.fillStyle = IMAGE_TEMPLATE18_CANVAS_BG;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.beginPath();
  traceTemplate18Card(ctx, width, height);
  ctx.clip();
  ctx.fillStyle = template18Background(options.tabIndex, isCta);
  ctx.fillRect(0, 0, width, height);
  drawTemplate18Vignette(ctx, width, height);

  if (kind !== 'cover') {
    drawTemplate18Progress(
      ctx,
      width,
      height,
      options.tabIndex,
      questionCount,
      template18Accent(options.tabIndex, isCta)
    );
  }

  const layout = layoutTemplate18Text(ctx, width, height, options.text, kind, fontFamily);
  if (layout.lines.length > 0) {
    ctx.fillStyle = IMAGE_TEMPLATE18_TEXT;
    ctx.font = `${IMAGE_TEMPLATE18_FONT_WEIGHT} ${layout.fontSize}px ${fontFamily}`;
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    let y = layout.top;
    for (const line of layout.lines) {
      ctx.fillText(line, width / 2, y);
      y += layout.lineHeight;
    }
  }

  const card = template18Card(width, height);

  if (kind === 'cta' && options.promo) {
    const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const promo = template18PromoLayout(width, height);
    ctx.drawImage(options.promo, promo.x, promo.y, promo.width, promo.height);
    ctx.letterSpacing = '0px';
    ctx.font = `700 ${labelSize}px ${IMAGE_TEMPLATE18_SANS_STACK}`;
    ctx.fillStyle = IMAGE_TEMPLATE18_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, promo.y - labelGap);
    ctx.restore();
    return;
  }

  ctx.letterSpacing = '0px';
  ctx.fillStyle = IMAGE_TEMPLATE18_TEXT;
  ctx.font = `700 ${Math.round(width * IMAGE_TEMPLATE18_FOOTER_SIZE)}px ${IMAGE_TEMPLATE18_SANS_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE18_FOOTER, width / 2, card.bottom - height * 0.042);
  ctx.restore();
}
