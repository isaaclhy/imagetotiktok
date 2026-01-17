import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const response = NextResponse.json({ success: true });

  // Clear all TikTok-related cookies
  response.cookies.delete('tiktok_access_token');
  response.cookies.delete('tiktok_refresh_token');
  response.cookies.delete('tiktok_oauth_state');
  response.cookies.delete('tiktok_code_verifier');

  return response;
}
