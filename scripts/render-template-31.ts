// Dev-only renderer for image template 31. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE31_COLORS,
  IMAGE_TEMPLATE31_CTA_TAB,
  IMAGE_TEMPLATE31_GRAIN_SRC,
  IMAGE_TEMPLATE31_QUESTION_COUNT,
  IMAGE_TEMPLATE31_SLIDE_COUNT,
  paintTemplate31Slide,
} from '../app/lib/image-template-31-flamingo';

const W = 1080;
const H = 1440;

GlobalFonts.registerFromPath(
  'public/fonts/eb-garamond/EBGaramond-Variable.ttf',
  'EB Garamond'
);
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-400.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-700.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Noto Color Emoji');

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

const COVER = 'Funny questions to ask your best friend';
const OPEN =
  'Which one of us would be the worst person to take on a vacation?';
const WITH_OPTIONS = [
  "What's something you secretly want me to do more often?",
  '',
  'a. Initiate affection',
  'b. Give compliments',
  'c. Plan surprises',
].join('\n');

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const grain = await loadImage(`public${IMAGE_TEMPLATE31_GRAIN_SRC}`);
  const rose = IMAGE_TEMPLATE31_COLORS[0]!;
  const lavender = IMAGE_TEMPLATE31_COLORS[1]!;

  const slides = [
    { text: COVER, color: lavender, name: 'cover', isCover: true, isCta: false },
    { text: 'Nosy questions\nyour bf can\'t\ndodge 👀', color: rose, name: 'cover-rose', isCover: true, isCta: false },
    { text: OPEN, color: rose, name: 'q-open', isCover: false, isCta: false },
    { text: WITH_OPTIONS, color: rose, name: 'q-options', isCover: false, isCta: false },
    { text: OPEN, color: rose, name: 'q5-cta', isCover: false, isCta: true },
  ];

  const outDir = 'docs/image-template-31';
  mkdirSync(outDir, { recursive: true });
  mkdirSync('public/image-templates', { recursive: true });

  for (const slide of slides) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    paintTemplate31Slide(ctx, W, H, {
      text: slide.text,
      tabIndex: slide.isCover ? 0 : 1,
      slideCount: IMAGE_TEMPLATE31_SLIDE_COUNT,
      isCover: slide.isCover,
      isCta: slide.isCta,
      color: slide.color,
      grain,
      promo: slide.isCta ? promo : null,
    });
    const png = canvas.toBuffer('image/png');
    writeFileSync(`${outDir}/${slide.name}.png`, png);
    if (slide.name === 'cover') {
      writeFileSync('public/image-templates/template-31-cover.png', png);
    }
    console.log(slide.name, slide.color, slide.text.slice(0, 60).replace(/\n/g, ' | '));
  }

  // Full carousel pack for the rose look.
  const pack = [
    COVER,
    OPEN,
    WITH_OPTIONS,
    'If we switched lives for a day, what would surprise you most about mine?',
    'What is one habit of mine you hope I never change?',
    'Be honest: what is the most exhausting part of being in a relationship with me?',
  ];
  for (let i = 0; i < IMAGE_TEMPLATE31_SLIDE_COUNT; i++) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const isCta = i === IMAGE_TEMPLATE31_CTA_TAB;
    paintTemplate31Slide(ctx, W, H, {
      text: pack[i] ?? '',
      tabIndex: i,
      slideCount: IMAGE_TEMPLATE31_SLIDE_COUNT,
      isCover: i === 0,
      isCta,
      color: rose,
      grain,
      promo: isCta ? promo : null,
    });
    writeFileSync(`${outDir}/pack-${i === 0 ? 'cover' : `q${i}`}.png`, canvas.toBuffer('image/png'));
  }
  console.log('pack', IMAGE_TEMPLATE31_QUESTION_COUNT, 'questions + cover');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
