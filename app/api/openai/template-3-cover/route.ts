import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  IMAGE_TEMPLATE3_OPENAI_COVER_PROMPT,
  IMAGE_TEMPLATE3_OPENAI_COVER_SIZE,
} from '@/app/lib/image-template-3-openai-cover';

/**
 * POST /api/openai/template-3-cover
 * Image Template 3 cover via OpenAI images, used when the model picker is set to OpenAI.
 */
export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is required for OpenAI cover generation.' },
        { status: 503 }
      );
    }

    const client = new OpenAI({ apiKey });
    const imgResult = await client.images.generate({
      model: 'gpt-image-1-mini',
      prompt: IMAGE_TEMPLATE3_OPENAI_COVER_PROMPT,
      size: IMAGE_TEMPLATE3_OPENAI_COVER_SIZE,
      quality: 'high',
      output_format: 'png',
    });

    const first = imgResult.data?.[0];
    const b64 = first && 'b64_json' in first ? (first as { b64_json?: string }).b64_json : null;
    if (!b64) throw new Error('OpenAI returned no image data');

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${b64}`,
      mimeType: 'image/png',
      provider: 'openai',
    });
  } catch (e) {
    console.error('Image Template 3 OpenAI cover generation failed:', e);
    const raw = e instanceof Error ? e.message : 'Image generation failed';
    const message = raw.length > 400 ? `${raw.slice(0, 400)}…` : raw;
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
