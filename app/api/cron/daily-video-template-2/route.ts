import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GOOGLE_DRIVE_REFRESH_COOKIE } from '@/app/lib/google-drive';
import { runDailyVideoTemplate2Job } from '@/app/lib/video-template-2/run-daily-job';

export const runtime = 'nodejs';
export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;

  const headerSecret = request.headers.get('x-cron-secret');
  return headerSecret === secret;
}

/**
 * GET /api/cron/daily-video-template-2
 * Runs the daily video template 2 job (Pexels video + new questions + Drive upload).
 * Requires ffmpeg on the host — use GitHub Actions for production cron.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(GOOGLE_DRIVE_REFRESH_COOKIE)?.value;

    const folderId =
      request.nextUrl.searchParams.get('folderId')?.trim() ||
      process.env.DAILY_VIDEO_DRIVE_FOLDER_ID?.trim() ||
      undefined;

    const result = await runDailyVideoTemplate2Job({
      folderId,
      refreshToken: cookieToken,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error('[cron/daily-video-template-2] failed:', e);
    const message = e instanceof Error ? e.message : 'Daily job failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
