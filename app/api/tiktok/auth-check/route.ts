import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('tiktok_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false });
  }

  // Verify token and get user info
  try {
    const verifyResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (verifyResponse.ok) {
      const userData = await verifyResponse.json();
      return NextResponse.json({ 
        authenticated: true,
        user: userData.data?.user || null
      });
    } else {
      // Token might be expired, clear it
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete('tiktok_access_token');
      response.cookies.delete('tiktok_refresh_token');
      return response;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
