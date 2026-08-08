/** Pull a single highlightable token out of a model response and match it in the title. */
export function normalizeHighlightCandidate(raw: string, title: string): string | null {
  const cleaned = raw
    .trim()
    .split(/\s+/)[0]
    ?.replace(/^["'`“”‘’]+|["'`“”‘’.,!?;:]+$/g, '')
    .trim();
  if (!cleaned) return null;

  const lowerTitle = title.toLowerCase();
  const lowerWord = cleaned.toLowerCase();
  const idx = lowerTitle.indexOf(lowerWord);
  if (idx >= 0) {
    // Prefer a whole-word match when possible.
    const beforeOk = idx === 0 || !/[A-Za-z0-9']/.test(title[idx - 1]!);
    const afterOk =
      idx + cleaned.length >= title.length ||
      !/[A-Za-z0-9']/.test(title[idx + cleaned.length]!);
    if (beforeOk && afterOk) {
      return title.slice(idx, idx + cleaned.length);
    }
  }

  const tokens = title.match(/[A-Za-z']+/g) ?? [];
  const found = tokens.find((t) => t.toLowerCase() === lowerWord);
  return found ?? null;
}

/** Split title into plain / highlighted / plain parts for React rendering. */
export function splitTitleAroundHighlight(
  title: string,
  highlightWord: string | null | undefined
): { before: string; word: string; after: string } | null {
  if (!highlightWord?.trim()) return null;
  const lowerTitle = title.toLowerCase();
  const lowerWord = highlightWord.toLowerCase();
  const idx = lowerTitle.indexOf(lowerWord);
  if (idx < 0) return null;
  return {
    before: title.slice(0, idx),
    word: title.slice(idx, idx + highlightWord.length),
    after: title.slice(idx + highlightWord.length),
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace(/^#/, '');
  if (h.length === 3) {
    return {
      r: parseInt(h[0]! + h[0], 16),
      g: parseInt(h[1]! + h[1], 16),
      b: parseInt(h[2]! + h[2], 16),
    };
  }
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: string, b: string): number {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) return 1;
  const lA = relativeLuminance(rgbA.r, rgbA.g, rgbA.b);
  const lB = relativeLuminance(rgbB.r, rgbB.g, rgbB.b);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Fun, high-chroma accents for the title squiggle. Computing a complement
 * mathematically produced muddy near-black or washed-out results, so we pick
 * from a curated vivid set instead.
 */
const SQUIGGLE_ACCENTS = [
  '#FFE84D', // bright yellow
  '#8CFF3D', // lime
  '#25F4EE', // cyan
  '#3DFFB0', // spring mint
  '#FF3B77', // hot pink
  '#FF2D55', // red pink
  '#FF7A29', // orange
  '#B44DFF', // electric purple
] as const;

/** Shortest distance between two hues on the 0–1 wheel (max 0.5). */
function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
}

/**
 * Vivid accent for the title squiggle, chosen from the background so it always
 * pops. Scores candidates on hue separation plus luminance contrast.
 */
export function squiggleColorForBackground(backgroundHex: string): string {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return SQUIGGLE_ACCENTS[0];
  const [bgHue, bgSat] = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Equal-brightness pairs (e.g. mid red on mid teal) vibrate instead of
  // popping, so only consider accents with real luminance separation.
  const MIN_CONTRAST = 1.8;
  const eligible = SQUIGGLE_ACCENTS.filter(
    (accent) => contrastRatio(accent, backgroundHex) >= MIN_CONTRAST
  );
  const pool = eligible.length > 0 ? eligible : SQUIGGLE_ACCENTS;

  let best = pool[0] as string;
  let bestScore = -Infinity;
  for (const accent of pool) {
    const accentRgb = hexToRgb(accent)!;
    const [accentHue] = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);
    // Greyish backgrounds have no meaningful hue — judge on contrast alone.
    const hueScore = bgSat < 0.08 ? 0 : hueDistance(bgHue, accentHue) / 0.5;
    const contrastScore = Math.min(contrastRatio(accent, backgroundHex), 4) / 4;
    const score = hueScore + contrastScore * 0.4;
    if (score > bestScore) {
      bestScore = score;
      best = accent;
    }
  }
  return best;
}

/**
 * Hand-drawn-style squiggle under a word on canvas (Breeze-ad look).
 * `y` is the top edge of the squiggle band — the path never rises above it,
 * so the wave can't creep up into the letters it sits under.
 */
export function drawTitleSquiggle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
  strokeWidth = 8,
  maxAmplitude = strokeWidth * 3
) {
  if (width <= 0) return;
  // Few big waves — dense tiny waves + thick stroke read as a straight bar.
  const waves = Math.max(3, Math.min(5, Math.round(width / 34)));
  const amp = Math.min(Math.max(strokeWidth * 1.9, width * 0.12), maxAmplitude);
  const centerY = y + amp;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, centerY);
  for (let i = 0; i < waves; i++) {
    const seg = width / waves;
    const x1 = x + seg * i;
    const x2 = x + seg * (i + 1);
    const mid = (x1 + x2) / 2;
    const dir = i % 2 === 0 ? -1 : 1;
    // Single deep hump per segment so the wiggle stays readable at export size.
    ctx.quadraticCurveTo(mid, centerY + dir * amp, x2, centerY + dir * amp * 0.08);
  }
  ctx.stroke();
  ctx.restore();
}
