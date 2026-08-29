import {
  drawTitleHighlight,
  squiggleColorForBackground,
  TITLE_HIGHLIGHT_TEXT_COLOR,
} from '@/app/lib/highlight-word';
import { IMAGE_TEMPLATE2_APP_FOOTER } from '@/app/lib/constants';

/** Matches template-2-cover.jpg picker art (dusty rose). */
export const IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO = 0.062;
export const IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT = 600;
/** Heavy weights read loose at large sizes — tighten like other overlays. */
export const IMAGE_TEMPLATE2_COVER_LETTER_SPACING = '-0.03em';
export const IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT = 1.15;
/** 20% horizontal padding each side. */
export const IMAGE_TEMPLATE2_COVER_MAX_TEXT_WIDTH_RATIO = 0.6;

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
    /** Cover slide hides the header chrome so only the title shows. */
    showProgress?: boolean;
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
    showProgress = true,
  } = options;

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const barX = frameWidth * 0.08;
  const barW = frameWidth * 0.84;
  const barY = frameHeight * 0.21;
  const barH = Math.max(8, Math.round(frameHeight * 0.007));

  if (showProgress) {
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
  }

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
    const highlightColor = squiggleColorForBackground(backgroundColor);

    for (const line of lines) {
      const idx = highlight ? line.toLowerCase().indexOf(highlight) : -1;
      if (idx >= 0) {
        const before = line.slice(0, idx);
        const word = line.slice(idx, idx + highlight.length);
        const lineWidth = ctx.measureText(line).width;
        const lineStartX = frameWidth / 2 - lineWidth / 2;
        // Measure by prefix difference so letter-spacing between the word and
        // its neighbours is accounted for.
        const beforeW = ctx.measureText(before).width;
        const wordX = lineStartX + beforeW;
        const wordW = ctx.measureText(before + word).width - beforeW;

        // Marker band goes down first so the word sits on top of it.
        drawTitleHighlight(ctx, wordX, y, wordW, fontSize, highlightColor);
        ctx.fillStyle = textColor;
        ctx.fillText(line, frameWidth / 2, y);

        ctx.textAlign = 'left';
        ctx.fillStyle = TITLE_HIGHLIGHT_TEXT_COLOR;
        ctx.fillText(word, wordX, y);
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
      } else {
        ctx.fillText(line, frameWidth / 2, y);
      }
      y += lineHeight;
    }
  }

  ctx.letterSpacing = '0px';
  if (footer.trim()) {
    ctx.font = `700 ${Math.round(frameHeight * 0.03)}px ${fontFamily}`;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(footer, frameWidth / 2, frameHeight * 0.9);
  }
}
