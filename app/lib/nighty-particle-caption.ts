import {
  NIGHTY_PARTICLE_CAPTION_FONT_WEIGHT,
  NIGHTY_PARTICLE_CAPTION_SIZE_RATIO,
  NIGHTY_PARTICLE_CONTENT_MAX_WIDTH_RATIO,
  NIGHTY_PARTICLE_DEFAULT_LINES,
  NIGHTY_PARTICLE_LINE2_COLOR,
  NIGHTY_PARTICLE_TIMING,
  type NightyParticleLines,
  type NightyParticleTiming,
} from '@/app/lib/constants';

export type NightyParticleCaptionContent = {
  lines: NightyParticleLines;
  timing: NightyParticleTiming;
  /** Accent (pink) color for secondary lines + CTA brand line. */
  accentColor?: string;
};

export const NIGHTY_PARTICLE_DEFAULT_CONTENT: NightyParticleCaptionContent = {
  lines: { ...NIGHTY_PARTICLE_DEFAULT_LINES },
  timing: { ...NIGHTY_PARTICLE_TIMING },
  accentColor: NIGHTY_PARTICLE_LINE2_COLOR,
};

export type NightyParticleLineOpacities = {
  line1: number;
  line2: number;
  line3: number;
  line4: number;
  line5: number;
  line6: number;
  line7: number;
  line8: number;
  line9: number;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** White + pink pair opacities for a phase that starts at `phaseStart`. */
function pairOpacities(
  t: number,
  phaseStart: number,
  holdSec: number,
  timing: NightyParticleTiming
): { white: number; pink: number } {
  const { fadeInSec, gapAfterWhiteSec, fadeOutSec } = timing;
  const local = t - phaseStart;
  if (local < 0) return { white: 0, pink: 0 };

  const whiteFadeInEnd = fadeInSec;
  const pinkFadeInStart = fadeInSec + gapAfterWhiteSec;
  const pinkFadeInEnd = pinkFadeInStart + fadeInSec;
  const fadeOutStart = pinkFadeInEnd + holdSec;
  const fadeOutEnd = fadeOutStart + fadeOutSec;

  let white = 0;
  if (local >= fadeOutEnd) white = 0;
  else if (local >= fadeOutStart) white = 1 - (local - fadeOutStart) / fadeOutSec;
  else if (local >= whiteFadeInEnd) white = 1;
  else white = local / fadeInSec;

  let pink = 0;
  if (local >= fadeOutEnd) pink = 0;
  else if (local >= fadeOutStart) pink = 1 - (local - fadeOutStart) / fadeOutSec;
  else if (local >= pinkFadeInEnd) pink = 1;
  else if (local >= pinkFadeInStart) pink = (local - pinkFadeInStart) / fadeInSec;

  return { white: clamp01(white), pink: clamp01(pink) };
}

/**
 * CTA: three lines fade in one after another, hold together, then fade out together.
 * Stagger uses the same gap as white → pink on earlier beats.
 */
function ctaOpacities(
  t: number,
  phaseStart: number,
  holdSec: number,
  timing: NightyParticleTiming
): { line7: number; line8: number; line9: number } {
  const { fadeInSec, gapAfterWhiteSec, fadeOutSec } = timing;
  const local = t - phaseStart;
  if (local < 0) return { line7: 0, line8: 0, line9: 0 };

  const line7End = fadeInSec;
  const line8Start = fadeInSec + gapAfterWhiteSec;
  const line8End = line8Start + fadeInSec;
  const line9Start = line8End + gapAfterWhiteSec;
  const line9End = line9Start + fadeInSec;
  const fadeOutStart = line9End + holdSec;
  const fadeOutEnd = fadeOutStart + fadeOutSec;

  const fadeOutFactor =
    local >= fadeOutEnd
      ? 0
      : local >= fadeOutStart
        ? 1 - (local - fadeOutStart) / fadeOutSec
        : 1;

  const lineIn = (start: number, end: number): number => {
    if (local < start) return 0;
    if (local >= end) return 1;
    return (local - start) / fadeInSec;
  };

  return {
    line7: clamp01(lineIn(0, line7End) * fadeOutFactor),
    line8: clamp01(lineIn(line8Start, line8End) * fadeOutFactor),
    line9: clamp01(lineIn(line9Start, line9End) * fadeOutFactor),
  };
}

function phaseDurationSec(holdSec: number, timing: NightyParticleTiming): number {
  return (
    timing.fadeInSec +
    timing.gapAfterWhiteSec +
    timing.fadeInSec +
    holdSec +
    timing.fadeOutSec
  );
}

/** Opacity for each caption line at video time `t` (seconds). */
export function nightyParticleLineOpacities(
  t: number,
  timing: NightyParticleTiming = NIGHTY_PARTICLE_TIMING
): NightyParticleLineOpacities {
  const {
    betweenPhasesSec,
    phase1HoldSec,
    phase2HoldSec,
    phase3HoldSec,
    phase4HoldSec,
  } = timing;

  const phase1 = pairOpacities(t, 0, phase1HoldSec, timing);
  const phase2Start = phaseDurationSec(phase1HoldSec, timing) + betweenPhasesSec;
  const phase2 = pairOpacities(t, phase2Start, phase2HoldSec, timing);
  const phase3Start =
    phase2Start + phaseDurationSec(phase2HoldSec, timing) + betweenPhasesSec;
  const phase3 = pairOpacities(t, phase3Start, phase3HoldSec, timing);
  const phase4Start =
    phase3Start + phaseDurationSec(phase3HoldSec, timing) + betweenPhasesSec;
  const cta = ctaOpacities(t, phase4Start, phase4HoldSec, timing);

  return {
    line1: phase1.white,
    line2: phase1.pink,
    line3: phase2.white,
    line4: phase2.pink,
    line5: phase3.white,
    line6: phase3.pink,
    line7: cta.line7,
    line8: cta.line8,
    line9: cta.line9,
  };
}

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
  if (current) lines.push(current);
  return lines;
}

function drawCenteredBlock(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  cx: number,
  startY: number,
  lineHeight: number,
  color: string,
  opacity: number
) {
  if (opacity <= 0.001 || lines.length === 0) return startY;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  let y = startY;
  for (const ln of lines) {
    ctx.fillText(ln, cx, y);
    y += lineHeight;
  }
  return y;
}

function drawCaptionPair(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  whiteText: string,
  pinkText: string,
  whiteOpacity: number,
  pinkOpacity: number,
  lineHeight: number,
  gap: number,
  maxWidth: number,
  accentColor: string
) {
  if (whiteOpacity <= 0.001 && pinkOpacity <= 0.001) return;

  const cx = frameWidth / 2;
  const lines1 = wrapLines(ctx, whiteText, maxWidth);
  const lines2 = wrapLines(ctx, pinkText, maxWidth);
  const block1H = lines1.length * lineHeight;
  const block2H = lines2.length * lineHeight;
  const totalH =
    (lines1.length ? block1H : 0) +
    (lines1.length && lines2.length ? gap : 0) +
    (lines2.length ? block2H : 0);

  const blockTop = frameHeight / 2 - totalH / 2;
  const line1StartY = blockTop + lineHeight / 2;
  const line2StartY =
    blockTop + (lines1.length ? block1H + gap : 0) + lineHeight / 2;

  drawCenteredBlock(ctx, lines1, cx, line1StartY, lineHeight, '#ffffff', whiteOpacity);
  drawCenteredBlock(
    ctx,
    lines2,
    cx,
    line2StartY,
    lineHeight,
    accentColor,
    pinkOpacity
  );
}

function drawCtaBlock(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  lines: NightyParticleLines,
  opacities: { line7: number; line8: number; line9: number },
  lineHeight: number,
  gap: number,
  maxWidth: number,
  accentColor: string
) {
  if (
    opacities.line7 <= 0.001 &&
    opacities.line8 <= 0.001 &&
    opacities.line9 <= 0.001
  ) {
    return;
  }

  const segments: { text: string; color: string; opacity: number }[] = [
    { text: lines.line7, color: '#ffffff', opacity: opacities.line7 },
    { text: lines.line8, color: accentColor, opacity: opacities.line8 },
    { text: lines.line9, color: '#ffffff', opacity: opacities.line9 },
  ];

  const wrapped = segments.map((s) => ({
    ...s,
    lines: wrapLines(ctx, s.text, maxWidth),
  }));
  const totalH =
    wrapped.reduce((sum, s) => sum + s.lines.length * lineHeight, 0) +
    gap * Math.max(0, wrapped.length - 1);

  let y = frameHeight / 2 - totalH / 2 + lineHeight / 2;
  const cx = frameWidth / 2;
  for (let i = 0; i < wrapped.length; i++) {
    const seg = wrapped[i]!;
    y = drawCenteredBlock(ctx, seg.lines, cx, y, lineHeight, seg.color, seg.opacity);
    if (i < wrapped.length - 1) y += gap;
  }
}

/** Draw animated Particle captions for the current video time. */
export function drawNightyParticleCaptionOverlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  timeSec: number,
  fontStack: string,
  content: NightyParticleCaptionContent = NIGHTY_PARTICLE_DEFAULT_CONTENT
) {
  const { lines, timing } = content;
  const accentColor = content.accentColor ?? NIGHTY_PARTICLE_LINE2_COLOR;
  const ops = nightyParticleLineOpacities(timeSec, timing);
  if (
    ops.line1 <= 0.001 &&
    ops.line2 <= 0.001 &&
    ops.line3 <= 0.001 &&
    ops.line4 <= 0.001 &&
    ops.line5 <= 0.001 &&
    ops.line6 <= 0.001 &&
    ops.line7 <= 0.001 &&
    ops.line8 <= 0.001 &&
    ops.line9 <= 0.001
  ) {
    return;
  }

  const fontSize = Math.max(
    16,
    Math.min(48, Math.floor(frameWidth * NIGHTY_PARTICLE_CAPTION_SIZE_RATIO))
  );
  const maxWidth = frameWidth * NIGHTY_PARTICLE_CONTENT_MAX_WIDTH_RATIO;
  const lineHeight = fontSize * 1.22;
  const gap = fontSize * 0.55;

  ctx.save();
  ctx.font = `${NIGHTY_PARTICLE_CAPTION_FONT_WEIGHT} ${fontSize}px ${fontStack}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const pairs: [string, string, number, number][] = [
    [lines.line1, lines.line2, ops.line1, ops.line2],
    [lines.line3, lines.line4, ops.line3, ops.line4],
    [lines.line5, lines.line6, ops.line5, ops.line6],
  ];

  for (const [white, pink, oWhite, oPink] of pairs) {
    drawCaptionPair(
      ctx,
      frameWidth,
      frameHeight,
      white,
      pink,
      oWhite,
      oPink,
      lineHeight,
      gap,
      maxWidth,
      accentColor
    );
  }

  drawCtaBlock(
    ctx,
    frameWidth,
    frameHeight,
    lines,
    { line7: ops.line7, line8: ops.line8, line9: ops.line9 },
    lineHeight,
    gap,
    maxWidth,
    accentColor
  );

  ctx.restore();
}
