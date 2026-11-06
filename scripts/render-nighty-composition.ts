/**
 * Dev renderer for one original Nighty composition.
 * Uses the same frame timeline and painter as the studio, and muxes the
 * owned rain/ocean files with per-sound gain from that timeline.
 *
 * Usage: npx tsx scripts/render-nighty-composition.ts [slug] [outfile]
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { nightyRainAudioSrc } from '../app/lib/constants';
import {
  cloneCompositionState,
  getNightyComposition,
  NIGHTY_COMPOSITIONS,
} from '../app/lib/nighty-video-templates/catalog';
import { paintNightyFrame } from '../app/lib/nighty-video-templates/paint';
import {
  NIGHTY_COMPOSITION_EXPORT_FPS,
  NIGHTY_COMPOSITION_EXPORT_HEIGHT,
  NIGHTY_COMPOSITION_EXPORT_WIDTH,
} from '../app/lib/nighty-video-templates/record';
import { compositionSoundIds, frameAt } from '../app/lib/nighty-video-templates/timeline';

const slug = process.argv[2] || 'which-rain';
const outfile = process.argv[3] || path.join(process.cwd(), `nighty-${slug}.mp4`);
const template = NIGHTY_COMPOSITIONS.find((item) => item.slug === slug) ?? getNightyComposition(3);
const state = cloneCompositionState(template.defaults);
const width = NIGHTY_COMPOSITION_EXPORT_WIDTH;
const height = NIGHTY_COMPOSITION_EXPORT_HEIGHT;
const fps = NIGHTY_COMPOSITION_EXPORT_FPS;

GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-500.ttf', 'TikTok Sans');
GlobalFonts.registerFromPath('public/fonts/tiktok-sans/TikTokSans-600.ttf', 'TikTok Sans');

const soundIds = compositionSoundIds(template, state);
const dir = mkdtempSync(path.join(tmpdir(), 'nighty-comp-'));
const commandFiles = soundIds.map((id, index) => {
  const file = path.join(dir, `gain-${index}.txt`);
  const lines: string[] = [];
  const steps = Math.round(template.durationSec * 10);
  for (let step = 0; step <= steps; step += 1) {
    const t = Math.min(template.durationSec, step / 10);
    const gain = frameAt(template, state, t).gains.find((item) => item.soundId === id)?.gain ?? 0;
    lines.push(`${t.toFixed(2)} volume volume ${gain.toFixed(4)};`);
  }
  writeFileSync(file, `${lines.join('\n')}\n`);
  return file;
});

const filterParts = soundIds.map((_, index) => {
  const input = index + 1;
  const file = commandFiles[index]!.replace(/\\/g, '/').replace(/:/g, '\\:');
  return `[${input}:a]atrim=0:${template.durationSec},asetpts=PTS-STARTPTS,asendcmd=f='${file}',volume[a${index}]`;
});
const mixInputs = soundIds.map((_, index) => `[a${index}]`).join('');
filterParts.push(
  `${mixInputs}amix=inputs=${soundIds.length}:duration=longest:normalize=0:dropout_transition=0[a]`
);

const args = [
  '-y',
  '-f',
  'rawvideo',
  '-pix_fmt',
  'rgba',
  '-s',
  `${width}x${height}`,
  '-r',
  String(fps),
  '-i',
  'pipe:0',
  ...soundIds.flatMap((id) => ['-i', path.join('public', nightyRainAudioSrc(id).replace(/^\//, ''))]),
  '-filter_complex',
  filterParts.join(';'),
  '-map',
  '0:v:0',
  '-map',
  '[a]',
  '-t',
  String(template.durationSec),
  '-c:v',
  'libx264',
  '-pix_fmt',
  'yuv420p',
  '-preset',
  'veryfast',
  '-crf',
  '20',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-movflags',
  '+faststart',
  outfile,
];

async function main(): Promise<void> {
  const ffmpeg = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  ffmpeg.stdin.on('error', () => undefined);
  const closed = new Promise<number>((resolve, reject) => {
    ffmpeg.on('error', reject);
    ffmpeg.on('close', (status) => resolve(status ?? 1));
  });
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const frames = Math.round(template.durationSec * fps);
  for (let frameIndex = 0; frameIndex < frames; frameIndex += 1) {
    const t = frameIndex / fps;
    paintNightyFrame(
      ctx as unknown as CanvasRenderingContext2D,
      width,
      height,
      frameAt(template, state, t)
    );
    const pixels = canvas.data();
    if (pixels.length !== width * height * 4) {
      throw new Error(`Unexpected frame buffer ${pixels.length}`);
    }
    if (!ffmpeg.stdin.write(pixels)) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }
  }
  ffmpeg.stdin.end();
  const code = await closed;
  if (code !== 0) process.exit(code);
  console.log(`rendered ${template.slug} -> ${outfile}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
