import { runDailyVideoTemplate2Job } from '@/app/lib/video-template-2/run-daily-job';

async function main() {
  const result = await runDailyVideoTemplate2Job({
    folderId: process.env.DAILY_VIDEO_DRIVE_FOLDER_ID?.trim() || undefined,
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
