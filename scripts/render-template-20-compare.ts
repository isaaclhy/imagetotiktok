// Dev-only renderer. napi-canvas is not the DOM CanvasRenderingContext2D.
// @ts-nocheck
import { mkdirSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { paintTemplate20Slide } from '../app/lib/image-template-20-ocean';

const W = 1080;
const H = 1440;

GlobalFonts.registerFromPath(
  'public/fonts/liberation-serif/LiberationSerif-Bold.ttf',
  'Liberation Serif'
);
GlobalFonts.registerFromPath(
  'public/fonts/liberation-serif/LiberationSerif-Regular.ttf',
  'Liberation Serif'
);
GlobalFonts.registerFromPath('public/fonts/poppins/Poppins-SemiBold.ttf', 'Poppins');

const SERIF = '"Liberation Serif", Times, serif';
const SANS = '"Poppins", sans-serif';

const QUESTION = [
  'If you had 60 seconds to make me cry for $1M, what would you do?',
  '',
  'a. Roast me',
  'b. Bring up my past',
  'c. Fake a breakup',
  'd. Ignore me',
].join('\n');

const REFS = {
  cover: '/home/ubuntu/.cursor/projects/workspace/uploads/ref-cover_cca8.jpg',
  question: '/home/ubuntu/.cursor/projects/workspace/uploads/ref-q1_8ef0.jpg',
  cta: '/home/ubuntu/.cursor/projects/workspace/uploads/ref-cta_b20a.jpg',
};

async function renderSlide(opts: {
  text: string;
  isCover?: boolean;
  isCta?: boolean;
  promo?: Awaited<ReturnType<typeof loadImage>> | null;
}) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  paintTemplate20Slide(ctx as unknown as CanvasRenderingContext2D, W, H, {
    text: opts.text,
    isCover: opts.isCover,
    isCta: opts.isCta,
    promo: opts.promo,
    fontFamily: SERIF,
    footerFontFamily: SANS,
  });
  return canvas;
}

function sample(data: Uint8ClampedArray, width: number, x: number, y: number) {
  const o = (y * width + x) * 4;
  return [data[o], data[o + 1], data[o + 2]];
}

function report(name: string, canvas: ReturnType<typeof createCanvas>) {
  const ctx = canvas.getContext('2d');
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { width, height, data } = image;
  const at = (fx: number, fy: number) =>
    sample(data, width, Math.round(fx * (width - 1)), Math.round(fy * (height - 1)));
  console.log(
    name,
    'center',
    at(0.5, 0.5),
    'edgeL',
    at(0.02, 0.5),
    'edgeB',
    at(0.5, 0.98),
    'corner',
    at(0.01, 0.01)
  );
  const lum = (x: number, y: number) => {
    const [r, g, b] = sample(data, width, x, y);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const bands: string[] = [];
  let start = -1;
  for (let y = 0; y < height; y++) {
    let bright = 0;
    for (let x = 0; x < width; x += 2) {
      if (lum(x, y) > 170) bright++;
    }
    const on = bright > 4;
    if (on && start < 0) start = y;
    if (!on && start >= 0) {
      bands.push(`${(start / height).toFixed(3)}-${((y - 1) / height).toFixed(3)}`);
      start = -1;
    }
  }
  console.log('  bands', bands.join(' '));
}

async function sideBySide(
  refPath: string,
  ours: Awaited<ReturnType<typeof renderSlide>>,
  outPath: string
) {
  const ref = await loadImage(refPath);
  const canvas = createCanvas(W * 2 + 24, H + 64);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 28px "Poppins", sans-serif';
  ctx.fillText('Reference', 24, 42);
  ctx.fillText('Template 20', W + 48, 42);
  ctx.drawImage(ref, 0, 64, W, H);
  ctx.drawImage(ours, W + 24, 64, W, H);
  const { writeFileSync } = await import('fs');
  writeFileSync(outPath, canvas.toBuffer('image/png'));
}

async function main() {
  const outDir = 'docs/image-template-20';
  mkdirSync(outDir, { recursive: true });
  const promo = await loadImage('public/image-templates/template-2-q5-appstore.png');
  const cover = await renderSlide({
    text: '3 dumb questions for him\n(but fun)',
    isCover: true,
  });
  const question = await renderSlide({ text: QUESTION });
  const cta = await renderSlide({ text: '', isCta: true, promo });
  const q5 = await renderSlide({ text: QUESTION, isCta: true, promo });
  const { writeFileSync } = await import('fs');
  const more = [
    [
      'If I said I bought something crazy, what would you guess?',
      '',
      'a. Something expensive',
      'b. Something useless',
      'c. Something random',
      'd. Something embarrassing',
    ].join('\n'),
    [
      "If I forgot everything tomorrow, what's the first thing you'd tell me?",
      '',
      'a. How we met',
      'b. What I am like',
      'c. Why you love me',
      'd. An inside joke',
    ].join('\n'),
    'Would you rather lose all our messages or all our photos together?',
  ];
  const q2 = await renderSlide({ text: more[0]! });
  const q3 = await renderSlide({ text: more[1]! });
  const q4 = await renderSlide({ text: more[2]! });
  const productCover = await renderSlide({
    text: '5 Dumb Questions To Ask Your Boyfriend Tonight',
    isCover: true,
  });
  writeFileSync(`${outDir}/cover.png`, cover.toBuffer('image/png'));
  writeFileSync(`${outDir}/question.png`, question.toBuffer('image/png'));
  writeFileSync(`${outDir}/q2.png`, q2.toBuffer('image/png'));
  writeFileSync(`${outDir}/q3.png`, q3.toBuffer('image/png'));
  writeFileSync(`${outDir}/q4.png`, q4.toBuffer('image/png'));
  writeFileSync(`${outDir}/cta.png`, cta.toBuffer('image/png'));
  writeFileSync(`${outDir}/q5-with-cta.png`, q5.toBuffer('image/png'));
  writeFileSync(`${outDir}/product-cover.png`, productCover.toBuffer('image/png'));
  writeFileSync(
    'public/image-templates/template-20-cover.jpg',
    productCover.toBuffer('image/jpeg', 90)
  );
  report('cover', cover);
  report('question', question);
  report('cta', cta);
  await sideBySide(REFS.cover, cover, `${outDir}/side-cover.png`);
  await sideBySide(REFS.question, question, `${outDir}/side-question.png`);
  await sideBySide(REFS.cta, cta, `${outDir}/side-cta.png`);
  console.log('wrote', outDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
