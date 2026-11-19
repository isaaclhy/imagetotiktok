// Dev-only renderer for image template 30. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE30_CTA_TAB,
  IMAGE_TEMPLATE30_QUESTION_COUNT,
  IMAGE_TEMPLATE30_SLIDE_COUNT,
  paintTemplate30Slide,
} from '../app/lib/image-template-30-pastel-dashes';
import { pickTemplate21QuestionBodies } from '../app/lib/image-template-21-questions';

const COVER_TITLE = 'Questions To Tell If Your Boyfriend Loves You';

const W = 1080;
const H = 1440;
const SANS = '"TikTok Sans", Arial, Helvetica, sans-serif';
const SERIF = '"Liberation Serif", "Times New Roman", Times, serif';

GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-500.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-700.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-800.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/liberation-serif/LiberationSerif-Regular.ttf', 'Liberation Serif');

function paintSet(dir, texts, look, promo) {
  mkdirSync(dir, { recursive: true });
  const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5', 'cta'];
  for (let i = 0; i < IMAGE_TEMPLATE30_SLIDE_COUNT; i++) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    paintTemplate30Slide(ctx, W, H, {
      text: texts[i] ?? '',
      tabIndex: i,
      slideCount: IMAGE_TEMPLATE30_SLIDE_COUNT,
      isCover: i === 0,
      isCta: i === IMAGE_TEMPLATE30_CTA_TAB,
      promo: i === IMAGE_TEMPLATE30_CTA_TAB ? promo : null,
      typeface: look.typeface,
      cover: look.cover,
      sansFamily: SANS,
      serifFamily: SERIF,
    });
    const png = canvas.toBuffer('image/png');
    const name = names[i] ?? `q${i}`;
    writeFileSync(`${dir}/${name}.png`, png);
    console.log(look.typeface, look.cover, name, (texts[i] ?? '').slice(0, 90).replace(/\n/g, ' | '));
  }
}

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const optionLines = (body) =>
    body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^[a-d][.)]\s+\S/i.test(line));
  const clean = (body) => {
    const lines = optionLines(body);
    if (lines.length < 3) return false;
    return lines.every((line) => {
      const text = line.replace(/^[a-d][.)]\s+/i, '').trim();
      if (text.length < 4) return false;
      // Some source options lost their first letter ("urious", "alm + …").
      const word = (text.split(/\s+/)[0] ?? '').replace(/[^A-Za-z]/g, '');
      if (!word) return true;
      if (word[0] === word[0].toUpperCase()) return true;
      return ['yes', 'no', 'it', 'a', 'the', 'my', 'our'].includes(word.toLowerCase());
    });
  };
  let questions = [];
  for (let attempt = 0; attempt < 12 && questions.length < IMAGE_TEMPLATE30_QUESTION_COUNT; attempt++) {
    const batch = pickTemplate21QuestionBodies(IMAGE_TEMPLATE30_QUESTION_COUNT * 3, questions);
    for (const body of batch) {
      if (!clean(body) || questions.includes(body)) continue;
      questions.push(body);
      if (questions.length === IMAGE_TEMPLATE30_QUESTION_COUNT) break;
    }
  }
  if (questions.length < IMAGE_TEMPLATE30_QUESTION_COUNT) {
    throw new Error(`expected ${IMAGE_TEMPLATE30_QUESTION_COUNT} questions, got ${questions.length}`);
  }
  const title = COVER_TITLE;
  const texts = [title, ...questions, ''];

  paintSet('docs/image-template-30/sans', texts, { typeface: 'sans', cover: 'highlight' }, promo);
  paintSet('docs/image-template-30/serif', texts, { typeface: 'serif', cover: 'plain' }, promo);
  paintSet('docs/image-template-30/glow', texts, { typeface: 'serif', cover: 'glow' }, promo);

  // Matched-copy slides for the side-by-side, using the reference wording.
  const compareDir = 'docs/image-template-30/compare-src';
  mkdirSync(compareDir, { recursive: true });
  const matched = [
    {
      name: 'cover',
      text: 'Is it okay for your boyfriend to do this?',
      tabIndex: 0,
      isCover: true,
      isCta: false,
    },
    {
      name: 'question',
      text: 'Is it okay to stay friends with someone you once had feelings for?\n\nA. yes\nB. no\nC. it depends',
      tabIndex: 1,
      isCover: false,
      isCta: false,
    },
    {
      name: 'cta',
      text: '',
      tabIndex: IMAGE_TEMPLATE30_CTA_TAB,
      isCover: false,
      isCta: true,
    },
  ];
  for (const slide of matched) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    paintTemplate30Slide(ctx, W, H, {
      text: slide.text,
      tabIndex: slide.tabIndex,
      slideCount: IMAGE_TEMPLATE30_SLIDE_COUNT,
      isCover: slide.isCover,
      isCta: slide.isCta,
      promo: slide.isCta ? promo : null,
      typeface: 'sans',
      cover: 'highlight',
      sansFamily: SANS,
      serifFamily: SERIF,
    });
    writeFileSync(`${compareDir}/${slide.name}.png`, canvas.toBuffer('image/png'));
  }

  const cover = createCanvas(W, H);
  const coverCtx = cover.getContext('2d');
  paintTemplate30Slide(coverCtx, W, H, {
    text: texts[0],
    tabIndex: 0,
    slideCount: IMAGE_TEMPLATE30_SLIDE_COUNT,
    isCover: true,
    isCta: false,
    typeface: 'sans',
    cover: 'highlight',
    sansFamily: SANS,
    serifFamily: SERIF,
  });
  writeFileSync('public/image-templates/template-30-cover.png', cover.toBuffer('image/png'));
  writeFileSync('docs/image-template-30/sans/cover.png', cover.toBuffer('image/png'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
