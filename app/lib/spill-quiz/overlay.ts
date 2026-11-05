import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { TIKTOK_SANS_FAMILY } from '@/app/lib/video-template-2/overlay-metrics';
import { SPILL_QUIZ_FOOTER_LINES, type SpillQuizLineRole } from '@/app/lib/spill-quiz/script';

export const SPILL_QUIZ_FRAME_WIDTH = 1080;
export const SPILL_QUIZ_FRAME_HEIGHT = 1920;

let fontRegistered = false;

function ensureTikTokSansFont(): void {
  if (fontRegistered) return;
  fontRegistered = true;
  const fontPath = path.join(process.cwd(), 'public/fonts/tiktok-sans/TikTokSans-700.ttf');
  if (fs.existsSync(fontPath)) {
    GlobalFonts.registerFromPath(fontPath, TIKTOK_SANS_FAMILY);
  }
}

function fontStack(): string {
  return `"${TIKTOK_SANS_FAMILY}", system-ui, sans-serif`;
}

type CanvasCtx = ReturnType<ReturnType<typeof createCanvas>['getContext']>;

function wrapTextLines(ctx: CanvasCtx, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) line = next;
    else {
      lines.push(line);
      line = words[i]!;
    }
  }
  lines.push(line);
  return lines;
}

function fitLines(
  ctx: CanvasCtx,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number
): { fontSize: number; lines: string[] } {
  let fontSize = startSize;
  let lines: string[] = [];
  while (fontSize >= minSize) {
    ctx.font = `700 ${fontSize}px ${fontStack()}`;
    lines = wrapTextLines(ctx, text, maxWidth);
    const longest = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
    if (longest <= maxWidth && lines.length <= 8) return { fontSize, lines };
    fontSize -= 2;
  }
  ctx.font = `700 ${minSize}px ${fontStack()}`;
  return { fontSize: minSize, lines: wrapTextLines(ctx, text, maxWidth) };
}

function fillCenteredText(
  ctx: CanvasCtx,
  lines: string[],
  cx: number,
  startY: number,
  fontSize: number,
  fill: string
): void {
  const lineHeight = fontSize * 1.18;
  ctx.font = `700 ${fontSize}px ${fontStack()}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = Math.max(8, fontSize * 0.12);
  ctx.shadowOffsetY = Math.max(2, fontSize * 0.04);
  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function paintFrame(
  ctx: CanvasCtx,
  width: number,
  height: number,
  text: string,
  role: SpillQuizLineRole,
  options: { dim: boolean; gradient: string | null }
): void {
  ctx.clearRect(0, 0, width, height);
  if (options.gradient) {
    const gradient = ctx.createLinearGradient(0, 0, width * 0.2, height);
    gradient.addColorStop(0, options.gradient === 'pink' ? '#3a1024' : '#1a1408');
    gradient.addColorStop(1, options.gradient === 'pink' ? '#140810' : '#0c0c10');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (options.dim) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.fillRect(0, 0, width, height);
  }

  const maxWidth = width * 0.84;
  const startSize =
    role === 'question' ? Math.round(height * 0.046) : Math.round(height * 0.052);
  const { fontSize, lines } = fitLines(ctx, text, maxWidth, startSize, Math.round(height * 0.028));
  const lineHeight = fontSize * 1.18;
  const blockHeight = lines.length * lineHeight;
  const footerSize = Math.max(28, Math.round(height * 0.022));
  const footerBlock = footerSize * 1.15 * SPILL_QUIZ_FOOTER_LINES.length;
  const centerTop = height * 0.42 - blockHeight / 2;
  fillCenteredText(ctx, lines, width / 2, centerTop + lineHeight / 2, fontSize, '#ffffff');

  const footerStart = height - footerBlock - height * 0.06;
  SPILL_QUIZ_FOOTER_LINES.forEach((footer, index) => {
    ctx.font = `700 ${footerSize}px ${fontStack()}`;
    const footerLines = wrapTextLines(ctx, footer, maxWidth);
    fillCenteredText(
      ctx,
      footerLines,
      width / 2,
      footerStart + index * footerSize * 1.2 + footerSize / 2,
      footerSize,
      'rgba(255,255,255,0.92)'
    );
  });
}

export function renderSpillQuizOverlayPng(
  text: string,
  role: SpillQuizLineRole,
  width = SPILL_QUIZ_FRAME_WIDTH,
  height = SPILL_QUIZ_FRAME_HEIGHT
): Buffer {
  ensureTikTokSansFont();
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  paintFrame(ctx, width, height, text, role, { dim: true, gradient: null });
  return canvas.toBuffer('image/png');
}

export function renderSpillQuizCoverPng(templateId: 8 | 9): Buffer {
  ensureTikTokSansFont();
  const width = 1080;
  const height = 1440;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const text =
    templateId === 8 ? 'How well do you know your girlfriend?' : 'Quiz your boyfriend';
  paintFrame(ctx, width, height, text, 'hook', {
    dim: false,
    gradient: templateId === 8 ? 'pink' : 'gold',
  });
  return canvas.toBuffer('image/png');
}
