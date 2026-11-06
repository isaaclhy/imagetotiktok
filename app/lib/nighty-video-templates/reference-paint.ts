import type { NightyCompositionLayout } from '@/app/lib/nighty-video-templates/catalog';
import type { NightyFrame } from '@/app/lib/nighty-video-templates/timeline';

const CAPTION_FONT = 'TikTok Sans, sans-serif';

/**
 * Supplied-reference pictures.
 *
 * Reference 1 draws a perspective mound: hashed samples on an irregular
 * height field, lit by the surface normal, with larger dimmer grains off the
 * focal plane. Reference 2 shades a 4-fold ribbed surface at 360×640 (the
 * source frame size) and scales it, so a 1080×1920 export does not run a
 * per-pixel loop over two million pixels. Reference 3 advects one shared
 * velocity field around exactly three nodes and draws varied-length trails.
 * None of these are frame copies of the supplied footage.
 */

export type ReferenceCaptionStyle = 'heavy-outline' | 'soft-shadow' | 'plain';

type ScratchCanvas = {
  width: number;
  height: number;
  getContext(kind: '2d'): CanvasRenderingContext2D;
};

type ScratchFactory = (width: number, height: number) => ScratchCanvas;

let scratchFactory: ScratchFactory | null = null;
const scratchCache = new Map<string, { canvas: ScratchCanvas; ctx: CanvasRenderingContext2D }>();

/** Node renders have no DOM canvas. The render script installs napi-rs here. */
export function installNightyScratchCanvas(factory: ScratchFactory): void {
  scratchFactory = factory;
  scratchCache.clear();
}

function scratch(width: number, height: number): { canvas: ScratchCanvas; ctx: CanvasRenderingContext2D } {
  const key = `${width}x${height}`;
  const cached = scratchCache.get(key);
  if (cached) return cached;
  let canvas: ScratchCanvas;
  if (typeof document !== 'undefined') {
    const element = document.createElement('canvas');
    element.width = width;
    element.height = height;
    canvas = element;
  } else if (scratchFactory) {
    canvas = scratchFactory(width, height);
  } else {
    throw new Error('Nighty scratch canvas is unavailable');
  }
  const ctx = canvas.getContext('2d');
  const entry = { canvas, ctx };
  scratchCache.set(key, entry);
  return entry;
}

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

/** Measured on the 360×640 source stills (white-pixel width / frame width). */
function captionTargetWidth(layout: NightyCompositionLayout): number {
  if (layout === 'kaleidoscope') return 0.74;
  return 0.545;
}

function captionLines(text: string): string[] {
  return text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  weight: number,
  targetWidth: number
): number {
  let size = Math.max(12, Math.round(targetWidth * 0.14));
  const family = `${weight} ${size}px ${CAPTION_FONT}`;
  ctx.font = family;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    ctx.font = `${weight} ${size}px ${CAPTION_FONT}`;
    let widest = 0;
    for (const line of lines) widest = Math.max(widest, ctx.measureText(line).width);
    if (widest <= targetWidth || size <= 11) return size;
    size = Math.max(11, Math.floor((size * targetWidth) / widest));
  }
  return size;
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  layout: NightyCompositionLayout
): void {
  const lines = captionLines(text);
  if (lines.length === 0) return;
  const style = captionStyle(layout);
  const weight = captionWeight(style);
  const size = fitFontSize(ctx, lines, weight, w * captionTargetWidth(layout));
  ctx.font = `${weight} ${size}px ${CAPTION_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  const lineH = size * 1.14;
  const blockH = lines.length * lineH;
  let y = h / 2 - blockH / 2 + lineH / 2;
  for (const line of lines) {
    const x = w / 2;
    if (style === 'heavy-outline') {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.lineWidth = Math.max(2, size * 0.34);
      ctx.strokeStyle = '#000000';
      ctx.strokeText(line, x, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, x, y);
    } else if (style === 'soft-shadow') {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
      ctx.shadowBlur = size * 0.55;
      ctx.shadowOffsetY = Math.max(1, size * 0.08);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(line, x, y);
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, x, y);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, x, y);
    }
    y += lineH;
  }
}

function unit(n: number): number {
  const x = (Math.imul(n, 1664525) + 1013904223) >>> 0;
  return (x & 0xffffff) / 0x1000000;
}

function paintParticleTerrain(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, w, h);
  const smoke = ctx.createRadialGradient(w * 0.46, h * 0.46, w * 0.02, w * 0.5, h * 0.5, w * 0.72);
  smoke.addColorStop(0, 'rgba(42, 42, 48, 0.55)');
  smoke.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = smoke;
  ctx.fillRect(0, 0, w, h);

  const count = Math.round(Math.min(5000, Math.max(3200, (w * h) / 200)));
  const px = new Float32Array(count);
  const py = new Float32Array(count);
  const depth = new Float32Array(count);
  const radius = new Float32Array(count);
  const red = new Uint8Array(count);
  const green = new Uint8Array(count);
  const blue = new Uint8Array(count);
  const order = new Uint16Array(count);

  for (let i = 0; i < count; i += 1) {
    const spin = unit(i + 3) * Math.PI * 2;
    const reach = Math.pow(unit(i + 11), 1.4);
    const depthMix = unit(i + 19);
    const nx = Math.cos(spin) * reach;
    const ny = Math.sin(spin) * reach * 0.92;
    const fold = Math.sin(t * 0.36);
    const height = Math.exp(-(nx * nx * 0.9 + (ny + 0.08 * fold) * (ny + 0.08 * fold) * 0.75));
    const lump = Math.exp(-((nx + 0.35) * (nx + 0.35) * 3 + (ny - 0.2) * (ny - 0.2) * 2.2));
    const ridge = Math.exp(-Math.pow(ny - 0.18 * Math.sin(nx * 2.4 + t * 0.5), 2) * 18) * height;
    const surface = height * 0.85 + lump * 0.35 + ridge * 0.4;
    const gx = nx * height * -1.6;
    const gy = (ny + 0.08 * fold) * height * -1.3;
    const lambert = Math.max(0.15, 0.55 + gx * -0.35 + gy * 0.15 + surface * 0.4);
    const scale = w * (0.34 + depthMix * 0.1);
    px[i] = w * 0.5 + nx * scale;
    py[i] = h * 0.46 + ny * scale * 1.25 - surface * h * 0.16 + (depthMix - 0.5) * h * 0.04;
    depth[i] = 1.2 + depthMix + (1 - surface);
    radius[i] = (w / 360) * (1.5 + depthMix * 2.2) * (0.8 + surface);
    const cool = Math.max(0, -gx - 0.15) * surface;
    const warm = Math.max(0, gx - 0.05) * surface;
    const gray = 36 + surface * 70 + lambert * 48;
    red[i] = Math.min(255, gray + warm * 90);
    green[i] = Math.min(255, gray + cool * 40);
    blue[i] = Math.min(255, gray + 8 + cool * 80);
    order[i] = i;
  }

  order.sort((a, b) => depth[b]! - depth[a]!);
  for (let n = 0; n < count; n += 1) {
    const i = order[n]!;
    const rad = radius[i]!;
    ctx.fillStyle = `rgb(${red[i]},${green[i]},${blue[i]})`;
    if (rad < 1.7) {
      ctx.fillRect(px[i]! - rad, py[i]! - rad, rad * 2, rad * 2);
    } else {
      ctx.beginPath();
      ctx.arc(px[i]!, py[i]!, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

const SHADE_W = 360;
const SHADE_H = 640;
let shadeImage: ImageData | null = null;

function paintKaleidoscope(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  duration: number
): void {
  const { canvas, ctx: shade } = scratch(SHADE_W, SHADE_H);
  if (!shadeImage) shadeImage = shade.createImageData(SHADE_W, SHADE_H);
  const data = shadeImage.data;
  const breathe = 0.5 + 0.5 * Math.sin(t * 1.12);
  const pinch = 0.5 + 0.5 * Math.sin(t * 0.66 + 1.1);
  const zoom = 0.86 + 0.16 * Math.sin(t * 1.28);
  const freq = 92 + 28 * pinch;
  const bend = 2.4 + 9 * (1 - breathe);
  const cx = SHADE_W / 2;
  const cy = SHADE_H / 2;
  const sector = Math.PI / 2;

  for (let y = 0; y < SHADE_H; y += 1) {
    const dy0 = (y - cy) / SHADE_W / zoom;
    const row = y * SHADE_W * 4;
    for (let x = 0; x < SHADE_W; x += 1) {
      const dx = (x - cx) / SHADE_W / zoom;
      const dy = dy0;
      let ang = Math.atan2(dy, dx);
      const r = Math.sqrt(dx * dx + dy * dy);
      ang %= sector;
      if (ang < 0) ang += sector;
      const across = Math.abs(ang - sector * 0.5);
      const leaf = r > 0.02 && r < 0.9 ? Math.sin(((r - 0.02) / 0.88) * Math.PI) : 0;
      const angWidth = 0.16 + 0.2 * leaf * (0.45 + 0.55 * breathe);
      const mask = across < angWidth ? (1 - across / angWidth) ** 1.35 : 0;
      const edge = r > 0.8 ? Math.max(0, 1 - (r - 0.8) / 0.14) : 1;
      const body = mask * leaf * edge;
      const phase = r * freq - t * 3.1 + across * r * bend;
      const wave = Math.sin(phase);
      const facing = wave > 0 ? wave : 0;
      const flank = facing * facing;
      const rib = flank * flank * facing;
      const eye =
        Math.exp(-((r - (0.3 + 0.06 * pinch)) * (r - (0.3 + 0.06 * pinch))) / 0.008) * mask * flank;
      const i = row + x * 4;
      const cover = body;
      data[i] = Math.min(255, cover * (flank * 36 + rib * 230 + eye * 160));
      data[i + 1] = Math.min(255, cover * (flank * 78 + rib * 245 + eye * 190));
      data[i + 2] = Math.min(255, cover * (flank * 190 + rib * 255 + eye * 230));
      data[i + 3] = 255;
    }
  }
  shade.putImageData(shadeImage, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(canvas as CanvasImageSource, 0, 0, w, h);
  const dark = referenceDarken('kaleidoscope', t, duration);
  if (dark > 0.001) {
    ctx.fillStyle = `rgba(0, 0, 0, ${dark * 0.82})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function paintVortex(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0a1c38');
  bg.addColorStop(0.28, '#061226');
  bg.addColorStop(1, '#02040c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const haze = ctx.createRadialGradient(w * 0.62, h * 0.16, w * 0.02, w * 0.55, h * 0.2, w * 0.78);
  haze.addColorStop(0, 'rgba(30, 80, 150, 0.28)');
  haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h * 0.62);

  const nodes = [
    { x: 0.5 * w, y: 0.74 * h, k: 1 },
    { x: 0.19 * w, y: 0.41 * h, k: 0.56 },
    { x: 0.79 * w, y: 0.19 * h, k: 0.64 },
  ];
  const soft = w * w * 0.018;
  const turb = w * 0.018;

  const velocity = (x: number, y: number, time: number): { vx: number; vy: number } => {
    let vx = 0;
    let vy = 0;
    for (let n = 0; n < 3; n += 1) {
      const node = nodes[n]!;
      const dx = x - node.x;
      const dy = y - node.y;
      const r2 = dx * dx + dy * dy + soft;
      const inv = (node.k * w * w * 0.085) / r2;
      vx += -dy * inv;
      vy += dx * inv;
    }
    const nx = x / w;
    const ny = y / h;
    vx += Math.sin(nx * 8.2 + ny * 3.4 + time * 0.7) * turb;
    vy += Math.cos(nx * 3.6 - ny * 7.6 + time * 0.55) * turb * 0.85;
    return { vx, vy };
  };

  const count = Math.round(Math.min(3600, Math.max(2400, (w * h) / 260)));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const bucketCount = 4;
  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const near = bucket / (bucketCount - 1);
    ctx.beginPath();
    ctx.lineWidth = Math.max(1, (w / 360) * (1.05 + near * 0.55));
    ctx.strokeStyle = `rgba(${60 + near * 100}, ${150 + near * 80}, 255, ${0.5 + near * 0.4})`;
    for (let i = bucket; i < count; i += bucketCount) {
      const z = 0.25 + unit(i * 2 + 5) * 0.75;
      let x = unit(i * 2) * w;
      let y = unit(i * 2 + 1) * h;
      const adv = t * (0.55 + z * 0.35);
      const v0 = velocity(x, y, adv);
      const speed0 = Math.hypot(v0.vx, v0.vy) || 1;
      const travel = (t * (4 + z * 5)) % (w * 0.035);
      x += (v0.vx / speed0) * travel;
      y += (v0.vy / speed0) * travel;
      if (x < 0) x += w;
      else if (x > w) x -= w;
      if (y < 0) y += h;
      else if (y > h) y -= h;
      const length = 2 + Math.floor(unit(i * 2 + 7) * (2 + z * 4));
      ctx.moveTo(x, y);
      let px = x;
      let py = y;
      for (let step = 0; step < length; step += 1) {
        const v = velocity(px, py, adv);
        const speed = Math.hypot(v.vx, v.vy) || 1;
        const stepPx = (w / 360) * (1.05 + z * 1.15);
        px -= (v.vx / speed) * stepPx;
        py -= (v.vy / speed) * stepPx;
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }

  for (let n = 0; n < nodes.length; n += 1) {
    const node = nodes[n]!;
    const rad = w * (0.075 + n * 0.008);
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, rad);
    glow.addColorStop(0, 'rgba(245, 252, 255, 0.95)');
    glow.addColorStop(0.14, 'rgba(90, 200, 255, 0.75)');
    glow.addColorStop(0.42, 'rgba(20, 70, 170, 0.22)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.x, node.y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function paintReferenceFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: NightyFrame
): void {
  ctx.save();
  if (frame.layout === 'particle-terrain') paintParticleTerrain(ctx, w, h, frame.t);
  else if (frame.layout === 'kaleidoscope') paintKaleidoscope(ctx, w, h, frame.t, frame.duration);
  else paintVortex(ctx, w, h, frame.t);
  ctx.restore();

  if (frame.dim > 0.01) {
    ctx.fillStyle = `rgba(0, 0, 0, ${frame.dim})`;
    ctx.fillRect(0, 0, w, h);
  }

  if (frame.headlineOpacity > 0.01) {
    ctx.save();
    ctx.globalAlpha = frame.headlineOpacity;
    drawCaption(ctx, w, h, frame.headline, frame.layout);
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
