import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Poll TikTok publish status
 * Uses /v2/post/publish/status/fetch/ to get the current status of a post
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

    const { searchParams } = new URL(request.url);
    const publishId = searchParams.get('publish_id');

    if (!publishId) {
      return NextResponse.json(
        { error: 'publish_id is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          publish_id: publishId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to fetch post status' },
        { status: response.status }
      );
    }

    // Return the status information
    // Possible statuses: PROCESSING_UPLOAD, PROCESSING_DOWNLOAD, PUBLISH_COMPLETE, FAILED
    return NextResponse.json({
      success: true,
      status: data.data?.status,
      status_msg: getStatusMessage(data.data?.status),
      fail_reason: data.data?.fail_reason,
      published_item_id: data.data?.publicaly_available_post_id,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to fetch post status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper to get user-friendly status message
function getStatusMessage(status: string | undefined): string {
  switch (status) {
    case 'PROCESSING_UPLOAD':
      return 'Uploading your content...';
    case 'PROCESSING_DOWNLOAD':
      return 'Processing your content...';
    case 'PUBLISH_COMPLETE':
      return 'Your content has been published!';
    case 'FAILED':
      return 'Publishing failed.';
    default:
      return 'Processing...';
  }
}
