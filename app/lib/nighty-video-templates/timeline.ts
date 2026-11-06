import { nightyRainSoundOption, type NightyRainSoundId } from '@/app/lib/constants';
import {
  clampFadeOutSec,
  type NightyCompositionState,
  type NightyCompositionTemplate,
} from '@/app/lib/nighty-video-templates/catalog';

export type NightySoundGain = {
  soundId: NightyRainSoundId;
  gain: number;
};

export type NightyFrame = {
  t: number;
  duration: number;
  scene: NightyCompositionState['scene'];
  layout: NightyCompositionTemplate['layout'];
  headline: string;
  headlineOpacity: number;
  primary: string;
  primaryOpacity: number;
  subline: string;
  sublineOpacity: number;
  brandOpacity: number;
  showCard: boolean;
  cardLabel: string;
  endCta: string;
  /** 0–1. Rises in the last moments. The line is drawn after the fade dim. */
  endCtaOpacity: number;
  activeIndex: number | null;
  slotCount: number;
  gains: NightySoundGain[];
  rain: number;
  waves: number;
  /** Extra darkness as the ending fade progresses, 0–1. */
  dim: number;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function pushGain(gains: NightySoundGain[], soundId: NightyRainSoundId, gain: number): void {
  if (gain <= 0.001) return;
  const existing = gains.find((item) => item.soundId === soundId);
  if (existing) existing.gain = Math.min(1, existing.gain + gain);
  else gains.push({ soundId, gain: Math.min(1, gain) });
}

function moodFromGains(gains: NightySoundGain[]): { rain: number; waves: number } {
  let rain = 0;
  let waves = 0;
  for (const item of gains) {
    const kind = nightyRainSoundOption(item.soundId).kind;
    if (kind === 'waves') waves += item.gain;
    else rain += item.gain;
  }
  return { rain: clamp01(rain), waves: clamp01(waves) };
}

export function compositionSoundIds(
  template: NightyCompositionTemplate,
  state: NightyCompositionState
): NightyRainSoundId[] {
  const ids: NightyRainSoundId[] = [];
  const add = (id: NightyRainSoundId) => {
    if (!ids.includes(id)) ids.push(id);
  };
  if (template.layout === 'tour') {
    for (const beat of state.beats) add(beat.soundId);
    return ids;
  }
  add(state.soundA);
  if (template.layout === 'compare') add(state.soundB);
  return ids;
}

export function frameAt(
  template: NightyCompositionTemplate,
  state: NightyCompositionState,
  timeSec: number
): NightyFrame {
  const duration = template.durationSec;
  const t = Math.min(Math.max(0, timeSec), duration);
  const fadeOutSec = clampFadeOutSec(state.fadeOutSec, duration);
  const gains: NightySoundGain[] = [];
  let headlineOpacity = 1;
  let sublineOpacity = 1;
  let primary = '';
  const primaryOpacity = 1;
  let brandOpacity = 0.92;
  let showCard = false;
  let cardLabel = '';
  let activeIndex: number | null = null;
  let slotCount = 0;

  if (template.layout === 'compare') {
    const split = duration / 2;
    const mix = smoothstep(split - 0.35, split + 0.35, t);
    pushGain(gains, state.soundA, 1 - mix);
    pushGain(gains, state.soundB, mix);
    primary = mix < 0.5 ? state.labelA : state.labelB;
    activeIndex = mix < 0.5 ? 0 : 1;
    slotCount = 2;
  } else if (template.layout === 'tour') {
    const beats = state.beats.length > 0 ? state.beats : [{ label: 'Rain', soundId: state.soundA }];
    const beatLen = duration / beats.length;
    const cross = Math.min(0.35, beatLen * 0.25);
    let best = 0;
    let bestGain = -1;
    beats.forEach((beat, index) => {
      const local = t - index * beatLen;
      let gain = 1;
      if (index > 0) gain *= smoothstep(0, cross, local);
      if (index < beats.length - 1) gain *= 1 - smoothstep(beatLen - cross, beatLen, local);
      gain = clamp01(gain);
      pushGain(gains, beat.soundId, gain);
      if (gain > bestGain) {
        bestGain = gain;
        best = index;
      }
    });
    primary = beats[best]?.label ?? '';
    activeIndex = best;
    slotCount = beats.length;
  } else if (template.layout === 'sequence') {
    const mix = smoothstep(duration * 0.42, duration * 0.52, t);
    headlineOpacity = 1 - mix;
    sublineOpacity = mix;
    pushGain(gains, state.soundA, 1);
  } else if (template.layout === 'ambience') {
    const appear = smoothstep(duration * 0.5, duration * 0.7, t);
    headlineOpacity = appear;
    sublineOpacity = appear;
    brandOpacity = appear;
    pushGain(gains, state.soundA, 1);
  } else {
    showCard = template.layout === 'card';
    cardLabel = state.labelA.trim();
    pushGain(gains, state.soundA, 1);
  }

  let master = 1;
  if (fadeOutSec > 0) {
    const start = duration - fadeOutSec;
    master = 1 - smoothstep(start, duration, t);
    for (const item of gains) item.gain *= master;
  }

  const mood = moodFromGains(gains);
  const sublineIsBrand = state.subline.trim().toLowerCase() === 'nighty';
  const endCta = state.endCta.trim();
  const ctaStart = Math.max(0, duration - 1.7);
  const endCtaOpacity = endCta
    ? smoothstep(ctaStart, Math.min(duration, ctaStart + 0.65), t)
    : 0;
  const settledBrand =
    brandOpacity * (template.layout === 'ambience' ? 1 : Math.max(master, 0.35));

  return {
    t,
    duration,
    scene: state.scene,
    layout: template.layout,
    headline: state.headline,
    headlineOpacity,
    primary,
    primaryOpacity,
    subline: sublineIsBrand ? '' : state.subline,
    sublineOpacity: sublineIsBrand ? 0 : sublineOpacity,
    brandOpacity: settledBrand * (1 - endCtaOpacity),
    showCard,
    cardLabel,
    endCta,
    endCtaOpacity,
    activeIndex,
    slotCount,
    gains,
    rain: mood.rain,
    waves: mood.waves,
    dim: fadeOutSec > 0 ? (1 - master) * 0.62 : 0,
  };
}
