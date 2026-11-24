import type { CopycatPost } from '@/app/lib/copycat/flamingo-cards';
import {
  COUPLES_NATURE_EXPORT_FPS,
  COUPLES_NATURE_EXPORT_HEIGHT,
  COUPLES_NATURE_EXPORT_WIDTH,
  captureCouplesNaturePlaybackFrames,
  computeCoverCrop,
  drawCouplesNatureBackground,
  loadVideoElementFromBlob,
} from '@/app/lib/couples-nature/background';
import { getCouplesNatureVideoBlob } from '@/app/lib/couples-nature/video-cache';
import type { CouplesNatureExportProgress } from '@/app/lib/couples-nature/types';
import { encodeJpegSequenceToMp4 } from '@/app/lib/webm-to-mp4';

export const VIDEO_TEMPLATE10_DURATION_SEC = 8;

/** High-contrast cool grade for the question-card background. The card is painted after this, so it stays unfiltered. */
export const VIDEO_TEMPLATE10_BACKGROUND_FILTER =
  'contrast(1.7) brightness(0.86) saturate(0.72) hue-rotate(18deg)';
export const VIDEO_TEMPLATE10_WIDTH = 1080;
export const VIDEO_TEMPLATE10_HEIGHT = 1920;

export const VIDEO_TEMPLATE10_PEXELS_QUERIES = [
  'walking through stone arch',
  'european city street walking',
  'paris street people walking',
  'old town cobblestone walk',
  'city architecture walking',
  'museum hallway walking',
] as const;

export const VIDEO_TEMPLATE10_SONGS = [
  { id: 'evergreen', label: 'Evergreen', src: '/video-templates/card-songs/evergreen.mp3' },
  { id: 'let-go', label: 'Let Go', src: '/video-templates/card-songs/let-go.mp3' },
  { id: 'little-things', label: 'Little Things', src: '/video-templates/card-songs/little-things.mp3' },
] as const;

export type VideoTemplate10SongId = (typeof VIDEO_TEMPLATE10_SONGS)[number]['id'];

const CARD_YELLOW = '#FED66E';
const CARD_BORDER = '#111111';
const LOGO_SRC = '/spill-logo.png';

const CARD_FONT =
  'var(--font-libre-baskerville), "Libre Baskerville", Georgia, serif';
const SANS = '"TikTok Sans", system-ui, sans-serif';

export function pickVideoTemplate10Song(exclude?: string) {
  const pool = VIDEO_TEMPLATE10_SONGS.filter((song) => song.id !== exclude);
  const choices = pool.length > 0 ? pool : VIDEO_TEMPLATE10_SONGS;
  return choices[Math.floor(Math.random() * choices.length)] ?? VIDEO_TEMPLATE10_SONGS[0];
}

export function videoTemplate10SongById(id: string) {
  return VIDEO_TEMPLATE10_SONGS.find((song) => song.id === id) ?? VIDEO_TEMPLATE10_SONGS[0];
}

export async function pickCopycatCardQuestion(exclude?: string): Promise<string> {
  const loaders = [
    () => import('@/app/lib/copycat/questions-21').then((mod) => mod.getQuestions21Posts()),
    () => import('@/app/lib/copycat/flamingo-convo').then((mod) => mod.getFlamingoConvoPosts()),
    () => import('@/app/lib/copycat/hhtalk').then((mod) => mod.getHhTalkPosts()),
    () => import('@/app/lib/copycat/hook-posts').then((mod) => mod.getHookPosts()),
    () => import('@/app/lib/copycat/trydeepen').then((mod) => mod.getTryDeepenPosts()),
  ];
  const groups = await Promise.all(loaders.map((load) => load()));
  const questions: string[] = [];
  for (const posts of groups) {
    for (const post of posts as CopycatPost[]) {
      for (const slide of post.slideText) {
        const text = slide.text.trim();
        if (text) questions.push(text);
      }
    }
  }
  if (questions.length === 0) return exclude?.trim() || 'Which of my weird habits have you secretly started copying?';
  let next = questions[Math.floor(Math.random() * questions.length)] ?? questions[0]!;
  if (exclude && questions.length > 1 && next === exclude) {
    next = questions.find((question) => question !== exclude) ?? next;
  }
  return next;
}

function traceRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0]!;
  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: CanvasImageSource | null,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  traceRoundRect(ctx, x, y, size, size, size * 0.22);
  ctx.clip();
  ctx.fillStyle = '#6D28D9';
  ctx.fillRect(x, y, size, size);
  if (logo) ctx.drawImage(logo, x, y, size, size);
  ctx.restore();
}

export function paintVideoTemplate10Overlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    text: string;
    logo?: CanvasImageSource | null;
    fontFamily?: string;
  }
) {
  ctx.clearRect(0, 0, width, height);
  const fontFamily = options.fontFamily || CARD_FONT;
  paintCard(ctx, width, height, options.text, options.logo ?? null, fontFamily);
}

function paintCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  logo: CanvasImageSource | null,
  fontFamily: string
) {
  const cardW = width * 0.78;
  const cardH = height * 0.5;
  const x = (width - cardW) / 2;
  const y = height * 0.22;
  const radius = width * 0.055;
  const border = Math.max(10, width * 0.012);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = width * 0.03;
  ctx.shadowOffsetY = width * 0.012;
  traceRoundRect(ctx, x, y, cardW, cardH, radius);
  ctx.fillStyle = CARD_BORDER;
  ctx.fill();
  ctx.restore();

  ctx.save();
  traceRoundRect(ctx, x + border, y + border, cardW - border * 2, cardH - border * 2, radius * 0.86);
  ctx.clip();
  ctx.fillStyle = CARD_YELLOW;
  ctx.fillRect(x, y, cardW, cardH);

  const barH = cardH * 0.105;
  const barY = y + cardH - border - barH;
  ctx.fillStyle = '#0E0E0E';
  ctx.fillRect(x + border, barY, cardW - border * 2, barH + border);

  const maxWidth = cardW * 0.78;
  let fontSize = Math.round(width * 0.048);
  const minSize = Math.round(width * 0.03);
  const textBottom = barY - cardH * 0.04;
  const textTop = y + border + cardH * 0.06;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1A1A1A';
  let lines: string[] = [];
  let lineH = fontSize * 1.28;
  while (fontSize >= minSize) {
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    lines = wrapLines(ctx, text, maxWidth);
    lineH = fontSize * 1.28;
    if (lines.length * lineH <= textBottom - textTop) break;
    fontSize -= 1;
  }
  let textY = (textTop + textBottom) / 2 - (lines.length * lineH) / 2 + lineH / 2;
  for (const line of lines) {
    ctx.fillText(line, width / 2, textY);
    textY += lineH;
  }

  const icon = barH * 0.62;
  const labelSize = Math.round(barH * 0.34);
  ctx.font = `700 ${labelSize}px ${SANS}`;
  const label = 'Spill It';
  const labelW = ctx.measureText(label).width;
  const groupW = icon + barH * 0.1 + labelW;
  const groupX = width / 2 - groupW / 2;
  const iconY = barY + (barH - icon) / 2;
  drawLogo(ctx, logo, groupX, iconY, icon);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, groupX + icon + barH * 0.1, barY + barH / 2);
  ctx.restore();
}

let logoPromise: Promise<HTMLImageElement | null> | null = null;

export function loadVideoTemplate10Logo(): Promise<HTMLImageElement | null> {
  if (!logoPromise) {
    logoPromise = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = LOGO_SRC;
    });
  }
  return logoPromise;
}

export async function exportCardOnVideo(options: {
  videoSrc: string;
  question: string;
  audioSrc: string;
  onProgress?: CouplesNatureExportProgress;
}): Promise<Blob> {
  const sourceBlob = await getCouplesNatureVideoBlob(options.videoSrc);
  const [logo, audioBlob, fontFamily] = await Promise.all([
    loadVideoTemplate10Logo(),
    fetch(options.audioSrc).then((response) => {
      if (!response.ok) throw new Error('Failed to load the song');
      return response.blob();
    }),
    resolveCardFont(),
  ]);
  const { video, objectUrl } = await loadVideoElementFromBlob(sourceBlob);
  try {
    const width = COUPLES_NATURE_EXPORT_WIDTH;
    const height = COUPLES_NATURE_EXPORT_HEIGHT;
    const fps = COUPLES_NATURE_EXPORT_FPS;
    const durationSec = Math.min(VIDEO_TEMPLATE10_DURATION_SEC, video.duration || VIDEO_TEMPLATE10_DURATION_SEC);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    const overlay = document.createElement('canvas');
    overlay.width = width;
    overlay.height = height;
    const overlayCtx = overlay.getContext('2d');
    if (!ctx || !overlayCtx) throw new Error('Canvas not available');
    const crop = computeCoverCrop(video.videoWidth, video.videoHeight, width, height);
    const paintFrame = () => {
      drawCouplesNatureBackground(ctx, video, crop, width, height, VIDEO_TEMPLATE10_BACKGROUND_FILTER);
      paintVideoTemplate10Overlay(overlayCtx, width, height, {
        text: options.question,
        logo,
        fontFamily,
      });
      ctx.drawImage(overlay, 0, 0);
    };
    options.onProgress?.('frames', 0, Math.ceil(durationSec * fps));
    const frames = await captureCouplesNaturePlaybackFrames(
      video,
      paintFrame,
      canvas,
      fps,
      durationSec,
      (captured, total) => options.onProgress?.('frames', captured, total)
    );
    options.onProgress?.('encode', 0, 1);
    const mp4 = await encodeJpegSequenceToMp4(frames, fps, audioBlob);
    options.onProgress?.('encode', 1, 1);
    return mp4;
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

async function resolveCardFont(): Promise<string> {
  const probe = document.createElement('span');
  probe.style.fontFamily = CARD_FONT;
  probe.style.position = 'absolute';
  probe.style.left = '-9999px';
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || CARD_FONT;
  probe.remove();
  try {
    await document.fonts.load(`400 64px ${family}`);
    await document.fonts.load('700 48px "TikTok Sans"');
  } catch {
    /* fonts may already be ready */
  }
  return family;
}
