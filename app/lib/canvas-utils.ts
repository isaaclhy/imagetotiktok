import { TITLE_FONT } from './constants';

/** Get complementary color (opposite on color wheel) from hex. Returns hex. */
export function getComplementaryColor(hex: string): string {
  const h = hex.replace(/^#/, '');
  if (h.length !== 6 && h.length !== 3) return '#e1c2ff';
  let r: number, g: number, b: number;
  if (h.length === 6) {
    r = parseInt(h.slice(0, 2), 16) / 255;
    g = parseInt(h.slice(2, 4), 16) / 255;
    b = parseInt(h.slice(4, 6), 16) / 255;
  } else {
    r = parseInt(h[0]! + h[0], 16) / 255;
    g = parseInt(h[1]! + h[1], 16) / 255;
    b = parseInt(h[2]! + h[2], 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const inputL = (max + min) / 2;
  if (inputL < 0.08) return '#4a90a4';
  let hh = 0, s = 0, l = inputL;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hh = ((b - r) / d + 2) / 6;
    else hh = ((r - g) / d + 4) / 6;
  }
  hh = (hh + 0.5) % 1;
  if (s === 0) {
    const v = Math.round(l * 255).toString(16).padStart(2, '0');
    return `#${v}${v}${v}`;
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  let rr = Math.round(hue2rgb(p, q, hh + 1 / 3) * 255);
  let gg = Math.round(hue2rgb(p, q, hh) * 255);
  let bb = Math.round(hue2rgb(p, q, hh - 1 / 3) * 255);
  const outL = (Math.max(rr, gg, bb) + Math.min(rr, gg, bb)) / 2 / 255;
  if (outL < 0.25) {
    const boost = 0.5 / Math.max(outL, 0.01);
    rr = Math.min(255, Math.round(rr * boost));
    gg = Math.min(255, Math.round(gg * boost));
    bb = Math.min(255, Math.round(bb * boost));
  }
  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/** Wrap title text into lines using canvas measure (matches export). Use in preview/carousel. */
export function wrapTextToLines(
  text: string,
  maxWidth: number,
  fontSizePx: number
): string[] {
  if (typeof document === 'undefined') return [text || ''].filter(Boolean);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [text || ''].filter(Boolean);
  ctx.font = `bold ${fontSizePx}px ${TITLE_FONT}`;
  const words = (text || '').trim().split(/\s+/);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const candidate = current + ' ' + (words[i] ?? '');
    if (ctx.measureText(candidate).width <= maxWidth) current = candidate;
    else {
      lines.push(current);
      current = words[i] ?? '';
    }
  }
  lines.push(current);
  return lines;
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
