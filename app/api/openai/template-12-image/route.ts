import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_CHARACTER_IMAGE_QUALITY,
  isCharacterImageQuality,
} from '@/app/lib/character-generation';
import { generateWithOpenAI } from '@/app/lib/generate-prompt-image';
import {
  buildTemplate12ImagePrompt,
  type Template12Scene,
} from '@/app/lib/image-template-12-couples';

export const maxDuration = 120;

/**
 * POST /api/openai/template-12-image
 * Body: { slideText, scene: { setting, action }, quality, leaveBottomClear }
 * One storybook poster via gpt-image-2.5-flare. Text is rendered in the image.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slideText = typeof body?.slideText === 'string' ? body.slideText.trim() : '';
    const setting = typeof body?.scene?.setting === 'string' ? body.scene.setting.trim() : '';
    const action = typeof body?.scene?.action === 'string' ? body.scene.action.trim() : '';
    if (!slideText) {
      return NextResponse.json({ error: 'slideText is required' }, { status: 400 });
    }
    if (!setting || !action) {
      return NextResponse.json({ error: 'scene.setting and scene.action are required' }, { status: 400 });
    }
    const scene: Template12Scene = { setting, action };
    const qualityRaw = typeof body?.quality === 'string' ? body.quality.trim() : '';
    const quality = isCharacterImageQuality(qualityRaw)
      ? qualityRaw
      : DEFAULT_CHARACTER_IMAGE_QUALITY;

    const result = await generateWithOpenAI(
      buildTemplate12ImagePrompt(slideText, scene, {
        leaveBottomClear: body?.leaveBottomClear === true,
      }),
      quality
    );
    if (!result) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      provider: result.provider,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate template image';
    console.error('Template 12 image error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
