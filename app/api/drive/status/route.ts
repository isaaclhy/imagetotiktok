import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GOOGLE_DRIVE_REFRESH_COOKIE, isOAuthConfigured } from '@/app/lib/google-drive';

export async function GET() {
  const cookieStore = await cookies();
  const connected = Boolean(cookieStore.get(GOOGLE_DRIVE_REFRESH_COOKIE)?.value);

  return NextResponse.json({
    oauthConfigured: isOAuthConfigured(),
    connected,
  });
}
