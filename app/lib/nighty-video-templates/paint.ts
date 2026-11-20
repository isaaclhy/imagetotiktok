import { isReferenceLayout, type NightySceneId } from '@/app/lib/nighty-video-templates/catalog';
import { paintReferenceFrame } from '@/app/lib/nighty-video-templates/reference-paint';
import type { NightyFrame } from '@/app/lib/nighty-video-templates/timeline';

export const NIGHTY_COMPOSITION_FONT = 'TikTok Sans, sans-serif';

const SCENES: Record<
  NightySceneId,
  { top: string; bottom: string; streak: string; wave: string; wash: string }
> = {
  night: {
    top: '#07111c',
    bottom: '#16304a',
    streak: 'rgba(226, 236, 244, 0.55)',
    wave: 'rgba(186, 220, 214, 0.35)',
    wash: 'rgba(90, 140, 170, 0.08)',
  },
  ocean: {
    top: '#04141c',
    bottom: '#0d4050',
    streak: 'rgba(210, 236, 234, 0.4)',
    wave: 'rgba(190, 230, 226, 0.45)',
    wash: 'rgba(70, 160, 160, 0.12)',
  },
  room: {
    top: '#0c0c10',
    bottom: '#24222a',
    streak: 'rgba(232, 232, 238, 0.32)',
    wave: 'rgba(200, 206, 214, 0.22)',
    wash: 'rgba(160, 150, 140, 0.05)',
  },
};

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
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
  return lines;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  centerY: number,
  fontPx: number,
  opacity: number
): void {
  if (lines.length === 0 || opacity <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = fontPx * 0.18;
  const lineHeight = fontPx * 1.18;
  const start = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, centerX, start + index * lineHeight);
  });
  ctx.restore();
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  fontPx: number,
  weight: number,
  maxWidth: number,
  opacity: number
): void {
  ctx.font = `${weight} ${fontPx}px ${NIGHTY_COMPOSITION_FONT}`;
  const lines = wrapLines(ctx, text, maxWidth);
  drawLines(ctx, lines, centerX, centerY, fontPx, opacity);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number, frame: NightyFrame): void {
  const scene = SCENES[frame.scene];
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, scene.top);
  sky.addColorStop(1, scene.bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = scene.wash;
  ctx.fillRect(0, 0, w, h);

  if (frame.rain > 0.02) {
    const count = Math.round(78 * frame.rain);
    ctx.strokeStyle = scene.streak;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < count; i += 1) {
      const seed = i * 97.13;
      const x = ((seed * 13.7) % 1) * w;
      const length = h * (0.028 + (i % 5) * 0.008);
      const speed = h * (0.42 + (i % 4) * 0.06);
      const y = ((seed * 53 + frame.t * speed) % (h + length)) - length;
      ctx.lineWidth = Math.max(1, w * (i % 7 === 0 ? 0.0022 : 0.00115));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w * 0.014, y + length);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (frame.waves > 0.02) {
    ctx.globalAlpha = frame.waves;
    for (let i = 0; i < 5; i += 1) {
      const yBase = h * (0.58 + i * 0.055);
      ctx.beginPath();
      ctx.strokeStyle = scene.wave;
      ctx.lineWidth = Math.max(1.5, h * 0.004);
      for (let x = 0; x <= w; x += w / 24) {
        const y =
          yBase +
          Math.sin(frame.t * 0.9 + i * 0.7 + x * 0.01) * h * 0.012 +
          Math.sin(frame.t * 0.35 + x * 0.004) * h * 0.008;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  const vignette = ctx.createRadialGradient(w / 2, h * 0.46, w * 0.2, w / 2, h * 0.48, h * 0.78);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.55, 'rgba(0, 0, 0, 0.08)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  const tick = Math.floor(frame.t * 8);
  for (let i = 0; i < 160; i += 1) {
    const n = Math.abs(Math.sin(i * 12.9898 + tick * 0.17));
    const x = (n * 43758.5453) % w;
    const y = (Math.abs(Math.sin(i * 78.233 + tick)) * 24634.634) % h;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}

function drawDots(ctx: CanvasRenderingContext2D, w: number, h: number, frame: NightyFrame): void {
  if (frame.slotCount < 2 || frame.activeIndex === null) return;
  const radius = Math.max(3, w * 0.011);
  const gap = radius * 3.1;
  const total = frame.slotCount * radius * 2 + (frame.slotCount - 1) * gap;
  let x = (w - total) / 2 + radius;
  const y = h * 0.8;
  for (let i = 0; i < frame.slotCount; i += 1) {
    ctx.beginPath();
    ctx.fillStyle = i === frame.activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.32)';
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    x += radius * 2 + gap;
  }
}

export function paintNightyFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: NightyFrame
): void {
  if (isReferenceLayout(frame.layout)) {
    paintReferenceFrame(ctx, w, h, frame);
    return;
  }
  drawBackdrop(ctx, w, h, frame);
  const maxWidth = w * 0.78;

  if (frame.showCard) {
    const cardW = w * 0.74;
    const cardH = h * 0.24;
    const x = (w - cardW) / 2;
    const y = h * 0.36;
    ctx.save();
    ctx.globalAlpha = Math.max(frame.headlineOpacity, 0.35);
    roundRect(ctx, x, y, cardW, cardH, w * 0.04);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = Math.max(1, w * 0.002);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.arc(w / 2, y + cardH * 0.28, w * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawTextBlock(
      ctx,
      frame.cardLabel || 'Rain',
      w / 2,
      y + cardH * 0.62,
      w * 0.038,
      500,
      cardW * 0.8,
      frame.headlineOpacity
    );
  }

  const headlineY = frame.showCard ? h * 0.22 : frame.layout === 'compare' || frame.layout === 'tour' ? h * 0.2 : h * 0.42;
  drawTextBlock(
    ctx,
    frame.headline,
    w / 2,
    headlineY,
    w * (frame.layout === 'statement' || frame.layout === 'sequence' ? 0.062 : 0.048),
    500,
    maxWidth,
    frame.headlineOpacity
  );

  if (frame.primary) {
    drawTextBlock(ctx, frame.primary, w / 2, h * 0.48, w * 0.07, 600, maxWidth, frame.primaryOpacity);
  }

  if (frame.subline) {
    const subY = frame.layout === 'sequence' ? headlineY : frame.showCard ? h * 0.68 : h * 0.68;
    drawTextBlock(ctx, frame.subline, w / 2, subY, w * 0.04, 500, maxWidth, frame.sublineOpacity);
  }

  drawDots(ctx, w, h, frame);

  drawTextBlock(ctx, 'Nighty', w / 2, h * 0.9, w * 0.03, 500, maxWidth, frame.brandOpacity);

  if (frame.dim > 0.01) {
    ctx.fillStyle = `rgba(0, 0, 0, ${frame.dim})`;
    ctx.fillRect(0, 0, w, h);
  }

  if (frame.endCta && frame.endCtaOpacity > 0.01) {
    drawTextBlock(ctx, 'Nighty', w / 2, h * 0.9, w * 0.032, 500, maxWidth, frame.endCtaOpacity);
    drawTextBlock(
      ctx,
      frame.endCta,
      w / 2,
      h * 0.945,
      w * 0.026,
      500,
      maxWidth,
      frame.endCtaOpacity
    );
  }
}
