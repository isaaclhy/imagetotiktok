import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint helps debug environment variable loading
  // DO NOT use this in production or expose sensitive data
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  return NextResponse.json({
    env_loaded: true,
    client_key_exists: !!clientKey,
    client_key_length: clientKey?.length || 0,
    client_key_preview: clientKey ? `${clientKey.substring(0, 4)}...${clientKey.substring(clientKey.length - 4)}` : 'NOT SET',
    client_secret_exists: !!clientSecret,
    redirect_uri: redirectUri || 'NOT SET',
    has_placeholder: clientKey?.includes('your_client_key') || false,
  }, {
    headers: {
      'Cache-Control': 'no-store',
    }
  });
}
