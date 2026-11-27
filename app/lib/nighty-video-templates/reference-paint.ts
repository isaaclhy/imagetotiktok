import type { NightyCompositionLayout } from '@/app/lib/nighty-video-templates/catalog';
import type { NightyFrame } from '@/app/lib/nighty-video-templates/timeline';

const CAPTION_FONT = 'TikTok Sans, sans-serif';

/**
 * Supplied-reference pictures.
 *
 * Samples use an avalanched uint32 mix. An affine LCG made x and y the same
 * sequence, so grains and trails collapsed onto a curve.
 * Reference 1 projects independent disk samples through a 2D height field.
 * Far grains are smaller. Reference 2 shades a continuous 4-lobe rib surface
 * at 360×640 and scales it. Reference 3 integrates long streamlines with RK4
 * around exactly three nodes and moves a highlight along each one.
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

export function drawReferenceCaption(
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
  const center =
    layout === 'kaleidoscope' ? 0.5 : layout === 'vortex' ? 0.473 : 0.476;
  let y = h * center - blockH / 2 + lineH / 2;
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

/** SplitMix-style avalanche. Adjacent integers are not an affine line. */
function mixUint32(n: number): number {
  let z = (n >>> 0) + 0x9e3779b9;
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
  return (z ^ (z >>> 16)) >>> 0;
}

/** Independent unit sample. `salt` is mixed, not added, so salt+1 is not a shift of salt. */
export function referenceUnit(index: number, salt: number): number {
  const mixed = mixUint32(Math.imul(index >>> 0, 0x9e3779b9) ^ mixUint32(salt >>> 0));
  return mixed / 4294967296;
}

/** How many cells of a bins×bins grid the first `count` pairs land in. A line fills about `bins` cells. */
export function seedScatterOccupancy(count: number, bins: number, saltA: number, saltB: number): number {
  const grid = new Uint8Array(bins * bins);
  let occupied = 0;
  for (let i = 0; i < count; i += 1) {
    const x = Math.min(bins - 1, Math.floor(referenceUnit(i, saltA) * bins));
    const y = Math.min(bins - 1, Math.floor(referenceUnit(i, saltB) * bins));
    const cell = y * bins + x;
    if (grid[cell] === 0) {
      grid[cell] = 1;
      occupied += 1;
    }
  }
  return occupied;
}

function moundHeight(x: number, z: number, t: number): number {
  const drift = 0.07 * Math.sin(t * 0.42);
  const x1 = x - drift;
  const z1 = z + 0.05 * Math.cos(t * 0.33);
  const dome = Math.exp(-(x1 * x1 * 0.95 + z1 * z1 * 1.15));
  const lump = Math.exp(-((x + 0.38) * (x + 0.38) * 2.6 + (z - 0.22) * (z - 0.22) * 2.2));
  const fold = Math.sin(x * 2.4 + t * 0.48) * Math.cos(z * 1.8 - t * 0.27);
  return dome * 0.78 + lump * 0.26 + fold * 0.1 * dome;
}

function paintParticleTerrain(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, w, h);
  const smoke = ctx.createRadialGradient(w * 0.48, h * 0.42, w * 0.02, w * 0.5, h * 0.48, w * 0.7);
  smoke.addColorStop(0, 'rgba(28, 28, 34, 0.45)');
  smoke.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = smoke;
  ctx.fillRect(0, 0, w, h);

  const count = Math.round(Math.min(9000, Math.max(6400, (w * h) / 220)));
  const px = new Float32Array(count);
  const py = new Float32Array(count);
  const depth = new Float32Array(count);
  const radius = new Float32Array(count);
  const red = new Uint8Array(count);
  const green = new Uint8Array(count);
  const blue = new Uint8Array(count);
  const order = new Uint16Array(count);
    const focal = w * 1.42;
  const eps = 0.03;

  for (let i = 0; i < count; i += 1) {
    const spin = referenceUnit(i, 1) * Math.PI * 2;
    const reach = Math.sqrt(referenceUnit(i, 2));
    const x = Math.cos(spin) * reach;
    const z = Math.sin(spin) * reach * 0.9;
    const y = moundHeight(x, z, t) + (referenceUnit(i, 4) - 0.5) * 0.04;
    const hx = moundHeight(x + eps, z, t) - moundHeight(x - eps, z, t);
    const hz = moundHeight(x, z + eps, t) - moundHeight(x, z - eps, t);
    let nx = -hx;
    let ny = eps * 2;
    let nz = -hz;
    const nlen = Math.hypot(nx, ny, nz) || 1;
    nx /= nlen;
    ny /= nlen;
    nz /= nlen;
    const camY = y - 0.1;
    const camZ = z + 2.45;
    px[i] = w * 0.5 + (x / camZ) * focal;
    py[i] = h * 0.58 - (camY / camZ) * focal;
    depth[i] = camZ;
    radius[i] = Math.max(0.45, ((w / 360) * 3.6) / camZ);
    const lambert = Math.max(0, nx * -0.22 + ny * 0.88 + nz * 0.2);
    const cool = Math.max(0, -nx * 0.85 + ny * 0.12) * lambert;
    const warm = Math.max(0, nx * 0.8) * lambert;
    const gray = 24 + lambert * 118;
    red[i] = Math.min(255, gray + warm * 70);
    green[i] = Math.min(255, gray + cool * 36);
    blue[i] = Math.min(255, gray + 4 + cool * 64);
    order[i] = i;
  }

  order.sort((a, b) => depth[b]! - depth[a]!);
  for (let n = 0; n < count; n += 1) {
    const i = order[n]!;
    const rad = radius[i]!;
    ctx.fillStyle = `rgb(${red[i]},${green[i]},${blue[i]})`;
    ctx.fillRect(px[i]! - rad, py[i]! - rad, rad * 2, rad * 2);
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
      const lobe = Math.cos(across * 2);
      const warped = r / (0.68 + 0.42 * Math.max(0, lobe));
      const phase = warped * freq - t * 2.4 + Math.sin(across * bend) * 0.6;
      const crest = Math.sin(phase);
      const lit = 0.48 + 0.52 * Math.max(0, crest);
      const spec = Math.max(0, crest) ** 5;
      const fall = warped > 1.05 ? Math.max(0, 1 - (warped - 1.05) / 0.2) : 1;
      const cover = lit * fall * (0.78 + 0.22 * (0.5 + 0.5 * lobe)) * (0.9 + 0.1 * pinch);
      const i = row + x * 4;
      data[i] = Math.min(255, cover * 18 + spec * 160);
      data[i + 1] = Math.min(255, cover * 55 + spec * 200);
      data[i + 2] = Math.min(255, cover * 165 + spec * 90);
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

type VortexStream = {
  xs: Float32Array;
  ys: Float32Array;
  samples: number;
  span: number;
  speed: number;
};

let vortexCache: { w: number; h: number; streams: VortexStream[] } | null = null;

function vortexVelocity(x: number, y: number, w: number, h: number): { vx: number; vy: number } {
  const nodes = [
    { x: 0.5 * w, y: 0.74 * h, k: 1 },
    { x: 0.19 * w, y: 0.41 * h, k: 0.62 },
    { x: 0.79 * w, y: 0.19 * h, k: 0.68 },
  ];
  const soft = (w * 0.09) ** 2;
  let vx = 0;
  let vy = 0;
  for (let n = 0; n < 3; n += 1) {
    const node = nodes[n]!;
    const dx = x - node.x;
    const dy = y - node.y;
    const r2 = dx * dx + dy * dy + soft;
    const spin = (node.k * w * w * 0.055) / r2;
    vx += -dy * spin;
    vy += dx * spin;
  }
  vx += Math.sin(x * 0.012 + y * 0.005) * w * 0.012;
  vy += Math.cos(x * 0.006 - y * 0.014) * w * 0.012;
  const speed = Math.hypot(vx, vy) || 1;
  const cap = w * 0.22;
  if (speed > cap) {
    vx = (vx / speed) * cap;
    vy = (vy / speed) * cap;
  }
  return { vx, vy };
}

function vortexRk4(x: number, y: number, dt: number, w: number, h: number): { x: number; y: number } {
  const k1 = vortexVelocity(x, y, w, h);
  const k2 = vortexVelocity(x + k1.vx * dt * 0.5, y + k1.vy * dt * 0.5, w, h);
  const k3 = vortexVelocity(x + k2.vx * dt * 0.5, y + k2.vy * dt * 0.5, w, h);
  const k4 = vortexVelocity(x + k3.vx * dt, y + k3.vy * dt, w, h);
  return {
    x: x + ((k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx) * dt) / 6,
    y: y + ((k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy) * dt) / 6,
  };
}

function vortexStreams(w: number, h: number): VortexStream[] {
  if (vortexCache && vortexCache.w === w && vortexCache.h === h) return vortexCache.streams;
  const streams: VortexStream[] = [];
  const count = 72;
  const steps = 280;
  const dt = 0.045;
  for (let i = 0; i < count; i += 1) {
    const xs = new Float32Array(steps);
    const ys = new Float32Array(steps);
    let x = referenceUnit(i, 20) * w;
    let y = referenceUnit(i, 21) * h;
    if (i < 18) {
      const node = i % 3;
      const fx = node === 0 ? 0.5 : node === 1 ? 0.19 : 0.79;
      const fy = node === 0 ? 0.74 : node === 1 ? 0.41 : 0.19;
      const ang = referenceUnit(i, 22) * Math.PI * 2;
      const rad = 0.04 + referenceUnit(i, 23) * 0.12;
      x = (fx + Math.cos(ang) * rad) * w;
      y = (fy + Math.sin(ang) * rad) * h;
    }
    let samples = 0;
    for (let step = 0; step < steps; step += 1) {
      xs[step] = x;
      ys[step] = y;
      samples += 1;
      const next = vortexRk4(x, y, dt, w, h);
      if (next.x < -w * 0.05 || next.y < -h * 0.05 || next.x > w * 1.05 || next.y > h * 1.05) break;
      x = next.x;
      y = next.y;
    }
    if (samples < 24) continue;
    streams.push({
      xs,
      ys,
      samples,
      span: 70 + Math.floor(referenceUnit(i, 24) * 140),
      speed: 0.55 + referenceUnit(i, 25) * 0.9,
    });
  }
  vortexCache = { w, h, streams };
  return streams;
}

function paintVortex(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0a1c38');
  bg.addColorStop(0.32, '#061226');
  bg.addColorStop(1, '#02040c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const haze = ctx.createRadialGradient(w * 0.62, h * 0.16, w * 0.02, w * 0.55, h * 0.22, w * 0.78);
  haze.addColorStop(0, 'rgba(30, 80, 150, 0.32)');
  haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h * 0.62);

  const streams = vortexStreams(w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1, w / 520);
  ctx.strokeStyle = 'rgba(70, 150, 220, 0.42)';
  ctx.beginPath();
  for (const stream of streams) {
    ctx.moveTo(stream.xs[0]!, stream.ys[0]!);
    for (let s = 1; s < stream.samples; s += 1) ctx.lineTo(stream.xs[s]!, stream.ys[s]!);
  }
  ctx.stroke();

  ctx.lineWidth = Math.max(1.25, w / 340);
  ctx.strokeStyle = 'rgba(170, 230, 255, 0.9)';
  ctx.beginPath();
  for (const stream of streams) {
    const span = Math.min(stream.span, stream.samples - 1);
    const start = Math.floor(t * stream.speed * 36) % Math.max(1, stream.samples - span);
    ctx.moveTo(stream.xs[start]!, stream.ys[start]!);
    for (let s = 1; s <= span; s += 1) {
      const index = start + s;
      ctx.lineTo(stream.xs[index]!, stream.ys[index]!);
    }
  }
  ctx.stroke();

  const glows = [
    { x: 0.5 * w, y: 0.74 * h },
    { x: 0.19 * w, y: 0.41 * h },
    { x: 0.79 * w, y: 0.19 * h },
  ];
  for (const node of glows) {
    const rad = w * 0.07;
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, rad);
    glow.addColorStop(0, 'rgba(245, 252, 255, 0.95)');
    glow.addColorStop(0.16, 'rgba(90, 200, 255, 0.72)');
    glow.addColorStop(0.45, 'rgba(20, 70, 170, 0.2)');
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
    drawReferenceCaption(ctx, w, h, frame.headline, frame.layout);
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
