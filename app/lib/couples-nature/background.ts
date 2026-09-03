import { COUPLES_NATURE_VIDEO_FILTER } from '@/app/lib/constants';

export const COUPLES_NATURE_EXPORT_WIDTH = 1080;
export const COUPLES_NATURE_EXPORT_HEIGHT = 1920;
export const COUPLES_NATURE_EXPORT_FPS = 30;

export type CoverCrop = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

/** Center-crop source video to fill a 9:16 destination frame. */
export function computeCoverCrop(
  videoWidth: number,
  videoHeight: number,
  destWidth: number,
  destHeight: number
): CoverCrop {
  const srcAspect = videoWidth / videoHeight;
  const destAspect = destWidth / destHeight;
  if (srcAspect > destAspect) {
    const sw = videoHeight * destAspect;
    return { sx: (videoWidth - sw) / 2, sy: 0, sw, sh: videoHeight };
  }
  const sh = videoWidth / destAspect;
  return { sx: 0, sy: (videoHeight - sh) / 2, sw: videoWidth, sh };
}

/** Draw the graded, center-cropped background frame (matches preview CSS filter). */
export function drawCouplesNatureBackground(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  crop: CoverCrop,
  destWidth: number,
  destHeight: number
): void {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth <= 0) return;
  ctx.filter = COUPLES_NATURE_VIDEO_FILTER;
  ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, destWidth, destHeight);
  ctx.filter = 'none';
}

export async function prefetchVideoBlob(videoSrc: string): Promise<Blob> {
  const response = await fetch(videoSrc);
  if (!response.ok) {
    throw new Error(`Failed to download video (${response.status})`);
  }
  return response.blob();
}

export async function loadVideoElementFromBlob(
  blob: Blob
): Promise<{ video: HTMLVideoElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'auto';
  video.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    video.addEventListener('error', () => reject(new Error('Failed to load video')), { once: true });
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      done();
      return;
    }
    video.addEventListener('canplaythrough', done, { once: true });
    video.addEventListener(
      'loadeddata',
      () => {
        window.setTimeout(done, 250);
      },
      { once: true }
    );
  });

  if (video.videoWidth <= 0 || video.videoHeight <= 0) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Invalid video dimensions');
  }

  return { video, objectUrl };
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

function canvasToJpegBytes(canvas: HTMLCanvasElement, quality = 0.75): Uint8Array {
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('Failed to encode frame');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function fillFrameGaps(slots: Array<Uint8Array | undefined>, totalFrames: number): Uint8Array[] {
  const out: Uint8Array[] = [];
  let last: Uint8Array | undefined;
  for (let i = 0; i < totalFrames; i++) {
    if (slots[i]) last = slots[i];
    if (last) out.push(last);
  }
  return out;
}

/**
 * Capture CFR JPEG frames during one realtime play-through (~9s).
 * Avoids per-frame seeking, which was taking 30–90s on long clips.
 */
export async function captureCouplesNaturePlaybackFrames(
  video: HTMLVideoElement,
  paintFrame: () => void,
  canvas: HTMLCanvasElement,
  fps: number,
  durationSec: number,
  onProgress?: (captured: number, total: number) => void
): Promise<Uint8Array[]> {
  const totalFrames = Math.max(1, Math.ceil(durationSec * fps));
  const slots: Array<Uint8Array | undefined> = new Array(totalFrames);
  let capturedCount = 0;

  await seekVideo(video, 0);
  video.playbackRate = 1;
  video.muted = true;

  const finish = (timeoutId: number) => {
    window.clearTimeout(timeoutId);
    video.pause();
    return fillFrameGaps(slots, totalFrames);
  };

  const storeFrame = (mediaTimeSec: number) => {
    const idx = Math.min(totalFrames - 1, Math.floor(mediaTimeSec * fps + 1e-4));
    if (slots[idx]) return;
    paintFrame();
    slots[idx] = canvasToJpegBytes(canvas);
    capturedCount += 1;
    onProgress?.(capturedCount, totalFrames);
  };

  if (typeof video.requestVideoFrameCallback === 'function') {
    return new Promise<Uint8Array[]>((resolve, reject) => {
      const timeoutId = window.setTimeout(
        () => resolve(finish(timeoutId)),
        Math.ceil((durationSec + 1.5) * 1000)
      );

      const onFrame = (_now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
        if (metadata.mediaTime >= durationSec - 0.001) {
          resolve(finish(timeoutId));
          return;
        }
        storeFrame(metadata.mediaTime);
        video.requestVideoFrameCallback(onFrame);
      };

      video
        .play()
        .then(() => video.requestVideoFrameCallback(onFrame))
        .catch((err) => {
          window.clearTimeout(timeoutId);
          reject(err);
        });
    });
  }

  return new Promise<Uint8Array[]>((resolve, reject) => {
    const timeoutId = window.setTimeout(
      () => resolve(finish(timeoutId)),
      Math.ceil((durationSec + 2) * 1000)
    );
    let nextFrameAt = performance.now();
    const frameMs = 1000 / fps;

    const tick = (now: number) => {
      if (video.currentTime >= durationSec - 0.001 || capturedCount >= totalFrames) {
        resolve(finish(timeoutId));
        return;
      }
      if (now >= nextFrameAt) {
        storeFrame(video.currentTime);
        nextFrameAt += frameMs;
        if (now > nextFrameAt + frameMs * 2) nextFrameAt = now;
      }
      requestAnimationFrame(tick);
    };

    video
      .play()
      .then(() => requestAnimationFrame(tick))
      .catch((err) => {
        window.clearTimeout(timeoutId);
        reject(err);
      });
  });
}
