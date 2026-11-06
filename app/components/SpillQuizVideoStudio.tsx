'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { SpillQuizTemplateId } from '@/app/lib/spill-quiz/script';
import {
  QUIZ_GALLERY_GRID_CLASS,
  matchesQuizTemplate,
  quizPosterSrc,
  quizTemplateCover,
} from '@/app/lib/spill-quiz/gallery';

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

export function SpillQuizVideoStudio({ templateId, onBack }: Props) {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [posterFallback, setPosterFallback] = useState<Record<string, true>>({});

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
      const mine = (data.videos ?? []).filter((video) =>
        matchesQuizTemplate(video.templateKey, templateId)
      );
      setVideos(mine);
      setPlayingId((current) => (current && mine.some((video) => video.id === current) ? current : null));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load videos');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    void load();
  }, [load]);

  const playing = videos.find((video) => video.id === playingId) ?? null;
  const cover = quizTemplateCover(templateId);

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
      setPlayingId(null);
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => {
            if (playing) {
              setPlayingId(null);
              setConfirmId(null);
              return;
            }
            onBack();
          }}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
        >
          {playing ? 'All videos' : 'Back'}
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
        {loading ? <p className="text-sm text-zinc-500">Loading saved videos…</p> : null}
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        {!loading && videos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700">
            No saved cartoon for this template. Unused daily videos show up here and stay until you delete them.
          </p>
        ) : null}
        {!loading && videos.length > 0 && !playing ? (
          <ul data-video-gallery={templateId} className={`${QUIZ_GALLERY_GRID_CLASS} min-w-0 list-none p-0`}>
            {videos.map((video) => {
              const poster = posterFallback[video.id] ? cover : quizPosterSrc(video.filename, templateId);
              return (
                <li key={video.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmId(null);
                      setPlayingId(video.id);
                    }}
                    className="w-full min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-left hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-zinc-500"
                  >
                    <span className="block aspect-[9/16] overflow-hidden rounded-lg bg-[#c6dbf0]">
                      <img
                        src={poster}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={() =>
                          setPosterFallback((current) =>
                            current[video.id] ? current : { ...current, [video.id]: true }
                          )
                        }
                      />
                    </span>
                    <span className="mt-2 line-clamp-3 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {video.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {playing ? (
          <div className="mx-auto w-full max-w-sm">
            <video
              key={playing.id}
              src={`/api/video-library/${playing.id}`}
              controls
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full rounded-xl bg-black object-contain"
            />
            <p className="mt-3 text-base font-medium">{playing.title}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void downloadVideo(playing)}
                disabled={pendingId === playing.id}
                className="min-h-12 rounded-xl bg-zinc-900 text-base font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Download
              </button>
              {confirmId === playing.id ? (
                <button
                  type="button"
                  onClick={() => void deleteVideo(playing.id)}
                  disabled={pendingId === playing.id}
                  className="min-h-12 rounded-xl bg-red-600 text-base font-medium text-white"
                >
                  Delete this video
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(playing.id)}
                  className="min-h-12 rounded-xl border border-zinc-300 text-base font-medium dark:border-zinc-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
