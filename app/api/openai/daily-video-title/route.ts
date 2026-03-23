import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPT_ID = 'pmpt_69bc89d0258881959a6b4627844469dc0c2d439a06104550';

/**
 * POST /api/openai/daily-video-title
 * Body: { questions: string } - questions to pass to the prompt
 * Calls OpenAI Responses API to generate video title. No version specified = always latest.
 * Returns { text: string } or { error: string }.
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
    const questionsVariable =
      typeof body?.questions === 'string' ? body.questions : 'example questions';

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      prompt: {
        id: PROMPT_ID,
        variables: { questions: questionsVariable },
      },
    });

    const outputText =
      (response as { output_text?: string }).output_text ??
      extractOutputText(
        response as {
          output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
        }
      );

    if (!outputText?.trim()) {
      return NextResponse.json(
        { error: 'No text generated' },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: outputText.trim() });
  } catch (e: unknown) {
    console.error('[daily-video-title] Error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to generate title';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function extractOutputText(res: {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}): string {
  const out = res?.output ?? [];
  for (const item of out) {
    const content = item?.content ?? [];
    for (const c of content) {
      if (c?.type === 'output_text' && typeof c?.text === 'string') return c.text;
    }
  }
  return '';
}
