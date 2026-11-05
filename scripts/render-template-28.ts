// Dev-only renderer for image template 28. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE28_SLIDE_COUNT,
  paintTemplate28Slide,
  pickTemplate28Questions,
  template28LookFromSeed,
  template28LookLabel,
} from '../app/lib/image-template-28-dotted';

const W = 1080;
const H = 1440;

GlobalFonts.registerFromPath('public/fonts/league-gothic/LeagueGothic-variable.ttf', 'League Gothic');
GlobalFonts.registerFromPath('app/fonts/inter/inter-latin-800.woff2', 'Inter ExtraBold');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/macos/Inter-Bold.ttf', 'Inter');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Noto Color Emoji');

const fonts = {
  displayFontFamily: '"League Gothic", Impact, sans-serif',
  bodyFontFamily: '"Inter ExtraBold", Inter, sans-serif',
  uiFontFamily: 'Inter, sans-serif',
  emojiFontFamily: '"Noto Color Emoji"',
};

function renderSlide(path, options) {
  const canvas = createCanvas(W, H);
  paintTemplate28Slide(canvas.getContext('2d'), W, H, {
    ...fonts,
    slideCount: IMAGE_TEMPLATE28_SLIDE_COUNT,
    ...options,
  });
  writeFileSync(path, canvas.toBuffer('image/png'));
}

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const outDir = process.env.TEMPLATE28_OUT || '/opt/cursor/artifacts/screenshots';
  mkdirSync(outDir, { recursive: true });
  mkdirSync('public/image-templates', { recursive: true });

  const posts = [
    { id: 'a', seed: 7, questionSeed: 101 },
    { id: 'b', seed: 1, questionSeed: 202 },
    {
      id: 'c',
      seed: 68,
      questionSeed: 303,
      questions: [
        'What was the best moment of your day, and who were you with?',
        'Was there a moment today you wished I was there with you?',
        "Would you rather wake up tomorrow with zero memory of me or know everything about me but be forced to break up right now?",
      ],
    },
  ];

  for (const post of posts) {
    const look = template28LookFromSeed(post.seed);
    const questions =
      post.questions ?? pickTemplate28Questions(3, [], post.questionSeed);
    const coverText = look.variant === 'old-new' ? look.topic : '';
    console.log(post.id, template28LookLabel(look), questions);
    const slides = [coverText, ...questions];
    const names = ['cover', 'q1', 'q2', 'q3'];
    for (let i = 0; i < slides.length; i++) {
      const isCta = i === slides.length - 1;
      const file = `${outDir}/template-28-post-${post.id}-${names[i]}.png`;
      renderSlide(file, {
        text: slides[i],
        tabIndex: i,
        isCover: i === 0,
        isCta,
        seed: post.seed,
        promo: isCta ? promo : null,
      });
      if (post.id === 'a' && i === 0) {
        renderSlide('public/image-templates/template-28-cover.png', {
          text: slides[i],
          tabIndex: 0,
          isCover: true,
          isCta: false,
          seed: post.seed,
        });
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
