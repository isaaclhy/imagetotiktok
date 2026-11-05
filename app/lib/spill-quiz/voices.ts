/** Natural ElevenLabs settings for the spoken quiz clips (normal pace, not the slow Fab read). */
export const SPILL_QUIZ_TTS_MODEL = 'eleven_multilingual_v2';

/** Rachel — the voice already used for Spill It speech. */
export const SPILL_QUIZ_VOICE_KNOW_HER = 'EXAVITQu4vr4xnSDxMaL';

/** Charlotte — a second premade conversational voice so the two dailies don't match. */
export const SPILL_QUIZ_VOICE_QUIZ_BOYFRIEND = 'XB0fDUnXU5powFXDhCwa';

export const SPILL_QUIZ_TTS_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0.25,
  use_speaker_boost: true,
  speed: 1,
} as const;

export type SpillQuizVoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed: number;
};
