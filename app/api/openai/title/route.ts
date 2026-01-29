import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPT_ID = 'pmpt_697a828356d48193add08df1687b46bb0c2b0324152ccb9d';
const PROMPT_VERSION = '5';

/**
 * POST /api/openai/title
 * Body: { context: string }
 * Calls OpenAI Responses API with stored prompt and variables.context.
 * Returns { title: string } or { error: string }.
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
    const context = typeof body?.context === 'string' ? body.context : '';

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      prompt: {
        id: PROMPT_ID,
        version: PROMPT_VERSION,
        variables: { context },
      },
    });

    const title = (response as { output_text?: string }).output_text ?? extractOutputText(response as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> });

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'No title generated' },
        { status: 502 }
      );
    }

    return NextResponse.json({ title: title.trim() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate title';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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
