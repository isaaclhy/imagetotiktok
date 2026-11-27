import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { getVideoTemplatesForApp } from './apps';
import {
  TILTED_CARD_DEFAULT_FILL,
  TILTED_CARD_INK,
  TILTED_CARD_PAPER,
  TILTED_CARD_TEMPLATE_ID,
  TILTED_CARD_TITLE,
  clampTiltedCardRotation,
  defaultTiltedCardQuestions,
  paintTiltedCardOverlay,
  tiltedCardDurationSec,
  tiltedCardQuestionAt,
  tiltedCardTextColor,
} from './video-template-11-tilted-card';

const root = process.cwd();
GlobalFonts.registerFromPath(
  path.join(root, 'public/fonts/playfair-display/PlayfairDisplay-Variable.ttf'),
  'Playfair Display'
);
GlobalFonts.registerFromPath(
  path.join(root, 'public/fonts/tiktok-sans/TikTokSans-700.ttf'),
  'TikTok Sans'
);

test('tilted card is listed only for Spill It', () => {
  const spill = getVideoTemplatesForApp('spill-it');
  const card = spill.find((item) => item.id === TILTED_CARD_TEMPLATE_ID);
  assert.equal(card?.title, TILTED_CARD_TITLE);
  assert.equal(
    getVideoTemplatesForApp('nighty').some(
      (item) => item.id === TILTED_CARD_TEMPLATE_ID || item.title === TILTED_CARD_TITLE
    ),
    false
  );
  assert.equal(
    getVideoTemplatesForApp('fab').some((item) => item.title === TILTED_CARD_TITLE),
    false
  );
  assert.equal(
    getVideoTemplatesForApp('nighty').map((item) => item.title).includes('Particle'),
    true
  );
  assert.equal(
    getVideoTemplatesForApp('nighty').map((item) => item.title).includes('Rain'),
    true
  );
});

test('text switches to light on Spill It purple and stays dark on the pastels', () => {
  assert.equal(tiltedCardTextColor('#F9C6D0'), TILTED_CARD_INK);
  assert.equal(tiltedCardTextColor('#FF8FB1'), TILTED_CARD_INK);
  assert.equal(tiltedCardTextColor('#FFB38A'), TILTED_CARD_INK);
  assert.equal(tiltedCardTextColor('#8C19FF'), TILTED_CARD_PAPER);
  assert.equal(tiltedCardTextColor('#ffffff'), TILTED_CARD_INK);
  assert.equal(tiltedCardTextColor('#000000'), TILTED_CARD_PAPER);
});

test('tilt stays inside the editable range and the sequence advances by question', () => {
  assert.equal(clampTiltedCardRotation(-3.5), -3.5);
  assert.equal(clampTiltedCardRotation(-40), -10);
  assert.equal(clampTiltedCardRotation(40), 10);
  const questions = defaultTiltedCardQuestions();
  assert.equal(tiltedCardDurationSec(questions), questions.length * 4);
  assert.equal(tiltedCardQuestionAt(questions, 0), questions[0]);
  assert.equal(tiltedCardQuestionAt(questions, 4), questions[1]);
  assert.equal(tiltedCardQuestionAt(questions, 100), questions[questions.length - 1]);
  assert.equal(tiltedCardQuestionAt(['  ', ''], 0).includes('fall for me'), true);
});

test('the card is a centred pastel panel and the frame corners stay clear', () => {
  const canvas = createCanvas(1080, 1920);
  const ctx = canvas.getContext('2d');
  paintTiltedCardOverlay(ctx as unknown as CanvasRenderingContext2D, 1080, 1920, {
    appName: 'Spill It',
    question: "What's something small I did early on that made you fall for me?",
    fill: TILTED_CARD_DEFAULT_FILL,
    rotationDeg: -3.5,
    serifFamily: 'Playfair Display',
    sansFamily: 'TikTok Sans',
  });
  // Upper-right of the card, clear of the left-aligned question.
  const panel = ctx.getImageData(900, 450, 1, 1).data;
  assert.equal(panel[0], 0xf9);
  assert.equal(panel[1], 0xc6);
  assert.equal(panel[2], 0xd0);
  assert.equal(panel[3], 255);
  const band = ctx.getImageData(140, 860, 760, 220).data;
  let inkPixels = 0;
  for (let i = 0; i < band.length; i += 4) {
    if (band[i] === 0x1c && band[i + 1] === 0x14 && band[i + 2] === 0x16) inkPixels += 1;
  }
  assert.ok(inkPixels > 40, `expected dark question ink, found ${inkPixels}`);
  const corner = ctx.getImageData(0, 0, 1, 1).data;
  assert.equal(corner[3], 0);

  paintTiltedCardOverlay(ctx as unknown as CanvasRenderingContext2D, 1080, 1920, {
    appName: 'SPILL IT',
    question: 'When did you first think this might actually last?',
    fill: '#8C19FF',
    rotationDeg: -3.5,
    serifFamily: 'Playfair Display',
    sansFamily: 'TikTok Sans',
  });
  const purple = ctx.getImageData(900, 450, 1, 1).data;
  assert.equal(purple[0], 0x8c);
  assert.equal(purple[1], 0x19);
  assert.equal(purple[2], 0xff);
  const lightBand = ctx.getImageData(140, 860, 760, 220).data;
  let paperPixels = 0;
  for (let i = 0; i < lightBand.length; i += 4) {
    if (lightBand[i] === 0xff && lightBand[i + 1] === 0xf8 && lightBand[i + 2] === 0xf4) {
      paperPixels += 1;
    }
  }
  assert.ok(paperPixels > 40, `expected light question ink on purple, found ${paperPixels}`);
});
