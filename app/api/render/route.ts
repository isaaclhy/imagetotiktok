import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import os from 'os';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let outputPath = '';
  let bundled = '';

  try {
    const body = await request.json();
    const questions: string[] = Array.isArray(body?.questions) ? body.questions.filter((q: unknown) => typeof q === 'string' && (q as string).trim()) : [];

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    const title = typeof body?.title === 'string' && body.title.trim() ? body.title.trim() : 'Spill It';

    const entryPoint = path.join(process.cwd(), 'remotion', 'index.ts');

    bundled = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });

    const inputProps = { title, questions };

    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'QuestionVideo',
      inputProps,
    });

    outputPath = path.join(os.tmpdir(), `questions-video-${Date.now()}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
    });

    const videoBuffer = fs.readFileSync(outputPath);

    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="questions-video.mp4"',
        'Content-Length': String(videoBuffer.length),
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to render video';
    console.error('Render error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    if (outputPath && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    if (bundled && fs.existsSync(bundled)) {
      fs.rmSync(bundled, { recursive: true, force: true });
    }
  }
}
