import {
  COUPLES_NATURE_EXPORT_FPS,
  COUPLES_NATURE_EXPORT_HEIGHT,
  COUPLES_NATURE_EXPORT_WIDTH,
  captureCouplesNaturePlaybackFrames,
  computeCoverCrop,
  drawCouplesNatureBackground,
  loadVideoElementFromBlob,
  type CoverCrop,
} from '@/app/lib/couples-nature/background';
import { exportCouplesNatureViaRecorder } from '@/app/lib/couples-nature/recorder-export';
import type { CouplesNatureExportProgress, CouplesNatureOverlayPainter } from '@/app/lib/couples-nature/types';
import { getCouplesNatureVideoBlob } from '@/app/lib/couples-nature/video-cache';
import {
  TEMPLATE2_COVER_FONT_WEIGHT,
  videoTemplate2FooterFontSizePx,
  videoTemplate2QuestionFontSizePx,
  videoTemplate2TitleFontSizePx,
} from '@/app/lib/video-template-2/overlay-metrics';
import { encodeJpegSequenceToMp4, preloadFfmpeg } from '@/app/lib/webm-to-mp4';

export type { CouplesNatureExportProgress, CouplesNatureOverlayPainter } from '@/app/lib/couples-nature/types';
export { preloadFfmpeg as warmCouplesNatureExport };
export { warmCouplesNatureVideoBlob } from '@/app/lib/couples-nature/video-cache';

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

async function exportCouplesNatureViaJpegSequence(options: {
  sourceBlob: Blob;
  paintOverlay: CouplesNatureOverlayPainter;
  maxDurationSec: number;
  onProgress?: CouplesNatureExportProgress;
}): Promise<Blob> {
  const { sourceBlob, paintOverlay, maxDurationSec, onProgress } = options;
  const width = COUPLES_NATURE_EXPORT_WIDTH;
  const height = COUPLES_NATURE_EXPORT_HEIGHT;
  const fps = COUPLES_NATURE_EXPORT_FPS;
  const { video, objectUrl } = await loadVideoElementFromBlob(sourceBlob);

  try {
    const durationSec = Math.min(maxDurationSec, video.duration || maxDurationSec);
    const totalFrames = Math.max(1, Math.ceil(durationSec * fps));

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

    const startedAt = performance.now();
    const frames = await captureCouplesNaturePlaybackFrames(
      video,
      paintFrame,
      canvas,
      fps,
      durationSec,
      (captured, total) => onProgress?.('frames', captured, total)
    );

    const elapsed = (performance.now() - startedAt) / 1000;
    console.info(
      `[couples-nature] CFR fallback captured ${frames.length}/${totalFrames} frames @ ${fps}fps (${elapsed.toFixed(1)}s)`
    );

    onProgress?.('encode', 0, 1);
    const mp4 = await encodeJpegSequenceToMp4(frames, fps, null);
    onProgress?.('encode', 1, 1);
    return mp4;
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

export async function exportCouplesNatureVideo(options: {
  videoSrc: string;
  sourceBlob?: Blob | null;
  paintOverlay: CouplesNatureOverlayPainter;
  maxDurationSec: number;
  onProgress?: CouplesNatureExportProgress;
}): Promise<Blob> {
  const sourceBlob = await getCouplesNatureVideoBlob(options.videoSrc, options.sourceBlob);

  try {
    return await exportCouplesNatureViaRecorder({
      sourceBlob,
      paintOverlay: options.paintOverlay,
      maxDurationSec: options.maxDurationSec,
      onProgress: options.onProgress,
    });
  } catch (recorderErr) {
    console.warn('[couples-nature] recorder export failed, using CFR jpeg fallback', recorderErr);
    return exportCouplesNatureViaJpegSequence({
      sourceBlob,
      paintOverlay: options.paintOverlay,
      maxDurationSec: options.maxDurationSec,
      onProgress: options.onProgress,
    });
  }
}
