import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import {
  createCarouselContainer,
  createImageContainer,
  createReelContainer,
  fetchPermalink,
  INSTAGRAM_CAROUSEL_MAX,
  publishContainer,
  readInstagramConfig,
  waitForContainerReady,
} from '@/app/lib/instagram';

export const maxDuration = 300;

/**
 * POST /api/instagram/post
 *
 * FormData:
 *   caption  — post caption (optional)
 *   files    — one or more images (carousel when >1), or a single video for a Reel
 *
 * Instagram fetches media by URL, so each file is uploaded to Vercel Blob first
 * and the public Blob URL is handed to the Graph API.
 */
export async function POST(request: NextRequest) {
  try {
    const config = readInstagramConfig();
    if (!config) {
      return NextResponse.json(
        {
          error:
            'Instagram is not configured. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to .env.local.',
        },
        { status: 500 }
      );
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            'Instagram needs public media URLs. Set BLOB_READ_WRITE_TOKEN so uploads can be hosted on Vercel Blob.',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const caption = ((formData.get('caption') as string) || '').trim();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No media to post.' }, { status: 400 });
    }

    const isVideo = files[0]!.type.startsWith('video/');
    if (!isVideo && files.length > INSTAGRAM_CAROUSEL_MAX) {
      return NextResponse.json(
        { error: `Instagram allows at most ${INSTAGRAM_CAROUSEL_MAX} images per carousel.` },
        { status: 400 }
      );
    }
    if (isVideo && files.length > 1) {
      return NextResponse.json(
        { error: 'Post one video at a time.' },
        { status: 400 }
      );
    }

    const stamp = Date.now();
    const mediaUrls: string[] = [];
    for (const [i, file] of files.entries()) {
      const ext = file.type.startsWith('video/') ? 'mp4' : 'png';
      const blob = await put(`instagram/${stamp}-${i}.${ext}`, file, {
        access: 'public',
        contentType: file.type,
      });
      mediaUrls.push(blob.url);
    }

    let containerId: string;

    if (isVideo) {
      containerId = await createReelContainer(config, mediaUrls[0]!, {
        caption,
        shareToFeed: true,
      });
    } else if (mediaUrls.length === 1) {
      containerId = await createImageContainer(config, mediaUrls[0]!, { caption });
    } else {
      const childIds: string[] = [];
      for (const url of mediaUrls) {
        const childId = await createImageContainer(config, url, { isCarouselItem: true });
        childIds.push(childId);
      }
      // Children must finish processing before the parent can reference them.
      for (const childId of childIds) {
        await waitForContainerReady(config, childId, { timeoutMs: 120_000 });
      }
      containerId = await createCarouselContainer(config, childIds, caption);
    }

    await waitForContainerReady(config, containerId);
    const mediaId = await publishContainer(config, containerId);
    const permalink = await fetchPermalink(config, mediaId);

    return NextResponse.json({
      success: true,
      mediaId,
      permalink,
      message: permalink ? 'Posted to Instagram.' : 'Posted to Instagram.',
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to post to Instagram';
    console.error('[instagram/post] Error:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
