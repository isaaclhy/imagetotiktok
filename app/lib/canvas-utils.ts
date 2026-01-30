import { TITLE_FONT } from './constants';

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
