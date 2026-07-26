import {
  FAB_AFFIRMATION_AMBIENT_GAIN,
  FAB_AFFIRMATION_SECONDS_PER_CLIP,
  FAB_NOTES_EXPORT_MAX_HEIGHT,
  FAB_NOTES_EXPORT_MAX_WIDTH,
  FAB_NOTES_EXPORT_VIDEO_BITRATE,
} from '@/app/lib/fab-video';
import {
  affirmationTextAtTime,
  totalFabAffirmationTimelineSec,
  type FabAffirmationAudioSegment,
} from '@/app/lib/fab-tts';

function exportCanvasSize(srcW: number, srcH: number): { w: number; h: number } {
  const scale = Math.min(
    1,
    FAB_NOTES_EXPORT_MAX_WIDTH / srcW,
    FAB_NOTES_EXPORT_MAX_HEIGHT / srcH
  );
  let w = Math.round(srcW * scale);
  let h = Math.round(srcH * scale);
  if (w % 2) w -= 1;
  if (h % 2) h -= 1;
  return { w: Math.max(2, w), h: Math.max(2, h) };
}

function pickMediaRecorderMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function drawFabAffirmationTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  frameW: number,
  frameH: number,
  text: string
) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const fontSize = Math.max(28, Math.floor(frameH * 0.038));
  const maxWidth = frameW * 0.78;
  ctx.save();
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapText(ctx, trimmed, maxWidth);
  const lineHeight = fontSize * 1.25;
  const blockH = lines.length * lineHeight;
  let y = frameH / 2 - blockH / 2 + lineHeight / 2;

  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.max(8, frameW * 0.012);
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  for (const line of lines) {
    ctx.fillText(line, frameW / 2, y);
    y += lineHeight;
  }
  ctx.restore();
}

function loadVideo(src: string): Promise<HTMLVideoElement> {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'auto';
  video.muted = true;
  video.src = src;
  return new Promise((resolve, reject) => {
    video.addEventListener('loadeddata', () => resolve(video), { once: true });
    video.addEventListener('error', () => reject(new Error('Failed to load video')), { once: true });
  });
}

async function decodeAudioBlob(
  ctx: AudioContext,
  blob: Blob
): Promise<AudioBuffer> {
  const ab = await blob.arrayBuffer();
  return ctx.decodeAudioData(ab.slice(0));
}

async function loadAmbientBuffer(
  ctx: AudioContext,
  src: string
): Promise<AudioBuffer> {
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(
      `Ambient file missing (${src}). Add it under public/fab-ambiance/.`
    );
  }
  const ab = await res.arrayBuffer();
  return ctx.decodeAudioData(ab.slice(0));
}

/**
 * Loops 0.5s Pexels cuts for the full TTS timeline.
 * Text is drawn only while that affirmation’s audio is playing (clears in gaps).
 * Optional ambientSrc loops quietly under the voice.
 */
export async function exportFabAffirmationMontage(
  videoSrcs: string[],
  segments: FabAffirmationAudioSegment[],
  secondsPerClip = FAB_AFFIRMATION_SECONDS_PER_CLIP,
  ambientSrc: string | null = null
): Promise<Blob> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser');
  }
  const mime = pickMediaRecorderMime();
  if (!mime) throw new Error('No supported video recording format in this browser');
  if (videoSrcs.length === 0) throw new Error('No videos to export');
  if (segments.length === 0) throw new Error('No TTS segments to export');

  const totalSec = totalFabAffirmationTimelineSec(segments);
  if (totalSec <= 0) throw new Error('Invalid TTS timeline');

  const videos = await Promise.all(videoSrcs.map((src) => loadVideo(src)));
  const first = videos[0]!;
  const { w, h } = exportCanvasSize(first.videoWidth, first.videoHeight);
  if (w <= 0 || h <= 0) throw new Error('Invalid video dimensions');

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const audioCtx = new AudioContext();
  const audioDest = audioCtx.createMediaStreamDestination();
  const buffers = await Promise.all(segments.map((s) => decodeAudioBlob(audioCtx, s.blob)));

  let ambientSource: AudioBufferSourceNode | null = null;
  if (ambientSrc) {
    const ambientBuffer = await loadAmbientBuffer(audioCtx, ambientSrc);
    ambientSource = audioCtx.createBufferSource();
    ambientSource.buffer = ambientBuffer;
    ambientSource.loop = true;
    const gain = audioCtx.createGain();
    gain.gain.value = FAB_AFFIRMATION_AMBIENT_GAIN;
    ambientSource.connect(gain);
    gain.connect(audioDest);
  }

  const videoStream = canvas.captureStream(30);
  const outStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(outStream, {
    mimeType: mime,
    videoBitsPerSecond: FAB_NOTES_EXPORT_VIDEO_BITRATE,
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  const recordingDone = new Promise<void>((resolve, reject) => {
    recorder.onerror = () => reject(new Error('Recording failed'));
    recorder.onstop = () => resolve();
  });

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  recorder.start(200);
  const wallStart = performance.now();
  const audioStart = audioCtx.currentTime + 0.05;

  ambientSource?.start(audioStart);

  for (let i = 0; i < segments.length; i++) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffers[i]!;
    source.connect(audioDest);
    source.start(audioStart + segments[i]!.startSec);
  }

  let activeVideo: HTMLVideoElement | null = null;
  let lastSlot = -1;

  try {
    await new Promise<void>((resolveDraw, rejectDraw) => {
      let rafId = 0;
      const draw = () => {
        try {
          const elapsed = (performance.now() - wallStart) / 1000;
          if (elapsed >= totalSec) {
            if (rafId) cancelAnimationFrame(rafId);
            activeVideo?.pause();
            try {
              ambientSource?.stop();
            } catch {
              // ignore
            }
            resolveDraw();
            return;
          }

          const slot = Math.floor(elapsed / secondsPerClip);
          if (slot !== lastSlot) {
            lastSlot = slot;
            const next = videos[slot % videos.length]!;
            if (activeVideo && activeVideo !== next) activeVideo.pause();
            activeVideo = next;
            try {
              activeVideo.currentTime = 0;
            } catch {
              // ignore
            }
            void activeVideo.play().catch(() => {});
          }

          if (activeVideo && activeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            ctx.drawImage(activeVideo, 0, 0, w, h);
            const text = affirmationTextAtTime(segments, elapsed);
            drawFabAffirmationTextOnCanvas(ctx, w, h, text);
          }

          rafId = requestAnimationFrame(draw);
        } catch (e) {
          if (rafId) cancelAnimationFrame(rafId);
          rejectDraw(e instanceof Error ? e : new Error('Export draw failed'));
        }
      };
      rafId = requestAnimationFrame(draw);
    });
  } finally {
    for (const video of videos) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    try {
      ambientSource?.stop();
    } catch {
      // ignore
    }
    window.setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, 350);
    window.setTimeout(() => {
      void audioCtx.close();
    }, 800);
  }

  await recordingDone;
  if (chunks.length === 0) throw new Error('No video data was recorded');
  return new Blob(chunks, { type: mime.includes('mp4') ? 'video/mp4' : 'video/webm' });
}
