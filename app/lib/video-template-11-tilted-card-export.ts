import {
  computeCoverCrop,
  loadVideoElementFromBlob,
} from '@/app/lib/couples-nature/background';
import { getCouplesNatureVideoBlob } from '@/app/lib/couples-nature/video-cache';
import {
  TILTED_CARD_FPS,
  TILTED_CARD_HEIGHT,
  TILTED_CARD_WIDTH,
  paintTiltedCardOverlay,
  tiltedCardDurationSec,
  tiltedCardQuestionAt,
  tiltedCardQuestions,
  type TiltedCardPaintOptions,
} from '@/app/lib/video-template-11-tilted-card';

export type TiltedCardRecording = {
  blob: Blob;
  extension: 'mp4' | 'webm';
};

type RecordOptions = {
  videoSrc: string;
  questions: readonly string[];
  card: Omit<TiltedCardPaintOptions, 'question' | 'clear'>;
  onProgress?: (seconds: number, totalSeconds: number) => void;
};

const SERIF_STACK = '"Playfair Display", "Libre Baskerville", Georgia, serif';
const SANS_STACK = '"TikTok Sans", system-ui, sans-serif';

function pickRecorderMime(): { mime: string; extension: 'mp4' | 'webm' } | null {
  const candidates: Array<{ mime: string; extension: 'mp4' | 'webm' }> = [
    { mime: 'video/mp4;codecs="avc1.42E01E"', extension: 'mp4' },
    { mime: 'video/mp4', extension: 'mp4' },
    { mime: 'video/webm;codecs=vp9', extension: 'webm' },
    { mime: 'video/webm;codecs=vp8', extension: 'webm' },
    { mime: 'video/webm', extension: 'webm' },
  ];
  if (typeof MediaRecorder === 'undefined') return null;
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate.mime)) return candidate;
  }
  return null;
}

function mountVideo(video: HTMLVideoElement): () => void {
  video.playsInline = true;
  video.muted = true;
  video.loop = true;
  video.setAttribute('playsinline', '');
  video.style.position = 'fixed';
  video.style.left = '0';
  video.style.top = '0';
  video.style.width = '8px';
  video.style.height = '8px';
  video.style.opacity = '0.02';
  video.style.pointerEvents = 'none';
  video.style.zIndex = '-1';
  if (!video.isConnected) document.body.appendChild(video);
  return () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
  };
}

export async function loadTiltedCardFontFamilies(): Promise<{
  serifFamily: string;
  sansFamily: string;
}> {
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.left = '-9999px';
  probe.style.fontFamily = SERIF_STACK;
  document.body.appendChild(probe);
  const serifFamily = getComputedStyle(probe).fontFamily || SERIF_STACK;
  probe.style.fontFamily = SANS_STACK;
  const sansFamily = getComputedStyle(probe).fontFamily || SANS_STACK;
  probe.remove();
  try {
    await document.fonts.load(`700 72px ${serifFamily}`);
    await document.fonts.load(`700 32px ${sansFamily}`);
  } catch {
    /* the paint still falls back to Georgia / system-ui */
  }
  return { serifFamily, sansFamily };
}

/**
 * Records the looping background with the question card changing on a timer.
 * Chrome usually records WebM; the studio turns that into MP4 and keeps WebM
 * when the encode does not finish.
 */
export async function recordTiltedCard(options: RecordOptions): Promise<TiltedCardRecording> {
  const format = pickRecorderMime();
  if (!format) throw new Error('No supported video recording format in this browser');

  const questions = tiltedCardQuestions(options.questions);
  const durationSec = tiltedCardDurationSec(questions);
  const families = await loadTiltedCardFontFamilies();
  const sourceBlob = await getCouplesNatureVideoBlob(options.videoSrc);
  const { video, objectUrl } = await loadVideoElementFromBlob(sourceBlob);
  const unmount = mountVideo(video);

  const width = TILTED_CARD_WIDTH;
  const height = TILTED_CARD_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  const overlay = document.createElement('canvas');
  overlay.width = width;
  overlay.height = height;
  const overlayCtx = overlay.getContext('2d');
  if (!ctx || !overlayCtx) {
    unmount();
    URL.revokeObjectURL(objectUrl);
    throw new Error('Canvas not available');
  }

  const crop = computeCoverCrop(video.videoWidth, video.videoHeight, width, height);
  const canvasStream = canvas.captureStream(TILTED_CARD_FPS);
  const recorder = new MediaRecorder(canvasStream, {
    mimeType: format.mime,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: BlobPart[] = [];

  const paint = (elapsedSec: number) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    }
    paintTiltedCardOverlay(overlayCtx, width, height, {
      ...options.card,
      ...families,
      question: tiltedCardQuestionAt(questions, elapsedSec),
    });
    ctx.drawImage(overlay, 0, 0);
  };

  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      let finished = false;
      const fail = (error: Error) => {
        if (finished) return;
        finished = true;
        reject(error);
      };
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => fail(new Error('Recording failed'));
      recorder.onstop = () => {
        if (finished) return;
        finished = true;
        const recorded = new Blob(chunks, { type: format.mime });
        if (recorded.size < 8_000) {
          reject(new Error('Recording too short'));
          return;
        }
        resolve(recorded);
      };

      const started = performance.now();
      let raf = 0;
      const frame = () => {
        const elapsed = (performance.now() - started) / 1000;
        paint(elapsed);
        options.onProgress?.(Math.min(elapsed, durationSec), durationSec);
        if (elapsed >= durationSec) {
          try {
            if (recorder.state === 'recording') recorder.stop();
          } catch (error) {
            fail(error instanceof Error ? error : new Error('Failed to stop recording'));
          }
          return;
        }
        raf = requestAnimationFrame(frame);
      };

      void video
        .play()
        .then(() => {
          paint(0);
          recorder.start(250);
          raf = requestAnimationFrame(frame);
        })
        .catch((error: unknown) => {
          cancelAnimationFrame(raf);
          fail(error instanceof Error ? error : new Error('Playback failed'));
        });
    });

    return { blob, extension: format.extension };
  } finally {
    if (recorder.state === 'recording') {
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    canvasStream.getTracks().forEach((track) => track.stop());
    unmount();
    URL.revokeObjectURL(objectUrl);
  }
}
