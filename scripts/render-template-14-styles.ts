// Dev-only renderer for image template 14 cover sizes and card styles.
// napi-canvas is not the DOM canvas the painter was written for.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE14_COLORS,
  IMAGE_TEMPLATE14_GRAIN_SRC,
  IMAGE_TEMPLATE14_STYLE_OPTIONS,
  paintTemplate14Slide,
  template14CoverSizeRatio,
  template14Paint,
  template14TextForStyle,
} from '../app/lib/image-template-14-cards';

const W = 1080;
const H = 1440;

GlobalFonts.registerFromPath(
  'public/fonts/libre-baskerville/LibreBaskerville-400.ttf',
  'Libre Baskerville'
);
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-700.ttf', 'TikTok Sans');

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    scale(sx, sy = sx) {
      this.a *= sx;
      this.d *= sy;
      return this;
    }
  };
}

globalThis.document = {
  createElement(tag) {
    if (tag !== 'canvas') throw new Error(`Unexpected element ${tag}`);
    return createCanvas(1, 1);
  },
};

const SHORT = 'Boyfriend test';
const MEDIUM = '5 questions to ask your boyfriend tonight';
const LONG =
  '5 Questions Every Boyfriend Must Answer Tonight If He Loves You';
const QUESTION =
  'Would you still date me if Im ugly but loyal or the prettiest girl in the world but a cheater?';

function renderSlide(options) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  paintTemplate14Slide(ctx, W, H, options);
  return canvas;
}

async function main() {
  const grain = await loadImage(`public${IMAGE_TEMPLATE14_GRAIN_SRC}`);
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const outDir = 'docs/image-template-14';
  mkdirSync(outDir, { recursive: true });

  console.log('cover ratios', {
    short: template14CoverSizeRatio(SHORT),
    medium: template14CoverSizeRatio(MEDIUM),
    long: template14CoverSizeRatio(LONG),
  });

  for (const color of IMAGE_TEMPLATE14_COLORS) {
    for (const option of IMAGE_TEMPLATE14_STYLE_OPTIONS) {
      const paint = template14Paint(color, option.id);
      const samples = paint.type === 'solid' ? [paint.color] : paint.stops.map((stop) => stop.color);
      console.log(
        option.id,
        color,
        template14TextForStyle(color, option.id),
        samples.join(' ')
      );
    }
  }

  const colorFor = {
    grain: '#B97BCE',
    solid: '#E3943A',
    wash: '#6FA3C4',
    glow: '#D13B61',
    dusk: '#D4A24A',
    duo: '#C45C8A',
  };

  const slides = [];
  for (const option of IMAGE_TEMPLATE14_STYLE_OPTIONS) {
    const color = colorFor[option.id];
    const cover = renderSlide({
      backgroundColor: color,
      style: option.id,
      text: MEDIUM,
      tabIndex: 0,
      grain,
      promo: null,
    });
    const question = renderSlide({
      backgroundColor: color,
      style: option.id,
      text: QUESTION,
      tabIndex: 1,
      grain,
      promo,
    });
    writeFileSync(`${outDir}/${option.id}-cover.png`, cover.toBuffer('image/png'));
    writeFileSync(`${outDir}/${option.id}-question.png`, question.toBuffer('image/png'));
    slides.push({ label: option.label, cover, question });
    console.log('wrote', option.id);
  }

  const shortCover = renderSlide({
    backgroundColor: '#B97BCE',
    style: 'grain',
    text: SHORT,
    tabIndex: 0,
    grain,
    promo: null,
  });
  const longCover = renderSlide({
    backgroundColor: '#B97BCE',
    style: 'grain',
    text: LONG,
    tabIndex: 0,
    grain,
    promo: null,
  });
  writeFileSync(`${outDir}/cover-short.png`, shortCover.toBuffer('image/png'));
  writeFileSync(`${outDir}/cover-long.png`, longCover.toBuffer('image/png'));

  const cellW = 360;
  const cellH = 480;
  const labelH = 36;
  const cols = IMAGE_TEMPLATE14_STYLE_OPTIONS.length;
  const sheet = createCanvas(cols * cellW, cellH * 2 + labelH * 2);
  const sheetCtx = sheet.getContext('2d');
  sheetCtx.fillStyle = '#111111';
  sheetCtx.fillRect(0, 0, sheet.width, sheet.height);
  slides.forEach((slide, index) => {
    const x = index * cellW;
    sheetCtx.drawImage(slide.cover, x, 0, cellW, cellH);
    sheetCtx.fillStyle = '#111111';
    sheetCtx.fillRect(x, cellH, cellW, labelH);
    sheetCtx.fillStyle = '#f4f4f4';
    sheetCtx.font = '600 22px "TikTok Sans", sans-serif';
    sheetCtx.textAlign = 'center';
    sheetCtx.textBaseline = 'middle';
    sheetCtx.fillText(slide.label, x + cellW / 2, cellH + labelH / 2);
    sheetCtx.drawImage(slide.question, x, cellH + labelH, cellW, cellH);
    sheetCtx.fillStyle = '#111111';
    sheetCtx.fillRect(x, cellH * 2 + labelH, cellW, labelH);
    sheetCtx.fillStyle = '#f4f4f4';
    sheetCtx.fillText(`${slide.label} · question`, x + cellW / 2, cellH * 2 + labelH + labelH / 2);
  });
  writeFileSync(`${outDir}/styles.png`, sheet.toBuffer('image/png'));

  const titles = createCanvas(cellW * 3, cellH + labelH);
  const titlesCtx = titles.getContext('2d');
  titlesCtx.fillStyle = '#111111';
  titlesCtx.fillRect(0, 0, titles.width, titles.height);
  [shortCover, renderSlide({
    backgroundColor: '#B97BCE',
    style: 'grain',
    text: MEDIUM,
    tabIndex: 0,
    grain,
    promo: null,
  }), longCover].forEach((canvas, index) => {
    const x = index * cellW;
    titlesCtx.drawImage(canvas, x, 0, cellW, cellH);
    titlesCtx.fillStyle = '#111111';
    titlesCtx.fillRect(x, cellH, cellW, labelH);
    titlesCtx.fillStyle = '#f4f4f4';
    titlesCtx.font = '600 22px "TikTok Sans", sans-serif';
    titlesCtx.textAlign = 'center';
    titlesCtx.textBaseline = 'middle';
    titlesCtx.fillText(['Short title', 'Medium title', 'Long title'][index], x + cellW / 2, cellH + labelH / 2);
  });
  writeFileSync(`${outDir}/cover-titles.png`, titles.toBuffer('image/png'));
  console.log('wrote sheets');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
