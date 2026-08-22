import { drawTitleSquiggle, squiggleColorForBackground } from '@/app/lib/highlight-word';
import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';

/** Matches template-2-cover.jpg picker art (dusty rose). */
export const IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO = 0.09;
export const IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT = 900;
/** Nunito Black reads loose at large sizes — tighten like other overlays. */
export const IMAGE_TEMPLATE2_COVER_LETTER_SPACING = '-0.03em';
export const IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT = 1.15;
export const IMAGE_TEMPLATE2_COVER_MAX_TEXT_WIDTH_RATIO = 0.8;

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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

/** Cover slide — large centered title + progress bar + app footer. */
export function drawImageTemplate2CoverSlide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: {
    backgroundColor: string;
    title: string;
    highlightWord: string | null | undefined;
    fontFamily: string;
    textColor?: string;
    typeLabel?: string;
    progress?: number;
    footer?: string;
  }
) {
  const {
    backgroundColor,
    title,
    highlightWord,
    fontFamily,
    textColor = '#FFFFFF',
    typeLabel,
    progress = 1 / 7,
    footer = IMAGE_TEMPLATE2_APP_FOOTER,
  } = options;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const barX = frameWidth * 0.08;
  const barW = frameWidth * 0.84;
  const barY = frameHeight * 0.21;
  const barH = Math.max(8, Math.round(frameHeight * 0.007));

  if (typeLabel?.trim()) {
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = `700 ${Math.round(frameHeight * 0.032)}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.letterSpacing = '0px';
    ctx.fillText(typeLabel.trim(), frameWidth / 2, barY - frameHeight * 0.018);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(barX, barY, barW * Math.min(1, Math.max(0, progress)), barH);

  const centerText = title.trim().replace(/\n/g, ' ');
  if (centerText) {
    const fontSize = Math.round(frameWidth * IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO);
    ctx.font = `${IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT} ${fontSize}px ${fontFamily}`;
    ctx.letterSpacing = IMAGE_TEMPLATE2_COVER_LETTER_SPACING;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;

    const maxTextWidth = frameWidth * IMAGE_TEMPLATE2_COVER_MAX_TEXT_WIDTH_RATIO;
    const lines = wrapLines(ctx, centerText, maxTextWidth);
    const highlight = highlightWord?.trim().toLowerCase() ?? '';
    const lineHeight = fontSize * IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT;
    const blockH = lines.length * lineHeight;
    let y = frameHeight / 2 - blockH / 2 + lineHeight / 2;
    const squiggleColor = squiggleColorForBackground(backgroundColor);

    for (const line of lines) {
      ctx.fillText(line, frameWidth / 2, y);
      if (highlight) {
        const idx = line.toLowerCase().indexOf(highlight);
        if (idx >= 0) {
          const before = line.slice(0, idx);
          const word = line.slice(idx, idx + highlight.length);
          const lineWidth = ctx.measureText(line).width;
          const lineStartX = frameWidth / 2 - lineWidth / 2;
          const beforeW = ctx.measureText(before).width;
          const wordW = ctx.measureText(word).width;
          const strokeW = Math.max(14, Math.round(fontSize * 0.26));
          drawTitleSquiggle(
            ctx,
            lineStartX + beforeW,
            y + fontSize * 0.55 + strokeW / 2,
            wordW,
            squiggleColor,
            strokeW,
            fontSize * 0.36
          );
        }
      }
      y += lineHeight;
    }
  }

  ctx.letterSpacing = '0px';
  ctx.font = `700 ${Math.round(frameHeight * 0.03)}px ${fontFamily}`;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(footer, frameWidth / 2, frameHeight * 0.9);
}
