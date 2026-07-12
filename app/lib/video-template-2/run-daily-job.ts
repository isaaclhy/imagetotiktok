import {
  clearDriveFolderContents,
  getRefreshTokenForAutomation,
  resolveDriveFolderId,
  uploadBufferToDrive,
} from '@/app/lib/google-drive';
import { fetchRandomPexelsPortraitVideo } from '@/app/lib/video-template-2/fetch-pexels';
import {
  cleanupRenderedVideo,
  readFileBuffer,
  renderVideoTemplate2WithOverlay,
} from '@/app/lib/video-template-2/ffmpeg';
import { pickDailyVideoTemplate2Content } from '@/app/lib/video-template-2/pick-content';

export type DailyVideoTemplate2JobResult = {
  ok: true;
  title: string;
  questions: string[];
  pexelsQuery: string;
  sourceVideoUrl: string;
  filename: string;
  driveFileId?: string | null;
  driveFileName?: string | null;
  driveWebViewLink?: string | null;
};

export type RunDailyVideoTemplate2JobOptions = {
  folderId?: string;
  skipClear?: boolean;
  refreshToken?: string;
};

function dailyOutputFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `template-2-daily-${date}.mp4`;
}

export async function runDailyVideoTemplate2Job(
  options: RunDailyVideoTemplate2JobOptions = {}
): Promise<DailyVideoTemplate2JobResult> {
  const content = pickDailyVideoTemplate2Content();
  const { videoUrl } = await fetchRandomPexelsPortraitVideo({
    query: content.pexelsQuery,
    page: content.pexelsPage,
  });

  const { outputPath } = await renderVideoTemplate2WithOverlay({
    videoUrl,
    title: content.title,
    questions: content.questions,
  });

  try {
    const mp4 = await readFileBuffer(outputPath);
    const filename = dailyOutputFilename();
    const refreshToken = getRefreshTokenForAutomation(options.refreshToken);
    const folderId = resolveDriveFolderId(options.folderId);

    if (!options.skipClear) {
      try {
        await clearDriveFolderContents(refreshToken, folderId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!/not found/i.test(msg)) throw e;
      }
    }

    const uploaded = await uploadBufferToDrive(
      refreshToken,
      mp4,
      filename,
      'video/mp4',
      folderId
    );

    return {
      ok: true,
      title: content.title,
      questions: content.questions,
      pexelsQuery: content.pexelsQuery,
      sourceVideoUrl: videoUrl,
      filename,
      driveFileId: uploaded.id,
      driveFileName: uploaded.name,
      driveWebViewLink: uploaded.webViewLink,
    };
  } finally {
    await cleanupRenderedVideo(outputPath);
  }
}
