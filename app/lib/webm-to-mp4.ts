'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

/** Warm ffmpeg.wasm while the user previews so export encode starts faster. */
export function preloadFfmpeg(): void {
  void getFfmpeg().catch(() => undefined);
}

async function getFfmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      const coreBaseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';
      const ffmpegBaseURL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm';
      // Pass an absolute classWorkerURL so Turbopack does not try to analyze
      // `new Worker(new URL(variable, import.meta.url))` inside @ffmpeg/ffmpeg.
      await ffmpeg.load({
        coreURL: await toBlobURL(`${coreBaseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${coreBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        classWorkerURL: await toBlobURL(`${ffmpegBaseURL}/worker.js`, 'text/javascript'),
      });
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    })().catch((err) => {
      ffmpegLoadPromise = null;
      throw err;
    });
  }
  return ffmpegLoadPromise;
}

export async function transcodeWebmToMp4(
  webm: Blob,
  /** Original source clip — audio is muxed in when the export was frame-accurate (video-only). */
  audioSource?: Blob | null,
  options?: { preset?: 'veryfast' | 'medium' }
): Promise<Blob> {
  const preset = options?.preset ?? 'medium';
  const ffmpeg = await getFfmpeg();
  const inputName = `input-${Date.now()}.webm`;
  const outputName = `output-${Date.now()}.mp4`;
  const audioInputName = audioSource ? `audio-${Date.now()}.src` : null;

  await ffmpeg.writeFile(inputName, await fetchFile(webm));
  if (audioSource && audioInputName) {
    await ffmpeg.writeFile(audioInputName, await fetchFile(audioSource));
  }

  const args = ['-i', inputName];
  if (audioInputName) args.push('-i', audioInputName);
  args.push('-map', '0:v:0');
  if (audioInputName) {
    args.push('-map', '1:a:0?');
  } else {
    args.push('-map', '0:a:0?');
  }
  args.push(
    '-r',
    '30',
    '-fps_mode',
    'cfr',
    '-c:v',
    'libx264',
    '-preset',
    preset,
    // This is a second lossy pass over an already-compressed recording, so keep
    // it near-visually-lossless — TikTok re-encodes again after upload.
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'high',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-movflags',
    '+faststart'
  );
  if (audioInputName) args.push('-shortest');
  args.push(outputName);

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  if (audioInputName) await ffmpeg.deleteFile(audioInputName);

  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  return new Blob([bytes as BlobPart], { type: 'video/mp4' });
}

/**
 * Encodes a JPEG frame sequence at an exact CFR — bypasses MediaRecorder timing entirely.
 * Used by Couples Nature export (`app/lib/couples-nature/export.ts`).
 */
export async function encodeJpegSequenceToMp4(
  frames: Uint8Array[],
  fps: number,
  audioSource?: Blob | null
): Promise<Blob> {
  if (frames.length === 0) throw new Error('No frames to encode');

  const ffmpeg = await getFfmpeg();
  const sessionId = `${Date.now()}`;
  const pipeName = `pipe-${sessionId}.mjpeg`;
  const outputName = `output-${sessionId}.mp4`;
  const audioInputName = audioSource ? `audio-${sessionId}.src` : null;

  const pipeSize = frames.reduce((sum, frame) => sum + frame.length, 0);
  const piped = new Uint8Array(pipeSize);
  let offset = 0;
  for (const frame of frames) {
    piped.set(frame, offset);
    offset += frame.length;
  }
  await ffmpeg.writeFile(pipeName, piped);
  if (audioSource && audioInputName) {
    await ffmpeg.writeFile(audioInputName, await fetchFile(audioSource));
  }

  const args = ['-f', 'image2pipe', '-framerate', String(fps), '-i', pipeName];
  if (audioInputName) args.push('-i', audioInputName);
  args.push('-map', '0:v:0');
  if (audioInputName) args.push('-map', '1:a:0?');
  args.push(
    '-c:v',
    'libx264',
    '-r',
    String(fps),
    '-fps_mode',
    'cfr',
    '-preset',
    'ultrafast',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'high',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-movflags',
    '+faststart'
  );
  if (audioInputName) args.push('-shortest');
  args.push(outputName);

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(pipeName);
  await ffmpeg.deleteFile(outputName);
  if (audioInputName) await ffmpeg.deleteFile(audioInputName);

  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  return new Blob([bytes as BlobPart], { type: 'video/mp4' });
}
