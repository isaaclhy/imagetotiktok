import { NextRequest, NextResponse } from 'next/server';
import { JobState } from '@google/genai';
import { buildCoverImagePromptText } from '@/app/lib/cover-image-openai';
import {
  createGeminiImageBatchJob,
  getGeminiBatchJob,
  isGeminiImageConfigured,
} from '@/app/lib/gemini-image';
import { GEMINI_IMAGE_ASPECT_RATIO, GEMINI_IMAGE_SIZE, GEMINI_IMAGE_MODEL } from '@/app/lib/gemini-image-config';

export const maxDuration = 300;

type BatchItem = { key: string; questiontext: string; promptId?: string };

const TERMINAL = new Set([
  JobState.JOB_STATE_SUCCEEDED,
  JobState.JOB_STATE_FAILED,
  JobState.JOB_STATE_CANCELLED,
  JobState.JOB_STATE_EXPIRED,
  JobState.JOB_STATE_PARTIALLY_SUCCEEDED,
]);

function parseImagesFromJob(job: Awaited<ReturnType<typeof getGeminiBatchJob>>) {
  const images: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const item of job.dest?.inlinedResponses ?? []) {
    const key = typeof item.metadata?.key === 'string' ? item.metadata.key : '';
    if (!key) continue;
    if (item.error) {
      errors[key] = item.error.message || 'Batch item failed';
      continue;
    }
    if (!item.response) {
      errors[key] = 'Empty response';
      continue;
    }
    try {
      const parts = item.response.candidates?.[0]?.content?.parts ?? [];
      let found = false;
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          images[key] = `data:${mime};base64,${part.inlineData.data}`;
          found = true;
          break;
        }
      }
      if (!found) errors[key] = 'No image in response';
    } catch (e) {
      errors[key] = e instanceof Error ? e.message : 'Parse error';
    }
  }
  return { images, errors };
}

/**
 * POST — build OpenAI prompts, start Gemini Batch job (50% image cost).
 * Body: { items: [{ key, questiontext, promptId? }] }
 */
export async function POST(request: NextRequest) {
  if (!isGeminiImageConfigured()) {
    return NextResponse.json(
      {
        error:
          'GEMINI_API_KEY is required for batch image generation. Add it to .env.local or use single /api/openai/cover-image without batch.',
      },
      { status: 503 }
    );
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const rawItems = body?.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    const items: BatchItem[] = rawItems.map((item: unknown, i: number) => {
      const o = item as { key?: string; questiontext?: string; promptId?: string };
      const key = typeof o.key === 'string' && o.key.trim() ? o.key.trim() : `item-${i}`;
      const questiontext = typeof o.questiontext === 'string' ? o.questiontext : '';
      const promptId = typeof o.promptId === 'string' ? o.promptId : undefined;
      return { key, questiontext, promptId };
    });

    const promptTexts = await Promise.all(
      items.map(async (item) => {
        if (!item.questiontext.trim()) throw new Error(`Missing questiontext for ${item.key}`);
        const imagePrompt = await buildCoverImagePromptText(item.questiontext, item.promptId);
        return { key: item.key, prompt: imagePrompt };
      })
    );

    const job = await createGeminiImageBatchJob(promptTexts);
    if (!job.name) {
      return NextResponse.json({ error: 'Batch job created without a name' }, { status: 502 });
    }

    return NextResponse.json({
      jobName: job.name,
      state: job.state,
      count: items.length,
      model: GEMINI_IMAGE_MODEL,
      aspectRatio: GEMINI_IMAGE_ASPECT_RATIO,
      imageSize: GEMINI_IMAGE_SIZE,
      mode: 'batch',
    });
  } catch (e) {
    console.error('Cover image batch create error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to start batch job';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET ?jobName=batches/... — poll batch job; returns images when succeeded.
 */
export async function GET(request: NextRequest) {
  const jobName = request.nextUrl.searchParams.get('jobName')?.trim();
  if (!jobName) {
    return NextResponse.json({ error: 'jobName query param is required' }, { status: 400 });
  }

  if (!isGeminiImageConfigured()) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 });
  }

  try {
    const job = await getGeminiBatchJob(jobName);
    const state = job.state ?? JobState.JOB_STATE_UNSPECIFIED;
    const done = TERMINAL.has(state);

    if (!done) {
      return NextResponse.json({ jobName, state, done: false });
    }

    if (
      state === JobState.JOB_STATE_FAILED ||
      state === JobState.JOB_STATE_CANCELLED ||
      state === JobState.JOB_STATE_EXPIRED
    ) {
      return NextResponse.json({
        jobName,
        state,
        done: true,
        error: job.error?.message || `Batch ended with ${state}`,
      });
    }

    const { images, errors } = parseImagesFromJob(job);
    return NextResponse.json({
      jobName,
      state,
      done: true,
      images,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    });
  } catch (e) {
    console.error('Cover image batch poll error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to poll batch job';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
