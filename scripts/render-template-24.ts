// Dev-only renderer for image template 24. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE24_DEFAULT_QUESTION_COUNT,
  paintTemplate24Slide,
  template24SlideCount,
} from '../app/lib/image-template-24-penguin';
import { pickTemplate24QuestionBodies } from '../app/lib/image-template-24-questions';

const W = 1080;
const H = 1440;
const FONT = '"Plus Jakarta Sans", sans-serif';

GlobalFonts.registerFromPath(
  'app/fonts/plus-jakarta-sans/plus-jakarta-sans-latin-800.woff2',
  'Plus Jakarta Sans'
);
GlobalFonts.registerFromPath('public/fonts/poppins/Poppins-SemiBold.ttf', 'Poppins');

const LOOK = {
  background: '#E9F1EC',
  cardColors: ['#FF7BAC', '#7AE0C3', '#B79CFF', '#FF9F52', '#7FBFFF'],
  rotations: [-1.6, 1.4, -0.9, 1.8, -1.2],
  highlightColor: '#FFD93D',
  highlightWord: 'unhinged',
};

const COVER = '5 unhinged questions to ask your boyfriend tonight';

async function renderSlide(options) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  paintTemplate24Slide(ctx, W, H, {
    ...options,
    slideCount: template24SlideCount(IMAGE_TEMPLATE24_DEFAULT_QUESTION_COUNT),
    fontFamily: FONT,
    look: LOOK,
    promo: options.promo ?? null,
  });
  return canvas.toBuffer('image/png');
}

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const questions = pickTemplate24QuestionBodies(IMAGE_TEMPLATE24_DEFAULT_QUESTION_COUNT);
  const slides = [COVER, ...questions];
  const outDir = 'docs/image-template-24';
  mkdirSync(outDir, { recursive: true });
  const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5'];
  const count = template24SlideCount(IMAGE_TEMPLATE24_DEFAULT_QUESTION_COUNT);
  for (let i = 0; i < count; i++) {
    const png = await renderSlide({
      text: slides[i] ?? '',
      tabIndex: i,
      isCover: i === 0,
      isCta: i === count - 1,
      promo: i === count - 1 ? promo : null,
    });
    const path = `${outDir}/${names[i]}.png`;
    writeFileSync(path, png);
    if (i === 0) writeFileSync('public/image-templates/template-24-cover.png', png);
    console.log(path, (slides[i] ?? '').slice(0, 90));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
