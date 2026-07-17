import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/daily-video-template-2
 *
 * The daily video job needs ffmpeg + @napi-rs/canvas and runs via GitHub Actions
 * (`npm run daily:video-template-2`), not on Vercel serverless.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get('authorization');
  const headerSecret = request.headers.get('x-cron-secret');
  const authorized =
    Boolean(secret) && (auth === `Bearer ${secret}` || headerSecret === secret);

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        'Daily video template 2 must run via GitHub Actions (ffmpeg required). Use workflow "Daily video template 2" or: npm run daily:video-template-2',
      hint: 'See .github/workflows/daily-video-template-2.yml',
    },
    { status: 501 }
  );
}
