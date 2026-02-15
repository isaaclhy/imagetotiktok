import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPT_ID_COUPLES = 'pmpt_697a828356d48193add08df1687b46bb0c2b0324152ccb9d';
const PROMPT_ID_FRIENDS = 'pmpt_69908d377ea88195a5bf8cb15cc77f120c5ce2b24cee5860';

/**
 * POST /api/openai/title
 * Body: { context: string, level?: string }
 * Uses prompt for Couples if level is "Couples", otherwise Friends prompt.
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
    const level = typeof body?.level === 'string' ? body.level : '';
    const isCouples = level.toLowerCase() === 'couples';
    const promptId = isCouples ? PROMPT_ID_COUPLES : PROMPT_ID_FRIENDS;

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      prompt: {
        id: promptId,
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
    console.error('[title] Error:', e);
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
