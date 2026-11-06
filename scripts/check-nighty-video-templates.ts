import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { nightyRainAudioSrc } from '../app/lib/constants';
import { getVideoTemplatesForApp } from '../app/lib/apps';
import {
  NIGHTY_COMPOSITIONS,
  cloneCompositionState,
  isNightyCompositionTemplateId,
} from '../app/lib/nighty-video-templates/catalog';
import { frameAt } from '../app/lib/nighty-video-templates/timeline';

const root = process.cwd();

const BANNED = [
  /sleep better\.?\s*feel better/i,
  /make sleeping easy/i,
  /get to sleep faster/i,
  /sleeping doesn't have to be hard/i,
  /exclusive natural white noise/i,
  /brain a massage/i,
  /racing thoughts/i,
  /anxiety/i,
  /hundreds of sounds/i,
  /top rated/i,
  /loved by millions/i,
  /clinically/i,
  /guaranteed/i,
  /\bmixer\b/i,
  /sleep tracking/i,
  /\bstories\b/i,
  /fireplace/i,
  /white noise/i,
  /brown noise/i,
  /\bcement\b/i,
  /fried chicken/i,
  /bettersleep/i,
  /rain rain/i,
  /dark noise/i,
  /rainy mood/i,
  /\bsleepa\b/i,
];

function customerStrings(): string[] {
  const strings: string[] = [];
  for (const template of NIGHTY_COMPOSITIONS) {
    strings.push(template.title, template.subtitle, template.defaults.headline, template.defaults.subline);
    strings.push(template.defaults.labelA, template.defaults.labelB);
    for (const beat of template.defaults.beats) strings.push(beat.label);
  }
  return strings;
}

const spill = getVideoTemplatesForApp('spill-it');
const fab = getVideoTemplatesForApp('fab');
const nighty = getVideoTemplatesForApp('nighty');

assert.equal(NIGHTY_COMPOSITIONS.length, 8, 'eight original compositions');
assert.deepEqual(
  NIGHTY_COMPOSITIONS.map((template) => template.id),
  [3, 4, 5, 6, 7, 8, 9, 10]
);

for (const template of NIGHTY_COMPOSITIONS) {
  assert.equal(template.provenance.classification, 'original');
  assert.equal(template.provenance.watchedVideo, false);
  assert.ok(template.provenance.references.length > 0);
  assert.equal(template.provenance.references.some((ref) => /sleepa/i.test(ref.sourceUrl)), false);
  for (const reference of template.provenance.references) {
    assert.ok(reference.sourceUrl.startsWith('https://'));
    assert.ok(reference.when.trim().length > 0);
    assert.ok(['secondary-index', 'organic', 'organic-or-uncertain'].includes(reference.evidence));
  }
  const fileIds = [template.defaults.soundA, template.defaults.soundB];
  for (const beat of template.defaults.beats) fileIds.push(beat.soundId);
  for (const id of fileIds) {
    const rel = nightyRainAudioSrc(id).replace(/^\//, '');
    assert.ok(fs.existsSync(path.join(root, 'public', rel)), rel);
  }
}

for (const text of customerStrings()) {
  for (const pattern of BANNED) {
    assert.equal(pattern.test(text), false, `${pattern} matched customer copy: ${text}`);
  }
}

const nightyTitles = new Set(nighty.map((card) => card.title));
for (const template of NIGHTY_COMPOSITIONS) {
  assert.ok(nightyTitles.has(template.title), template.title);
  assert.equal(
    spill.some((card) => card.title === template.title),
    false,
    `Spill It leaked ${template.title}`
  );
  assert.equal(
    fab.some((card) => card.title === template.title),
    false,
    `Fab leaked ${template.title}`
  );
  assert.equal(isNightyCompositionTemplateId(template.id), true);
}

assert.deepEqual(
  spill.map((card) => card.title),
  [
    'Couples Nature',
    'iPhone Notes',
    'Ocean sunset',
    'Fresh Baked Donut',
    'Cinematic',
    'Dark Love Letter',
    'How well do you know your girlfriend',
    'Quiz your girlfriend',
  ]
);
assert.equal(nighty.some((card) => card.title === 'Particle'), true);
assert.equal(nighty.some((card) => card.title === 'Rain'), true);
assert.equal(nighty.length, 10);

const rainRainUrls = NIGHTY_COMPOSITIONS.flatMap((template) => template.provenance.references)
  .map((reference) => reference.sourceUrl)
  .filter((url) => url.includes('pipiads.com'));
assert.equal(new Set(rainRainUrls).size, 3, 'Rain Rain references stay on three cluster URLs');

const betterSleepSecondary = NIGHTY_COMPOSITIONS.flatMap((template) =>
  template.provenance.references.filter(
    (reference) => reference.evidence === 'secondary-index' && reference.sourceUrl.includes('admanage.ai')
  )
);
assert.equal(betterSleepSecondary.length, 5, 'five BetterSleep secondary-index notes, not verified winners');

const which = NIGHTY_COMPOSITIONS[0]!;
const whichState = cloneCompositionState(which.defaults);
const early = frameAt(which, whichState, 1);
assert.ok((early.gains.find((gain) => gain.soundId === 'rain-on-window')?.gain ?? 0) > 0.9);
assert.ok((early.gains.find((gain) => gain.soundId === 'rain-on-roof')?.gain ?? 0) < 0.05);
assert.equal(early.primary, 'On the window');
const late = frameAt(which, whichState, 8);
assert.ok((late.gains.find((gain) => gain.soundId === 'rain-on-roof')?.gain ?? 0) > 0.9);
assert.equal(late.primary, 'On the roof');

const fade = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'lights-low')!;
const fadeEnd = frameAt(fade, cloneCompositionState(fade.defaults), fade.durationSec - 0.05);
assert.ok(fadeEnd.gains.every((gain) => gain.gain < 0.08));
assert.ok(fadeEnd.dim > 0.4);

const tour = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'same-night')!;
const tourStart = frameAt(tour, cloneCompositionState(tour.defaults), 0.4);
const tourOcean = frameAt(tour, cloneCompositionState(tour.defaults), 10.5);
assert.equal(tourStart.primary, 'Light rain');
assert.equal(tourOcean.primary, 'Calm waves');
assert.ok((tourOcean.gains.find((gain) => gain.soundId === 'calm-waves')?.gain ?? 0) > 0.8);

const ambience = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'window-rain')!;
assert.ok(frameAt(ambience, cloneCompositionState(ambience.defaults), 0.4).headlineOpacity < 0.05);
assert.ok(frameAt(ambience, cloneCompositionState(ambience.defaults), 7).headlineOpacity > 0.9);

console.log(
  `ok: ${NIGHTY_COMPOSITIONS.length} original Nighty compositions, Spill It unchanged, audio files present`
);
