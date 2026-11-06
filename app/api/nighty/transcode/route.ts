import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { isAppAuthed, unauthorizedAppResponse } from '@/app/lib/app-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_BYTES = 40_000_000;

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('ffmpeg timed out'));
    }, 45_000);
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = `${stderr}${chunk.toString()}`.slice(-2000);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `ffmpeg exited ${code}`));
    });
  });
}

/** Turns a browser recording into an MP4 when the machine has ffmpeg. */
export async function POST(request: NextRequest) {
  if (!isAppAuthed(request)) return unauthorizedAppResponse();

  let dir: string | null = null;
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Recording is empty or too large' }, { status: 413 });
    }

    dir = await mkdtemp(path.join(os.tmpdir(), 'nighty-mp4-'));
    const input = path.join(dir, 'in.webm');
    const output = path.join(dir, 'out.mp4');
    await writeFile(input, Buffer.from(await file.arrayBuffer()));
    await runFfmpeg([
      '-y',
      '-i',
      input,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart',
      output,
    ]);
    const mp4 = await readFile(output);
    return new NextResponse(new Uint8Array(mp4), {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transcode failed';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
