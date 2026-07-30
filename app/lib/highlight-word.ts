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

/** Hand-drawn-style squiggle under a word on canvas (Breeze-ad look). */
export function drawTitleSquiggle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color: string,
  strokeWidth = 8
) {
  if (width <= 0) return;
  // Few big waves — dense tiny waves + thick stroke read as a straight bar.
  const waves = Math.max(2, Math.min(4, Math.round(width / 42)));
  const amp = Math.max(strokeWidth * 2.4, width * 0.16, 14);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < waves; i++) {
    const seg = width / waves;
    const x1 = x + seg * i;
    const x2 = x + seg * (i + 1);
    const mid = (x1 + x2) / 2;
    const dir = i % 2 === 0 ? -1 : 1;
    // Single deep hump per segment so the wiggle stays readable at export size.
    ctx.quadraticCurveTo(mid, y + dir * amp, x2, y + dir * amp * 0.08);
  }
  ctx.stroke();
  ctx.restore();
}
