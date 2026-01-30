import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import { createServeToken } from '@/lib/tiktok-serve-token';

/**
 * TikTok Photo Post API
 * Uses /v2/post/publish/content/init/ with PULL_FROM_URL.
 * Images must be public URLs from a verified domain (see TikTok Developer Portal).
 *
 * Setup (choose one):
 * A) Own domain (e.g. www.bleamies.com):
 *    - APP_URL=https://www.bleamies.com (or your deployment URL)
 *    - BLOB_READ_WRITE_TOKEN + Vercel Blob store
 *    - Verify https://www.bleamies.com in TikTok → Manage URL properties
 * B) Blob domain only:
 *    - BLOB_READ_WRITE_TOKEN + Blob store
 *    - Verify Blob store domain in TikTok → Manage URL properties
 * C) You host images: send photo_url (public URL on your verified domain) instead of image file.
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
    const privacyLevel = formData.get('privacy_level') as string;
    const disableComment = formData.get('disable_comment') === 'true';
    
    // Content disclosure settings
    const brandOrganicToggle = formData.get('brand_organic_toggle') === 'true'; // Your brand
    const brandContentToggle = formData.get('brand_content_toggle') === 'true'; // Branded content

    // Validate required fields
    if (!caption.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!privacyLevel) {
      return NextResponse.json(
        { error: 'Privacy level is required' },
        { status: 400 }
      );
    }

    let imageUrl: string;

    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
      imageUrl = photoUrl;
    } else if (imageFile && imageFile.size > 0) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          {
            error:
              'Photo Post requires image hosting. Use a Vercel Blob store (BLOB_READ_WRITE_TOKEN) and verify your domain in TikTok Developer Portal → Manage URL properties. Or host images on your domain and send photo_url.',
          },
          { status: 500 }
        );
      }
      const blob = await put(`tiktok-photo-${Date.now()}.png`, imageFile, {
        access: 'public',
      });
      const blobUrl = blob.url;
      const baseUrl =
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        request.nextUrl.origin;
      const base = baseUrl.replace(/\/$/, '');
      try {
        const token = createServeToken(blobUrl);
        imageUrl = `${base}/api/tiktok/serve?token=${encodeURIComponent(token)}`;
      } catch {
        imageUrl = blobUrl;
      }
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
            title: caption.slice(0, 90),
            privacy_level: privacyLevel,
            disable_comment: disableComment,
            // Content disclosure settings (only include if either is true)
            ...(brandOrganicToggle || brandContentToggle ? {
              brand_organic_toggle: brandOrganicToggle,
              brand_content_toggle: brandContentToggle,
            } : {}),
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
      const errStr = String(errMsg);
      const scopeRelated =
        /scope|permission|authorize|access denied|did not authorize/i.test(errStr);
      const isScopeError =
        (initResponse.status === 401 || initResponse.status === 403) && scopeRelated;

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

    // Check creator_info for posting limits
    const creatorInfo = initData.data?.creator_info;
    if (creatorInfo) {
      // If comment_disabled is true, creator cannot post right now
      if (creatorInfo.comment_disabled === true) {
        return NextResponse.json(
          {
            error: 'You cannot make more posts at this moment. Please try again later.',
            rateLimited: true,
          },
          { status: 429 }
        );
      }
      
      // If max_post_count is reached
      if (
        typeof creatorInfo.max_post_count === 'number' &&
        typeof creatorInfo.privacy_level_options === 'object'
      ) {
        // Additional checks can be added here if TikTok provides more specific fields
      }
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
