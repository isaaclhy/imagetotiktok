import OpenAI from 'openai';
import {
  generateGeminiPromptTabImage,
  isGeminiImageConfigured,
  toDataUrl,
  isGeminiQuotaError,
} from '@/app/lib/gemini-image';
import {
  GEMINI_IMAGE_ASPECT_RATIO,
  GEMINI_IMAGE_SIZE,
} from '@/app/lib/gemini-image-config';
import {
  generateVertexImagenImage,
  getVertexImagenConfigFromEnv,
} from '@/app/lib/vertex-imagen';

export type PromptImageResult = {
  imageUrl: string;
  mimeType: string;
  provider: 'gemini' | 'vertex' | 'openai';
};

export function formatGeminiQuotaHelp(): string {
  return (
    'Gemini image free-tier quota is used up for this API key (limit 0 on image models). ' +
    'Wait ~30s and retry, check https://ai.dev/rate-limit, enable billing on your Google AI project, ' +
    'or rely on OpenAI/Vertex fallback if configured.'
  );
}

async function generateWithVertex(prompt: string): Promise<PromptImageResult | null> {
  const vertexConfig = getVertexImagenConfigFromEnv();
  if (!vertexConfig) return null;
  const vertexSize =
    GEMINI_IMAGE_SIZE === '1K' || GEMINI_IMAGE_SIZE === '2K' ? GEMINI_IMAGE_SIZE : '2K';
  const { base64, mimeType } = await generateVertexImagenImage({
    prompt,
    projectId: vertexConfig.projectId,
    location: vertexConfig.location,
    model: vertexConfig.model,
    aspectRatio: GEMINI_IMAGE_ASPECT_RATIO,
    sampleImageSize: vertexSize,
  });
  return {
    imageUrl: `data:${mimeType};base64,${base64}`,
    mimeType,
    provider: 'vertex',
  };
}

async function generateWithOpenAI(prompt: string): Promise<PromptImageResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  const client = new OpenAI({ apiKey });
  const imgResult = await client.images.generate({
    model: 'gpt-image-1-mini',
    prompt,
    size: '1024x1536',
    quality: 'high',
    output_format: 'png',
  });
  const first = imgResult.data?.[0];
  const b64 = first && 'b64_json' in first ? (first as { b64_json?: string }).b64_json : null;
  if (!b64) throw new Error('OpenAI returned no image data');
  return {
    imageUrl: `data:image/png;base64,${b64}`,
    mimeType: 'image/png',
    provider: 'openai',
  };
}

/** Prompt tab: Gemini (Nano Banana 2) → Vertex Imagen → OpenAI on quota/errors. */
export async function generatePromptTabImage(prompt: string): Promise<PromptImageResult> {
  const trimmed = prompt.trim();
  if (!trimmed) throw new Error('prompt is empty');

  let geminiQuotaHit = false;

  if (isGeminiImageConfigured()) {
    try {
      const result = await generateGeminiPromptTabImage(trimmed);
      return {
        imageUrl: toDataUrl(result),
        mimeType: result.mimeType,
        provider: 'gemini',
      };
    } catch (e) {
      if (isGeminiQuotaError(e)) {
        geminiQuotaHit = true;
        console.warn('[prompt-image] Gemini quota exhausted, trying fallbacks');
      } else {
        throw e;
      }
    }
  }

  const errors: string[] = [];

  try {
    const vertex = await generateWithVertex(trimmed);
    if (vertex) return vertex;
  } catch (e) {
    errors.push(`Vertex: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const openai = await generateWithOpenAI(trimmed);
    if (openai) return openai;
  } catch (e) {
    errors.push(`OpenAI: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (geminiQuotaHit) {
    const hint = formatGeminiQuotaHelp();
    if (errors.length > 0) {
      throw new Error(`${hint} Fallbacks failed: ${errors.join('; ')}`);
    }
    throw new Error(`${hint} Add OPENAI_API_KEY or GOOGLE_CLOUD_PROJECT for automatic fallback.`);
  }

  throw new Error(
    errors.length > 0
      ? `No image provider available. ${errors.join('; ')}`
      : 'Configure GEMINI_API_KEY, GOOGLE_CLOUD_PROJECT (Vertex), or OPENAI_API_KEY.'
  );
}
