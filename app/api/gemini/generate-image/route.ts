import { NextRequest, NextResponse } from 'next/server';
import { generatePromptTabImage, formatGeminiQuotaHelp } from '@/app/lib/generate-prompt-image';
import { isGeminiQuotaError } from '@/app/lib/gemini-image';

/**
 * POST /api/gemini/generate-image
 * Body: { prompt: string }
 * Generates one image from prompt text (Gemini → Vertex → OpenAI on quota).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const result = await generatePromptTabImage(prompt);
    return NextResponse.json({
      imageUrl: result.imageUrl,
      mimeType: result.mimeType,
      provider: result.provider,
    });
  } catch (e) {
    console.error('Prompt image generation failed:', e);
    const raw = e instanceof Error ? e.message : 'Image generation failed';
    const quota = isGeminiQuotaError(e) || raw.includes('free-tier quota');
    const message = quota ? formatGeminiQuotaHelp() : raw.length > 400 ? `${raw.slice(0, 400)}…` : raw;
    return NextResponse.json({ error: message }, { status: quota ? 429 : 502 });
  }
}
