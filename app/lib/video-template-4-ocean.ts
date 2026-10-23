import {
  BRAVE_QUESTIONS,
  FLIRTY_QUESTIONS,
  FUNNY_QUESTIONS,
} from '@/app/lib/constants';

export const VIDEO_TEMPLATE4_PEXELS_QUERY = 'ocean sunset';
export const VIDEO_TEMPLATE4_LABELS = [
  'Questions for your boyfriend:',
] as const;
export type VideoTemplate4Label = (typeof VIDEO_TEMPLATE4_LABELS)[number];

const FONT = '"TikTok Sans", system-ui, -apple-system, sans-serif';
const OPTIONLESS_QUESTIONS = [
  ...FUNNY_QUESTIONS,
  ...FLIRTY_QUESTIONS,
  ...BRAVE_QUESTIONS,
];

function pickFrom<T extends string>(pool: readonly T[], exclude?: string): T {
  const filtered = exclude
    ? pool.filter((item) => item !== exclude)
    : [...pool];
  const list = filtered.length > 0 ? filtered : pool;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function pickVideoTemplate4Label(_exclude?: string): VideoTemplate4Label {
  return VIDEO_TEMPLATE4_LABELS[0];
}

export function pickVideoTemplate4Question(exclude?: string): string {
  return pickFrom(OPTIONLESS_QUESTIONS, exclude);
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
  lines.push(current);
  return lines;
}

export function paintVideoTemplate4Overlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  options: { label: string; question: string }
) {
  const sky = ctx.createLinearGradient(0, 0, 0, frameHeight);
  sky.addColorStop(0, 'rgba(255, 142, 64, 0.26)');
  sky.addColorStop(0.28, 'rgba(255, 112, 56, 0.14)');
  sky.addColorStop(0.55, 'rgba(210, 72, 58, 0.08)');
  sky.addColorStop(0.78, 'rgba(120, 32, 48, 0.14)');
  sky.addColorStop(1, 'rgba(68, 14, 36, 0.24)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const vignette = ctx.createRadialGradient(
    frameWidth / 2,
    frameHeight * 0.42,
    frameWidth * 0.18,
    frameWidth / 2,
    frameHeight * 0.5,
    frameWidth * 0.92
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.62, 'rgba(0, 0, 0, 0.08)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  const maxW = frameWidth * 0.78;
  const labelSize = Math.round(frameWidth * 0.048);
  const questionSize = Math.round(frameWidth * 0.034);
  const labelLineH = labelSize * 1.2;
  const questionLineH = questionSize * 1.22;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = Math.max(10, frameWidth * 0.028);
  ctx.shadowOffsetY = Math.max(1, frameWidth * 0.004);

  ctx.font = `800 ${labelSize}px ${FONT}`;
  const labelLines = wrapLines(ctx, options.label, maxW);
  ctx.font = `800 ${questionSize}px ${FONT}`;
  const questionLines = wrapLines(ctx, options.question, maxW);
  const blockH = labelLines.length * labelLineH + questionLineH * 0.35 + questionLines.length * questionLineH;
  let y = frameHeight * 0.38 - blockH / 2 + labelLineH / 2;

  ctx.font = `800 ${labelSize}px ${FONT}`;
  for (const line of labelLines) {
    ctx.fillText(line, frameWidth / 2, y);
    y += labelLineH;
  }
  y += questionLineH * 0.2;
  ctx.font = `800 ${questionSize}px ${FONT}`;
  for (const line of questionLines) {
    ctx.fillText(line, frameWidth / 2, y);
    y += questionLineH;
  }

  const markY = frameHeight * 0.78;
  const heartSize = Math.round(frameWidth * 0.036);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = Math.max(8, frameWidth * 0.02);
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = `400 ${heartSize}px ${FONT}`;
  ctx.fillText('♥ ♥ ♥', frameWidth / 2, markY - heartSize * 1.35);
  ctx.font = `700 ${Math.round(frameWidth * 0.03)}px ${FONT}`;
  ctx.textBaseline = 'bottom';
  ctx.fillText('Spill It', frameWidth / 2, markY);
}
