import { NextRequest, NextResponse } from 'next/server';
import {
  generateDailyCopy,
  isDailyCopyQuestionType,
  type DailyCopyQuestionType,
} from '@/app/lib/openai-daily-copy';

/**
 * POST /api/openai/daily-video-title
 * Body: { questions: string, type?: DailyCopyQuestionType }
 * Uses combined Spill It title+caption prompt; returns the title.
 * Returns { text, title, description } or { error }.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const questionsVariable =
      typeof body?.questions === 'string' ? body.questions : 'example questions';
    const type: DailyCopyQuestionType = isDailyCopyQuestionType(body?.type)
      ? body.type
      : 'funny';

    const copy = await generateDailyCopy(questionsVariable, type);
    return NextResponse.json({
      text: copy.title,
      title: copy.title,
      description: copy.description,
      type,
    });
  } catch (e: unknown) {
    console.error('[daily-video-title] Error:', e);
    const msg = e instanceof Error ? e.message : 'Failed to generate title';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
