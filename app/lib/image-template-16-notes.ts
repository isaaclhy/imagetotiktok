import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';

export const IMAGE_TEMPLATE16_QUESTION_COUNT = 4;
export const IMAGE_TEMPLATE16_SLIDE_COUNT = IMAGE_TEMPLATE16_QUESTION_COUNT + 1;
export const IMAGE_TEMPLATE16_CTA_TAB = IMAGE_TEMPLATE16_QUESTION_COUNT;
export const IMAGE_TEMPLATE16_BG = '#FFFFFF';
export const IMAGE_TEMPLATE16_TEXT = '#111111';
export const IMAGE_TEMPLATE16_MUTED = '#3A3A3A';
export const IMAGE_TEMPLATE16_GOLD = '#C8A33A';
export const IMAGE_TEMPLATE16_BRAND = 'Spill It';
export const IMAGE_TEMPLATE16_ICON_SRC = '/spill-it-icon.jpg';
export const IMAGE_TEMPLATE16_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif';

export const IMAGE_TEMPLATE16_SIDE_PAD = 0.07;
export const IMAGE_TEMPLATE16_HEADER_Y = 0.068;
export const IMAGE_TEMPLATE16_HEADER_SIZE = 0.042;
export const IMAGE_TEMPLATE16_HEADER_LABEL = 0.034;
export const IMAGE_TEMPLATE16_BRAND_Y = 0.168;
export const IMAGE_TEMPLATE16_AVATAR = 0.086;
export const IMAGE_TEMPLATE16_ICON_RADIUS = 0.223;
export const IMAGE_TEMPLATE16_BRAND_SIZE = 0.05;
export const IMAGE_TEMPLATE16_BODY_SIZE = 0.072;
export const IMAGE_TEMPLATE16_BODY_TOP = 0.345;
export const IMAGE_TEMPLATE16_BODY_WEIGHT = 800;
export const IMAGE_TEMPLATE16_OPTION_SIZE = 0.052;
export const IMAGE_TEMPLATE16_OPTION_WEIGHT = 500;
export const IMAGE_TEMPLATE16_OPTION_GAP = 0.55;
export const IMAGE_TEMPLATE16_LINE_HEIGHT = 1.12;
export const IMAGE_TEMPLATE16_LETTER_SPACING = -0.03;
export const IMAGE_TEMPLATE16_FOOTER_Y = 0.855;
export const IMAGE_TEMPLATE16_FOOTER_SIZE = 0.028;
export const IMAGE_TEMPLATE16_COVER_SRC = '/image-templates/template-16-cover.png';

export function isImageTemplate16Id(templateId: number | null | undefined): boolean {
  return templateId === 16;
}

export function isTemplate16CtaTab(
  tabIndex: number,
  questionCount = IMAGE_TEMPLATE16_QUESTION_COUNT
): boolean {
  return tabIndex > 0 && tabIndex === questionCount;
}

export function template16Footer(
  tabIndex: number,
  questionCount = IMAGE_TEMPLATE16_QUESTION_COUNT
): string {
  if (isTemplate16CtaTab(tabIndex, questionCount)) return '';
  if (tabIndex <= 0) return 'swipe →';
  return `${String(tabIndex).padStart(2, '0')}/${String(questionCount).padStart(2, '0')}`;
}

export function wrapNotesLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let current = words[0]!;
    for (let i = 1; i < words.length; i++) {
      const word = words[i]!;
      const candidate = `${current} ${word}`;
      if (ctx.measureText(candidate).width <= maxWidth) current = candidate;
      else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

export function measureNotesLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight = IMAGE_TEMPLATE16_BODY_WEIGHT
): string[] {
  if (typeof document === 'undefined') return text.trim() ? [text.trim()] : [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.trim() ? [text.trim()] : [];
  ctx.font = `${fontWeight} ${fontSize}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
  return wrapNotesLines(ctx, text, maxWidth);
}

function strokeIcon(
  ctx: CanvasRenderingContext2D,
  draw: () => void,
  lineWidth: number
) {
  ctx.save();
  ctx.strokeStyle = IMAGE_TEMPLATE16_GOLD;
  ctx.fillStyle = IMAGE_TEMPLATE16_GOLD;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  draw();
  ctx.restore();
}

function drawSpillItIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  icon?: CanvasImageSource | null
) {
  const x = cx - size / 2;
  const y = cy - size / 2;
  const radius = size * IMAGE_TEMPLATE16_ICON_RADIUS;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, radius);
  ctx.clip();
  if (icon) {
    ctx.drawImage(icon, x, y, size, size);
  } else {
    ctx.fillStyle = '#7B5CFF';
    ctx.fill();
  }
  ctx.restore();
}

function drawNotesChrome(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brandIcon?: CanvasImageSource | null
) {
  const pad = width * IMAGE_TEMPLATE16_SIDE_PAD;
  const headerY = height * IMAGE_TEMPLATE16_HEADER_Y;
  const icon = Math.max(22, width * IMAGE_TEMPLATE16_HEADER_SIZE);
  const lw = Math.max(2, icon * 0.085);

  strokeIcon(
    ctx,
    () => {
      ctx.beginPath();
      ctx.moveTo(pad + icon * 0.42, headerY - icon * 0.32);
      ctx.lineTo(pad + icon * 0.12, headerY);
      ctx.lineTo(pad + icon * 0.42, headerY + icon * 0.32);
      ctx.stroke();
    },
    lw
  );

  ctx.fillStyle = IMAGE_TEMPLATE16_GOLD;
  ctx.font = `400 ${Math.round(width * IMAGE_TEMPLATE16_HEADER_LABEL)}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Notes', pad + icon * 0.52, headerY);

  const right = width - pad;
  const moreX = right - icon * 0.38;
  const shareX = moreX - icon * 1.45;

  strokeIcon(
    ctx,
    () => {
      const s = icon;
      ctx.beginPath();
      ctx.moveTo(shareX, headerY - s * 0.42);
      ctx.lineTo(shareX, headerY + s * 0.12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shareX - s * 0.24, headerY - s * 0.16);
      ctx.lineTo(shareX, headerY - s * 0.42);
      ctx.lineTo(shareX + s * 0.24, headerY - s * 0.16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shareX - s * 0.34, headerY + s * 0.02);
      ctx.lineTo(shareX - s * 0.34, headerY + s * 0.38);
      ctx.quadraticCurveTo(shareX - s * 0.34, headerY + s * 0.5, shareX - s * 0.2, headerY + s * 0.5);
      ctx.lineTo(shareX + s * 0.2, headerY + s * 0.5);
      ctx.quadraticCurveTo(shareX + s * 0.34, headerY + s * 0.5, shareX + s * 0.34, headerY + s * 0.38);
      ctx.lineTo(shareX + s * 0.34, headerY + s * 0.02);
      ctx.stroke();
    },
    lw
  );

  strokeIcon(
    ctx,
    () => {
      const s = icon;
      ctx.beginPath();
      ctx.arc(moreX, headerY, s * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      const r = s * 0.055;
      for (const dx of [-s * 0.16, 0, s * 0.16]) {
        ctx.beginPath();
        ctx.arc(moreX + dx, headerY, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    lw
  );

  const brandY = height * IMAGE_TEMPLATE16_BRAND_Y;
  const avatar = width * IMAGE_TEMPLATE16_AVATAR;
  drawSpillItIcon(ctx, pad + avatar / 2, brandY, avatar, brandIcon);

  ctx.fillStyle = IMAGE_TEMPLATE16_MUTED;
  ctx.font = `400 ${Math.round(width * IMAGE_TEMPLATE16_BRAND_SIZE)}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE16_BRAND, pad + avatar + width * 0.026, brandY);
}

export function paintTemplate16Slide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    tabIndex: number;
    icon?: CanvasImageSource | null;
    promo?: CanvasImageSource | null;
    questionCount?: number;
  }
): void {
  ctx.fillStyle = IMAGE_TEMPLATE16_BG;
  ctx.fillRect(0, 0, width, height);
  drawNotesChrome(ctx, width, height, options.icon);

  const questionCount = options.questionCount ?? IMAGE_TEMPLATE16_QUESTION_COUNT;
  const isCta = Boolean(options.promo) || isTemplate16CtaTab(options.tabIndex, questionCount);
  const pad = width * IMAGE_TEMPLATE16_SIDE_PAD;
  const maxWidth = width - pad * 2;
  const { question, options: optionText } =
    options.tabIndex === 0
      ? { question: options.text, options: '' }
      : splitCopycatQuestionAndOptions(options.text);
  const fontSize = Math.round(width * IMAGE_TEMPLATE16_BODY_SIZE);
  const optionSize = Math.round(width * IMAGE_TEMPLATE16_OPTION_SIZE);
  ctx.letterSpacing = `${IMAGE_TEMPLATE16_LETTER_SPACING}em`;
  ctx.font = `${IMAGE_TEMPLATE16_BODY_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
  const questionLines = wrapNotesLines(ctx, question, maxWidth);
  ctx.font = `${IMAGE_TEMPLATE16_OPTION_WEIGHT} ${optionSize}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
  const optionLines = optionText ? wrapNotesLines(ctx, optionText, maxWidth) : [];
  const questionLineH = fontSize * IMAGE_TEMPLATE16_LINE_HEIGHT;
  const optionLineH = optionSize * 1.28;
  const optionGap = optionLines.length ? fontSize * IMAGE_TEMPLATE16_OPTION_GAP : 0;
  const startY = height * IMAGE_TEMPLATE16_BODY_TOP;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = IMAGE_TEMPLATE16_TEXT;
  ctx.font = `${IMAGE_TEMPLATE16_BODY_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
  questionLines.forEach((line, index) => {
    ctx.fillText(line, pad, startY + index * questionLineH);
  });

  const optionsY = startY + questionLines.length * questionLineH + optionGap;
  ctx.font = `${IMAGE_TEMPLATE16_OPTION_WEIGHT} ${optionSize}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
  optionLines.forEach((line, index) => {
    ctx.fillText(line, pad, optionsY + index * optionLineH);
  });

  const lastIsOption = optionLines.length > 0;
  const lastLines = lastIsOption ? optionLines : questionLines;
  const lastSize = lastIsOption ? optionSize : fontSize;
  const lastLineH = lastIsOption ? optionLineH : questionLineH;
  const lastStart = lastIsOption ? optionsY : startY;
  if (lastLines.length > 0) {
    ctx.font = `${lastIsOption ? IMAGE_TEMPLATE16_OPTION_WEIGHT : IMAGE_TEMPLATE16_BODY_WEIGHT} ${lastSize}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
    const last = lastLines[lastLines.length - 1]!;
    const caretX = pad + ctx.measureText(last).width + lastSize * 0.04;
    const caretY = lastStart + (lastLines.length - 1) * lastLineH;
    ctx.fillRect(caretX, caretY + lastSize * 0.08, Math.max(3, lastSize * 0.045), lastSize * 0.82);
  }

  if (isCta && options.promo) {
    const blockBottom =
      optionsY + optionLines.length * optionLineH ||
      startY + questionLines.length * questionLineH;
    const labelSize = Math.round(height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = height * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(
      width,
      height,
      blockBottom + labelSize + labelGap
    );
    ctx.drawImage(options.promo, layout.x, layout.y, layout.width, layout.height);
    ctx.letterSpacing = '0px';
    ctx.font = `700 ${labelSize}px "TikTok Sans", system-ui, sans-serif`;
    ctx.fillStyle = IMAGE_TEMPLATE16_TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, width / 2, layout.y - labelGap);
    return;
  }

  const footer = template16Footer(options.tabIndex, questionCount);
  if (footer) {
    ctx.letterSpacing = '0px';
    ctx.fillStyle = IMAGE_TEMPLATE16_TEXT;
    ctx.font = `400 ${Math.round(width * IMAGE_TEMPLATE16_FOOTER_SIZE)}px ${IMAGE_TEMPLATE16_FONT_STACK}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(footer, pad, height * IMAGE_TEMPLATE16_FOOTER_Y);
  }
}
