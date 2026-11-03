// Dev-only renderer for image template 25. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE25_CTA_TAB,
  IMAGE_TEMPLATE25_SLIDE_COUNT,
  paintTemplate25Slide,
} from '../app/lib/image-template-25-flat-serif';
import { pickTemplate25QuestionBodies } from '../app/lib/image-template-25-questions';

const W = 1080;
const H = 1440;
const FONT = '"Liberation Serif", "Times New Roman", Times, serif';

GlobalFonts.registerFromPath(
  'public/fonts/liberation-serif/LiberationSerif-Regular.ttf',
  'Liberation Serif'
);
GlobalFonts.registerFromPath(
  'public/fonts/liberation-serif/LiberationSerif-Bold.ttf',
  'Liberation Serif'
);
GlobalFonts.registerFromPath('public/fonts/poppins/Poppins-SemiBold.ttf', 'Poppins');

const COVER = 'ask your partner these questions to laugh together while increasing intimacy';

function paint(options) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  paintTemplate25Slide(ctx, W, H, {
    slideCount: IMAGE_TEMPLATE25_SLIDE_COUNT,
    fontFamily: FONT,
    promo: null,
    ...options,
  });
  return { canvas, ctx };
}

function hex(n) {
  return n.toString(16).padStart(2, '0');
}

function analyze(ctx, label) {
  const data = ctx.getImageData(0, 0, W, H).data;
  const bg = [data[0], data[1], data[2]];
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  const sample = (x0, y0, w, h) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        const o = (y * W + x) * 4;
        const d =
          Math.abs(data[o] - bg[0]) + Math.abs(data[o + 1] - bg[1]) + Math.abs(data[o + 2] - bg[2]);
        sum += d;
        sumSq += d * d;
        n++;
      }
    }
  };
  sample(0, 0, 24, 24);
  sample(W - 24, 0, 24, 24);
  sample(0, 40, 16, H - 80);
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));

  let minY = H;
  let maxY = 0;
  let minX = W;
  let maxX = 0;
  const rows = [];
  for (let y = 0; y < H; y++) {
    let hit = false;
    for (let x = 0; x < W; x += 1) {
      const o = (y * W + x) * 4;
      const d =
        Math.abs(data[o] - bg[0]) + Math.abs(data[o + 1] - bg[1]) + Math.abs(data[o + 2] - bg[2]);
      if (d > 40) {
        hit = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    if (hit) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      rows.push(y);
    }
  }
  const bands = [];
  if (rows.length) {
    let start = rows[0];
    let prev = rows[0];
    for (const y of rows.slice(1)) {
      if (y - prev > 10) {
        bands.push([start, prev]);
        start = y;
      }
      prev = y;
    }
    bands.push([start, prev]);
  }
  console.log(
    label,
    `bg #${hex(bg[0])}${hex(bg[1])}${hex(bg[2])}`,
    `std ${std.toFixed(3)}`,
    `ink y ${rows.length ? (minY / H).toFixed(3) : '-'}–${rows.length ? (maxY / H).toFixed(3) : '-'}`,
    `x ${rows.length ? (minX / W).toFixed(3) : '-'}–${rows.length ? (maxX / W).toFixed(3) : '-'}`,
    'bands',
    bands.map(([a, b]) => `${(a / H).toFixed(3)}-${(b / H).toFixed(3)}`).join(', ')
  );
}

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const probe = createCanvas(W, H).getContext('2d');
  probe.font = `700 ${W * 0.069}px "Liberation Serif"`;
  const bold = probe.measureText('Hygpq');
  probe.font = `400 ${W * 0.052}px "Liberation Serif"`;
  const regular = probe.measureText('Hygpq');
  probe.font = `600 ${W * 0.038}px "Poppins"`;
  const footer = probe.measureText('Spill It - Couples Questions');
  console.log('bold ink/em', ((bold.actualBoundingBoxAscent + bold.actualBoundingBoxDescent) / (W * 0.069)).toFixed(3));
  console.log('regular ink/em', ((regular.actualBoundingBoxAscent + regular.actualBoundingBoxDescent) / (W * 0.052)).toFixed(3));
  console.log('footer width ratio', (footer.width / W).toFixed(3));

  const outDir = 'docs/image-template-25';
  mkdirSync(outDir, { recursive: true });

  const questions = pickTemplate25QuestionBodies(5);
  const slides = [COVER, ...questions, ''];
  const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5', 'cta'];
  for (let i = 0; i < IMAGE_TEMPLATE25_SLIDE_COUNT; i++) {
    const { canvas, ctx } = paint({
      text: slides[i] ?? '',
      tabIndex: i,
      isCover: i === 0,
      isCta: i === IMAGE_TEMPLATE25_CTA_TAB,
      promo: i === IMAGE_TEMPLATE25_CTA_TAB ? promo : null,
    });
    analyze(ctx, names[i]);
    const png = canvas.toBuffer('image/png');
    writeFileSync(`${outDir}/${names[i]}.png`, png);
    if (i === 0) writeFileSync('public/image-templates/template-25-cover.png', png);
    console.log(' ', (slides[i] || '(cta)').slice(0, 90));
  }

  const optionText =
    'What would you rather I do?\n\na. Roast you\nb. Bring up your past\nc. Fake a breakup\nd. Ignore you';
  const optionSlide = paint({
    text: optionText,
    tabIndex: 1,
    isCover: false,
    isCta: false,
  });
  analyze(optionSlide.ctx, 'options');
  writeFileSync(`${outDir}/question-with-options.png`, optionSlide.canvas.toBuffer('image/png'));

  const two = paint({
    text: 'What would I most likely be fired for?',
    tabIndex: 2,
    isCover: false,
    isCta: false,
  });
  analyze(two.ctx, 'ref-2-line');
  const three = paint({
    text: 'What intimated you most about me at the beginning of our relationship?',
    tabIndex: 3,
    isCover: false,
    isCta: false,
  });
  analyze(three.ctx, 'ref-3-line');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
