import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_WORDS = 9;
const COPYCAT_CAPTION_HASHTAGS =
  '#couplesgoals #datenightideas #relationshipgoals #coupleschallenge';

function extractOutputText(res: {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}): string {
  if (typeof res.output_text === 'string' && res.output_text.trim()) {
    return res.output_text;
  }
  for (const item of res.output ?? []) {
    for (const part of item.content ?? []) {
      if (part.type === 'output_text' && typeof part.text === 'string') return part.text;
    }
  }
  return '';
}

function clampCaption(raw: string): string {
  const cleaned = raw
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/[#@]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleaned.split(' ').filter(Boolean);
  return words.slice(0, MAX_WORDS).join(' ');
}

/**
 * POST /api/openai/copycat-caption
 * Body: { cover: string, questions: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = (await request.json()) as {
      cover?: unknown;
      questions?: unknown;
    };
    const cover = typeof body.cover === 'string' ? body.cover.trim() : '';
    const questions = Array.isArray(body.questions)
      ? body.questions
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 6)
      : [];

    if (!cover && questions.length === 0) {
      return NextResponse.json({ error: 'Need cover text or questions' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You write TikTok captions for a couples question carousel app called Spill It. Voice: extremely Gen Z, lazy, dry, slightly unhinged, like someone doomscrolling at 1am. Lowercase ok. No hashtags, no emojis spam, no quotes. Max 9 words. One line only. Do not explain.',
        },
        {
          role: 'user',
          content: `Write one caption under 10 words from this carousel.\nCover: ${cover || '(none)'}\nQuestions:\n${questions.join('\n') || '(none)'}`,
        },
      ],
    });

    const caption = clampCaption(extractOutputText(response));
    if (!caption) {
      return NextResponse.json({ error: 'No caption generated' }, { status: 502 });
    }
    return NextResponse.json({
      caption: `${caption} ${COPYCAT_CAPTION_HASHTAGS}`,
    });
  } catch (e: unknown) {
    console.error('[copycat-caption] Error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to generate caption';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
