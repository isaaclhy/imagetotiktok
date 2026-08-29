import { NextResponse } from 'next/server';
import { fetchInstagramAccount, readInstagramConfig } from '@/app/lib/instagram';

/**
 * GET /api/instagram/auth-check
 * Reports whether the env token works, so the UI can show the connected handle.
 */
export async function GET() {
  const config = readInstagramConfig();
  if (!config) {
    return NextResponse.json({
      configured: false,
      connected: false,
      error:
        'Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to .env.local to enable Instagram posting.',
    });
  }

  try {
    const user = await fetchInstagramAccount(config);
    return NextResponse.json({ configured: true, connected: true, user });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to reach Instagram';
    return NextResponse.json({ configured: true, connected: false, error: message });
  }
}
