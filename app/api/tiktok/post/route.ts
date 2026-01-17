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
    const caption = formData.get('caption') as string;
    const privacyLevel = (formData.get('privacy_level') as string) || 'SELF_ONLY'; // Default to private

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert image to base64 or use TikTok's upload API
    // TikTok requires video format, so we'll need to convert image to video
    // For now, we'll use the TikTok Video Upload API
    
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
          video_size: imageFile.size,
          chunk_size: 10000000, // 10MB chunks
          total_chunk_count: 1,
        },
      }),
    });

    const initData = await initResponse.json();

    if (!initResponse.ok) {
      console.error('Init upload error:', initData);
      return NextResponse.json(
        { error: initData.error?.message || 'Failed to initialize upload' },
        { status: initResponse.status }
      );
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
