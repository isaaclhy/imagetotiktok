import { execFile } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { assertFfmpegAvailable, downloadToFile } from '@/app/lib/video-template-2/ffmpeg';
import {
  SPILL_QUIZ_FRAME_HEIGHT,
  SPILL_QUIZ_FRAME_WIDTH,
  renderSpillQuizOverlayPng,
} from '@/app/lib/spill-quiz/overlay';
import type { SpillQuizLineRole } from '@/app/lib/spill-quiz/script';

const execFileAsync = promisify(execFile);

const FFMPEG_MAX_BUFFER = 12 * 1024 * 1024;

export type SpokenQuizSegment = {
  text: string;
  role: SpillQuizLineRole;
  audio: Buffer;
};

async function probeDurationSec(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    filePath,
  ]);
  const duration = Number(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Failed to read audio duration for ${path.basename(filePath)}`);
  }
  return duration;
}

function enableBetween(start: number, end: number): string {
  return `enable='between(t\\,${start.toFixed(3)}\\,${end.toFixed(3)})'`;
}

export async function renderSpokenQuizMp4(options: {
  videoUrl?: string;
  videoPath?: string;
  segments: SpokenQuizSegment[];
}): Promise<{ outputPath: string; durationSec: number; cleanup: () => Promise<void> }> {
  await assertFfmpegAvailable();
  if (!options.videoUrl && !options.videoPath) {
    throw new Error('A background video is required');
  }
  if (options.segments.length === 0) throw new Error('Quiz video has no lines');

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'spill-quiz-'));
  const cleanup = async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  };

  try {
    const inputPath = options.videoPath ?? path.join(tmpDir, 'background.mp4');
    if (options.videoUrl) {
      await downloadToFile(options.videoUrl, inputPath);
    }

    const durations: number[] = [];
    const paddedPaths: string[] = [];
    for (let i = 0; i < options.segments.length; i++) {
      const rawPath = path.join(tmpDir, `raw-${i}.audio`);
      const paddedPath = path.join(tmpDir, `line-${i}.m4a`);
      await fs.writeFile(rawPath, options.segments[i]!.audio);
      await execFileAsync(
        'ffmpeg',
        [
          '-y',
          '-i',
          rawPath,
          '-af',
          'apad=pad_dur=0.35',
          '-c:a',
          'aac',
          '-b:a',
          '160k',
          '-ar',
          '44100',
          '-ac',
          '2',
          paddedPath,
        ],
        { maxBuffer: FFMPEG_MAX_BUFFER }
      );
      paddedPaths.push(paddedPath);
      durations.push(await probeDurationSec(paddedPath));

      const png = renderSpillQuizOverlayPng(options.segments[i]!.text, options.segments[i]!.role);
      await fs.writeFile(path.join(tmpDir, `overlay-${i}.png`), png);
    }

    const concatInputs: string[] = [];
    const concatLabels: string[] = [];
    paddedPaths.forEach((filePath, index) => {
      concatInputs.push('-i', filePath);
      concatLabels.push(`[${index}:a]`);
    });
    const voicePath = path.join(tmpDir, 'voice.m4a');
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        ...concatInputs,
        '-filter_complex',
        `${concatLabels.join('')}concat=n=${paddedPaths.length}:v=0:a=1[a]`,
        '-map',
        '[a]',
        '-c:a',
        'aac',
        '-b:a',
        '160k',
        voicePath,
      ],
      { maxBuffer: FFMPEG_MAX_BUFFER }
    );

    const durationSec = await probeDurationSec(voicePath);
    const outputPath = path.join(tmpDir, 'quiz.mp4');
    const args = ['-y', '-stream_loop', '-1', '-i', inputPath];
    for (let i = 0; i < options.segments.length; i++) {
      args.push(
        '-loop',
        '1',
        '-framerate',
        '30',
        '-t',
        durationSec.toFixed(3),
        '-i',
        path.join(tmpDir, `overlay-${i}.png`)
      );
    }
    args.push('-i', voicePath);

    let cursor = 0;
    const chains: string[] = [
      `[0:v]scale=${SPILL_QUIZ_FRAME_WIDTH}:${SPILL_QUIZ_FRAME_HEIGHT}:force_original_aspect_ratio=increase,crop=${SPILL_QUIZ_FRAME_WIDTH}:${SPILL_QUIZ_FRAME_HEIGHT},setsar=1,fps=30,trim=duration=${durationSec.toFixed(3)},setpts=PTS-STARTPTS[base]`,
    ];
    let previous = 'base';
    for (let i = 0; i < options.segments.length; i++) {
      const start = cursor;
      const end = i === options.segments.length - 1 ? durationSec + 0.05 : cursor + durations[i]!;
      cursor += durations[i]!;
      const next = `v${i}`;
      const overlayInput = i + 1;
      chains.push(
        `[${previous}][${overlayInput}:v]overlay=0:0:${enableBetween(start, end)}[${next}]`
      );
      previous = next;
    }

    const voiceInput = options.segments.length + 1;
    args.push(
      '-filter_complex',
      chains.join(';'),
      '-map',
      `[${previous}]`,
      '-map',
      `${voiceInput}:a`,
      '-t',
      durationSec.toFixed(3),
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '160k',
      '-movflags',
      '+faststart',
      outputPath
    );

    await execFileAsync('ffmpeg', args, { maxBuffer: FFMPEG_MAX_BUFFER });
    return { outputPath, durationSec, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
