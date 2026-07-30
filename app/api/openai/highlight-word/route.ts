import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { normalizeHighlightCandidate } from '@/app/lib/highlight-word';

/**
 * POST /api/openai/highlight-word
 * Body: { title: string }
 * Picks one curiosity-driving word from the title for underline emphasis.
 * Returns { word: string } or { error: string }.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: `Highlight ONE word in this sentence that is interesting or would poke people's curiosity so they swipe for more.

Rules:
- Reply with ONLY that single word, exactly as it appears in the sentence
- No quotes, punctuation, explanation, or extra words
- Prefer emotional, concrete, surprising, or spicy words
- Avoid filler words like: the, a, an, to, of, for, and, or, your, ask, questions, tonight

Sentence:
${title}`,
        },
      ],
    });

    const raw =
      (response as { output_text?: string }).output_text ??
      extractOutputText(
        response as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }
      );

    const word = normalizeHighlightCandidate(raw ?? '', title);
    if (!word) {
      return NextResponse.json({ error: 'No valid highlight word returned' }, { status: 502 });
    }

    return NextResponse.json({ word });
  } catch (e: unknown) {
    console.error('[highlight-word] Error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to pick highlight word';
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
