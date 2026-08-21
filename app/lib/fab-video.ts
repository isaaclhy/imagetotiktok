/** Pexels search queries for Fab Notes video background. */
export const FAB_NOTES_PEXELS_QUERIES = [
  'couples beach',
  'full of flowers',
  'waves',
  'pink trippy',
  'beach sunset',
] as const;

export const FAB_NOTES_FOOTER = '💕 More on Spill It Couples Questions 💕';

export const FAB_NOTES_MAX_DURATION_SEC = 9;

/** Cap export canvas so bitrate isn't spread across 4K Pexels sources. */
export const FAB_NOTES_EXPORT_MAX_WIDTH = 1080;
export const FAB_NOTES_EXPORT_MAX_HEIGHT = 1920;

/** ~8 Mbps — stable 1080p30 encode without dropping frames as often as 10 Mbps. */
export const FAB_NOTES_EXPORT_VIDEO_BITRATE = 8_000_000;

/** Fab affirmation montage (video template 1). */
export const FAB_AFFIRMATION_PEXELS_QUERIES = [
  'soft aesthetic',
  'flowers sunlight',
  'ocean waves calm',
  'pink clouds',
  'golden hour nature',
  'self care aesthetic',
  'candle soft light',
  'beach sunset',
] as const;

export type FabMontageVideoStyleId =
  | 'random'
  | 'pink-dreamy'
  | 'pink-aura-abstract'
  | 'pink-super-galaxy';

export const FAB_AFFIRMATION_VIDEO_STYLES: {
  id: FabMontageVideoStyleId;
  label: string;
  /** Fixed Pexels query; null = pick randomly from FAB_AFFIRMATION_PEXELS_QUERIES. */
  query: string | null;
}[] = [
  { id: 'random', label: 'Random', query: null },
  { id: 'pink-dreamy', label: 'Pink dreamy', query: 'Pink dreamy' },
  { id: 'pink-aura-abstract', label: 'Pink aura abstract', query: 'pink aura abstract' },
  { id: 'pink-super-galaxy', label: 'Pink super galaxy', query: 'pink super galaxy' },
];

export const FAB_AFFIRMATION_DEFAULT_VIDEO_STYLE: FabMontageVideoStyleId = 'random';

export function resolveFabAffirmationPexelsQuery(styleId: FabMontageVideoStyleId): string {
  const style = FAB_AFFIRMATION_VIDEO_STYLES.find((s) => s.id === styleId);
  if (style?.query) return style.query;
  return FAB_AFFIRMATION_PEXELS_QUERIES[
    Math.floor(Math.random() * FAB_AFFIRMATION_PEXELS_QUERIES.length)
  ]!;
}

export const FAB_AFFIRMATION_CLIP_COUNT = 5;
/** Background montage cut length (independent of affirmation / TTS timing). */
export const FAB_AFFIRMATION_SECONDS_PER_CLIP = 0.5;
export const FAB_AFFIRMATION_TEXT_COUNT = 5;
/** Silence between spoken affirmations (text is hidden during the gap). */
export const FAB_AFFIRMATION_TTS_GAP_SEC = 0.1;
/** Default ElevenLabs female voice (Rachel). Override with ELEVENLABS_VOICE_ID. */
export const FAB_AFFIRMATION_TTS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
export const FAB_AFFIRMATION_TTS_MODEL = 'eleven_flash_v2_5';
/** Speaking rate for manifestation tone (1 = normal). Applied to ElevenLabs + browser voice. */
export const FAB_AFFIRMATION_SPEECH_RATE = 0.82;
/** Calmer, less dramatic delivery for affirmation / manifestation reads. */
export const FAB_AFFIRMATION_TTS_VOICE_SETTINGS = {
  stability: 0.72,
  similarity_boost: 0.68,
  style: 0.12,
  use_speaker_boost: true,
  speed: FAB_AFFIRMATION_SPEECH_RATE,
} as const;

export type FabTtsProviderId = 'browser' | 'elevenlabs';

export const FAB_AFFIRMATION_TTS_PROVIDERS: {
  id: FabTtsProviderId;
  label: string;
}[] = [
  { id: 'browser', label: 'Browser (free)' },
  { id: 'elevenlabs', label: 'ElevenLabs' },
];

/** Default to free browser voice so testing doesn’t burn ElevenLabs credits. */
export const FAB_AFFIRMATION_DEFAULT_TTS_PROVIDER: FabTtsProviderId = 'browser';

export type FabAmbientSoundId = 'none' | 'waterflow' | 'soft-beats' | 'soft-rain';

export const FAB_AFFIRMATION_AMBIENT_SOUNDS: {
  id: FabAmbientSoundId;
  label: string;
  /** Public path under /fab-ambiance/; null = no bed. */
  src: string | null;
}[] = [
  { id: 'none', label: 'None', src: null },
  { id: 'waterflow', label: 'Waterflow', src: '/fab-ambiance/waterflow.mp3' },
  { id: 'soft-beats', label: 'Soft beats', src: '/fab-ambiance/soft-beats.mp3' },
  { id: 'soft-rain', label: 'Soft rain', src: '/fab-ambiance/soft-rain.mp3' },
];

export const FAB_AFFIRMATION_DEFAULT_AMBIENT: FabAmbientSoundId = 'none';
/** Bed volume under TTS (0–1). */
export const FAB_AFFIRMATION_AMBIENT_GAIN = 0.22;

export function resolveFabAffirmationAmbientSrc(
  id: FabAmbientSoundId
): string | null {
  return FAB_AFFIRMATION_AMBIENT_SOUNDS.find((s) => s.id === id)?.src ?? null;
}
