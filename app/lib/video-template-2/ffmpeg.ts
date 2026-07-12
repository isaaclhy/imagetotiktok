import { execFile } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { VIDEO_TEMPLATE2_MAX_DURATION_SEC } from '@/app/lib/video-template-2/overlay-metrics';
import { renderVideoTemplate2OverlayPng } from '@/app/lib/video-template-2/overlay-canvas';

const execFileAsync = promisify(execFile);

export async function assertFfmpegAvailable(): Promise<void> {
  try {
    await execFileAsync('ffmpeg', ['-version']);
  } catch {
    throw new Error(
      'ffmpeg is not installed. Install ffmpeg locally or run this job via GitHub Actions (which installs it automatically).'
    );
  }
}

export async function probeVideoDimensions(videoPath: string): Promise<{ width: number; height: number }> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=p=0:s=x',
    videoPath,
  ]);

  const [widthRaw, heightRaw] = stdout.trim().split('x');
  const width = Number(widthRaw);
  const height = Number(heightRaw);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error('Failed to read video dimensions');
  }
  return { width, height };
}

export async function downloadToFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download video (${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buffer);
}

export async function renderVideoTemplate2WithOverlay(options: {
  videoUrl: string;
  title: string;
  questions: string[];
  outputPath?: string;
}): Promise<{ outputPath: string; width: number; height: number }> {
  await assertFfmpegAvailable();

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vt2-daily-'));
  const inputPath = path.join(tmpDir, 'input.mp4');
  const overlayPath = path.join(tmpDir, 'overlay.png');
  const outputPath = options.outputPath ?? path.join(tmpDir, 'output.mp4');

  try {
    await downloadToFile(options.videoUrl, inputPath);
    const { width, height } = await probeVideoDimensions(inputPath);
    const overlayPng = renderVideoTemplate2OverlayPng(width, height, options.title, options.questions);
    await fs.writeFile(overlayPath, overlayPng);

    await execFileAsync('ffmpeg', [
      '-y',
      '-i',
      inputPath,
      '-i',
      overlayPath,
      '-filter_complex',
      '[0:v][1:v]overlay=0:0',
      '-t',
      String(VIDEO_TEMPLATE2_MAX_DURATION_SEC),
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-an',
      outputPath,
    ]);

    return { outputPath, width, height };
  } catch (e) {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    throw e;
  }
}

export async function readFileBuffer(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

export async function cleanupRenderedVideo(outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
}
