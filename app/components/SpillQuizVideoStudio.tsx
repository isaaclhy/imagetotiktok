'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { SpillQuizTemplateId } from '@/app/lib/spill-quiz/script';

type LibraryVideo = {
  id: string;
  templateId: number;
  templateKey: string;
  title: string;
  filename: string;
  lines: string[];
  createdAt: string;
};

type Props = {
  templateId: SpillQuizTemplateId;
  onBack: () => void;
};

function matchesTemplate(video: LibraryVideo, templateId: SpillQuizTemplateId): boolean {
  if (templateId === 8) return video.templateKey === 'know-girlfriend';
  return video.templateKey === 'quiz-girlfriend';
}

export function SpillQuizVideoStudio({ templateId, onBack }: Props) {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
        window.location.href = '/password?redirect=/?tab=video';
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not load videos');
      const mine = (data.videos ?? []).filter((video) => matchesTemplate(video, templateId));
      setVideos(mine);
      setSelectedId((current) =>
        current && mine.some((video) => video.id === current) ? current : (mine[0]?.id ?? null)
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load videos');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = videos.find((video) => video.id === selectedId) ?? null;

  async function downloadVideo(video: LibraryVideo) {
    setPendingId(video.id);
    setError(null);
    try {
      const res = await fetch(`/api/video-library/${video.id}?download=1`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const file = new File([blob], video.filename, { type: 'video/mp4' });
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
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
      if (!res.ok) throw new Error('Delete failed');
      setConfirmId(null);
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
        >
          Back
        </button>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {templateId === 8 ? 'How well do you know your girlfriend?' : 'Quiz your girlfriend'}
        </p>
        <Link
          href="/library"
          className="ml-auto rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
        >
          Video library
        </Link>
      </div>
      <div className="space-y-4 p-3">
        {loading ? <p className="text-sm text-zinc-500">Loading the cartoon…</p> : null}
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        {!loading && !selected ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700">
            No saved cartoon for this template. Unused daily videos show up here and stay until you delete them.
          </p>
        ) : null}
        {selected ? (
          <div className="mx-auto w-full max-w-sm">
            <video
              key={selected.id}
              src={`/api/video-library/${selected.id}`}
              controls
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full rounded-xl bg-black object-contain"
            />
            <p className="mt-3 text-base font-medium">{selected.title}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void downloadVideo(selected)}
                disabled={pendingId === selected.id}
                className="min-h-12 rounded-xl bg-zinc-900 text-base font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Download
              </button>
              {confirmId === selected.id ? (
                <button
                  type="button"
                  onClick={() => void deleteVideo(selected.id)}
                  disabled={pendingId === selected.id}
                  className="min-h-12 rounded-xl bg-red-600 text-base font-medium text-white"
                >
                  Delete this video
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(selected.id)}
                  className="min-h-12 rounded-xl border border-zinc-300 text-base font-medium dark:border-zinc-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : null}
        {videos.length > 1 ? (
          <ul className="space-y-2">
            {videos.map((video) => (
              <li key={video.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(video.id)}
                  className={`w-full rounded-lg px-3 py-3 text-left text-sm ${
                    video.id === selectedId
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  {video.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
