import type { NightyCompositionLayout } from '@/app/lib/nighty-video-templates/catalog';
import type { NightyFrame } from '@/app/lib/nighty-video-templates/timeline';

const CAPTION_FONT = 'TikTok Sans, sans-serif';

export type ReferenceCaptionStyle = 'heavy-outline' | 'soft-shadow' | 'plain';

/** 0 before 10s, then a smooth darken through the end. Kaleidoscope only. */
export function referenceDarken(layout: NightyCompositionLayout, t: number, duration: number): number {
  if (layout !== 'kaleidoscope' || t < 10) return 0;
  const span = Math.max(0.001, duration - 10);
  const u = Math.min(1, Math.max(0, (t - 10) / span));
  return u * u * (3 - 2 * u);
}

function captionStyle(layout: NightyCompositionLayout): ReferenceCaptionStyle {
  if (layout === 'particle-terrain') return 'heavy-outline';
  if (layout === 'kaleidoscope') return 'soft-shadow';
  return 'plain';
}

function captionWeight(style: ReferenceCaptionStyle): number {
  if (style === 'heavy-outline') return 700;
  if (style === 'soft-shadow') return 500;
  return 400;
}

function captionTargetWidth(style: ReferenceCaptionStyle): number {
  if (style === 'heavy-outline') return 0.68;
  if (style === 'soft-shadow') return 0.78;
  return 0.7;
}

function captionLines(text: string): string[] {
  const lines = text.split('\n').map((line) => line.trim());
  const kept = lines.filter((line) => line.length > 0);
  return kept.length > 0 ? kept : [];
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  weight: number,
  targetWidth: number
): number {
  let size = Math.round(targetWidth * 0.16);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    ctx.font = `${weight} ${size}px ${CAPTION_FONT}`;
    let widest = 0;
    for (const line of lines) widest = Math.max(widest, ctx.measureText(line).width);
    if (widest <= targetWidth || size <= 18) return size;
    size = Math.max(18, Math.floor((size * targetWidth) / widest));
  }
  return size;
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  style: ReferenceCaptionStyle
): void {
  const lines = captionLines(text);
  if (lines.length === 0) return;
  const weight = captionWeight(style);
  const size = fitFontSize(ctx, lines, weight, w * captionTargetWidth(style));
  ctx.font = `${weight} ${size}px ${CAPTION_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lineH = size * 1.22;
  const blockH = lines.length * lineH;
  let y = h / 2 - blockH / 2 + lineH / 2;
  for (const line of lines) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    if (style === 'heavy-outline') {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.lineWidth = Math.max(2, size * 0.16);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.94)';
      ctx.strokeText(line, w / 2, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, w / 2, y);
    } else if (style === 'soft-shadow') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = size * 0.16;
      ctx.shadowOffsetY = size * 0.04;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, w / 2, y);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, w / 2, y);
    }
    y += lineH;
  }
}

function paintParticleTerrain(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.fillStyle = '#141418';
  ctx.fillRect(0, 0, w, h);

  const cell = Math.max(3.5, w / 96);
  const cols = Math.ceil(w / cell) + 3;
  const rows = Math.ceil(h / cell) + 3;
  const speed = 0.58;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x0 = (col - 1) * cell;
      const y0 = (row - 1) * cell;
      const u = x0 / w;
      const v = y0 / h;
      const phase = t * speed;
      const diag = Math.sin((u * 5.4 + v * 2.6) * Math.PI + phase);
      const cross = Math.sin((u * 1.7 - v * 6.2) * Math.PI + phase * 0.84);
      const wave = diag * 0.62 + cross * 0.38;
      const crest = (wave + 1) / 2;
      const x = x0 + Math.sin(v * 14 + phase) * cell * 0.42;
      const y = y0 + wave * cell * 2.35;
      const stripe = Math.sin((u * 8.5 - v * 3.4) * Math.PI + phase * 0.45);
      let color: string;
      if (crest > 0.86 && stripe > 0.62) {
        color = `rgb(${48 + crest * 20}, ${168 + crest * 50}, ${196 + crest * 30})`;
      } else if (crest > 0.84 && stripe < -0.62) {
        color = `rgb(${148 + crest * 30}, ${32}, ${42})`;
      } else {
        const lit = Math.max(0, diag) * 14;
        const gray = Math.round(24 + crest * 58 + lit);
        color = `rgb(${gray}, ${gray + 1}, ${gray + 4})`;
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, cell * 0.47, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function foldQuarter(angle: number): number {
  const sector = Math.PI / 4;
  let a = angle % (Math.PI * 2);
  if (a < 0) a += Math.PI * 2;
  const span = sector * 2;
  const wrapped = a % span;
  return wrapped > sector ? span - wrapped : wrapped;
}

function paintKaleidoscope(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  duration: number
): void {
  const image = ctx.createImageData(w, h);
  const data = image.data;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(cx, cy);
  const pulse = 0.9 + 0.12 * Math.sin(t * 1.5);
  const chevron = 0.5 + 0.5 * Math.sin(t * 1.02);
  const pinch = 0.82 + 0.18 * Math.sin(t * 1.28 + 0.6);

  for (let y = 0; y < h; y += 1) {
    const dy = y - cy;
    for (let x = 0; x < w; x += 1) {
      const dx = x - cx;
      const r = Math.hypot(dx, dy);
      const folded = foldQuarter(Math.atan2(dy, dx));
      const across = Math.sin(folded) * r;
      const along = Math.cos(folded) * r;
      const norm = r / maxR;
      const half = maxR * pulse * pinch * (0.045 + 0.2 * Math.sin(Math.min(1, norm) * Math.PI));
      const inside = half > 1 ? Math.max(0, 1 - Math.abs(across) / half) : 0;
      const body = inside ** 0.5;
      const bent = along + Math.abs(across) * (0.15 + 1.15 * chevron);
      const sine = Math.sin((bent / w) * 36 * Math.PI - t * 2.25);
      const rib = 0.22 + 0.78 * Math.max(0, sine) ** (0.4 + chevron * 0.7);
      const edge = norm < 0.03 ? norm / 0.03 : 1;
      const falloff = 1 - Math.min(1, Math.max(0, (norm - 0.78) / 0.22));
      const v = body * rib * edge * falloff;
      const gloss = sine > 0.72 ? (sine - 0.72) / 0.28 : 0;
      const i = (y * w + x) * 4;
      data[i] = Math.round(4 + v * 28 + gloss * body * 80);
      data[i + 1] = Math.round(10 + v * 78 + gloss * body * 110);
      data[i + 2] = Math.round(32 + v * 200 + gloss * body * 40);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const dark = referenceDarken('kaleidoscope', t, duration);
  if (dark > 0.001) {
    ctx.fillStyle = `rgba(0, 0, 8, ${dark * 0.72})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function paintVortex(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.fillStyle = '#03060d';
  ctx.fillRect(0, 0, w, h);

  const nodes = [
    { x: 0.5, y: 0.76, count: 480, radius: 0.58, speed: 0.9, arms: 5 },
    { x: 0.18, y: 0.44, count: 320, radius: 0.4, speed: -1.12, arms: 4 },
    { x: 0.8, y: 0.18, count: 300, radius: 0.36, speed: 1.2, arms: 4 },
  ];
  const reach = Math.min(w, h);

  for (const node of nodes) {
    const nx = node.x * w;
    const ny = node.y * h;
    const maxR = node.radius * reach;
    for (let i = 0; i < node.count; i += 1) {
      const arm = i % node.arms;
      const along = (Math.floor(i / node.arms) + 0.35) / Math.ceil(node.count / node.arms);
      const angle = arm * ((Math.PI * 2) / node.arms) + along * 6.2 + t * node.speed;
      const rad = along * maxR;
      const x = nx + Math.cos(angle) * rad;
      const y = ny + Math.sin(angle) * rad;
      const tangent = angle + (Math.PI / 2) * Math.sign(node.speed || 1);
      const trail = Math.max(6, w * 0.028) * (0.28 + along * 0.9);
      const dir = Math.sign(node.speed || 1);
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(tangent) * trail * dir, y - Math.sin(tangent) * trail * dir);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `rgba(90, 210, 255, ${0.18 + 0.45 * (1 - along)})`;
      ctx.lineWidth = Math.max(1, w * 0.0022);
      ctx.stroke();
      ctx.fillStyle = `rgba(210, 248, 255, ${0.55 + 0.4 * (1 - along)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.8, w * 0.0032 * (1.15 - along * 0.4)), 0, Math.PI * 2);
      ctx.fill();
    }
    const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, w * 0.045);
    glow.addColorStop(0, 'rgba(236, 252, 255, 1)');
    glow.addColorStop(0.22, 'rgba(70, 190, 255, 0.9)');
    glow.addColorStop(1, 'rgba(0, 30, 70, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(nx, ny, w * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintReferenceFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: NightyFrame
): void {
  if (frame.layout === 'particle-terrain') paintParticleTerrain(ctx, w, h, frame.t);
  else if (frame.layout === 'kaleidoscope') paintKaleidoscope(ctx, w, h, frame.t, frame.duration);
  else paintVortex(ctx, w, h, frame.t);

  if (frame.dim > 0.01) {
    ctx.fillStyle = `rgba(0, 0, 0, ${frame.dim})`;
    ctx.fillRect(0, 0, w, h);
  }

  if (frame.headlineOpacity > 0.01) {
    ctx.save();
    ctx.globalAlpha = frame.headlineOpacity;
    drawCaption(ctx, w, h, frame.headline, captionStyle(frame.layout));
    ctx.restore();
  }

  if (frame.endCta && frame.endCtaOpacity > 0.01) {
    ctx.save();
    ctx.globalAlpha = frame.endCtaOpacity;
    ctx.fillStyle = '#ffffff';
    ctx.font = `500 ${Math.max(16, w * 0.028)}px ${CAPTION_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frame.endCta, w / 2, h * 0.9);
    ctx.restore();
  }
}
