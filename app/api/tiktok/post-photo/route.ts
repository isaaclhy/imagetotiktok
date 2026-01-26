import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';

/**
 * TikTok Photo Post API
 * Uses /v2/post/publish/content/init/ with PULL_FROM_URL.
 * Images must be public URLs from a verified domain (see TikTok Developer Portal).
 *
 * Setup:
 * 1. Add Vercel Blob store → BLOB_READ_WRITE_TOKEN in env.
 * 2. In TikTok Developer Portal → your app → Manage URL properties: verify the
 *    Blob store domain (e.g. *.public.blob.vercel-storage.com or your store URL).
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('tiktok_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated. Please connect your TikTok account first.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const photoUrl = formData.get('photo_url') as string | null;
    const caption = (formData.get('caption') as string) || '';
    const privacyLevel = (formData.get('privacy_level') as string) || 'SELF_ONLY';

    let imageUrl: string;

    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
      imageUrl = photoUrl;
    } else if (imageFile && imageFile.size > 0) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          {
            error:
              'Photo Post requires image hosting. Add a Vercel Blob store, set BLOB_READ_WRITE_TOKEN, and verify the Blob domain in TikTok Developer Portal → Manage URL properties.',
          },
          { status: 500 }
        );
      }
      const blob = await put(`tiktok-photo-${Date.now()}.png`, imageFile, {
        access: 'public',
      });
      imageUrl = blob.url;
    } else {
      return NextResponse.json(
        { error: 'Provide either an "image" file or a "photo_url" (public URL).' },
        { status: 400 }
      );
    }

    const initResponse = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/content/init/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          media_type: 'PHOTO',
          post_mode: 'MEDIA_UPLOAD', // Upload as draft; user edits & posts from TikTok app (no direct post)
          post_info: {
            title: caption.slice(0, 90) || 'Bleamies',
            privacy_level: privacyLevel,
            disable_comment: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            photo_images: [imageUrl],
            photo_cover_index: 0,
          },
        }),
      }
    );

    const initData = await initResponse.json();

    if (!initResponse.ok) {
      const errMsg =
        initData.error?.message ?? initData.error?.code ?? 'Unknown error';
      const isScopeError =
        initResponse.status === 403 &&
        /scope|permission|authorize|access denied/i.test(String(errMsg));

      if (isScopeError) {
        const res = NextResponse.json(
          {
            error:
              'Missing photo post permission. Reconnect your TikTok account and accept all requested permissions.',
            requiresReauth: true,
          },
          { status: 403 }
        );
        res.cookies.delete('tiktok_access_token');
        res.cookies.delete('tiktok_refresh_token');
        return res;
      }

      return NextResponse.json(
        { error: errMsg || 'Failed to initialize photo post' },
        { status: initResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Uploaded to TikTok as draft — check your app to edit and post.',
      data: initData.data,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to post photo';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
