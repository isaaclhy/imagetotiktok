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

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toHex = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(hue2rgb(p, q, h + 1 / 3))}${toHex(hue2rgb(p, q, h))}${toHex(
    hue2rgb(p, q, h - 1 / 3)
  )}`;
}

/** Analogous hue offset — close enough to harmonise, far enough to read as a swipe. */
const HIGHLIGHT_HUE_SHIFT = 0.055;
/** Marker band carries dark text, so keep it light and softly saturated. */
const HIGHLIGHT_SATURATION = 0.72;
const HIGHLIGHT_LIGHTNESS = 0.78;
/** Neutral backgrounds have no hue to riff on — fall back to a warm cream. */
const HIGHLIGHT_NEUTRAL_FALLBACK = '#F5E6A8';

/**
 * Marker color derived from the slide background: same family, nudged around
 * the wheel and lifted in tone. Maximising contrast (the old approach) gave
 * neon-on-pastel, which read as loud rather than designed.
 */
export function squiggleColorForBackground(backgroundHex: string): string {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return HIGHLIGHT_NEUTRAL_FALLBACK;
  const [bgHue, bgSat] = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (bgSat < 0.08) return HIGHLIGHT_NEUTRAL_FALLBACK;

  // Shift toward the warm side of the background hue — warmer neighbours read
  // as highlighter ink, cooler ones tend to look like a misprint.
  const hue = (bgHue + HIGHLIGHT_HUE_SHIFT + 1) % 1;
  return hslToHex(hue, HIGHLIGHT_SATURATION, HIGHLIGHT_LIGHTNESS);
}

/**
 * Ink color for text sitting on a marker swipe — the accents are all light, so
 * white-on-highlight would wash out.
 */
export const TITLE_HIGHLIGHT_TEXT_COLOR = '#141414';

/** Marker band geometry, shared by canvas export and the DOM preview. */
export const TITLE_HIGHLIGHT_PAD_X_EM = 0.12;
export const TITLE_HIGHLIGHT_PAD_Y_EM = 0.1;
export const TITLE_HIGHLIGHT_RADIUS_EM = 0.08;
export const TITLE_HIGHLIGHT_TILT_RAD = -0.012;

/**
 * Highlighter swipe behind a word on canvas. Draw this *before* the text so the
 * word sits on top of the marker band.
 */
export function drawTitleHighlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string
) {
  if (width <= 0) return;
  const padX = fontSize * TITLE_HIGHLIGHT_PAD_X_EM;
  const padY = fontSize * TITLE_HIGHLIGHT_PAD_Y_EM;

  // `textBaseline = 'middle'` centers the em box, not the glyphs, so a band
  // centered on `y` sits low. Measure a reference with ascenders + descenders
  // (same for every word, so bands stay aligned across lines) and wrap the ink.
  const ref = ctx.measureText('Hxpy');
  const ascent = ref.actualBoundingBoxAscent;
  const descent = ref.actualBoundingBoxDescent;
  const hasInkMetrics = Number.isFinite(ascent) && Number.isFinite(descent);
  const inkH = hasInkMetrics ? ascent + descent : fontSize;
  const inkTop = hasInkMetrics ? y - ascent : y - fontSize / 2;

  const bandW = width + padX * 2;
  const bandH = inkH + padY * 2;
  const bandX = x - padX;
  const bandY = inkTop - padY;
  const radius = Math.min(fontSize * TITLE_HIGHLIGHT_RADIUS_EM, bandH / 2);

  ctx.save();
  // Slight tilt so it reads as a hand swipe rather than a solid label.
  ctx.translate(bandX + bandW / 2, bandY + bandH / 2);
  ctx.rotate(TITLE_HIGHLIGHT_TILT_RAD);
  ctx.translate(-(bandX + bandW / 2), -(bandY + bandH / 2));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(bandX + radius, bandY);
  ctx.arcTo(bandX + bandW, bandY, bandX + bandW, bandY + bandH, radius);
  ctx.arcTo(bandX + bandW, bandY + bandH, bandX, bandY + bandH, radius);
  ctx.arcTo(bandX, bandY + bandH, bandX, bandY, radius);
  ctx.arcTo(bandX, bandY, bandX + bandW, bandY, radius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
