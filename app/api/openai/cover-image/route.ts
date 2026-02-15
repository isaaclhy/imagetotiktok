import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPT_IDS = [
  'pmpt_697bd67b55d48190ba24de5df8a84f3c0e7de9c8192b5cdc',
  'pmpt_6990f9a317588194827b173df4b3d6a30d4beef4679a5add',
  'pmpt_6991006af1cc8195a60c91937fc07b7100c73c923d7ad252',
];

function extractOutputText(res: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }): string {
  const out = res?.output ?? [];
  for (const item of out) {
    const content = item?.content ?? [];
    for (const c of content) {
      if (c?.type === 'output_text' && typeof c?.text === 'string') return c.text;
    }
  }
  return '';
}

/**
 * POST /api/openai/cover-image
 * Body: { questiontext: string }
 * 1. Randomly picks one of two Responses API prompts, calls it with questiontext to get image prompt.
 * 2. Calls images.generate (gpt-image-1-mini) with that prompt.
 * Returns { imageUrl: "data:image/png;base64,..." } or { error: string }.
 * Requires OPENAI_API_KEY in env.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const questiontext = typeof body?.questiontext === 'string' ? body.questiontext : '';

    if (!questiontext.trim()) {
      return NextResponse.json(
        { error: 'questiontext is required' },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });
    const promptId = PROMPT_IDS[Math.floor(Math.random() * PROMPT_IDS.length)]!;

    const response = await client.responses.create({
      prompt: {
        id: promptId,
        variables: { questiontext },
      },
    });

    const imagePrompt =
      (response as { output_text?: string }).output_text ??
      extractOutputText(response as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> });

    if (!imagePrompt?.trim()) {
      return NextResponse.json(
        { error: 'No image prompt generated' },
        { status: 502 }
      );
    }

    const imgResult = await client.images.generate({
      model: "gpt-image-1-mini",
      prompt: imagePrompt.trim(),
      size: '1024x1536',
      quality: 'high',
      output_format: 'png',
    });

    const first = imgResult.data?.[0];
    const b64 = first && 'b64_json' in first ? (first as { b64_json?: string }).b64_json : null;

    if (!b64) {
      return NextResponse.json(
        { error: 'No image data in response' },
        { status: 502 }
      );
    }

    const imageUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({ imageUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate cover image';
    console.error('Cover image error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
