import { NextRequest, NextResponse } from 'next/server';
import { buildCoverImagePromptText } from '@/app/lib/cover-image-openai';
import { generateWithOpenAI } from '@/app/lib/generate-prompt-image';
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
 * 2. Pixels: OpenAI gpt-image-2.5-flare first; Gemini then Vertex on failure.
 * For multiple images use POST /api/openai/cover-image/batch (still Gemini batch).
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
    let provider: 'openai' | 'gemini' | 'vertex' = 'openai';

    const openai = await generateWithOpenAI(imagePrompt).catch((e) => {
      console.warn('OpenAI image generation failed, trying fallbacks:', e);
      return null;
    });

    if (openai) {
      imageUrl = openai.imageUrl;
      provider = 'openai';
    } else if (isGeminiImageConfigured()) {
      const result = await generateGeminiImageSync(imagePrompt);
      imageUrl = toDataUrl(result);
      provider = 'gemini';
    } else {
      const vertexConfig = getVertexImagenConfigFromEnv();
      if (!vertexConfig) {
        return NextResponse.json({ error: 'No image data in response' }, { status: 502 });
      }
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
      provider = 'vertex';
    }

    return NextResponse.json({
      imageUrl,
      imagePrompt,
      provider,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate cover image';
    console.error('Cover image error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
