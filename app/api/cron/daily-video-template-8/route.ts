import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/daily-video-template-8
 * Spoken "How well do you know your girlfriend?" clip.
 * ffmpeg does not run on Vercel. Use GitHub Actions.
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
        'Daily know-your-girlfriend video must run via GitHub Actions (ffmpeg required). Use workflow "Daily know your girlfriend" or: npm run daily:video-template-8',
      hint: 'See .github/workflows/daily-video-template-8.yml',
    },
    { status: 501 }
  );
}
