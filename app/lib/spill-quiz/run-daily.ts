import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import type { SpillQuizTemplateId, SpillQuizTemplateKey } from '@/app/lib/spill-quiz/script';
import { findDailyVideoForDay, saveDailyVideo } from '@/app/lib/video-library/store';

export type DailySpillQuizResult = {
  ok: true;
  skipped: boolean;
  templateId: SpillQuizTemplateId;
  templateKey: SpillQuizTemplateKey;
  title: string;
  day: string;
  filename: string;
  libraryId?: string;
  blobPathname?: string;
};

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function runPython(root: string, templateId: SpillQuizTemplateId, day: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'python3',
      [path.join(root, 'scripts', 'render_daily.py')],
      {
        cwd: root,
        env: {
          ...process.env,
          CARTOON_QUIZ_ROOT: root,
          CARTOON_TEMPLATE: String(templateId),
          CARTOON_DAY: day,
          CARTOON_OUT: outPath,
          KOKORO_ONNX: process.env.KOKORO_ONNX || path.join(root, 'models', 'kokoro-v1.0.onnx'),
          KOKORO_VOICES: process.env.KOKORO_VOICES || path.join(root, 'models', 'voices-v1.0.bin'),
        },
      }
    );
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => process.stdout.write(chunk));
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim().slice(-500) || `Cartoon render exited ${code}`));
    });
  });
}

export async function runDailySpillQuiz(templateId: SpillQuizTemplateId): Promise<DailySpillQuizResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) throw new Error('Missing BLOB_READ_WRITE_TOKEN');
  if (!process.env.MONGODB_URI?.trim()) throw new Error('Missing MONGODB_URI');

  const templateKey: SpillQuizTemplateKey = templateId === 8 ? 'know-girlfriend' : 'quiz-girlfriend';
  const title =
    templateId === 8 ? 'How well do you know your girlfriend?' : 'Quiz your girlfriend';
  const day = utcDay();
  const filename = `${templateKey}-${day}.mp4`;

  if (process.env.DAILY_QUIZ_FORCE !== '1') {
    const existing = await findDailyVideoForDay(templateKey, day);
    if (existing && existing.day !== 'original') {
      return {
        ok: true,
        skipped: true,
        templateId,
        templateKey,
        title: existing.title,
        day,
        filename: existing.filename,
        libraryId: existing._id.toString(),
        blobPathname: existing.blobPathname,
      };
    }
  }

  const root = path.join(process.cwd(), 'cartoon-quiz');
  const outPath = path.join(root, 'out', filename);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await runPython(root, templateId, day, outPath);
  const mp4 = await fs.readFile(outPath);
  const saved = await saveDailyVideo({
    templateId,
    templateKey,
    title,
    filename,
    day,
    lines: [`Cartoon quiz for ${day}`],
    mp4,
    origin: `daily:${templateKey}:${day}`,
  });
  return {
    ok: true,
    skipped: false,
    templateId,
    templateKey,
    title,
    day,
    filename,
    libraryId: saved.id,
    blobPathname: saved.pathname,
  };
}
