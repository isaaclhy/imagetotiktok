import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPT_ID = 'pmpt_69b5f2ad999c81949f29e044248eafe90dd231b3e36b0ca0';
const PROMPT_VERSION = '2';

/**
 * POST /api/openai/daily-title
 * Body: { questions: string } - questions to pass to the prompt
 * Calls OpenAI Responses API to generate content (e.g. title) for daily TikTok.
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
    console.error('[daily-title] Error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to generate text';
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
