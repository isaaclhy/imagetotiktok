import { NextResponse } from 'next/server';
import {
  generateGeminiImageSync,
  isGeminiQuotaError,
  toDataUrl,
} from '@/app/lib/gemini-image';
import {
  GEMINI_IMAGE_PRO_MODEL,
  isGeminiImageConfigured,
} from '@/app/lib/gemini-image-config';
import { formatGeminiQuotaHelp } from '@/app/lib/generate-prompt-image';
import {
  IMAGE_TEMPLATE4_COVER_ASPECT_RATIO,
  IMAGE_TEMPLATE4_COVER_IMAGE_SIZE,
  pickRandomImageTemplate4CoverPrompt,
} from '@/app/lib/image-template-4-cover';

/**
 * POST /api/gemini/template-4-cover
 * Generates the Image Template 4 mirror-selfie cover via Nano Banana Pro at 2K / 9:16.
 * Randomly uses the hoodie or blonde prompt variant each request.
 */
export async function POST() {
  try {
    if (!isGeminiImageConfigured()) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is required for Image Template 4 cover generation.' },
        { status: 503 }
      );
    }

    const { prompt, variant } = pickRandomImageTemplate4CoverPrompt();
    const result = await generateGeminiImageSync(prompt, {
      model: GEMINI_IMAGE_PRO_MODEL,
      aspectRatio: IMAGE_TEMPLATE4_COVER_ASPECT_RATIO,
      imageSize: IMAGE_TEMPLATE4_COVER_IMAGE_SIZE,
    });

    return NextResponse.json({
      imageUrl: toDataUrl(result),
      mimeType: result.mimeType,
      provider: 'gemini',
      model: GEMINI_IMAGE_PRO_MODEL,
      variant,
    });
  } catch (e) {
    console.error('Image Template 4 cover generation failed:', e);
    const raw = e instanceof Error ? e.message : 'Image generation failed';
    const quota = isGeminiQuotaError(e) || raw.includes('free-tier quota');
    const message = quota ? formatGeminiQuotaHelp() : raw.length > 400 ? `${raw.slice(0, 400)}…` : raw;
    return NextResponse.json({ error: message }, { status: quota ? 429 : 502 });
  }
}
