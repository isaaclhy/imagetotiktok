import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    const imageFile = formData.get('image') as File;
    const videoDuration = formData.get('video_duration') as string; // Duration in seconds (optional)
    const caption = formData.get('caption') as string;
    const privacyLevel = (formData.get('privacy_level') as string) || 'SELF_ONLY'; // Default to private

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const videoSize = imageFile.size;
    // TikTok: chunk_size must be 5MB–64MB per chunk, EXCEPT for files < 5MB
    // where chunk_size must equal the entire file size.
    const FIVE_MB = 5 * 1024 * 1024;
    const CHUNK_SIZE_LARGE = 10 * 1024 * 1024; // 10MB
    const chunkSize = videoSize < FIVE_MB ? videoSize : CHUNK_SIZE_LARGE;
    const totalChunkCount = Math.ceil(videoSize / chunkSize);

    // Step 1: Initialize upload
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: caption || 'Created with TikTok Image Generator',
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunkCount,
        },
      }),
    });

    const initData = await initResponse.json();

    if (!initResponse.ok) {
      console.error('Init upload error:', initData);
      const errMsg = initData.error?.message ?? initData.error?.code ?? 'Unknown error';

      // Only treat as scope/permission error when the message clearly indicates it
      const isScopeError =
        initResponse.status === 403 &&
        (errMsg.toLowerCase().includes('scope') ||
          errMsg.toLowerCase().includes('permission') ||
          errMsg.toLowerCase().includes('authorize') ||
          errMsg.toLowerCase().includes('access denied'));

      if (isScopeError) {
        const errorResponse = NextResponse.json(
          {
            error: 'Missing video upload permission. Please reconnect your TikTok account and accept all requested permissions.',
            requiresReauth: true,
          },
          { status: 403 }
        );
        errorResponse.cookies.delete('tiktok_access_token');
        errorResponse.cookies.delete('tiktok_refresh_token');
        return errorResponse;
      }

      // Return the actual TikTok error so we can debug (e.g. format, app approval)
      return NextResponse.json(
        { error: errMsg || 'Failed to initialize upload' },
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
      
      // Check if video duration exceeds max allowed duration
      if (
        typeof creatorInfo.max_video_post_duration_sec === 'number' &&
        videoDuration
      ) {
        const durationSec = parseFloat(videoDuration);
        if (!isNaN(durationSec) && durationSec > creatorInfo.max_video_post_duration_sec) {
          return NextResponse.json(
            {
              error: `Video duration (${durationSec}s) exceeds maximum allowed duration (${creatorInfo.max_video_post_duration_sec}s). Please trim your video and try again.`,
              durationExceeded: true,
              maxDuration: creatorInfo.max_video_post_duration_sec,
            },
            { status: 400 }
          );
        }
      }
    }

    const { publish_id, upload_url } = initData.data;

    // Step 2: Upload the video/image file
    // Note: TikTok requires MP4 format, so we'd need to convert the image to a video
    // For now, this is a placeholder - you'd need to use a library to convert image to video
    const imageBuffer = await imageFile.arrayBuffer();
    
    // Convert image to video (simplified - in production, use ffmpeg or similar)
    // This is a simplified example - actual implementation would convert PNG to MP4
    const uploadResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
      },
      body: imageBuffer, // In production, this should be a video file
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: uploadResponse.status }
      );
    }

    // Step 3: Publish the video
    const publishResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/publish/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: publish_id,
      }),
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      console.error('Publish error:', publishData);
      return NextResponse.json(
        { error: publishData.error?.message || 'Failed to publish video' },
        { status: publishResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      post_id: publish_id,
      message: 'Successfully posted to TikTok',
    });
  } catch (error: any) {
    console.error('Post to TikTok error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post to TikTok' },
      { status: 500 }
    );
  }
}
