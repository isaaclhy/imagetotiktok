import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  generateVertexImagenImage,
  getVertexImagenConfigFromEnv,
} from '@/app/lib/vertex-imagen';

const PROMPT_IDS = [
  'pmpt_697bd67b55d48190ba24de5df8a84f3c0e7de9c8192b5cdc',
  'pmpt_6990f9a317588194827b173df4b3d6a30d4beef4679a5add',
  'pmpt_6991006af1cc8195a60c91937fc07b7100c73c923d7ad252',
];

function extractOutputText(res: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }): string {
  const out = res?.output ?? [];
  for (const item of out) {
    const content = item?.content ?? [];
    for (const c of content) {
      if (c?.type === 'output_text' && typeof c?.text === 'string') return c.text;
    }
  }
  return '';
}

/**
 * POST /api/openai/cover-image
 * Body: { questiontext: string, promptId?: string }
 * 1. OpenAI Responses API: stored prompt + questiontext → final image prompt text.
 * 2. Image pixels: Vertex AI Imagen when GOOGLE_CLOUD_PROJECT (or GCP_PROJECT_ID) is set;
 *    otherwise OpenAI images.generate (gpt-image-1-mini).
 * Returns { imageUrl: "data:image/png;base64,..." } or { error: string }.
 * Requires OPENAI_API_KEY. Vertex path also needs ADC (e.g. GOOGLE_APPLICATION_CREDENTIALS).
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const questiontext = typeof body?.questiontext === 'string' ? body.questiontext : '';
    const promptIdParam = typeof body?.promptId === 'string' ? body.promptId.trim() : null;

    if (!questiontext.trim()) {
      return NextResponse.json(
        { error: 'questiontext is required' },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });
    const promptId = promptIdParam && PROMPT_IDS.includes(promptIdParam)
      ? promptIdParam
      : PROMPT_IDS[Math.floor(Math.random() * PROMPT_IDS.length)]!;

    const response = await client.responses.create({
      prompt: {
        id: promptId,
        variables: { questiontext },
      },
    });

    const imagePrompt =
      (response as { output_text?: string }).output_text ??
      extractOutputText(response as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> });

    if (!imagePrompt?.trim()) {
      return NextResponse.json(
        { error: 'No image prompt generated' },
        { status: 502 }
      );
    }

    const vertexConfig = getVertexImagenConfigFromEnv();
    let imageUrl: string;

    if (vertexConfig) {
      const { base64, mimeType } = await generateVertexImagenImage({
        prompt: imagePrompt.trim(),
        projectId: vertexConfig.projectId,
        location: vertexConfig.location,
        model: vertexConfig.model,
        aspectRatio: '9:16',
        sampleImageSize: '1K',
      });
      imageUrl = `data:${mimeType};base64,${base64}`;
    } else {
      const imgResult = await client.images.generate({
        model: 'gpt-image-1-mini',
        prompt: imagePrompt.trim(),
        size: '1024x1536',
        quality: 'high',
        output_format: 'png',
      });

      const first = imgResult.data?.[0];
      const b64 =
        first && 'b64_json' in first ? (first as { b64_json?: string }).b64_json : null;

      if (!b64) {
        return NextResponse.json(
          { error: 'No image data in response' },
          { status: 502 }
        );
      }

      imageUrl = `data:image/png;base64,${b64}`;
    }

    return NextResponse.json({ imageUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate cover image';
    console.error('Cover image error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
