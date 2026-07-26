import {
  FAB_AFFIRMATION_SPEECH_RATE,
  FAB_AFFIRMATION_TTS_GAP_SEC,
  FAB_AFFIRMATION_TTS_MODEL,
  type FabTtsProviderId,
} from '@/app/lib/fab-video';

export type FabAffirmationAudioSegment = {
  text: string;
  /** Object URL for preview playback (revoke when replaced). */
  audioUrl: string;
  blob: Blob;
  durationSec: number;
  startSec: number;
  provider: FabTtsProviderId;
};

export function revokeFabAffirmationSegments(segments: FabAffirmationAudioSegment[]) {
  for (const s of segments) {
    try {
      URL.revokeObjectURL(s.audioUrl);
    } catch {
      // ignore
    }
  }
}

async function blobDurationSec(blob: Blob): Promise<number> {
  const url = URL.createObjectURL(blob);
  try {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;
    await new Promise<void>((resolve, reject) => {
      audio.addEventListener('loadedmetadata', () => resolve(), { once: true });
      audio.addEventListener('error', () => reject(new Error('Failed to read audio duration')), {
        once: true,
      });
    });
    const d = audio.duration;
    if (!Number.isFinite(d) || d <= 0) {
      throw new Error('Invalid audio duration');
    }
    return d;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function fetchFabAffirmationTts(text: string): Promise<Blob> {
  const res = await fetch('/api/elevenlabs/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, modelId: FAB_AFFIRMATION_TTS_MODEL }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || `TTS failed (${res.status})`);
  }
  return res.blob();
}

/** Rough spoken length for browser / mock timing (~145 wpm scaled by speech rate). */
export function estimateSpeechDurationSec(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerSec = 2.4 * FAB_AFFIRMATION_SPEECH_RATE;
  return Math.max(1.5, words / wordsPerSec + 0.45);
}

/** Silent WAV so export can still schedule a timeline without ElevenLabs audio. */
export function makeSilentWavBlob(durationSec: number, sampleRate = 24000): Blob {
  const numSamples = Math.max(1, Math.floor(durationSec * sampleRate));
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  // samples already 0 (silence)
  return new Blob([buffer], { type: 'audio/wav' });
}

function buildTimeline(
  texts: string[],
  blobs: Blob[],
  durations: number[],
  provider: FabTtsProviderId
): FabAffirmationAudioSegment[] {
  const segments: FabAffirmationAudioSegment[] = [];
  let t = 0;
  for (let i = 0; i < texts.length; i++) {
    const blob = blobs[i]!;
    const durationSec = durations[i]!;
    segments.push({
      text: texts[i]!,
      blob,
      audioUrl: URL.createObjectURL(blob),
      durationSec,
      startSec: t,
      provider,
    });
    t += durationSec + FAB_AFFIRMATION_TTS_GAP_SEC;
  }
  return segments;
}

/**
 * Generate TTS per affirmation and build a timeline.
 * Text is visible for [startSec, startSec + durationSec); gaps have no text.
 * `browser` uses free Web Speech in preview + silent placeholders for export timing.
 */
export async function buildFabAffirmationSegments(
  affirmations: string[],
  provider: FabTtsProviderId = 'browser'
): Promise<FabAffirmationAudioSegment[]> {
  const texts = affirmations.map((t) => t.trim()).filter(Boolean);
  if (texts.length === 0) return [];

  if (provider === 'browser') {
    const durations = texts.map((text) => estimateSpeechDurationSec(text));
    const blobs = durations.map((d) => makeSilentWavBlob(d));
    return buildTimeline(texts, blobs, durations, 'browser');
  }

  const blobs = await Promise.all(texts.map((text) => fetchFabAffirmationTts(text)));
  const durations = await Promise.all(blobs.map((b) => blobDurationSec(b)));
  return buildTimeline(texts, blobs, durations, 'elevenlabs');
}

export function totalFabAffirmationTimelineSec(
  segments: FabAffirmationAudioSegment[]
): number {
  if (segments.length === 0) return 0;
  const last = segments[segments.length - 1]!;
  // End after last line (no trailing gap needed for export length).
  return last.startSec + last.durationSec;
}

export function affirmationTextAtTime(
  segments: FabAffirmationAudioSegment[],
  timeSec: number
): string {
  for (const s of segments) {
    if (timeSec >= s.startSec && timeSec < s.startSec + s.durationSec) {
      return s.text;
    }
  }
  return '';
}

export function pickBrowserFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const preferred =
    voices.find(
      (v) =>
        /^en/i.test(v.lang) &&
        /female|samantha|karen|moira|victoria|zira|siri|jenny|aria|natasha|susan/i.test(v.name)
    ) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0];
  return preferred ?? null;
}

export function ensureBrowserVoicesLoaded(): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve();
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', done);
      resolve();
    };
    window.speechSynthesis.addEventListener('voiceschanged', done);
    window.setTimeout(done, 800);
  });
}
