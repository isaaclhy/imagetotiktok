/** Pexels search queries for the cinematic cover background. */
export const VIDEO_TEMPLATE6_PEXELS_QUERIES = [
  'cinematic couple',
  'cinematic city night',
  'cinematic rain',
  'cinematic ocean',
  'cinematic sunset',
  'cinematic forest fog',
] as const;

export const VIDEO_TEMPLATE6_SEE_DESCRIPTION = 'see description';

const FONT = '"TikTok Sans", system-ui, -apple-system, sans-serif';

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
  lines.push(current);
  return lines;
}

function drawDownArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
  const stroke = Math.max(2, size * 0.14);
  const topY = cy - size * 0.46;
  const tipY = cy + size * 0.46;
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = stroke;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, tipY);
  ctx.moveTo(cx - size * 0.38, tipY - size * 0.38);
  ctx.lineTo(cx, tipY);
  ctx.lineTo(cx + size * 0.38, tipY - size * 0.38);
  ctx.stroke();
  ctx.restore();
}

export function paintVideoTemplate6Overlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: { text: string }
) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const vignette = ctx.createRadialGradient(
    frameWidth / 2,
    frameHeight * 0.46,
    frameWidth * 0.12,
    frameWidth / 2,
    frameHeight * 0.5,
    frameWidth * 0.95
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.68, 'rgba(0, 0, 0, 0.1)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.48)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const maxW = frameWidth * 0.78;
  const maxBlock = frameHeight * 0.34;
  let fontSize = Math.round(frameWidth * 0.072);
  let lines: string[] = [];
  let lineH = fontSize * 1.16;

  for (let step = 0; step < 12; step++) {
    lineH = fontSize * 1.16;
    ctx.font = `700 ${fontSize}px ${FONT}`;
    lines = wrapLines(ctx, options.text, maxW);
    if (lines.length * lineH <= maxBlock || fontSize <= Math.round(frameWidth * 0.04)) break;
    fontSize = Math.max(Math.round(frameWidth * 0.04), fontSize - 2);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = Math.max(10, frameWidth * 0.028);
  ctx.shadowOffsetY = Math.max(1, frameWidth * 0.004);
  ctx.font = `700 ${fontSize}px ${FONT}`;

  const blockH = lines.length * lineH;
  let y = frameHeight * 0.46 - blockH / 2 + lineH / 2;
  for (const line of lines) {
    ctx.fillText(line, frameWidth / 2, y);
    y += lineH;
  }

  const cueSize = Math.round(frameWidth * 0.034);
  const arrowSize = Math.round(frameWidth * 0.07);
  const cueY = frameHeight * 0.9;
  drawDownArrow(ctx, frameWidth / 2, cueY - cueSize * 1.35, arrowSize);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = Math.max(8, frameWidth * 0.02);
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.font = `600 ${cueSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(VIDEO_TEMPLATE6_SEE_DESCRIPTION, frameWidth / 2, cueY);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}
