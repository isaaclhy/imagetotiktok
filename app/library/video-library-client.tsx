'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type LibraryVideo = {
  id: string;
  templateId: number;
  templateKey: string;
  title: string;
  filename: string;
  day: string;
  lines: string[];
  createdAt: string;
};

function templateLabel(templateKey: string): string {
  if (templateKey === 'know-girlfriend') return 'How well do you know your girlfriend';
  if (templateKey === 'quiz-boyfriend') return 'Quiz your boyfriend';
  return 'Daily video';
}

export function VideoLibraryClient() {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/video-library', { cache: 'no-store' });
      const data = (await res.json()) as { videos?: LibraryVideo[]; error?: string };
      if (res.status === 401) {
        window.location.href = '/password?redirect=/library';
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not load videos');
      setVideos(data.videos ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function downloadVideo(video: LibraryVideo) {
    setPendingId(video.id);
    setError(null);
    try {
      const res = await fetch(`/api/video-library/${video.id}?download=1`);
      if (res.status === 401) {
        window.location.href = '/password?redirect=/library';
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'Download failed');
      }
      const blob = await res.blob();
      const file = new File([blob], video.filename, { type: 'video/mp4' });
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      try {
        if (nav.canShare?.({ files: [file] }) && nav.share) {
          await nav.share({ files: [file], title: video.title });
          return;
        }
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name === 'AbortError') return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = video.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    } catch (downloadError) {
      if (downloadError instanceof Error && downloadError.name === 'AbortError') return;
      setError(downloadError instanceof Error ? downloadError.message : 'Download failed');
    } finally {
      setPendingId(null);
    }
  }

  async function deleteVideo(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/video-library/${id}`, { method: 'DELETE' });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (res.status === 401) {
        window.location.href = '/password?redirect=/library';
        return;
      }
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      setVideos((current) => current.filter((video) => video.id !== id));
      setConfirmId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-4 pb-16">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Spill It</p>
            <h1 className="text-2xl font-semibold">Video library</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Unused daily videos stay here. Download one, post it, then delete it.
            </p>
          </div>
          <Link
            href="/?tab=video"
            className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Studio
          </Link>
        </header>
        <button
          type="button"
          onClick={() => void load()}
          className="min-h-11 self-start rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700"
        >
          Refresh
        </button>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}
        {loading ? <p className="text-sm text-zinc-500">Loading videos…</p> : null}
        {!loading && !error && videos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            No saved videos yet. Two new clips are added each morning, and they stay until you delete them.
          </p>
        ) : null}
        <ul className="flex flex-col gap-6">
          {videos.map((video) => {
            const when = new Date(video.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });
            const busy = pendingId === video.id;
            return (
              <li
                key={video.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="space-y-1 px-4 pt-4">
                  <p className="text-xs text-zinc-500">
                    {templateLabel(video.templateKey)} · {when}
                  </p>
                  <h2 className="text-lg font-semibold leading-snug">{video.title}</h2>
                </div>
                <video
                  src={`/api/video-library/${video.id}`}
                  controls
                  playsInline
                  preload="metadata"
                  className="mt-3 max-h-[70dvh] w-full bg-black object-contain"
                />
                <details className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <summary className="cursor-pointer">Script</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    {video.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ol>
                </details>
                <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void downloadVideo(video)}
                    disabled={busy}
                    className="min-h-12 rounded-xl bg-zinc-900 text-base font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {busy && confirmId !== video.id ? 'Working…' : 'Download'}
                  </button>
                  {confirmId === video.id ? (
                    <button
                      type="button"
                      onClick={() => void deleteVideo(video.id)}
                      disabled={busy}
                      className="min-h-12 rounded-xl bg-red-600 text-base font-medium text-white disabled:opacity-50"
                    >
                      Delete this video
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(video.id)}
                      disabled={busy}
                      className="min-h-12 rounded-xl border border-zinc-300 text-base font-medium disabled:opacity-50 dark:border-zinc-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
