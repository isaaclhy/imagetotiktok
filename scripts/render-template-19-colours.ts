// Dev-only contact sheet for template 19 colour presets.
// napi-canvas is not the DOM CanvasRenderingContext2D.
// @ts-nocheck
import { mkdirSync } from 'fs';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import {
  IMAGE_TEMPLATE19_COLORS,
  paintTemplate19Slide,
} from '../app/lib/image-template-19-glow';

const W = 1080;
const H = 1440;
const COLS = 4;
const ROWS = 2;
const CELL_W = 540;
const CELL_H = 720;
const LABEL_H = 56;
const SHEET_W = COLS * CELL_W;
const SHEET_H = ROWS * (CELL_H + LABEL_H);

GlobalFonts.registerFromPath(
  'public/fonts/liberation-serif/LiberationSerif-Regular.ttf',
  'Liberation Serif'
);
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-600.ttf', 'TikTok Sans');

const COVER = '5 questions you should ask him';
const LABELS = {
  red: 'Red',
  'royal-blue': 'Royal blue',
  emerald: 'Emerald green',
  purple: 'Purple',
  orange: 'Orange',
  'hot-pink': 'Hot pink',
  teal: 'Teal',
  gold: 'Gold/amber',
};

function renderCover(color) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  paintTemplate19Slide(ctx, W, H, {
    text: COVER,
    fontFamily: '"Liberation Serif", Times, serif',
    labelFontFamily: '"TikTok Sans", sans-serif',
    isCover: true,
    color,
  });
  return canvas;
}

mkdirSync('docs/image-template-19', { recursive: true });

const sheet = createCanvas(SHEET_W, SHEET_H);
const sheetCtx = sheet.getContext('2d');
sheetCtx.fillStyle = '#111111';
sheetCtx.fillRect(0, 0, SHEET_W, SHEET_H);

IMAGE_TEMPLATE19_COLORS.forEach((color, index) => {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = col * CELL_W;
  const y = row * (CELL_H + LABEL_H);
  const slide = renderCover(color);
  sheetCtx.drawImage(slide, x, y, CELL_W, CELL_H);
  sheetCtx.fillStyle = '#111111';
  sheetCtx.fillRect(x, y + CELL_H, CELL_W, LABEL_H);
  sheetCtx.fillStyle = '#f4f4f4';
  sheetCtx.font = '600 28px "TikTok Sans", sans-serif';
  sheetCtx.textAlign = 'center';
  sheetCtx.textBaseline = 'middle';
  sheetCtx.fillText(LABELS[color], x + CELL_W / 2, y + CELL_H + LABEL_H / 2);
  const center = slide.getContext('2d').getImageData(W / 2, H / 2, 1, 1).data;
  console.log(color, [center[0], center[1], center[2]]);
});

const png = sheet.toBuffer('image/png');
const out = 'docs/image-template-19/colours.png';
require('fs').writeFileSync(out, png);
console.log('wrote', out, png.length);
