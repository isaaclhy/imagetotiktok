import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { isAppAuthed, unauthorizedAppResponse } from '@/app/lib/app-auth';
import { saveDailyVideo } from '@/app/lib/video-library/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** One clearly marked clip so delete can be tested without touching the cartoons. */
export async function POST(request: NextRequest) {
  if (!isAppAuthed(request)) return unauthorizedAppResponse();
  try {
    const filePath = path.join(process.cwd(), 'data', 'cartoon-originals', 'test-artifact.mp4');
    const mp4 = await fs.readFile(filePath);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const saved = await saveDailyVideo({
      templateId: 8,
      templateKey: 'test-artifact',
      title: 'TEST artifact — safe to delete',
      filename: `test-artifact-${stamp}.mp4`,
      day: 'test',
      lines: ['This is a test clip. Deleting it does not remove the cartoon quizzes.'],
      mp4,
      origin: `test:${stamp}`,
    });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create the test clip';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
