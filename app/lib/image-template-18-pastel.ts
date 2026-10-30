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

/** Soft dark edge, strongest in the corners, over a flat pastel fill. */
export const IMAGE_TEMPLATE18_VIGNETTE =
  'radial-gradient(ellipse at center, rgba(40,18,14,0) 28%, rgba(32,12,10,0.08) 52%, rgba(20,8,8,0.3) 76%, rgba(12,4,4,0.58) 100%)';

export const IMAGE_TEMPLATE18_PROGRESS_Y = 0.055;
export const IMAGE_TEMPLATE18_PROGRESS_H = 0.0065;
export const IMAGE_TEMPLATE18_PROGRESS_INSET = 0.08;
export const IMAGE_TEMPLATE18_PROGRESS_GAP = 0.012;
/** The active segment is only partly filled, like a story bar mid-slide. */
export const IMAGE_TEMPLATE18_PROGRESS_ACTIVE = 0.62;
export const IMAGE_TEMPLATE18_PROGRESS_TRACK = 'rgba(55, 42, 36, 0.18)';

export const IMAGE_TEMPLATE18_FOOTER_Y = 0.915;
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
  const maxWidth = width * 0.76;
  if (kind === 'cover') {
    return {
      top: height * 0.16,
      bottom: height * 0.84,
      maxWidth,
      preferred: 0.072,
      min: 0.034,
    };
  }
  if (kind === 'cta') {
    const promo = imageTemplate2Q5PromoLayout(width, height, 0);
    const labelSize = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO;
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    return {
      top: height * 0.12,
      bottom: promo.y - labelGap - labelSize - height * 0.028,
      maxWidth: width * 0.78,
      preferred: 0.05,
      min: 0.028,
    };
  }
  return {
    top: height * 0.14,
    bottom: height * 0.82,
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

export function drawTemplate18Vignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.hypot(width, height) * 0.56;
  const inner = Math.min(width, height) * 0.34;
  const gradient = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  gradient.addColorStop(0, 'rgba(40,18,14,0)');
  gradient.addColorStop(0.3, 'rgba(32,12,10,0.04)');
  gradient.addColorStop(0.62, 'rgba(24,8,8,0.2)');
  gradient.addColorStop(0.84, 'rgba(16,6,6,0.4)');
  gradient.addColorStop(1, 'rgba(10,4,4,0.58)');
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
  const inset = width * IMAGE_TEMPLATE18_PROGRESS_INSET;
  const gap = width * IMAGE_TEMPLATE18_PROGRESS_GAP;
  const barH = Math.max(3, Math.round(height * IMAGE_TEMPLATE18_PROGRESS_H));
  const y = height * IMAGE_TEMPLATE18_PROGRESS_Y;
  const totalW = width - inset * 2;
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

  if (kind === 'cta' && options.promo) {
    const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const promo = imageTemplate2Q5PromoLayout(width, height, 0);
    ctx.drawImage(options.promo, promo.x, promo.y, promo.width, promo.height);
    ctx.letterSpacing = '0px';
    ctx.font = `700 ${labelSize}px ${IMAGE_TEMPLATE18_SANS_STACK}`;
    ctx.fillStyle = IMAGE_TEMPLATE18_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, promo.y - labelGap);
    return;
  }

  ctx.letterSpacing = '0px';
  ctx.fillStyle = IMAGE_TEMPLATE18_TEXT;
  ctx.font = `700 ${Math.round(width * IMAGE_TEMPLATE18_FOOTER_SIZE)}px ${IMAGE_TEMPLATE18_SANS_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE18_FOOTER, width / 2, height * IMAGE_TEMPLATE18_FOOTER_Y);
}
