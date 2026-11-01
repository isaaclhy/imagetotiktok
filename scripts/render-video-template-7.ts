// Dev-only stills for video template 7. napi-canvas is not the DOM canvas.
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import bank from '../app/lib/video-template-7-love-letter.json';
import { paintVideoTemplate7Overlay } from '../app/lib/video-template-7-love-letter';

const W = 1080;
const H = 1920;

GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-400.ttf', 'TikTok Sans');

type DrawCtx = CanvasRenderingContext2D;

function asCanvas(ctx: unknown): DrawCtx {
  return ctx as DrawCtx;
}

function paintBackground(ctx: DrawCtx, kind: 'quote' | 'short' | 'long') {
  if (kind === 'quote') {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#3a2a22');
    sky.addColorStop(0.45, '#6a4a38');
    sky.addColorStop(1, '#241812');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    const rowH = 46;
    for (let y = 0; y < H; y += rowH) {
      const offset = (y / rowH) % 2 === 0 ? 0 : 28;
      for (let x = -40; x < W; x += 86) {
        ctx.fillStyle = y % (rowH * 2) === 0 ? 'rgba(40, 24, 16, 0.35)' : 'rgba(20, 12, 8, 0.28)';
        ctx.fillRect(x + offset, y + 4, 78, rowH - 10);
      }
    }
    return;
  }

  const room = ctx.createLinearGradient(0, 0, 0, H);
  if (kind === 'short') {
    room.addColorStop(0, '#1a1618');
    room.addColorStop(0.42, '#3a2c28');
    room.addColorStop(1, '#120e10');
  } else {
    room.addColorStop(0, '#121014');
    room.addColorStop(0.5, '#2a2428');
    room.addColorStop(1, '#0c0a0c');
  }
  ctx.fillStyle = room;
  ctx.fillRect(0, 0, W, H);
  const lamp = ctx.createRadialGradient(W * 0.5, H * 0.42, 40, W * 0.5, H * 0.46, H * 0.55);
  lamp.addColorStop(0, 'rgba(120, 78, 48, 0.35)');
  lamp.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);
}

function render(
  text: string,
  source: 'quote' | 'letter',
  kind: 'quote' | 'short' | 'long',
  outPath: string
) {
  const canvas = createCanvas(W, H);
  const ctx = asCanvas(canvas.getContext('2d'));
  paintBackground(ctx, kind);
  paintVideoTemplate7Overlay(ctx, W, H, { text, source });
  writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log(outPath);
}

const quote = bank.quotes.find((entry) => entry.startsWith('i love you\nbut touch my fries'));
const short = bank.letters.find((entry) => entry.startsWith('to my girl who works so hard'));
const long = bank.letters.find((entry) =>
  entry.startsWith('i want you to hear this on a day when we are not perfect')
);

if (!quote || !short || !long) {
  throw new Error('Template 7 sample text is missing from the bank');
}

const outDir = 'docs/video-template-7';
mkdirSync(outDir, { recursive: true });
render(quote, 'quote', 'quote', `${outDir}/short-quote.png`);
render(short, 'letter', 'short', `${outDir}/short-letter.png`);
render(long, 'letter', 'long', `${outDir}/long-letter.png`);
