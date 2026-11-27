'use client';

import { useEffect, useRef, useState } from 'react';
import { finalizeNightyRecording } from '@/app/lib/nighty-video-templates/finalize-export';
import { terminateLoadedFfmpeg, transcodeWebmToMp4 } from '@/app/lib/webm-to-mp4';
import {
  loadTiltedCardFontFamilies,
  recordTiltedCard,
} from '@/app/lib/video-template-11-tilted-card-export';
import {
  TILTED_CARD_DEFAULT_APP_NAME,
  TILTED_CARD_DEFAULT_FILL,
  TILTED_CARD_DEFAULT_ROTATION,
  TILTED_CARD_DEFAULT_VIDEO,
  TILTED_CARD_HEIGHT,
  TILTED_CARD_HOLD_SEC,
  TILTED_CARD_MAX_QUESTIONS,
  TILTED_CARD_PEXELS_QUERIES,
  TILTED_CARD_PRESETS,
  TILTED_CARD_ROTATION_MAX,
  TILTED_CARD_ROTATION_MIN,
  TILTED_CARD_TITLE,
  TILTED_CARD_WIDTH,
  clampTiltedCardRotation,
  defaultTiltedCardQuestions,
  normalizeHexColor,
  paintTiltedCardOverlay,
  pickTiltedCardQuestions,
  tiltedCardQuestions,
} from '@/app/lib/video-template-11-tilted-card';
import { PEXELS_PREFER_HEIGHT, pexelsVideoProxySrc } from '@/app/lib/pexels-video-client';

type Props = {
  onBack: () => void;
};

const fieldClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100';

export function TiltedCardVideoStudio({ onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [appName, setAppName] = useState(TILTED_CARD_DEFAULT_APP_NAME);
  const [questions, setQuestions] = useState<string[]>(defaultTiltedCardQuestions);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [fill, setFill] = useState(TILTED_CARD_DEFAULT_FILL);
  const [rotation, setRotation] = useState(TILTED_CARD_DEFAULT_ROTATION);
  const [videoSrc, setVideoSrc] = useState(TILTED_CARD_DEFAULT_VIDEO);
  const [videoLabel, setVideoLabel] = useState('Sunset beach');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('Download');
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const previewQuestion = questions[previewIndex] ?? '';

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (previewIndex > questions.length - 1) {
      setPreviewIndex(Math.max(0, questions.length - 1));
    }
  }, [previewIndex, questions.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let cancelled = false;
    void (async () => {
      const families = await loadTiltedCardFontFamilies();
      if (cancelled) return;
      paintTiltedCardOverlay(ctx, canvas.width, canvas.height, {
        appName,
        question: previewQuestion,
        fill,
        rotationDeg: rotation,
        ...families,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [appName, previewQuestion, fill, rotation]);

  const replaceVideo = (src: string, label: string, blobUrl: string | null) => {
    if (blobUrlRef.current && blobUrlRef.current !== blobUrl) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = blobUrl;
    setVideoSrc(src);
    setVideoLabel(label);
    setVideoError(null);
  };

  const pickClip = async () => {
    setPicking(true);
    setVideoError(null);
    try {
      const query =
        TILTED_CARD_PEXELS_QUERIES[Math.floor(Math.random() * TILTED_CARD_PEXELS_QUERIES.length)]!;
      const page = 1 + Math.floor(Math.random() * 8);
      const res = await fetch(
        `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}&preferHeight=${PEXELS_PREFER_HEIGHT}`
      );
      const data = (await res.json()) as { videoUrl?: string; error?: string };
      if (!res.ok || !data.videoUrl) throw new Error(data.error || 'Could not find a clip');
      replaceVideo(pexelsVideoProxySrc(data.videoUrl), 'Pexels clip', null);
    } catch (error) {
      setVideoError(error instanceof Error ? error.message : 'Could not find a clip');
    } finally {
      setPicking(false);
    }
  };

  const uploadClip = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setVideoError('Choose a video file.');
      return;
    }
    const url = URL.createObjectURL(file);
    replaceVideo(url, file.name, url);
  };

  const download = async () => {
    const ready = tiltedCardQuestions(questions);
    if (ready.length === 0) {
      setExportError('Add a question first.');
      return;
    }
    setExporting(true);
    setExportError(null);
    setExportNote(null);
    setExportLabel('Recording…');
    try {
      const recorded = await recordTiltedCard({
        videoSrc,
        questions: ready,
        card: { appName, fill, rotationDeg: rotation },
        onProgress: (seconds, total) => {
          setExportLabel(`Recording ${Math.min(total, Math.ceil(seconds))}s / ${Math.ceil(total)}s`);
        },
      });
      setExportLabel('Encoding MP4…');
      const file = await finalizeNightyRecording(
        recorded,
        (blob) => transcodeWebmToMp4(blob, null, { preset: 'veryfast' }),
        120_000,
        terminateLoadedFfmpeg
      );
      const filename = `tilted-card.${file.extension}`;
      setExportNote(
        file.fallback
          ? `Downloaded ${filename}. MP4 encode isn’t available in this browser, so this file is WebM.`
          : `Downloaded ${filename}.`
      );
      const url = URL.createObjectURL(file.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setExporting(false);
      setExportLabel('Download');
    }
  };

  return (
    <div
      data-testid="tilted-card-studio"
      className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{TILTED_CARD_TITLE}</p>
        <button
          type="button"
          onClick={() => void download()}
          disabled={exporting || picking}
          className="ml-auto inline-flex items-center justify-center rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {exporting ? exportLabel : 'Download'}
        </button>
      </div>

      <div className="flex flex-col items-start gap-4 p-3 md:flex-row">
        <div className="relative mx-auto aspect-9/16 w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-black dark:border-zinc-700">
          <video
            key={videoSrc}
            src={videoSrc}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            controls
            onError={() => setVideoError('The background clip could not play.')}
          />
          <canvas
            ref={canvasRef}
            data-testid="tilted-card-preview"
            width={TILTED_CARD_WIDTH}
            height={TILTED_CARD_HEIGHT}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
            aria-hidden
          />
        </div>

        <div className="w-full min-w-0 space-y-4 md:max-h-[calc(100vh-8rem)] md:w-80 md:overflow-y-auto md:pr-1">
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Background</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{videoLabel}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void pickClip()}
                disabled={picking || exporting}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {picking ? 'Finding a clip…' : 'Pick a clip'}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={exporting}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Upload a clip
              </button>
              <button
                type="button"
                onClick={() => replaceVideo(TILTED_CARD_DEFAULT_VIDEO, 'Sunset beach', null)}
                disabled={exporting}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Use sunset
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(event) => {
                uploadClip(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            {videoError ? <p className="text-xs text-red-600 dark:text-red-400">{videoError}</p> : null}
          </div>

          <div>
            <label htmlFor="tilted-card-name" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              App name
            </label>
            <input
              id="tilted-card-name"
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Questions</p>
              <button
                type="button"
                onClick={() => {
                  setQuestions(pickTiltedCardQuestions(Math.max(1, questions.length), questions));
                  setPreviewIndex(0);
                }}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Shuffle
              </button>
            </div>
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div key={index}>
                  <div className="mb-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(index)}
                      className={`text-[11px] font-medium ${
                        index === previewIndex
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      Q{index + 1}
                      {index === previewIndex ? ' · preview' : ''}
                    </button>
                    {questions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQuestions((current) => current.filter((_, item) => item !== index));
                          setPreviewIndex((current) => (current > index ? current - 1 : current));
                        }}
                        className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <textarea
                    value={question}
                    rows={3}
                    onFocus={() => setPreviewIndex(index)}
                    onChange={(event) => {
                      const value = event.target.value;
                      setQuestions((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
                      setPreviewIndex(index);
                    }}
                    className={`${fieldClass} resize-y`}
                  />
                </div>
              ))}
            </div>
            {questions.length < TILTED_CARD_MAX_QUESTIONS ? (
              <button
                type="button"
                onClick={() => setQuestions((current) => [...current, ''])}
                className="mt-2 text-xs text-zinc-600 underline dark:text-zinc-300"
              >
                Add a question
              </button>
            ) : null}
            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              Download is one video. Each question stays up for {TILTED_CARD_HOLD_SEC} seconds, in this order.
            </p>
          </div>

          <div>
            <label htmlFor="tilted-card-rotation" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Card tilt ({rotation.toFixed(1)}°)
            </label>
            <input
              id="tilted-card-rotation"
              type="range"
              min={TILTED_CARD_ROTATION_MIN}
              max={TILTED_CARD_ROTATION_MAX}
              step={0.5}
              value={rotation}
              onChange={(event) => setRotation(clampTiltedCardRotation(Number(event.target.value)))}
              className="w-full"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">Card colour</p>
            <div className="flex flex-wrap gap-2">
              {TILTED_CARD_PRESETS.map((preset) => {
                const selected = normalizeHexColor(fill) === preset.hex;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFill(preset.hex)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] ${
                      selected
                        ? 'border-zinc-900 dark:border-zinc-100'
                        : 'border-zinc-300 dark:border-zinc-600'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.hex }}
                    />
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              Custom
              <input
                type="color"
                aria-label="Custom card colour"
                value={normalizeHexColor(fill).toLowerCase()}
                onChange={(event) => setFill(normalizeHexColor(event.target.value))}
                className="h-8 w-10 cursor-pointer rounded border border-zinc-300 bg-transparent dark:border-zinc-600"
              />
              <span className="font-mono text-[11px] text-zinc-500">{normalizeHexColor(fill)}</span>
            </label>
          </div>

          {exportError ? <p className="text-xs text-red-600 dark:text-red-400">{exportError}</p> : null}
          {exportNote ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{exportNote}</p> : null}
        </div>
      </div>
    </div>
  );
}
