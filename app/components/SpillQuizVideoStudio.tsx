'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  SPILL_QUIZ_FOOTER_LINES,
  pickSpillQuizScript,
  spillQuizPreviewVoiceId,
  type SpillQuizScript,
  type SpillQuizTemplateId,
} from '@/app/lib/spill-quiz/script';
import { SPILL_QUIZ_TTS_MODEL, SPILL_QUIZ_TTS_SETTINGS } from '@/app/lib/spill-quiz/voices';

type Props = {
  templateId: SpillQuizTemplateId;
  onBack: () => void;
};

export function SpillQuizVideoStudio({ templateId, onBack }: Props) {
  const [script, setScript] = useState<SpillQuizScript>(() => pickSpillQuizScript(templateId));
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [posterSrc, setPosterSrc] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef(false);
  const clipsRef = useRef<{ key: string; urls: string[] } | null>(null);

  useEffect(() => {
    cancelRef.current = false;
    void loadBackground(script);
    return () => {
      cancelRef.current = true;
      audioRef.current?.pause();
    };
    // One background per template. A new script keeps the current clip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  function revokeClips() {
    const cached = clipsRef.current;
    if (!cached) return;
    for (const url of cached.urls) URL.revokeObjectURL(url);
    clipsRef.current = null;
  }

  async function loadBackground(current: SpillQuizScript) {
    setVideoLoading(true);
    setVideoError(null);
    try {
      const query = current.pexelsQueries[Math.floor(Math.random() * current.pexelsQueries.length)]!;
      const page = 1 + Math.floor(Math.random() * 15);
      const res = await fetch(
        `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}&preferHeight=1920`
      );
      const data = (await res.json()) as { videoUrl?: string; thumbnailUrl?: string; error?: string };
      if (!res.ok || !data.videoUrl) throw new Error(data.error || 'Could not load a background');
      setVideoSrc(data.videoUrl);
      setPosterSrc(data.thumbnailUrl || null);
    } catch (error) {
      setVideoError(error instanceof Error ? error.message : 'Could not load a background');
    } finally {
      setVideoLoading(false);
    }
  }

  async function ensureVoice(current: SpillQuizScript): Promise<string[]> {
    const key = `${current.templateId}:${current.lines.map((line) => line.text).join('|')}`;
    if (clipsRef.current?.key === key) return clipsRef.current.urls;
    revokeClips();
    setVoiceLoading(true);
    setVoiceError(null);
    try {
      const urls = await Promise.all(
        current.lines.map(async (line) => {
          const res = await fetch('/api/elevenlabs/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: line.text,
              voiceId: spillQuizPreviewVoiceId(current.templateId),
              modelId: SPILL_QUIZ_TTS_MODEL,
              voiceSettings: SPILL_QUIZ_TTS_SETTINGS,
            }),
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null;
            throw new Error(data?.error || `Voice failed (${res.status})`);
          }
          return URL.createObjectURL(await res.blob());
        })
      );
      clipsRef.current = { key, urls };
      return urls;
    } finally {
      setVoiceLoading(false);
    }
  }

  function playUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Could not play the voice'));
      audio.src = url;
      void audio.play().catch(reject);
    });
  }

  async function playPreview() {
    cancelRef.current = false;
    setPlaying(true);
    setVoiceError(null);
    try {
      const urls = await ensureVoice(script);
      const video = videoRef.current;
      if (video) {
        video.muted = true;
        video.loop = true;
        await video.play().catch(() => undefined);
      }
      for (let i = 0; i < urls.length; i++) {
        if (cancelRef.current) break;
        setLineIndex(i);
        await playUrl(urls[i]!);
        if (cancelRef.current) break;
        await new Promise((resolve) => window.setTimeout(resolve, 80));
      }
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : 'Voice preview failed');
    } finally {
      setPlaying(false);
      videoRef.current?.pause();
    }
  }

  function stopPreview() {
    cancelRef.current = true;
    audioRef.current?.pause();
    videoRef.current?.pause();
    setPlaying(false);
  }

  function newScript() {
    stopPreview();
    revokeClips();
    const next = pickSpillQuizScript(templateId);
    setScript(next);
    setLineIndex(0);
    setVoiceError(null);
  }

  const activeLine = script.lines[lineIndex]?.text ?? script.title;

  return (
    <div className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{script.title}</p>
        <Link
          href="/library"
          className="ml-auto rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Video library
        </Link>
      </div>
      <div className="grid gap-4 p-3 md:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-xl bg-black">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc ?? undefined}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
              loop
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-950" />
          )}
          <div className="absolute inset-0 bg-black/50" />
          {videoLoading ? (
            <p className="absolute left-3 top-3 z-20 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
              Loading background…
            </p>
          ) : null}
          <div className="absolute inset-x-6 top-[18%] bottom-[18%] flex items-center justify-center">
            <p className="text-center text-2xl font-bold leading-tight text-white drop-shadow-md">
              {activeLine}
            </p>
          </div>
          <p className="absolute inset-x-4 bottom-4 text-center text-[11px] font-semibold leading-snug text-white/90">
            {SPILL_QUIZ_FOOTER_LINES[0]}
            <br />
            {SPILL_QUIZ_FOOTER_LINES[1]}
          </p>
        </div>
        <div className="min-w-0 space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            One spoken clip. The daily job saves the MP4 in the video library. This preview uses the same
            script and a natural voice.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => (playing ? stopPreview() : void playPreview())}
              disabled={voiceLoading}
              className="min-h-12 rounded-lg bg-zinc-900 px-4 text-base font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {voiceLoading ? 'Getting a voice…' : playing ? 'Stop' : 'Play voice'}
            </button>
            <button
              type="button"
              onClick={newScript}
              disabled={playing || voiceLoading}
              className="min-h-12 rounded-lg border border-zinc-300 px-4 text-base text-zinc-800 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-100"
            >
              New script
            </button>
            <button
              type="button"
              onClick={() => void loadBackground(script)}
              disabled={videoLoading || playing}
              className="min-h-12 rounded-lg border border-zinc-300 px-4 text-base text-zinc-800 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-100"
            >
              {videoLoading ? 'Loading…' : 'New background'}
            </button>
          </div>
          {voiceError ? <p className="text-sm text-red-600 dark:text-red-400">{voiceError}</p> : null}
          {videoError ? <p className="text-sm text-red-600 dark:text-red-400">{videoError}</p> : null}
          <ol className="space-y-2">
            {script.lines.map((line, index) => (
              <li
                key={`${line.role}-${index}`}
                className={`rounded-lg px-3 py-2 text-sm ${
                  index === lineIndex
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                }`}
              >
                {line.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
