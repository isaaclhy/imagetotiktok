// Dev-only renderer for image templates 26 and 27. napi-canvas is not the DOM canvas.
// @ts-nocheck
import { mkdirSync, writeFileSync } from 'fs';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { cleanCopycatDisplayText, formatCopycatSlideBody } from '../app/lib/copycat/flamingo-cards';
import { getMisunderstoodCou4Posts } from '../app/lib/copycat/misunderstood-cou4';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '../app/lib/image-template-2-cover';
import {
  paintTemplate26Slide,
  template26AnswerLines,
} from '../app/lib/image-template-26-aww-eww';
import {
  paintTemplate27Slide,
  template27CoverTitle,
} from '../app/lib/image-template-27-pink-cards';

const W = 1080;
const H = 1440;
const UBUNTU = 'Ubuntu, "Segoe UI", sans-serif';
const LILITA = '"Lilita One", Nunito, sans-serif';

GlobalFonts.registerFromPath('public/fonts/ubuntu/Ubuntu-Regular.ttf', 'Ubuntu');
GlobalFonts.registerFromPath('public/fonts/ubuntu/Ubuntu-Bold.ttf', 'Ubuntu Bold');
GlobalFonts.registerFromPath('public/fonts/lilita-one/LilitaOne-Regular.ttf', 'Lilita One');

function postSlides(id) {
  const post = getMisunderstoodCou4Posts().find((item) => item.id === id);
  if (!post) throw new Error(`Missing post ${id}`);
  const questions = post.slideText.map((slide) => formatCopycatSlideBody(slide));
  return {
    cover: cleanCopycatDisplayText(post.coverText),
    questions,
    count: questions.length + 2,
  };
}

function write(canvas, path) {
  writeFileSync(path, canvas.toBuffer('image/png'));
}

async function main() {
  const promo = await loadImage(`public${IMAGE_TEMPLATE2_Q5_PROMO_SRC}`);
  const icon = await loadImage('public/spill-it-icon.jpg');
  const probe = createCanvas(200, 80).getContext('2d');
  probe.font = '700 40px Ubuntu';
  const bold = probe.measureText('aww').width;
  probe.font = '400 40px Ubuntu';
  const regular = probe.measureText('aww').width;
  probe.font = '400 40px "Lilita One"';
  const lilita = probe.measureText('Ask him #4').width;
  console.log('font widths', { bold, regular, lilita });

  const aww = postSlides('7703581640055950610');
  console.log('26 cover', aww.cover);
  console.log('26 q1', template26AnswerLines(aww.questions[0]));
  const fallback = template26AnswerLines('Sharing a hoodie on the couch');
  console.log('26 fallback', fallback);

  const dir26 = 'docs/image-template-26';
  mkdirSync(dir26, { recursive: true });
  const slides26 = [aww.cover, ...aww.questions, ''];
  const names26 = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5', 'cta'];
  for (let i = 0; i < slides26.length; i++) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const isCta = i === slides26.length - 1;
    paintTemplate26Slide(ctx, W, H, {
      text: slides26[i],
      tabIndex: i,
      slideCount: slides26.length,
      isCover: i === 0,
      isCta,
      promo: isCta ? promo : null,
      fontFamily: UBUNTU,
    });
    const name = names26[i] ?? `s${i}`;
    write(canvas, `${dir26}/${name}.png`);
    if (i === 0) write(canvas, 'public/image-templates/template-26-cover.png');
  }

  const statement = createCanvas(W, H);
  paintTemplate26Slide(statement.getContext('2d'), W, H, {
    text: 'Sleeping in his hoodie when he is not around',
    tabIndex: 1,
    slideCount: 7,
    isCover: false,
    isCta: false,
    fontFamily: UBUNTU,
  });
  write(statement, `${dir26}/statement-fallback.png`);

  const rage = postSlides('7691946946461830406');
  const cover27 = template27CoverTitle('him', 4);
  console.log('27 cover', cover27, 'from', rage.cover);
  const dir27 = 'docs/image-template-27';
  mkdirSync(dir27, { recursive: true });
  const slides27 = [cover27, ...rage.questions, ''];
  const names27 = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5', 'cta'];
  for (let i = 0; i < slides27.length; i++) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const isCta = i === slides27.length - 1;
    paintTemplate27Slide(ctx, W, H, {
      text: isCta ? '' : slides27[i],
      tabIndex: i,
      slideCount: slides27.length,
      isCover: i === 0,
      isCta,
      audience: 'him',
      promo: isCta ? promo : null,
      icon,
      fontFamily: LILITA,
      uiFontFamily: UBUNTU,
    });
    const name = names27[i] ?? `s${i}`;
    write(canvas, `${dir27}/${name}.png`);
    if (i === 0) write(canvas, 'public/image-templates/template-27-cover.png');
  }

  const choicePost = postSlides('7702707151000587541');
  const choice = createCanvas(W, H);
  paintTemplate27Slide(choice.getContext('2d'), W, H, {
    text: choicePost.questions[0],
    tabIndex: 1,
    slideCount: choicePost.count,
    isCover: false,
    isCta: false,
    audience: 'him',
    icon,
    fontFamily: LILITA,
    uiFontFamily: UBUNTU,
  });
  write(choice, `${dir27}/question-with-options.png`);
  console.log('27 options sample', choicePost.questions[0].slice(0, 180));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
