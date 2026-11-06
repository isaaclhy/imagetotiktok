// Dev-only renderer for image template 29. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE29_CATS_SRC,
  IMAGE_TEMPLATE29_CTA_TAB,
  IMAGE_TEMPLATE29_QUESTION_COUNT,
  IMAGE_TEMPLATE29_SLIDE_COUNT,
  paintTemplate29Slide,
} from '../app/lib/image-template-29-dark-cats';
import { pickTemplate21QuestionBodies } from '../app/lib/image-template-21-questions';

const W = 1080;
const H = 1440;

GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-600.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-700.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-800.ttf', 'TikTok Sans');

const COVER = 'Does He Pass The Good Boyfriend Test?';

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const cats = await loadImage(`public${IMAGE_TEMPLATE29_CATS_SRC}`);
  const questions = pickTemplate21QuestionBodies(IMAGE_TEMPLATE29_QUESTION_COUNT);
  if (questions.length < IMAGE_TEMPLATE29_QUESTION_COUNT) {
    throw new Error(`expected ${IMAGE_TEMPLATE29_QUESTION_COUNT} questions, got ${questions.length}`);
  }
  const texts = [COVER, ...questions, ''];
  const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'cta'];
  const outDir = 'docs/image-template-29';
  mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < IMAGE_TEMPLATE29_SLIDE_COUNT; i++) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    paintTemplate29Slide(ctx, W, H, {
      text: texts[i] ?? '',
      tabIndex: i,
      slideCount: IMAGE_TEMPLATE29_SLIDE_COUNT,
      isCover: i === 0,
      isCta: i === IMAGE_TEMPLATE29_CTA_TAB,
      promo: i === IMAGE_TEMPLATE29_CTA_TAB ? promo : null,
      cats: i === 0 ? cats : null,
      fontFamily: '"TikTok Sans", Arial, Helvetica, sans-serif',
    });
    const png = canvas.toBuffer('image/png');
    const name = names[i] ?? `q${i}`;
    writeFileSync(`${outDir}/${name}.png`, png);
    if (i === 0) writeFileSync('public/image-templates/template-29-cover.png', png);
    console.log(name, (texts[i] ?? '').slice(0, 80).replace(/\n/g, ' | '));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
