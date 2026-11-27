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
import {
  referenceDarken,
  referenceUnit,
  seedScatterOccupancy,
} from '../app/lib/nighty-video-templates/reference-paint';

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
  /overthinking/i,
  /blocks your brain/i,
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

const originals = NIGHTY_COMPOSITIONS.filter(
  (template) => template.provenance.classification === 'original'
);
const supplied = NIGHTY_COMPOSITIONS.filter(
  (template) => template.provenance.classification === 'supplied-reference'
);
assert.equal(originals.length, 8, 'eight original compositions');
assert.equal(supplied.length, 3, 'three supplied-reference recreations');
assert.equal(NIGHTY_COMPOSITIONS.length, 11);
assert.deepEqual(
  originals.map((template) => template.id),
  [3, 4, 5, 6, 7, 8, 9, 10]
);
assert.deepEqual(
  supplied.map((template) => template.id),
  [11, 12, 13]
);

for (const template of NIGHTY_COMPOSITIONS) {
  const suppliedRef = template.provenance.classification === 'supplied-reference';
  assert.equal(template.provenance.watchedVideo, suppliedRef);
  assert.ok(template.provenance.references.length > 0);
  assert.equal(template.provenance.references.some((ref) => /sleepa/i.test(ref.sourceUrl)), false);
  for (const reference of template.provenance.references) {
    assert.ok(reference.when.trim().length > 0);
    if (suppliedRef) {
      assert.equal(reference.evidence, 'supplied-reference');
      assert.equal(reference.sourceUrl.startsWith('http'), false);
    } else {
      assert.ok(reference.sourceUrl.startsWith('https://'));
      assert.ok(['secondary-index', 'organic', 'organic-or-uncertain'].includes(reference.evidence));
    }
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
assert.equal(nighty.some((card) => card.title === 'Reference 1'), true);
assert.equal(nighty.some((card) => card.title === 'Reference 2'), true);
assert.equal(nighty.some((card) => card.title === 'Reference 3'), true);
assert.equal(nighty.length, 13);

assert.deepEqual(
  supplied.map((template) => template.slug),
  ['reference-1', 'reference-2', 'reference-3']
);
assert.deepEqual(
  supplied.map((template) => template.layout),
  ['particle-terrain', 'kaleidoscope', 'vortex']
);
assert.deepEqual(
  supplied.map((template) => template.durationSec),
  [9.045, 12.003, 10.048]
);
assert.ok(supplied.every((template) => template.exportFps === 30));
assert.ok(supplied.every((template) => template.defaults.endCta === ''));
assert.ok(supplied.every((template) => template.defaults.fadeOutSec === 0));
assert.deepEqual(
  supplied.map((template) => template.defaults.headline.split('\n').length),
  [4, 3, 4]
);
assert.equal(supplied[0]?.defaults.soundA, 'brown-noise');
assert.equal(supplied[1]?.defaults.soundA, 'white-noise');
assert.equal(supplied[2]?.defaults.soundA, 'gentle-waves');
for (const template of supplied) {
  const state = cloneCompositionState(template.defaults);
  const start = frameAt(template, state, 0);
  const end = frameAt(template, state, template.durationSec);
  assert.equal(start.headlineOpacity, 1);
  assert.equal(end.headlineOpacity, 1);
  assert.equal(start.brandOpacity, 0);
  assert.equal(start.endCtaOpacity, 0);
  assert.equal(end.endCtaOpacity, 0);
  assert.equal(start.rain, 0);
  assert.equal(start.waves, 0);
  assert.equal(start.dim, 0);
  assert.ok((start.gains.find((gain) => gain.soundId === template.defaults.soundA)?.gain ?? 0) > 0.9);
}
assert.equal(referenceDarken('kaleidoscope', 9.9, 12.003), 0);
assert.ok(referenceDarken('kaleidoscope', 11, 12.003) > 0.4);
assert.ok(referenceDarken('kaleidoscope', 12.003, 12.003) > 0.95);
assert.equal(referenceDarken('vortex', 11, 10.048), 0);
assert.equal(referenceDarken('particle-terrain', 8, 9.045), 0);

const scatterBins = 24;
const scatterCount = 4000;
for (const [saltA, saltB] of [
  [1, 2],
  [3, 11],
  [20, 21],
] as const) {
  const occupied = seedScatterOccupancy(scatterCount, scatterBins, saltA, saltB);
  assert.ok(
    occupied > scatterBins * scatterBins * 0.85,
    `seeds (${saltA},${saltB}) occupied ${occupied}/${scatterBins * scatterBins}, expected a filled plane`
  );
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < scatterCount; i += 1) {
    const x = referenceUnit(i, saltA);
    const y = referenceUnit(i, saltB);
    sx += x;
    sy += y;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  }
  const meanX = sx / scatterCount;
  const meanY = sy / scatterCount;
  const varX = sxx / scatterCount - meanX * meanX;
  const varY = syy / scatterCount - meanY * meanY;
  const cov = sxy / scatterCount - meanX * meanY;
  const r2 = (cov * cov) / (varX * varY);
  assert.ok(r2 < 0.02, `seeds (${saltA},${saltB}) correlation r2=${r2}`);
  const trace = varX + varY;
  const det = varX * varY - cov * cov;
  const gap = Math.sqrt(Math.max(0, (trace * trace) / 4 - det));
  const major = trace / 2 + gap;
  const minor = trace / 2 - gap;
  assert.ok(minor / major > 0.45, `seeds (${saltA},${saltB}) eigen ratio ${minor / major}`);
}

function affineUnit(n: number): number {
  const x = (Math.imul(n, 1664525) + 1013904223) >>> 0;
  return (x & 0xffffff) / 0x1000000;
}
{
  const bins = 24;
  const grid = new Uint8Array(bins * bins);
  let occupied = 0;
  for (let i = 0; i < 4000; i += 1) {
    const x = Math.min(bins - 1, Math.floor(affineUnit(i + 3) * bins));
    const y = Math.min(bins - 1, Math.floor(affineUnit(i + 11) * bins));
    const cell = y * bins + x;
    if (grid[cell] === 0) {
      grid[cell] = 1;
      occupied += 1;
    }
  }
  assert.ok(occupied < bins * 3, `affine hash should stay near a line, occupied ${occupied}`);
}

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
      `ok: ${originals.length} original Nighty compositions, ${supplied.length} supplied references, Spill It unchanged, audio files present, WebM falls back without system ffmpeg`
    );
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
