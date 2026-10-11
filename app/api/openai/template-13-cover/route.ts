import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_CHARACTER_IMAGE_QUALITY,
  isCharacterImageQuality,
} from '@/app/lib/character-generation';
import { generateWithOpenAI } from '@/app/lib/generate-prompt-image';
import { buildTemplate13CoverPrompt } from '@/app/lib/image-template-13-cover';

export const maxDuration = 120;

/**
 * POST /api/openai/template-13-cover
 * Body: { screenText, quality }
 * The notification line on the phone is screenText.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const screenText = typeof body?.screenText === 'string' ? body.screenText.trim() : '';
    if (!screenText) {
      return NextResponse.json({ error: 'screenText is required' }, { status: 400 });
    }
    const qualityRaw = typeof body?.quality === 'string' ? body.quality.trim() : '';
    const quality = isCharacterImageQuality(qualityRaw)
      ? qualityRaw
      : DEFAULT_CHARACTER_IMAGE_QUALITY;

    const result = await generateWithOpenAI(buildTemplate13CoverPrompt(screenText), quality);
    if (!result) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      provider: result.provider,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate the cover';
    console.error('Template 13 cover error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
