'use client';

import { useEffect, useState } from 'react';
import {
  FRESH_BAKED_DONUT_HANDLE,
  captionWithoutHashtags,
  freshBakedDonutPlaybackSrc,
  type FreshBakedDonutPost,
} from '@/app/lib/video-template-fresh-baked-donut';

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (views >= 1_000) return `${Math.round(views / 1_000)}k`;
  return String(views);
}

type FreshBakedDonutGalleryProps = {
  posts: FreshBakedDonutPost[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
  disabled?: boolean;
};

export function FreshBakedDonutGallery({
  posts,
  onSelect,
  onDelete,
  deletingId = null,
  disabled = false,
}: FreshBakedDonutGalleryProps) {
  return (
    <div className="w-full min-w-0">
      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
        {posts.length} clips from @{FRESH_BAKED_DONUT_HANDLE}. Click one for details.
      </p>
      <div className="grid w-full grid-cols-4 gap-2">
        {posts.map((post) => {
          const isDeleting = deletingId === post.id;
          return (
            <div
              key={post.id}
              className="relative min-w-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700"
            >
              <button
                type="button"
                disabled={disabled || isDeleting}
                onClick={() => onSelect(post.id)}
                className="w-full text-left transition-colors hover:border-zinc-400 disabled:opacity-50 dark:hover:border-zinc-500"
              >
                <div className="relative aspect-9/16 overflow-hidden bg-zinc-900">
                  {post.thumbnailUrl ? (
                    <img
                      src={post.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
                    {Math.round(post.durationSec)}s
                  </span>
                </div>
                <p className="truncate px-1.5 py-1 text-[10px] text-zinc-500">
                  {formatViews(post.views)} views
                </p>
              </button>
              <button
                type="button"
                aria-label="Delete clip"
                disabled={disabled || isDeleting}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDelete(post.id);
                }}
                className="absolute top-1.5 right-1.5 z-10 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? '…' : 'Delete'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type FreshBakedDonutDetailProps = {
  post: FreshBakedDonutPost;
};

export function FreshBakedDonutDetail({ post }: FreshBakedDonutDetailProps) {
  const videoLink = post.reelUrl || post.url;
  const [publicUrl, setPublicUrl] = useState('');
  const [publicBusy, setPublicBusy] = useState(false);
  const [publicError, setPublicError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPublicUrl('');
    setPublicError('');
    setCopied(false);
  }, [post.id]);

  const copyPublicLink = async () => {
    setPublicBusy(true);
    setPublicError('');
    setCopied(false);
    try {
      let url = publicUrl;
      if (!url) {
        const res = await fetch('/api/fresh-baked-donut/public-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: post.id }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Failed to host a public link');
        }
        url = data.url;
        setPublicUrl(url);
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch (error) {
      setPublicError(error instanceof Error ? error.message : 'Failed to copy public link');
    } finally {
      setPublicBusy(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto md:mx-0 min-w-0">
      <div className="relative aspect-9/16 w-full overflow-hidden rounded-xl border border-zinc-200 bg-black dark:border-zinc-700">
        <video
          key={post.id}
          src={freshBakedDonutPlaybackSrc(post)}
          poster={post.thumbnailUrl || undefined}
          className="h-full w-full object-cover"
          controls
          playsInline
          loop
          muted
          autoPlay
        />
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {captionWithoutHashtags(post.caption) || `@${FRESH_BAKED_DONUT_HANDLE}`}
      </p>
      <p className="text-xs text-zinc-500">
        {formatViews(post.views)} views · {Math.round(post.durationSec)}s
      </p>
      {videoLink ? (
        <a
          href={videoLink}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all text-xs text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-zinc-200"
        >
          {videoLink}
        </a>
      ) : null}
      <button
        type="button"
        disabled={publicBusy}
        onClick={() => void copyPublicLink()}
        className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {publicBusy ? 'Hosting…' : copied ? 'Copied public link' : 'Copy public link'}
      </button>
      {publicUrl ? (
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block break-all text-xs text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-zinc-200"
        >
          {publicUrl}
        </a>
      ) : null}
      {publicError ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{publicError}</p> : null}
    </div>
  );
}
