import { NIGHTY_RAIN_SOUND_OPTIONS, type NightyRainSoundId } from '@/app/lib/constants';

/**
 * Original Nighty video compositions for the Nighty Video tab.
 *
 * These are not recreations of competitor ads. Research supplied text hooks
 * and links only — no video files — so nothing here is a frame copy.
 * Competitor names stay in `references` for the operator. On-video copy is
 * original and limited to verified Nighty facts plus the rain and ocean
 * files already stored in this app.
 *
 * Count: 8 originals. Not a 25-ad quota.
 * BetterSleep rows in the research manifest are secondary-index entries.
 * Rain Rain's five copy flights share three source URLs, not five confirmed videos.
 * Dark Noise and Rainy Mood are organic references. Sleepa had no paid refs.
 */

export type NightySceneId = 'night' | 'ocean' | 'room';

export type NightyCompositionLayout =
  | 'compare'
  | 'statement'
  | 'card'
  | 'sequence'
  | 'ambience'
  | 'tour';

export type NightyEvidence = 'secondary-index' | 'organic' | 'organic-or-uncertain';

export type NightyTemplateReference = {
  id: string;
  evidence: NightyEvidence;
  sourceUrl: string;
  /** Date text from the research note. Not a performance metric. */
  when: string;
  /** Mechanism kept, and the wording or claim this original refuses. */
  note: string;
};

/** Public App Store listing for Nighty. Not burned into the picture as a long URL. */
export const NIGHTY_APP_STORE_URL =
  'https://apps.apple.com/us/app/nighty-sleep-and-sound/id6804306705';

/** Short end line. Empty string hides it. */
export const NIGHTY_DEFAULT_END_CTA = 'App Store';

export type NightyBeat = {
  label: string;
  soundId: NightyRainSoundId;
};

export type NightyCompositionState = {
  headline: string;
  subline: string;
  scene: NightySceneId;
  labelA: string;
  labelB: string;
  soundA: NightyRainSoundId;
  soundB: NightyRainSoundId;
  /** Seconds of gentle fade at the end. 0 leaves the bed at full level. */
  fadeOutSec: number;
  /** Small end line under the Nighty mark. Empty hides it. */
  endCta: string;
  beats: NightyBeat[];
};

export type NightyCompositionTemplate = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  layout: NightyCompositionLayout;
  durationSec: number;
  defaults: NightyCompositionState;
  provenance: {
    classification: 'original';
    /** No source MP4 was downloaded, so this cannot be a frame match. */
    watchedVideo: false;
    summary: string;
    references: NightyTemplateReference[];
  };
};

const NIGHT: NightySceneId = 'night';
const ROOM: NightySceneId = 'room';

function state(
  partial: Omit<NightyCompositionState, 'endCta'> & { endCta?: string }
): NightyCompositionState {
  return { endCta: NIGHTY_DEFAULT_END_CTA, ...partial };
}

export const NIGHTY_COMPOSITIONS: readonly NightyCompositionTemplate[] = [
  {
    id: 3,
    slug: 'which-rain',
    title: 'Which rain',
    subtitle: 'Window, then roof',
    layout: 'compare',
    durationSec: 10,
    defaults: state({
      headline: 'Which rain is this?',
      subline: 'Nighty',
      scene: NIGHT,
      labelA: 'On the window',
      labelB: 'On the roof',
      soundA: 'rain-on-window',
      soundB: 'rain-on-roof',
      fadeOutSec: 0,
      beats: [],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original A/B of two Nighty rain textures. The reference is a curiosity-comparison mechanism, not a shot match.',
      references: [
        {
          id: 'ig-reel-C9V_0TOMcji',
          evidence: 'organic',
          sourceUrl: 'https://www.instagram.com/bettersleep/reel/C9V_0TOMcji/',
          when: 'July 2024',
          note: 'Official brand Reel. Not a verified paid placement and not watched as video. This composition compares owned rain textures instead of copying that reel.',
        },
      ],
    },
  },
  {
    id: 4,
    slug: 'light-or-heavy',
    title: 'Light or heavy',
    subtitle: 'Two rain intensities',
    layout: 'compare',
    durationSec: 10,
    defaults: state({
      headline: 'Light, or heavy?',
      subline: 'Nighty',
      scene: NIGHT,
      labelA: 'Light rain',
      labelB: 'Heavy rain',
      soundA: 'light-rain',
      soundB: 'heavy-rain',
      fadeOutSec: 0,
      beats: [],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original intensity comparison using the light-rain and heavy-rain files in this app. Noise-color sounds from the reference are not in the library, so they are not claimed.',
      references: [
        {
          id: 'fb-page-1508548876778096',
          evidence: 'organic-or-uncertain',
          sourceUrl:
            'https://www.facebook.com/bettersleep/videos/green-%EF%B8%8F-brown-pink-noise-try-them-all/1508548876778096/',
          when: 'Page video; paid use not confirmed',
          note: 'Hook was a noise-color comparison. Not watched. This original compares light and heavy rain only.',
        },
      ],
    },
  },
  {
    id: 5,
    slug: 'lights-low',
    title: 'Lights low',
    subtitle: 'One sound, then a fade',
    layout: 'statement',
    durationSec: 8,
    defaults: state({
      headline: 'Lights low.',
      subline: 'One sound for the night.',
      scene: NIGHT,
      labelA: '',
      labelB: '',
      soundA: 'light-rain',
      soundB: 'light-rain',
      fadeOutSec: 2.5,
      beats: [],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original bedtime line plus the verified gentle fade. It does not reuse the reference metaphor or a screen recording.',
      references: [
        {
          id: 'admanage-94424',
          evidence: 'secondary-index',
          sourceUrl: 'https://admanage.ai/ad/94424',
          when: 'Index date Feb 28, 2026; title says Jan 2025',
          note: 'Secondary index only, not a verified top performer. Mechanism was “pick a sound and start it.” Refused the massage line. No video file.',
        },
        {
          id: 'dn-yt-SLjjZ2k0ld0',
          evidence: 'organic',
          sourceUrl: 'https://www.youtube.com/watch?v=SLjjZ2k0ld0',
          when: 'Organic YouTube demo',
          note: 'Organic product walkthrough, not a paid ad. Used only as a fade-out idea. This is not a widget or screen-recording copy.',
        },
      ],
    },
  },
  {
    id: 6,
    slug: 'no-account',
    title: 'No account',
    subtitle: 'Rain without signing in',
    layout: 'card',
    durationSec: 8,
    defaults: state({
      headline: 'No account.',
      subline: 'The rain starts anyway.',
      scene: ROOM,
      labelA: 'Rain on the roof',
      labelB: '',
      soundA: 'rain-on-roof',
      soundB: 'rain-on-roof',
      fadeOutSec: 2,
      beats: [],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original privacy line. Nighty’s verified fact here is no account, plus a fade. Star ratings and slogan swaps were refused.',
      references: [
        {
          id: 'admanage-5079398',
          evidence: 'secondary-index',
          sourceUrl: 'https://admanage.ai/ad/5079398',
          when: 'Jul 30, 2026 (index)',
          note: 'Secondary index. Social-proof and star wording refused. No video file.',
        },
        {
          id: 'admanage-94521',
          evidence: 'secondary-index',
          sourceUrl: 'https://admanage.ai/ad/94521',
          when: 'Feb 28, 2026 (index)',
          note: 'Secondary index. The indexed slogan was not reused. No video file.',
        },
      ],
    },
  },
  {
    id: 7,
    slug: 'window-rain',
    title: 'Window rain',
    subtitle: 'Mostly the sound',
    layout: 'ambience',
    durationSec: 8,
    defaults: state({
      headline: 'Rain on the window.',
      subline: 'Nighty',
      scene: ROOM,
      labelA: '',
      labelB: '',
      soundA: 'rain-on-window',
      soundB: 'rain-on-window',
      fadeOutSec: 0,
      beats: [],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original near-silent rain piece. The reference is an old organic rain video, not a paid ad and not a frame copy.',
      references: [
        {
          id: 'rm-yt-SDmbGrQqWog',
          evidence: 'organic',
          sourceUrl: 'https://www.youtube.com/watch?v=SDmbGrQqWog',
          when: '2012-01-12',
          note: 'Organic rain video. Not watched as a file. This uses Nighty rain-on-window audio only.',
        },
      ],
    },
  },
  {
    id: 8,
    slug: 'the-rain-stays',
    title: 'The rain stays',
    subtitle: 'A short bedtime',
    layout: 'sequence',
    durationSec: 9,
    defaults: state({
      headline: 'The light goes off.',
      subline: 'The rain stays on.',
      scene: ROOM,
      labelA: '',
      labelB: '',
      soundA: 'heavy-rain',
      soundB: 'heavy-rain',
      fadeOutSec: 2.2,
      beats: [],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original two-line bedtime. Five Rain Rain copy flights in research share three source URLs from 2022; they are not five confirmed videos, and their slogans are not used.',
      references: [
        {
          id: 'pipiads-1726052079270961',
          evidence: 'secondary-index',
          sourceUrl:
            'https://www.pipiads.com/tiktok-ads-examples/rainrainsleepsounds-tiktok-ads-1726052079270961',
          when: '2022 (first seen March; flights through December)',
          note: 'One historical TikTok cluster URL carrying more than one text flight, including a one-day white-noise line. Secondary index, not ROAS. White noise was not adapted — that file is not in this app. Slogans about easy or hard sleep were refused.',
        },
        {
          id: 'pipiads-1732650954378273',
          evidence: 'secondary-index',
          sourceUrl:
            'https://www.pipiads.com/tiktok-ads-examples/rainrainsleepsounds-tiktok-ads-1732650954378273',
          when: 'Jun 7, 2022 – Jul 12, 2022',
          note: 'Historical secondary index. A “sleep faster” claim was refused. No video file.',
        },
        {
          id: 'pipiads-1743890202520610',
          evidence: 'secondary-index',
          sourceUrl:
            'https://www.pipiads.com/tiktok-ads-examples/rainrainsleepsounds-tiktok-ads-1743890202520610',
          when: 'Sep 23, 2022 – Oct 11, 2022',
          note: 'Third cluster URL, not a fifth distinct confirmed video. Brand-swap slogan refused. No video file.',
        },
      ],
    },
  },
  {
    id: 9,
    slug: 'same-night',
    title: 'Same night',
    subtitle: 'Four owned sounds',
    layout: 'tour',
    durationSec: 12,
    defaults: state({
      headline: 'Same night.',
      subline: 'Nighty',
      scene: NIGHT,
      labelA: '',
      labelB: '',
      soundA: 'light-rain',
      soundB: 'calm-waves',
      fadeOutSec: 0,
      beats: [
        { label: 'Light rain', soundId: 'light-rain' },
        { label: 'Heavy rain', soundId: 'heavy-rain' },
        { label: 'Rain on trees', soundId: 'rain-on-trees' },
        { label: 'Calm waves', soundId: 'calm-waves' },
      ],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original tour of four files already in this app: three rains and calm waves. Not a screen recording and not a control-center demo.',
      references: [
        {
          id: 'dn-yt-SLjjZ2k0ld0',
          evidence: 'organic',
          sourceUrl: 'https://www.youtube.com/watch?v=SLjjZ2k0ld0',
          when: 'Organic YouTube demo',
          note: 'Organic walkthrough, not a paid ad. Not watched as a file. Sequence-of-sounds idea only.',
        },
        {
          id: 'dn-yt-AffvLwYXnfU',
          evidence: 'organic',
          sourceUrl: 'https://www.youtube.com/watch?v=AffvLwYXnfU',
          when: 'Organic YouTube demo',
          note: 'Second organic demo link. Widgets were not copied.',
        },
      ],
    },
  },
  {
    id: 10,
    slug: 'less-on-the-screen',
    title: 'Less on the screen',
    subtitle: 'Rain, then a fade',
    layout: 'statement',
    durationSec: 8,
    defaults: state({
      headline: 'Less on the screen.',
      subline: 'Just the rain.',
      scene: ROOM,
      labelA: '',
      labelB: '',
      soundA: 'rain-on-trees',
      soundB: 'rain-on-trees',
      fadeOutSec: 2.4,
      beats: [],
    }),
    provenance: {
      classification: 'original',
      watchedVideo: false,
      summary:
        'Original quiet line. Two secondary-index entries share one hook and were not treated as two verified winners or copied.',
      references: [
        {
          id: 'admanage-94432',
          evidence: 'secondary-index',
          sourceUrl: 'https://admanage.ai/ad/94432',
          when: 'Index date Feb 28, 2026; title says Sep 2025',
          note: 'Secondary index. Same hook family as 94395, different asset id. Anxiety, “hundreds of sounds,” and reach figures were not used. No video file.',
        },
        {
          id: 'admanage-94395',
          evidence: 'secondary-index',
          sourceUrl: 'https://admanage.ai/ad/94395',
          when: 'Index date Feb 28, 2026; title says Jan 2025',
          note: 'Secondary index. Not a separate confirmed video. Same refusal as 94432.',
        },
      ],
    },
  },
];

const edits = new Map<number, NightyCompositionState>();
const EDIT_STORAGE_KEY = 'nighty-composition-edits-v1';
const SOUND_IDS = new Set(NIGHTY_RAIN_SOUND_OPTIONS.map((sound) => sound.id));
const SCENE_IDS = new Set<NightySceneId>(['night', 'ocean', 'room']);

function browserStorage(): Storage | null {
  try {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isCompositionState(value: unknown): value is NightyCompositionState {
  if (!value || typeof value !== 'object') return false;
  const state = value as NightyCompositionState;
  if (typeof state.headline !== 'string' || typeof state.subline !== 'string') return false;
  if (typeof state.labelA !== 'string' || typeof state.labelB !== 'string') return false;
  if (typeof state.endCta !== 'string' || typeof state.fadeOutSec !== 'number') return false;
  if (!SCENE_IDS.has(state.scene)) return false;
  if (!SOUND_IDS.has(state.soundA) || !SOUND_IDS.has(state.soundB)) return false;
  if (!Array.isArray(state.beats)) return false;
  return state.beats.every(
    (beat) =>
      !!beat &&
      typeof beat.label === 'string' &&
      SOUND_IDS.has(beat.soundId)
  );
}

function readStoredEdits(): Record<string, NightyCompositionState> {
  const storage = browserStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(EDIT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const kept: Record<string, NightyCompositionState> = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (isCompositionState(value)) kept[id] = value;
    }
    return kept;
  } catch {
    return {};
  }
}

function writeStoredEdits(all: Record<string, NightyCompositionState>): void {
  const storage = browserStorage();
  if (!storage) return;
  try {
    storage.setItem(EDIT_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* private mode or a full disk; the in-memory copy still works this tab */
  }
}

export function cloneCompositionState(state: NightyCompositionState): NightyCompositionState {
  return {
    ...state,
    beats: state.beats.map((beat) => ({ ...beat })),
  };
}

export function isNightyCompositionTemplateId(id: number | null | undefined): id is number {
  return typeof id === 'number' && NIGHTY_COMPOSITIONS.some((template) => template.id === id);
}

export function getNightyComposition(id: number): NightyCompositionTemplate {
  const template = NIGHTY_COMPOSITIONS.find((item) => item.id === id);
  if (!template) throw new Error(`Unknown Nighty composition ${id}`);
  return template;
}

export function nightyCompositionCards(): { id: number; title: string; subtitle: string }[] {
  return NIGHTY_COMPOSITIONS.map((template) => ({
    id: template.id,
    title: template.title,
    subtitle: template.subtitle,
  }));
}

export function loadCompositionState(template: NightyCompositionTemplate): NightyCompositionState {
  const memory = edits.get(template.id);
  if (memory) return cloneCompositionState(memory);
  const stored = readStoredEdits()[String(template.id)];
  if (stored) {
    const next = cloneCompositionState(stored);
    edits.set(template.id, next);
    return cloneCompositionState(next);
  }
  return cloneCompositionState(template.defaults);
}

export function saveCompositionState(id: number, state: NightyCompositionState): void {
  const next = cloneCompositionState(state);
  edits.set(id, next);
  const all = readStoredEdits();
  all[String(id)] = next;
  writeStoredEdits(all);
}

export function resetCompositionState(id: number): void {
  edits.delete(id);
  const all = readStoredEdits();
  delete all[String(id)];
  writeStoredEdits(all);
}

export function clampFadeOutSec(value: number, durationSec: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(0, value), Math.max(0, durationSec - 0.5));
}
