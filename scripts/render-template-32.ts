// Dev-only renderer for image template 32. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import { paintTemplate32Slide } from '../app/lib/image-template-32-wavy-blob';

const W = 1080;
const H = 1440;

GlobalFonts.registerFromPath('public/fonts/fraunces/Fraunces-Black.ttf', 'Fraunces');
GlobalFonts.registerFromPath('public/fonts/fraunces/Fraunces-Medium.ttf', 'Fraunces');
GlobalFonts.registerFromPath('public/fonts/fraunces/Fraunces-SemiBoldItalic.ttf', 'Fraunces');

function renderSlide(path, options) {
  const canvas = createCanvas(W, H);
  paintTemplate32Slide(canvas.getContext('2d'), W, H, {
    fontFamily: 'Fraunces',
    labelFontFamily: 'Fraunces',
    ...options,
  });
  writeFileSync(path, canvas.toBuffer('image/png'));
}

async function main() {
  const outDir = process.env.TEMPLATE32_OUT || '/tmp/template-32';
  mkdirSync(outDir, { recursive: true });
  mkdirSync('public/image-templates', { recursive: true });
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const coverText = '5 questions for late night talks';
  const question =
    'What is your ideal way to spend a Sunday together?\n\na. Staying in all day\nb. A long walk with no plan\nc. Brunch and then nowhere\nd. Whatever you are doing';

  renderSlide(`${outDir}/cover.png`, {
    text: coverText,
    tabIndex: 0,
    isCover: true,
    isCta: false,
  });
  renderSlide('public/image-templates/template-32-cover.png', {
    text: coverText,
    tabIndex: 0,
    isCover: true,
    isCta: false,
  });
  renderSlide(`${outDir}/question.png`, {
    text: question,
    tabIndex: 1,
    isCover: false,
    isCta: false,
  });
  renderSlide(`${outDir}/cta.png`, {
    text: '',
    tabIndex: 6,
    slideCount: 7,
    isCover: false,
    isCta: true,
    promo,
  });
  console.log(outDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
