import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { NIGHTY_SOURCE_SOUND_OPTIONS, nightySourceAudioSrc } from '../app/lib/nighty-video-templates/sounds';
import { getVideoTemplatesForApp } from '../app/lib/apps';
import {
  NIGHTY_COMPOSITIONS,
  cloneCompositionState,
  isNightyCompositionTemplateId,
  loadCompositionState,
  resetCompositionState,
  saveCompositionState,
} from '../app/lib/nighty-video-templates/catalog';
import { finalizeNightyRecording } from '../app/lib/nighty-video-templates/finalize-export';
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
    strings.push(template.defaults.labelA, template.defaults.labelB, template.defaults.endCta);
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
    const rel = nightySourceAudioSrc(id).replace(/^\//, '');
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
assert.equal(early.primary, 'Rain on window');
const late = frameAt(which, whichState, 8);
assert.ok((late.gains.find((gain) => gain.soundId === 'rain-on-roof')?.gain ?? 0) > 0.9);
assert.equal(late.primary, 'Rain on roof');

const fade = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'lights-low')!;
const fadeEnd = frameAt(fade, cloneCompositionState(fade.defaults), fade.durationSec - 0.05);
assert.ok(fadeEnd.gains.every((gain) => gain.gain < 0.08));
assert.ok(fadeEnd.dim > 0.4);

const tour = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'same-night')!;
const tourStart = frameAt(tour, cloneCompositionState(tour.defaults), 0.4);
const tourOcean = frameAt(tour, cloneCompositionState(tour.defaults), 10.5);
assert.equal(tourStart.primary, 'Light rain on cement');
assert.equal(tourOcean.primary, 'Gentle Waves');
assert.ok((tourOcean.gains.find((gain) => gain.soundId === 'gentle-waves')?.gain ?? 0) > 0.8);

const ambience = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'window-rain')!;
assert.ok(frameAt(ambience, cloneCompositionState(ambience.defaults), 0.4).headlineOpacity < 0.05);
assert.ok(frameAt(ambience, cloneCompositionState(ambience.defaults), 7).headlineOpacity > 0.9);

const lights = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'lights-low')!;
const lightsState = cloneCompositionState(lights.defaults);
assert.equal(lightsState.endCta, 'App Store');
assert.ok(frameAt(lights, lightsState, 1).endCtaOpacity < 0.05);
const lightsEnd = frameAt(lights, lightsState, lights.durationSec - 0.15);
assert.ok(lightsEnd.endCtaOpacity > 0.85);
assert.equal(lightsEnd.endCta, 'App Store');
const hidden = frameAt(lights, { ...lightsState, endCta: '   ' }, lights.durationSec - 0.15);
assert.equal(hidden.endCtaOpacity, 0);

const paintSrc = fs.readFileSync(
  path.join(root, 'app/lib/nighty-video-templates/paint.ts'),
  'utf8'
);
assert.equal(paintSrc.includes('Fading out'), false);

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  },
});

const editable = NIGHTY_COMPOSITIONS.find((template) => template.slug === 'lights-low')!;
const edited = cloneCompositionState(editable.defaults);
edited.headline = 'Saved in this browser';
edited.endCta = 'App Store';
saveCompositionState(editable.id, edited);
assert.equal(loadCompositionState(editable).headline, 'Saved in this browser');
assert.ok(store.get('nighty-composition-edits-v2')?.includes('Saved in this browser'));
resetCompositionState(editable.id);
assert.equal(loadCompositionState(editable).headline, editable.defaults.headline);
assert.equal(store.get('nighty-composition-edits-v2')?.includes('Saved in this browser'), false);

for (const sound of NIGHTY_SOURCE_SOUND_OPTIONS) {
  const rel = sound.audioSrc.replace(/^\//, '');
  const bytes = fs.readFileSync(path.join(root, 'public', rel));
  const digest = createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest, sound.sha256, sound.id);
}
for (const legacy of ['light-rain.mp3', 'calm-waves.mp3', 'rain-on-trees.mp3', 'heavy-rain.mp3']) {
  assert.ok(fs.existsSync(path.join(root, 'public/nighty-rain', legacy)), legacy);
}

async function checkExportFallback(): Promise<void> {
  const webm = new Blob(['webm-bytes'], { type: 'video/webm' });
  const mp4 = new Blob(['mp4-bytes'], { type: 'video/mp4' });
  const converted = await finalizeNightyRecording({ blob: webm, extension: 'webm' }, async () => mp4);
  assert.equal(converted.extension, 'mp4');
  assert.equal(converted.fallback, false);
  assert.equal(await converted.blob.text(), 'mp4-bytes');

  const failed = await finalizeNightyRecording({ blob: webm, extension: 'webm' }, async () => {
    throw new Error('ffmpeg.wasm unavailable');
  });
  assert.equal(failed.extension, 'webm');
  assert.equal(failed.fallback, true);
  assert.equal(await failed.blob.text(), 'webm-bytes');

  const timedOut = await finalizeNightyRecording(
    { blob: webm, extension: 'webm' },
    () => new Promise<Blob>(() => undefined),
    30
  );
  assert.equal(timedOut.extension, 'webm');
  assert.equal(timedOut.fallback, true);

  const alreadyMp4 = await finalizeNightyRecording({ blob: mp4, extension: 'mp4' }, async () => {
    throw new Error('should not transcode');
  });
  assert.equal(alreadyMp4.extension, 'mp4');
  assert.equal(alreadyMp4.fallback, false);
}

checkExportFallback()
  .then(() => {
    console.log(
      `ok: ${NIGHTY_COMPOSITIONS.length} original Nighty compositions, Spill It unchanged, audio files present, WebM falls back without system ffmpeg`
    );
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
