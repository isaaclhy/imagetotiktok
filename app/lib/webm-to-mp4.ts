'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

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

export async function transcodeWebmToMp4(webm: Blob): Promise<Blob> {
  const ffmpeg = await getFfmpeg();
  const inputName = `input-${Date.now()}.webm`;
  const outputName = `output-${Date.now()}.mp4`;

  await ffmpeg.writeFile(inputName, await fetchFile(webm));
  await ffmpeg.exec([
    '-i',
    inputName,
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-movflags',
    '+faststart',
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  return new Blob([bytes as BlobPart], { type: 'video/mp4' });
}
