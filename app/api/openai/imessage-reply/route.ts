import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/** OpenAI platform prompt — boyfriend iMessage reply for Template 3 Q slides. */
export const IMAGE_TEMPLATE3_IMESSAGE_REPLY_PROMPT_ID =
  'pmpt_6a8e02fcd72c819080051190992a3af30db8ba75675944e2';
export const IMAGE_TEMPLATE3_IMESSAGE_REPLY_PROMPT_VERSION = '1';

/**
 * POST /api/openai/imessage-reply
 * Body: { question: string }
 * Returns { replies: string[] } — boyfriend-style iMessage bubble(s).
 * Prompt output is typically: {"replies":["…","…"]}
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      prompt: {
        id: IMAGE_TEMPLATE3_IMESSAGE_REPLY_PROMPT_ID,
        version: IMAGE_TEMPLATE3_IMESSAGE_REPLY_PROMPT_VERSION,
        variables: { question },
      },
    });

    const raw =
      (response as { output_text?: string }).output_text ??
      extractOutputText(
        response as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }
      );

    const replies = parseImessageReplies(raw);
    if (replies.length === 0) {
      return NextResponse.json({ error: 'No reply generated' }, { status: 502 });
    }

    return NextResponse.json({ replies });
  } catch (e: unknown) {
    console.error('[imessage-reply] Error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to generate reply';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Parse prompt JSON `{"replies":[...]}` or fall back to plain text. */
export function parseImessageReplies(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const tryParse = (text: string): string[] | null => {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((x): x is string => typeof x === 'string')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { replies?: unknown }).replies)) {
        return ((parsed as { replies: unknown[] }).replies)
          .filter((x): x is string => typeof x === 'string')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      /* not JSON */
    }
    return null;
  };

  const direct = tryParse(trimmed);
  if (direct?.length) return direct;

  // Sometimes models wrap JSON in markdown fences
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    const fromFence = tryParse(fenced[1].trim());
    if (fromFence?.length) return fromFence;
  }

  // Embedded object in surrounding text
  const objMatch = trimmed.match(/\{[\s\S]*"replies"[\s\S]*\}/);
  if (objMatch?.[0]) {
    const fromObj = tryParse(objMatch[0]);
    if (fromObj?.length) return fromObj;
  }

  return [trimmed];
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
