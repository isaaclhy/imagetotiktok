import fs from 'fs/promises';
import { fetchRandomPexelsPortraitVideo } from '@/app/lib/video-template-2/fetch-pexels';
import { getRefreshTokenForAutomation, uploadBufferToDrive } from '@/app/lib/google-drive';
import { renderSpokenQuizMp4 } from '@/app/lib/spill-quiz/render';
import { pickSpillQuizScript, type SpillQuizTemplateId } from '@/app/lib/spill-quiz/script';
import { synthesizeSpillQuizLines } from '@/app/lib/spill-quiz/tts';
import { findDailyVideoForDay, saveDailyVideo } from '@/app/lib/video-library/store';

export type DailySpillQuizResult = {
  ok: true;
  skipped: boolean;
  templateId: SpillQuizTemplateId;
  templateKey: string;
  title: string;
  day: string;
  filename: string;
  provider?: string;
  libraryId?: string;
  blobPathname?: string;
  driveWebViewLink?: string | null;
  driveWarning?: string | null;
};

function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function outputFilename(templateKey: string, day: string): string {
  const stamp = new Date().toISOString().slice(11, 19).replace(/:/g, '');
  return `${templateKey}-${day}-${stamp}.mp4`;
}

async function maybeUploadDrive(mp4: Buffer, filename: string): Promise<{
  driveWebViewLink: string | null;
  driveWarning: string | null;
}> {
  const folderId = process.env.DAILY_QUIZ_DRIVE_FOLDER_ID?.trim();
  if (!folderId) return { driveWebViewLink: null, driveWarning: null };
  try {
    const refreshToken = getRefreshTokenForAutomation();
    const uploaded = await uploadBufferToDrive(refreshToken, mp4, filename, 'video/mp4', folderId);
    return { driveWebViewLink: uploaded.webViewLink ?? null, driveWarning: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { driveWebViewLink: null, driveWarning: message };
  }
}

export async function runDailySpillQuiz(templateId: SpillQuizTemplateId): Promise<DailySpillQuizResult> {
  if (!process.env.PIXELS_API_KEY?.trim()) throw new Error('Missing PIXELS_API_KEY');
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) throw new Error('Missing BLOB_READ_WRITE_TOKEN');
  if (!process.env.MONGODB_URI?.trim()) throw new Error('Missing MONGODB_URI');

  const script = pickSpillQuizScript(templateId);
  const day = utcDay();
  const filename = outputFilename(script.templateKey, day);

  if (process.env.DAILY_QUIZ_FORCE !== '1') {
    const existing = await findDailyVideoForDay(script.templateKey, day);
    if (existing) {
      return {
        ok: true,
        skipped: true,
        templateId,
        templateKey: script.templateKey,
        title: existing.title,
        day,
        filename: existing.filename,
        libraryId: existing._id.toString(),
        blobPathname: existing.blobPathname,
      };
    }
  }

  const { provider, clips } = await synthesizeSpillQuizLines(
    templateId,
    script.lines.map((line) => line.text)
  );
  const query = script.pexelsQueries[Math.floor(Math.random() * script.pexelsQueries.length)]!;
  const { videoUrl } = await fetchRandomPexelsPortraitVideo({ query });
  const rendered = await renderSpokenQuizMp4({
    videoUrl,
    segments: script.lines.map((line, index) => ({
      text: line.text,
      role: line.role,
      audio: clips[index]!.audio,
    })),
  });

  try {
    const mp4 = await fs.readFile(rendered.outputPath);
    const saved = await saveDailyVideo({
      templateId,
      templateKey: script.templateKey,
      title: script.title,
      filename,
      day,
      lines: script.lines.map((line) => line.text),
      mp4,
    });
    const drive = await maybeUploadDrive(mp4, filename);
    return {
      ok: true,
      skipped: false,
      templateId,
      templateKey: script.templateKey,
      title: script.title,
      day,
      filename,
      provider,
      libraryId: saved.id,
      blobPathname: saved.pathname,
      driveWebViewLink: drive.driveWebViewLink,
      driveWarning: drive.driveWarning,
    };
  } finally {
    await rendered.cleanup();
  }
}
