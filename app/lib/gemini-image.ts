import { GoogleGenAI, JobState, Modality, type BatchJob, type GenerateContentResponse } from '@google/genai';
import {
  GEMINI_BATCH_MAX_WAIT_MS,
  GEMINI_BATCH_POLL_INTERVAL_MS,
  GEMINI_IMAGE_ASPECT_RATIO,
  GEMINI_IMAGE_MODEL,
  GEMINI_IMAGE_SIZE,
  GEMINI_PROMPT_TAB_IMAGE_MODEL,
  isGeminiImageConfigured,
} from '@/app/lib/gemini-image-config';

export type GeminiImageResult = { mimeType: string; base64: string };

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  return new GoogleGenAI({ apiKey });
}

export function imageGenerateConfig() {
  return {
    responseModalities: [Modality.TEXT, Modality.IMAGE],
    imageConfig: {
      aspectRatio: GEMINI_IMAGE_ASPECT_RATIO,
      imageSize: GEMINI_IMAGE_SIZE,
    },
  };
}

function extractImageFromResponse(response: GenerateContentResponse): GeminiImageResult {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData;
    if (inline?.data) {
      return {
        mimeType: inline.mimeType || 'image/png',
        base64: inline.data,
      };
    }
  }
  throw new Error('No image in Gemini response');
}

export function toDataUrl(result: GeminiImageResult): string {
  return `data:${result.mimeType};base64,${result.base64}`;
}

export type GenerateGeminiImageOptions = {
  /** Defaults to GEMINI_IMAGE_MODEL unless overridden. */
  model?: string;
};

/** Standard (non-batch) single image — use for one-off retries. */
export async function generateGeminiImageSync(
  prompt: string,
  options?: GenerateGeminiImageOptions
): Promise<GeminiImageResult> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: options?.model ?? GEMINI_IMAGE_MODEL,
    contents: prompt,
    config: imageGenerateConfig(),
  });
  return extractImageFromResponse(response);
}

export function isGeminiQuotaError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('Quota exceeded')
  );
}

/** Prompt tab: tries GEMINI_PROMPT_TAB_IMAGE_MODEL, falls back to GEMINI_IMAGE_MODEL on quota errors. */
export async function generateGeminiPromptTabImage(prompt: string): Promise<GeminiImageResult> {
  const primary = GEMINI_PROMPT_TAB_IMAGE_MODEL;
  const fallback = GEMINI_IMAGE_MODEL;
  try {
    return await generateGeminiImageSync(prompt, { model: primary });
  } catch (e) {
    if (primary !== fallback && isGeminiQuotaError(e)) {
      console.warn(
        `[gemini] Prompt tab quota hit for ${primary}; retrying with ${fallback}`
      );
      return generateGeminiImageSync(prompt, { model: fallback });
    }
    throw e;
  }
}

export type GeminiBatchImageRequest = { key: string; prompt: string };

const BATCH_TERMINAL = new Set([
  JobState.JOB_STATE_SUCCEEDED,
  JobState.JOB_STATE_FAILED,
  JobState.JOB_STATE_CANCELLED,
  JobState.JOB_STATE_EXPIRED,
  JobState.JOB_STATE_PARTIALLY_SUCCEEDED,
]);

export async function createGeminiImageBatchJob(
  requests: GeminiBatchImageRequest[]
): Promise<BatchJob> {
  if (requests.length === 0) throw new Error('No batch image requests');
  const ai = getClient();
  const config = imageGenerateConfig();

  const src = requests.map((r) => ({
    contents: [{ role: 'user' as const, parts: [{ text: r.prompt }] }],
    config,
    metadata: { key: r.key },
  }));

  return ai.batches.create({
    model: GEMINI_IMAGE_MODEL,
    src,
    config: { displayName: `bleamies-images-${Date.now()}` },
  });
}

export async function getGeminiBatchJob(name: string): Promise<BatchJob> {
  const ai = getClient();
  return ai.batches.get({ name });
}

function parseImagesFromBatchJob(job: BatchJob): Record<string, string> {
  const images: Record<string, string> = {};
  const responses = job.dest?.inlinedResponses ?? [];
  for (const item of responses) {
    const key = item.metadata?.key;
    if (!key || typeof key !== 'string') continue;
    if (item.error) {
      console.error(`Batch item ${key} error:`, item.error);
      continue;
    }
    if (!item.response) continue;
    try {
      images[key] = toDataUrl(extractImageFromResponse(item.response));
    } catch (e) {
      console.error(`Batch item ${key} parse error:`, e);
    }
  }
  return images;
}

export async function waitForGeminiBatchJob(
  name: string,
  options?: { maxWaitMs?: number; pollIntervalMs?: number }
): Promise<{ job: BatchJob; images: Record<string, string> }> {
  const maxWaitMs = options?.maxWaitMs ?? GEMINI_BATCH_MAX_WAIT_MS;
  const pollIntervalMs = options?.pollIntervalMs ?? GEMINI_BATCH_POLL_INTERVAL_MS;
  const started = Date.now();

  while (Date.now() - started < maxWaitMs) {
    const job = await getGeminiBatchJob(name);
    const state = job.state;
    if (state && BATCH_TERMINAL.has(state)) {
      if (
        state === JobState.JOB_STATE_FAILED ||
        state === JobState.JOB_STATE_CANCELLED ||
        state === JobState.JOB_STATE_EXPIRED
      ) {
        const msg = job.error?.message || `Batch job ended with state ${state}`;
        throw new Error(msg);
      }
      const images = parseImagesFromBatchJob(job);
      if (Object.keys(images).length === 0) {
        throw new Error('Batch job finished but no images were returned');
      }
      return { job, images };
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  throw new Error('Gemini batch job timed out');
}

export async function generateGeminiImagesBatch(
  requests: GeminiBatchImageRequest[]
): Promise<Record<string, string>> {
  const job = await createGeminiImageBatchJob(requests);
  if (!job.name) throw new Error('Batch job created without a name');
  const { images } = await waitForGeminiBatchJob(job.name);
  return images;
}

export { isGeminiImageConfigured };
