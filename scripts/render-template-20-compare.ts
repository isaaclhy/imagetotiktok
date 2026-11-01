// Dev-only renderer. napi-canvas is not the DOM CanvasRenderingContext2D.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_APP_FOOTER, IMAGE_TEMPLATE2_PASTEL_COLORS } from '../app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO,
  IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO,
  IMAGE_TEMPLATE2_TEXT_COLOR,
  imageTemplate2Q5PromoLayout,
} from '../app/lib/image-template-2-cover';
import { paintTemplate20Slide } from '../app/lib/image-template-20-ocean';
import {
  IMAGE_TEMPLATE23_CTA_TAB,
  paintTemplate23Slide,
} from '../app/lib/image-template-23-flat-dark';

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
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-800.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-700.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('app/fonts/roboto/roboto-latin-400-normal.woff2', 'Roboto');
GlobalFonts.registerFromPath('app/fonts/roboto/roboto-latin-700-normal.woff2', 'Roboto');

const SERIF = '"Liberation Serif", Times, serif';
const SANS = '"Poppins", sans-serif';
const TIKTOK = '"TikTok Sans", sans-serif';
const ROBOTO = '"Roboto", sans-serif';

const QUESTION = [
  'If you had 60 seconds to make me cry for $1M, what would you do?',
  '',
  'a. Roast me',
  'b. Bring up my past',
  'c. Fake a breakup',
  'd. Ignore me',
].join('\n');

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

async function sideBySide(refPath, ours, outPath, rightLabel) {
  const ref = await loadImage(refPath);
  const canvas = createCanvas(W * 2 + 24, H + 64);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 28px "Poppins", sans-serif';
  ctx.fillText('Reference', 24, 42);
  ctx.fillText(rightLabel, W + 48, 42);
  ctx.drawImage(ref, 0, 64, W, H);
  ctx.drawImage(ours, W + 24, 64, W, H);
  writeFileSync(outPath, canvas.toBuffer('image/png'));
}

function wrapWords(ctx, text, maxWidth) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      lines.push(current);
      current = words[i];
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Template 2 question / Q5, matching the studio export. */
function renderTemplate2(text, { cta, promo }) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = IMAGE_TEMPLATE2_PASTEL_COLORS[cta ? 5 : 1];
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
  ctx.font = `700 ${Math.round(W * 0.03)}px ${TIKTOK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Couples Questions', W / 2, H * 0.08);

  const barX = W * 0.08;
  const barW = W * 0.84;
  const barY = H * 0.21;
  const barH = Math.max(8, Math.round(H * 0.007));
  ctx.font = `700 ${Math.round(H * 0.032)}px ${TIKTOK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Funny Questions', W / 2, barY - H * 0.018);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(barX, barY, barW * (cta ? 1 : 0.5), barH);

  const fontSize = Math.round(W * IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO);
  ctx.font = `800 ${fontSize}px ${TIKTOK}`;
  ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const maxTextWidth = W * 0.6;
  const textX = (W - maxTextWidth) / 2;
  const lines = wrapWords(ctx, text.replace(/\n/g, ' '), maxTextWidth);
  const lineHeight = fontSize * 1.22;
  const blockH = lines.length * lineHeight;
  const textCenterY = H * IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO;
  let y = textCenterY - blockH / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, textX, y);
    y += lineHeight;
  }

  if (cta && promo) {
    const labelSize = Math.round(H * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
    const labelGap = H * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(W, H, y - lineHeight / 2 + labelSize + labelGap);
    ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
    ctx.font = `700 ${labelSize}px ${TIKTOK}`;
    ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, W / 2, layout.y - labelGap);
  } else {
    ctx.font = `700 ${Math.round(H * 0.03)}px ${TIKTOK}`;
    ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_APP_FOOTER, W / 2, H * 0.9);
  }
  return canvas;
}

function renderTemplate23(text, { cta, promo, tabIndex }) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  paintTemplate23Slide(ctx, W, H, {
    text,
    tabIndex,
    isCover: false,
    isCta: cta,
    promo: cta ? promo : null,
    fontFamily: ROBOTO,
  });
  return canvas;
}

function strip(canvases, labels, outPath) {
  const gap = 24;
  const labelH = 64;
  const canvas = createCanvas(W * canvases.length + gap * (canvases.length - 1), H + labelH);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 28px "Poppins", sans-serif';
  canvases.forEach((slide, index) => {
    const x = index * (W + gap);
    ctx.fillText(labels[index], x + 24, 42);
    ctx.drawImage(slide, x, labelH, W, H);
  });
  writeFileSync(outPath, canvas.toBuffer('image/png'));
}

async function main() {
  const outDir = 'docs/image-template-20';
  mkdirSync(outDir, { recursive: true });
  const promo = await loadImage('public/image-templates/template-2-q5-appstore.png');
  const question = await renderSlide({ text: QUESTION });
  const q5 = await renderSlide({ text: QUESTION, isCta: true, promo });
  const longQuestion = [
    'If I said I bought something crazy that you have never seen before, what would you guess?',
    '',
    'a. Something ridiculously expensive that we cannot afford',
    'b. Something completely useless but still funny',
    'c. Something random I saw on TikTok at 2am',
    'd. Something embarrassing that you would hide from everyone',
  ].join('\n');
  const qLong = await renderSlide({ text: longQuestion, isCta: true, promo });
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
  const shortQuestion = 'Would you still like me if I went bald?';
  const short = await renderSlide({ text: shortQuestion });
  const shortCta = await renderSlide({ text: shortQuestion, isCta: true, promo });
  const t2Question = renderTemplate2(QUESTION, { cta: false, promo });
  const t2Cta = renderTemplate2(QUESTION, { cta: true, promo });
  const t2Long = renderTemplate2(longQuestion, { cta: true, promo });
  const t2Short = renderTemplate2(shortQuestion, { cta: true, promo });
  const t23Question = renderTemplate23(QUESTION, { cta: false, promo, tabIndex: 1 });
  const t23Cta = renderTemplate23(QUESTION, {
    cta: true,
    promo,
    tabIndex: IMAGE_TEMPLATE23_CTA_TAB,
  });
  const t23Long = renderTemplate23(longQuestion, {
    cta: true,
    promo,
    tabIndex: IMAGE_TEMPLATE23_CTA_TAB,
  });
  const t23Short = renderTemplate23(shortQuestion, {
    cta: true,
    promo,
    tabIndex: IMAGE_TEMPLATE23_CTA_TAB,
  });
  writeFileSync(`${outDir}/question.png`, question.toBuffer('image/png'));
  writeFileSync(`${outDir}/question-short.png`, short.toBuffer('image/png'));
  writeFileSync(`${outDir}/question-long.png`, (await renderSlide({ text: longQuestion })).toBuffer('image/png'));
  writeFileSync(`${outDir}/q2.png`, q2.toBuffer('image/png'));
  writeFileSync(`${outDir}/q3.png`, q3.toBuffer('image/png'));
  writeFileSync(`${outDir}/q4.png`, q4.toBuffer('image/png'));
  writeFileSync(`${outDir}/cta.png`, q5.toBuffer('image/png'));
  writeFileSync(`${outDir}/q5-with-cta.png`, q5.toBuffer('image/png'));
  writeFileSync(`${outDir}/q5-long.png`, qLong.toBuffer('image/png'));
  writeFileSync(`${outDir}/cta-short.png`, shortCta.toBuffer('image/png'));
  strip(
    [t2Question, question, t23Question],
    ['Template 2', 'Template 20', 'Template 23'],
    `${outDir}/compare-question.png`
  );
  strip(
    [t2Cta, q5, t23Cta],
    ['Template 2', 'Template 20', 'Template 23'],
    `${outDir}/compare-cta.png`
  );
  strip(
    [t2Long, qLong, t23Long],
    ['Template 2 long', 'Template 20 long', 'Template 23 long'],
    `${outDir}/compare-cta-long.png`
  );
  strip(
    [t2Short, shortCta, t23Short],
    ['Template 2', 'Template 20', 'Template 23'],
    `${outDir}/compare-cta-short.png`
  );
  await sideBySide('docs/image-template-20/ref-question.png', question, `${outDir}/side-question.png`, 'Template 20');
  await sideBySide('docs/image-template-20/ref-cta.png', q5, `${outDir}/side-cta.png`, 'Template 20');
  report('question', question);
  report('short', short);
  report('q5', q5);
  report('qlong', qLong);
  report('t2cta', t2Cta);
  report('t23cta', t23Cta);
  console.log('wrote', outDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
