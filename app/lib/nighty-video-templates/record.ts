import {
  nightySourceAudioSrc,
  type NightySourceSoundId,
} from '@/app/lib/nighty-video-templates/sounds';
import type {
  NightyCompositionState,
  NightyCompositionTemplate,
} from '@/app/lib/nighty-video-templates/catalog';
import { NIGHTY_COMPOSITION_FONT, paintNightyFrame } from '@/app/lib/nighty-video-templates/paint';
import { compositionSoundIds, frameAt } from '@/app/lib/nighty-video-templates/timeline';

export const NIGHTY_COMPOSITION_EXPORT_WIDTH = 1080;
export const NIGHTY_COMPOSITION_EXPORT_HEIGHT = 1920;
export const NIGHTY_COMPOSITION_EXPORT_FPS = 24;

function pickRecorderMime(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm',
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4',
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(message));
      }
    );
  });
}

async function loadBed(src: string): Promise<HTMLAudioElement> {
  const bed = document.createElement('audio');
  bed.crossOrigin = 'anonymous';
  bed.preload = 'auto';
  bed.loop = true;
  bed.src = src;
  // Keep it in the document. display:none can keep play() from ever settling.
  bed.style.position = 'fixed';
  bed.style.left = '-9999px';
  bed.style.width = '1px';
  bed.style.height = '1px';
  document.body.appendChild(bed);
  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        bed.addEventListener('canplaythrough', () => resolve(), { once: true });
        bed.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
          once: true,
        });
        bed.load();
      }),
      15000,
      `Timed out loading ${src}`
    );
  } catch (error) {
    bed.remove();
    throw error;
  }
  return bed;
}

/**
 * Records the composition in real time with the owned bed audio mixed in.
 * Prefers WebM+Opus because Chrome's MediaRecorder MP4 path often drops audio.
 */
export async function recordNightyComposition(
  template: NightyCompositionTemplate,
  state: NightyCompositionState,
  onProgress?: (seconds: number) => void
): Promise<{ blob: Blob; extension: 'webm' | 'mp4'; mimeType: string }> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser');
  }
  const mime = pickRecorderMime();
  if (!mime) throw new Error('No supported video recording format in this browser');

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) throw new Error('AudioContext is not available');
  const audioCtx = new AudioCtx();
  const resumePromise = audioCtx.resume();

  if (typeof document !== 'undefined' && document.fonts?.load) {
    try {
      await document.fonts.load(`500 64px "${NIGHTY_COMPOSITION_FONT.split(',')[0]?.trim()}"`);
      await document.fonts.load(`600 80px "TikTok Sans"`);
    } catch {
      /* system font fallback */
    }
  }

  const w = NIGHTY_COMPOSITION_EXPORT_WIDTH;
  const h = NIGHTY_COMPOSITION_EXPORT_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    await audioCtx.close().catch(() => undefined);
    throw new Error('Canvas not available');
  }

  await resumePromise;
  const destination = audioCtx.createMediaStreamDestination();

  const soundIds = compositionSoundIds(template, state);
  const beds: { id: NightySourceSoundId; el: HTMLAudioElement; gain: GainNode }[] = [];

  try {
    for (const id of soundIds) {
      const el = await loadBed(nightySourceAudioSrc(id));
      el.setAttribute('data-nighty-export-bed', id);
      const source = audioCtx.createMediaElementSource(el);
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(destination);
      beds.push({ id, el, gain });
    }

    const opening = frameAt(template, state, 0);
    for (const bed of beds) {
      bed.gain.gain.value = opening.gains.find((item) => item.soundId === bed.id)?.gain ?? 0;
      bed.el.currentTime = 0;
    }
    paintNightyFrame(ctx, w, h, opening);

    const canvasStream = canvas.captureStream(NIGHTY_COMPOSITION_EXPORT_FPS);
    const out = new MediaStream();
    for (const track of canvasStream.getVideoTracks()) out.addTrack(track);
    for (const track of destination.stream.getAudioTracks()) out.addTrack(track);
    if (out.getAudioTracks().length === 0) {
      throw new Error('Export audio track was not created');
    }

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(out, {
      mimeType: mime,
      videoBitsPerSecond: 6_000_000,
      audioBitsPerSecond: 192_000,
    });

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => reject(new Error('Recording failed'));
      recorder.onstop = () => resolve();
    });

    recorder.start(200);
    await Promise.all(
      beds.map((bed) =>
        withTimeout(bed.el.play(), 5000, `Audio did not start for ${bed.id}`)
      )
    );
    const started = performance.now();
    const durationMs = template.durationSec * 1000;

    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearInterval(timer);
        window.clearTimeout(backup);
        resolve();
      };
      const tick = () => {
        const elapsed = performance.now() - started;
        const t = Math.min(template.durationSec, elapsed / 1000);
        const frame = frameAt(template, state, t);
        paintNightyFrame(ctx, w, h, frame);
        for (const bed of beds) {
          const match = frame.gains.find((item) => item.soundId === bed.id);
          bed.gain.gain.value = match?.gain ?? 0;
        }
        onProgress?.(t);
        if (elapsed >= durationMs) finish();
      };
      const timer = window.setInterval(tick, 1000 / NIGHTY_COMPOSITION_EXPORT_FPS);
      const backup = window.setTimeout(finish, durationMs + 500);
      tick();
    });

    if (recorder.state === 'recording') {
      recorder.requestData();
      recorder.stop();
    }
    await withTimeout(stopped, 10000, 'Recording did not finish');

    const type = mime.split(';')[0] || 'video/webm';
    const blob = new Blob(chunks, { type });
    if (blob.size < 1000) throw new Error('Export produced an empty video');
    const extension = type.includes('mp4') ? 'mp4' : 'webm';
    return { blob, extension, mimeType: type };
  } finally {
    for (const bed of beds) {
      bed.el.pause();
      bed.el.removeAttribute('src');
      bed.el.load();
      bed.el.remove();
    }
    await audioCtx.close().catch(() => undefined);
  }
}
