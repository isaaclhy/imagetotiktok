import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const PROMPT_ID = 'pmpt_697bd67b55d48190ba24de5df8a84f3c0e7de9c8192b5cdc';
const PROMPT_VERSION = '2';

/**
 * POST /api/openai/theme
 * Body: { context: string }
 * Calls OpenAI Responses API for image theme (Pexels query).
 * Context = category + first 3 questions.
 * Returns { theme: string } or { error: string }.
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

    const theme = (response as { output_text?: string }).output_text ?? extractOutputText(response as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> });

    if (!theme?.trim()) {
      return NextResponse.json(
        { error: 'No theme generated' },
        { status: 502 }
      );
    }

    return NextResponse.json({ theme: theme.trim() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate theme';
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
