// Dev-only renderer for image template 23. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE23_COVER_SUBTITLE,
  IMAGE_TEMPLATE23_CTA_TAB,
  IMAGE_TEMPLATE23_QUESTION_COUNT,
  IMAGE_TEMPLATE23_SLIDE_COUNT,
  paintTemplate23Slide,
} from '../app/lib/image-template-23-flat-dark';
import { pickTemplate21QuestionBodies } from '../app/lib/image-template-21-questions';

const W = 1080;
const H = 1440;
const FONT = '"Roboto", sans-serif';

GlobalFonts.registerFromPath('app/fonts/roboto/roboto-latin-400-normal.woff2', 'Roboto');
GlobalFonts.registerFromPath('app/fonts/roboto/roboto-latin-400-italic.woff2', 'Roboto');
GlobalFonts.registerFromPath('app/fonts/roboto/roboto-latin-700-normal.woff2', 'Roboto');
GlobalFonts.registerFromPath('public/fonts/poppins/Poppins-SemiBold.ttf', 'Poppins');

const COVER = '5 Fun Questions To Ragebait Your Boo';

async function renderSlide(options: {
  text: string;
  tabIndex: number;
  isCover?: boolean;
  isCta?: boolean;
  coverSubtitle?: string;
  promo?: unknown;
}) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  paintTemplate23Slide(ctx, W, H, {
    ...options,
    slideCount: IMAGE_TEMPLATE23_SLIDE_COUNT,
    fontFamily: FONT,
    promo: options.promo ?? null,
  });
  return canvas.toBuffer('image/png');
}

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const questions = pickTemplate21QuestionBodies(IMAGE_TEMPLATE23_QUESTION_COUNT);
  const slides = [COVER, ...questions];
  const outDir = 'docs/image-template-23';
  mkdirSync(outDir, { recursive: true });
  const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
  for (let i = 0; i < IMAGE_TEMPLATE23_SLIDE_COUNT; i++) {
    const png = await renderSlide({
      text: slides[i] ?? '',
      tabIndex: i,
      isCover: i === 0,
      isCta: i === IMAGE_TEMPLATE23_CTA_TAB,
      coverSubtitle: IMAGE_TEMPLATE23_COVER_SUBTITLE,
      promo: i === IMAGE_TEMPLATE23_CTA_TAB ? promo : null,
    });
    const path = `${outDir}/${names[i]}.png`;
    const { writeFileSync } = await import('fs');
    writeFileSync(path, png);
    if (i === 0) writeFileSync('public/image-templates/template-23-cover.png', png);
    console.log(path, slides[i]?.slice(0, 80));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
