import { NextResponse } from 'next/server';
import { GOOGLE_DRIVE_REFRESH_COOKIE } from '@/app/lib/google-drive';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(GOOGLE_DRIVE_REFRESH_COOKIE);
  return response;
}
