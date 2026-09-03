import {
  COUPLES_NATURE_EXPORT_FPS,
  COUPLES_NATURE_EXPORT_HEIGHT,
  COUPLES_NATURE_EXPORT_WIDTH,
  computeCoverCrop,
  drawCouplesNatureBackground,
  loadVideoElementFromBlob,
  type CoverCrop,
} from '@/app/lib/couples-nature/background';
import type { CouplesNatureExportProgress, CouplesNatureOverlayPainter } from '@/app/lib/couples-nature/types';
import {
  TEMPLATE2_COVER_FONT_WEIGHT,
  videoTemplate2FooterFontSizePx,
  videoTemplate2QuestionFontSizePx,
  videoTemplate2TitleFontSizePx,
} from '@/app/lib/video-template-2/overlay-metrics';
import { transcodeWebmToMp4 } from '@/app/lib/webm-to-mp4';

async function ensureCouplesNatureFonts(frameHeight: number): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  const titleSize = videoTemplate2TitleFontSizePx(frameHeight);
  const questionSize = videoTemplate2QuestionFontSizePx(frameHeight);
  const footerSize = videoTemplate2FooterFontSizePx(frameHeight);
  const weight = TEMPLATE2_COVER_FONT_WEIGHT;
  try {
    await document.fonts.load(`${weight} ${titleSize}px "TikTok Sans"`);
    await document.fonts.load(`${weight} ${questionSize}px "TikTok Sans"`);
    await document.fonts.load(`${weight} ${footerSize}px "TikTok Sans"`);
  } catch {
    /* fall back to system font */
  }
}

function pickRecorderMime(): string {
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
}

function seekVideo(video: HTMLVideoElement, timeSec: number): Promise<void> {
  const clamped = Math.max(0, timeSec);
  if (Math.abs(video.currentTime - clamped) < 0.001) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Failed to seek video'));
    };
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    const maxTime = Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.04) : clamped;
    video.currentTime = Math.min(clamped, maxTime);
  });
}

type CaptureTrack = MediaStreamTrack & { requestFrame?: () => void };

/**
 * Record one realtime play-through with a pre-baked text overlay (static per export).
 * Much faster than JPEG sequence + full wasm re-encode; CFR pass only when WebM.
 */
export async function exportCouplesNatureViaRecorder(options: {
  sourceBlob: Blob;
  paintOverlay: CouplesNatureOverlayPainter;
  maxDurationSec: number;
  onProgress?: CouplesNatureExportProgress;
}): Promise<Blob> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported');
  }
  const mime = pickRecorderMime();
  if (!mime) throw new Error('No supported video recording format');

  const { sourceBlob, paintOverlay, maxDurationSec, onProgress } = options;
  const width = COUPLES_NATURE_EXPORT_WIDTH;
  const height = COUPLES_NATURE_EXPORT_HEIGHT;
  const { video, objectUrl } = await loadVideoElementFromBlob(sourceBlob);

  try {
    const durationSec = Math.min(maxDurationSec, video.duration || maxDurationSec);

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = width;
    overlayCanvas.height = height;
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!overlayCtx) throw new Error('Overlay canvas not available');
    await ensureCouplesNatureFonts(height);
    paintOverlay(overlayCtx, width, height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas not available');

    const crop: CoverCrop = computeCoverCrop(video.videoWidth, video.videoHeight, width, height);

    const paintFrame = () => {
      drawCouplesNatureBackground(ctx, video, crop, width, height);
      ctx.drawImage(overlayCanvas, 0, 0);
    };

    const probeStream = canvas.captureStream(0);
    const probeTrack = probeStream.getVideoTracks()[0] as CaptureTrack | undefined;
    const supportsRequestFrame = typeof probeTrack?.requestFrame === 'function';
    probeStream.getTracks().forEach((t) => t.stop());

    const canvasStream = canvas.captureStream(supportsRequestFrame ? 0 : COUPLES_NATURE_EXPORT_FPS);
    const captureTrack = canvasStream.getVideoTracks()[0] as CaptureTrack | undefined;

    const outStream = new MediaStream();
    canvasStream.getVideoTracks().forEach((t) => outStream.addTrack(t));

    video.muted = true;

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(outStream, {
      mimeType: mime,
      videoBitsPerSecond: 12_000_000,
    });

    const recordedBlob = await new Promise<Blob>((resolve, reject) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeoutId);
        video.pause();
        try {
          if (recorder.state === 'recording') recorder.stop();
        } catch {
          reject(new Error('Failed to stop recording'));
        }
      };

      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onerror = () => reject(new Error('Recording failed'));
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mime });
        if (blob.size < 16_000) {
          reject(new Error('Recording too short'));
          return;
        }
        resolve(blob);
      };

      const timeoutId = window.setTimeout(finish, Math.ceil(durationSec * 1000) + 500);

      const pumpFrame = () => {
        paintFrame();
        captureTrack?.requestFrame?.();
      };

      const runRvfc = () => {
        const step = (_now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
          pumpFrame();
          onProgress?.(
            'frames',
            Math.min(
              Math.ceil(durationSec * COUPLES_NATURE_EXPORT_FPS),
              Math.floor(metadata.mediaTime * COUPLES_NATURE_EXPORT_FPS) + 1
            ),
            Math.ceil(durationSec * COUPLES_NATURE_EXPORT_FPS)
          );
          if (metadata.mediaTime >= durationSec - 0.001) {
            finish();
            return;
          }
          video.requestVideoFrameCallback(step);
        };
        return step;
      };

      void (async () => {
        try {
          await seekVideo(video, 0);
          recorder.start(250);
          await video.play();

          if (supportsRequestFrame && typeof video.requestVideoFrameCallback === 'function') {
            video.requestVideoFrameCallback(runRvfc());
          } else {
            let nextFrameAt = performance.now();
            const frameMs = 1000 / COUPLES_NATURE_EXPORT_FPS;
            const tick = (now: number) => {
              if (video.currentTime >= durationSec - 0.001) {
                finish();
                return;
              }
              if (now >= nextFrameAt) {
                pumpFrame();
                nextFrameAt += frameMs;
              }
              requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        } catch (err) {
          finish();
          reject(err instanceof Error ? err : new Error('Playback failed'));
        }
      })();
    });

    if (recordedBlob.type.includes('mp4')) {
      return recordedBlob;
    }

    onProgress?.('encode', 0, 1);
    const mp4 = await transcodeWebmToMp4(recordedBlob, null, { preset: 'veryfast' });
    onProgress?.('encode', 1, 1);
    return mp4;
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
