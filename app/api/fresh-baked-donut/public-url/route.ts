import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import {
  isAllowedMediaVideoUrl,
  MEDIA_PROXY_UPSTREAM_HEADERS,
} from '@/app/lib/media-proxy';
import { FRESH_BAKED_DONUT_POSTS } from '@/app/lib/video-template-fresh-baked-donut';

export const maxDuration = 120;

/**
 * POST /api/fresh-baked-donut/public-url
 * Hosts a clip on Vercel Blob so OpenRouter can fetch a stable HTTPS MP4.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Set BLOB_READ_WRITE_TOKEN to host a public video URL.' },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    const post = FRESH_BAKED_DONUT_POSTS.find((item) => item.id === id);
    if (!post?.videoUrl || !isAllowedMediaVideoUrl(post.videoUrl)) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
    }

    const upstream = await fetch(post.videoUrl, { headers: MEDIA_PROXY_UPSTREAM_HEADERS });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Could not download clip (${upstream.status})` },
        { status: 502 }
      );
    }

    const file = await upstream.blob();
    if (file.size < 32) {
      return NextResponse.json({ error: 'Downloaded clip was empty' }, { status: 502 });
    }

    const hosted = await put(`fresh-baked-donut/${post.id}.mp4`, file, {
      access: 'public',
      contentType: 'video/mp4',
    });

    return NextResponse.json({ url: hosted.url, id: post.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to host clip';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
