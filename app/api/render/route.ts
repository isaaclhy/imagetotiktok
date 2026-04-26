import { NextRequest, NextResponse } from 'next/server';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getRemotionBundleServeUrl } from './get-remotion-bundle';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let outputPath = '';

  try {
    const body = await request.json();
    const questions: string[] = Array.isArray(body?.questions) ? body.questions.filter((q: unknown) => typeof q === 'string' && (q as string).trim()) : [];

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    const titleRaw = typeof body?.title === 'string' && body.title.trim() ? body.title.trim() : '';
    const templateRaw = typeof body?.template === 'string' ? body.template.trim() : '';
    const templateMode = body?.templateMode === 'video' || body?.templateMode === 'questions_on_page'
      ? 'video'
      : 'static';

    let title: string;
    let showQuestionsAsSlides: boolean;
    let showBranding: boolean;
    let minimalVideo: boolean;

    if (templateMode === 'video') {
      title = questions.join('\n') || titleRaw || 'Spill It';
      showQuestionsAsSlides = false;
      showBranding = false;
      minimalVideo = true;
    } else {
      const parts = [templateRaw, titleRaw].filter(Boolean);
      title = parts.join('\n') || 'Spill It';
      showQuestionsAsSlides = true;
      showBranding = false;
      minimalVideo = false;
    }

    const serveUrl = await getRemotionBundleServeUrl();

    const inputProps = { title, questions, showQuestionsAsSlides, showBranding, minimalVideo };

    const composition = await selectComposition({
      serveUrl,
      id: 'QuestionVideo',
      inputProps,
    });

    outputPath = path.join(os.tmpdir(), `questions-video-${Date.now()}.mp4`);

    await renderMedia({
      composition,
      serveUrl,
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
  }
}
