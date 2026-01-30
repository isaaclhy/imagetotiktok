import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Fetch creator_info from TikTok API
 * This includes privacy_level_options and interaction settings (comment, duet, stitch)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('tiktok_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call the photo post init endpoint with minimal data to get creator_info
    // We don't actually post, just fetch the creator settings
    const response = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/creator_info/query/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to fetch creator info' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      creator_info: data.data?.creator_info || null,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to fetch creator info';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
