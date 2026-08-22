import { NextResponse } from 'next/server';
import {
  generateGeminiImageSync,
  isGeminiQuotaError,
  toDataUrl,
} from '@/app/lib/gemini-image';
import { isGeminiImageConfigured } from '@/app/lib/gemini-image-config';
import { formatGeminiQuotaHelp } from '@/app/lib/generate-prompt-image';
import {
  IMAGE_TEMPLATE3_COVER_ASPECT_RATIO,
  IMAGE_TEMPLATE3_COVER_IMAGE_SIZE,
  pickRandomImageTemplate3CoverPrompt,
} from '@/app/lib/image-template-3-cover';

/**
 * POST /api/gemini/template-3-cover
 * Generates Image Template 3 cover via Nano Banana 2 at 1K / 9:16.
 * Randomly uses shocked, playful, or goofy prompt variant each request.
 */
export async function POST() {
  try {
    if (!isGeminiImageConfigured()) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is required for Image Template 3 cover generation.' },
        { status: 503 }
      );
    }

    const { prompt, variant } = pickRandomImageTemplate3CoverPrompt();
    const result = await generateGeminiImageSync(prompt, {
      aspectRatio: IMAGE_TEMPLATE3_COVER_ASPECT_RATIO,
      imageSize: IMAGE_TEMPLATE3_COVER_IMAGE_SIZE,
    });

    return NextResponse.json({
      imageUrl: toDataUrl(result),
      mimeType: result.mimeType,
      provider: 'gemini',
      variant,
    });
  } catch (e) {
    console.error('Image Template 3 cover generation failed:', e);
    const raw = e instanceof Error ? e.message : 'Image generation failed';
    const quota = isGeminiQuotaError(e) || raw.includes('free-tier quota');
    const message = quota ? formatGeminiQuotaHelp() : raw.length > 400 ? `${raw.slice(0, 400)}…` : raw;
    return NextResponse.json({ error: message }, { status: quota ? 429 : 502 });
  }
}
