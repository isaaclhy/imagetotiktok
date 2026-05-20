import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildCoverImagePromptText } from '@/app/lib/cover-image-openai';
import {
  generateGeminiImageSync,
  isGeminiImageConfigured,
  toDataUrl,
} from '@/app/lib/gemini-image';
import {
  generateVertexImagenImage,
  getVertexImagenConfigFromEnv,
} from '@/app/lib/vertex-imagen';
import {
  GEMINI_IMAGE_ASPECT_RATIO,
  GEMINI_IMAGE_SIZE,
} from '@/app/lib/gemini-image-config';

/**
 * POST /api/openai/cover-image
 * Body: { questiontext: string, promptId?: string }
 * 1. OpenAI Responses API → final image prompt text.
 * 2. Pixels: Gemini (sync) when GEMINI_API_KEY; else Vertex Imagen; else OpenAI images.
 * For multiple images use POST /api/openai/cover-image/batch (50% cheaper, async).
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const questiontext = typeof body?.questiontext === 'string' ? body.questiontext : '';
    const promptIdParam = typeof body?.promptId === 'string' ? body.promptId.trim() : null;

    if (!questiontext.trim()) {
      return NextResponse.json({ error: 'questiontext is required' }, { status: 400 });
    }

    const imagePrompt = await buildCoverImagePromptText(questiontext, promptIdParam);
    let imageUrl: string;

    if (isGeminiImageConfigured()) {
      const result = await generateGeminiImageSync(imagePrompt);
      imageUrl = toDataUrl(result);
    } else {
      const vertexConfig = getVertexImagenConfigFromEnv();
      if (vertexConfig) {
        const vertexSize =
          GEMINI_IMAGE_SIZE === '1K' || GEMINI_IMAGE_SIZE === '2K' ? GEMINI_IMAGE_SIZE : '2K';
        const { base64, mimeType } = await generateVertexImagenImage({
          prompt: imagePrompt,
          projectId: vertexConfig.projectId,
          location: vertexConfig.location,
          model: vertexConfig.model,
          aspectRatio: GEMINI_IMAGE_ASPECT_RATIO,
          sampleImageSize: vertexSize,
        });
        imageUrl = `data:${mimeType};base64,${base64}`;
      } else {
        const client = new OpenAI({ apiKey });
        const imgResult = await client.images.generate({
          model: 'gpt-image-1-mini',
          prompt: imagePrompt,
          size: '1024x1536',
          quality: 'high',
          output_format: 'png',
        });
        const first = imgResult.data?.[0];
        const b64 =
          first && 'b64_json' in first ? (first as { b64_json?: string }).b64_json : null;
        if (!b64) {
          return NextResponse.json({ error: 'No image data in response' }, { status: 502 });
        }
        imageUrl = `data:image/png;base64,${b64}`;
      }
    }

    return NextResponse.json({
      imageUrl,
      imagePrompt,
      provider: isGeminiImageConfigured() ? 'gemini' : 'fallback',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate cover image';
    console.error('Cover image error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
