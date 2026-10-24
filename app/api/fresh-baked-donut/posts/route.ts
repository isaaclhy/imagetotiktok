import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FEED_PATH = path.join(
  process.cwd(),
  'app/lib/video-template-fresh-baked-donut/freshbakeddonuts.json'
);

type Feed = {
  handle: string;
  platform?: string;
  minViews?: number;
  postCount?: number;
  posts: { id: string }[];
};

export async function DELETE(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  if (!id) {
    return NextResponse.json({ error: 'Missing clip id' }, { status: 400 });
  }

  const raw = await fs.readFile(FEED_PATH, 'utf8');
  const feed = JSON.parse(raw) as Feed;
  if (!Array.isArray(feed.posts)) {
    return NextResponse.json({ error: 'Feed is missing posts' }, { status: 500 });
  }

  const nextPosts = feed.posts.filter((post) => post.id !== id);
  if (nextPosts.length === feed.posts.length) {
    return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
  }

  const nextFeed = {
    ...feed,
    postCount: nextPosts.length,
    posts: nextPosts,
  };
  await fs.writeFile(FEED_PATH, `${JSON.stringify(nextFeed, null, 2)}\n`, 'utf8');
  return NextResponse.json({ ok: true, id, postCount: nextPosts.length });
}
