'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { CharacterCard } from '@/app/lib/characters';
import type { StudioAppId } from '@/app/lib/apps';
import {
  fetchPinterestCoverImage,
  pickRandomPinterestQuery,
  rememberPinterestCoverUrl,
} from '@/app/lib/pinterest';
import {
  CHARACTER_IMAGE_QUALITIES,
  DEFAULT_CHARACTER_IMAGE_QUALITY,
  type CharacterImageQuality,
} from '@/app/lib/character-generation';
import { FUNNY_QUESTIONS } from '@/app/lib/constants';
import { IphoneLockScreen } from '@/app/components/IphoneNotificationCard';
import { exportCharacterSlides, CHARACTER_COVER_STROKE, CHARACTER_COVER_TITLE_SIZE_RATIO } from '@/app/lib/character-slide-export';
import {
  IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
  IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
} from '@/app/lib/image-template-2-cover';
import { pickRandomDailyFunnyTitle } from '@/app/lib/video-template-2/pick-content';
import JSZip from 'jszip';

const CHARACTER_PINTEREST_POOL = 30;
const CHARACTER_PINTEREST_RECENT_LIMIT = 48;
const CHARACTER_QUESTION_COUNT = 5;
const CHARACTER_SLIDE_COUNT = 1 + CHARACTER_QUESTION_COUNT;

function pickCharacterQuestions(count: number, avoid: string[] = []): string[] {
  const avoidSet = new Set(avoid.map((q) => q.trim()).filter(Boolean));
  const pool = FUNNY_QUESTIONS.filter((q) => !avoidSet.has(q));
  const source = pool.length >= count ? pool : [...FUNNY_QUESTIONS];
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

type CharacterStudioProps = {
  character: CharacterCard;
  selectedAppId: StudioAppId;
  onBack: () => void;
};

function CoverTitleOverlay({ title, x, y }: { title: string; x: number; y: number }) {
  if (!title.trim()) return null;
  return (
    <div
      data-cover-title
      className="absolute z-10 max-w-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
    >
      <p
        className="text-center text-white wrap-break-word"
        style={{
          fontFamily: '"TikTok Sans", system-ui, sans-serif',
          fontSize: `${CHARACTER_COVER_TITLE_SIZE_RATIO * 100}cqw`,
          fontWeight: IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
          letterSpacing: IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
          lineHeight: IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
          WebkitTextStroke: `${CHARACTER_COVER_STROKE} #000000`,
          paintOrder: 'stroke fill',
        }}
      >
        {title}
      </p>
    </div>
  );
}

function ImageFrame({
  label,
  src,
  alt,
  placeholder,
  overlay,
  foreground,
  frameMarker,
}: {
  label: string;
  src?: string | null;
  alt: string;
  placeholder: string;
  overlay?: string | null;
  foreground?: ReactNode;
  frameMarker?: string;
}) {
  return (
    <div className="min-w-0">
      <div
        data-cover-frame={frameMarker}
        className="@container aspect-3/4 w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-600/80 relative"
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {placeholder}
          </div>
        )}
        {foreground}
        {overlay ? (
          <div className="absolute inset-0 z-20 bg-black/45 flex items-center justify-center text-sm text-white">
            {overlay}
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 text-center">{label}</p>
    </div>
  );
}

export function CharacterStudio({ character, selectedAppId, onBack }: CharacterStudioProps) {
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quality, setQuality] = useState<CharacterImageQuality>(DEFAULT_CHARACTER_IMAGE_QUALITY);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>(() =>
    pickCharacterQuestions(CHARACTER_QUESTION_COUNT)
  );
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [coverTitle, setCoverTitle] = useState(() => pickRandomDailyFunnyTitle());
  const [titleAnchor, setTitleAnchor] = useState({ x: 0.5, y: 0.5 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [description, setDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recentRef = useRef<string[]>([]);
  const lastQueryRef = useRef('');

  const searchReference = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    setError(null);
    setGeneratedImageUrl(null);
    const query = pickRandomPinterestQuery(character.referenceQueries, lastQueryRef.current);
    lastQueryRef.current = query;
    try {
      const result = await fetchPinterestCoverImage({
        query,
        exclude: recentRef.current,
        poolSize: CHARACTER_PINTEREST_POOL,
        deep: true,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      recentRef.current = rememberPinterestCoverUrl(
        recentRef.current,
        result.originalUrl || result.imageUrl,
        CHARACTER_PINTEREST_RECENT_LIMIT
      );
      setReferenceImageUrl(result.imageUrl);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to fetch Pinterest image');
    } finally {
      if (abortRef.current === controller) setIsSearching(false);
    }
  }, [character.referenceQueries]);

  useEffect(() => {
    setReferenceImageUrl(null);
    setGeneratedImageUrl(null);
    setError(null);
    setSelectedSlide(0);
    setCoverTitle(pickRandomDailyFunnyTitle());
    setTitleAnchor({ x: 0.5, y: 0.5 });
    setQuestions(pickCharacterQuestions(CHARACTER_QUESTION_COUNT));
    setDescription('');
    setDescriptionError(null);
    recentRef.current = [];
    lastQueryRef.current = '';
    void searchReference();
    return () => abortRef.current?.abort();
  }, [character.id, searchReference]);

  const handleStart = async () => {
    if (!referenceImageUrl || isGenerating || isSearching) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/openai/character-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: selectedAppId,
          characterId: character.id,
          referenceImageUrl,
          quality,
        }),
      });
      const data = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || 'Failed to generate character image');
      }
      setGeneratedImageUrl(data.imageUrl);
      setSelectedSlide(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate character image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    const filled = questions.map((q) => q.trim()).filter(Boolean);
    if (filled.length === 0) {
      setDescriptionError('Add some questions first, then generate a description.');
      return;
    }
    setDescriptionError(null);
    setIsGeneratingDescription(true);
    try {
      const res = await fetch('/api/openai/daily-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: filled.join('\n'),
          type: 'funny',
        }),
      });
      const data = (await res.json()) as {
        description?: string;
        text?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate description');
      }
      const next =
        (typeof data.description === 'string' && data.description.trim()) ||
        (typeof data.text === 'string' && data.text.trim()) ||
        '';
      if (!next) {
        throw new Error('No description returned');
      }
      setDescription(next);
    } catch (e) {
      setDescriptionError(e instanceof Error ? e.message : 'Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleRandomQuestion = () => {
    if (selectedSlide < 1) return;
    const index = selectedSlide - 1;
    const next = pickCharacterQuestions(1, questions)[0] ?? questions[index] ?? '';
    setQuestions((current) => {
      const copy = [...current];
      copy[index] = next;
      return copy;
    });
  };

  const clampTitleAnchor = useCallback((x: number, y: number, dx = 0, dy = 0) => {
    const titles = [...document.querySelectorAll('[data-cover-title]')].filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
    const measured = titles
      .map((titleEl) => {
        const frame = titleEl.closest('[data-cover-frame]');
        if (!(frame instanceof HTMLElement)) return null;
        const frameRect = frame.getBoundingClientRect();
        if (frameRect.width < 1 || frameRect.height < 1) return null;
        return { titleEl, frameRect };
      })
      .filter((item): item is { titleEl: HTMLElement; frameRect: DOMRect } => item !== null)
      .sort((a, b) => b.frameRect.width - a.frameRect.width);
    const sample = measured[0];
    if (!sample) {
      return {
        x: Math.min(0.9, Math.max(0.1, x + dx)),
        y: Math.min(0.9, Math.max(0.1, y + dy)),
      };
    }
    const { titleEl, frameRect } = sample;
    const titleRect = titleEl.getBoundingClientRect();
    const inset = 6;
    const halfW = titleRect.width / 2 + inset;
    const halfH = titleRect.height / 2 + inset;
    const nextX = x * frameRect.width + dx * frameRect.width;
    const nextY = y * frameRect.height + dy * frameRect.height;
    const minX = Math.min(halfW, frameRect.width / 2);
    const maxX = Math.max(minX, frameRect.width - halfW);
    const minY = Math.min(halfH, frameRect.height / 2);
    const maxY = Math.max(minY, frameRect.height - halfH);
    return {
      x: Math.min(maxX, Math.max(minX, nextX)) / frameRect.width,
      y: Math.min(maxY, Math.max(minY, nextY)) / frameRect.height,
    };
  }, []);

  const moveTitle = (dx: number, dy: number) => {
    setTitleAnchor((current) => clampTitleAnchor(current.x, current.y, dx, dy));
  };

  useLayoutEffect(() => {
    setTitleAnchor((current) => {
      const next = clampTitleAnchor(current.x, current.y);
      if (Math.abs(next.x - current.x) < 0.0005 && Math.abs(next.y - current.y) < 0.0005) {
        return current;
      }
      return next;
    });
  }, [coverTitle, clampTitleAnchor]);

  const handleDownload = async () => {
    if (!generatedImageUrl || isDownloading) return;
    setIsDownloading(true);
    setError(null);
    try {
      const entries = await exportCharacterSlides({
        coverSrc: generatedImageUrl,
        questionBackgroundSrc: character.questionBackgroundSrc,
        title: coverTitle,
        titleX: titleAnchor.x,
        titleY: titleAnchor.y,
        questions,
      });
      const zip = new JSZip();
      for (const entry of entries) zip.file(entry.path, entry.blob);
      const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${character.id}-slides.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const questionIndex = selectedSlide - 1;
  const activeQuestion = questionIndex >= 0 ? (questions[questionIndex] ?? '') : '';

  return (
    <div className="w-full min-w-0 max-w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <p className="order-3 w-full text-xs font-medium text-zinc-800 dark:text-zinc-200 sm:order-0 sm:w-auto sm:text-sm">
          {character.name}
        </p>
        <div className="order-2 ml-auto flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
          <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <span>Quality</span>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as CharacterImageQuality)}
              disabled={isGenerating}
              className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 sm:py-1 text-sm sm:text-xs text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
            >
              {CHARACTER_IMAGE_QUALITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void searchReference()}
            disabled={isSearching || isGenerating}
            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching…' : 'Retry'}
          </button>
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={!referenceImageUrl || isSearching || isGenerating}
            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating…' : 'Start'}
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={!generatedImageUrl || isDownloading || isGenerating}
            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Downloading…' : 'Download'}
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <ImageFrame
            label={character.name}
            src={character.coverSrc}
            alt={`${character.name} identity`}
            placeholder="No identity photo"
          />
          <ImageFrame
            label="Pinterest reference"
            src={referenceImageUrl}
            alt={`${character.name} scene reference`}
            placeholder={isSearching ? 'Searching Pinterest…' : 'No reference yet'}
            frameMarker="reference"
            foreground={<CoverTitleOverlay title={coverTitle} x={titleAnchor.x} y={titleAnchor.y} />}
          />
          <ImageFrame
            label="Generated"
            src={generatedImageUrl}
            alt={`${character.name} generated`}
            placeholder="Generated image will appear here"
            overlay={isGenerating ? `Generating with ${character.name}…` : null}
          />
        </div>
        <div className="mt-6 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <div className="flex gap-1 pb-3 overflow-x-auto min-w-0 max-w-full">
            {Array.from({ length: CHARACTER_SLIDE_COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedSlide(i)}
                className={`px-2.5 md:px-3 py-1.5 rounded-md text-xs md:text-sm whitespace-nowrap transition-colors ${
                  selectedSlide === i
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {i === 0 ? 'Cover' : `Q${i}`}
              </button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-start gap-4 min-w-0 w-full">
            <div
              className={`@container relative w-full max-w-sm mx-auto md:mx-0 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 overflow-hidden min-w-0 bg-black ${
                selectedSlide === 0 ? 'aspect-3/4' : 'aspect-[393/852]'
              }`}
              data-cover-frame={selectedSlide === 0 ? 'cover' : undefined}
            >
              {selectedSlide === 0 ? (
                generatedImageUrl ? (
                  <>
                    <img
                      src={generatedImageUrl}
                      alt={`${character.name} cover`}
                      className="w-full h-full object-cover"
                    />
                    <CoverTitleOverlay title={coverTitle} x={titleAnchor.x} y={titleAnchor.y} />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center px-4 text-center text-sm text-zinc-400">
                    Cover appears here after Start
                  </div>
                )
              ) : (
                <>
                  <img
                    src={character.questionBackgroundSrc}
                    alt="Question background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <IphoneLockScreen question={activeQuestion} showCta={selectedSlide === 5} />
                </>
              )}
            </div>
            <div className="w-full min-w-0 md:flex-1 space-y-4">
            {selectedSlide === 0 ? (
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Cover title
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverTitle((current) => pickRandomDailyFunnyTitle(current));
                    }}
                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Random title
                  </button>
                </div>
                <input
                  type="text"
                  value={coverTitle}
                  onChange={(e) => setCoverTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Move title</span>
                  <div className="grid grid-cols-3 gap-1">
                    <span />
                    <button
                      type="button"
                      aria-label="Move title up"
                      onClick={() => moveTitle(0, -0.04)}
                      className="h-8 w-8 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ↑
                    </button>
                    <span />
                    <button
                      type="button"
                      aria-label="Move title left"
                      onClick={() => moveTitle(-0.04, 0)}
                      className="h-8 w-8 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ←
                    </button>
                    <span />
                    <button
                      type="button"
                      aria-label="Move title right"
                      onClick={() => moveTitle(0.04, 0)}
                      className="h-8 w-8 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      →
                    </button>
                    <span />
                    <button
                      type="button"
                      aria-label="Move title down"
                      onClick={() => moveTitle(0, 0.04)}
                      className="h-8 w-8 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ↓
                    </button>
                    <span />
                  </div>
                </div>
              </div>
            ) : null}
            {selectedSlide > 0 ? (
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Q{selectedSlide} question
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomQuestion}
                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Random question
                  </button>
                </div>
                <input
                  type="text"
                  value={activeQuestion}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuestions((current) => {
                      const copy = [...current];
                      copy[questionIndex] = value;
                      return copy;
                    });
                  }}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
            ) : null}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Description
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleGenerateDescription()}
                      disabled={
                        isGeneratingDescription || questions.every((q) => !q.trim())
                      }
                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingDescription ? 'Generating…' : 'Generate description'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = description.trim();
                        if (!text) return;
                        void navigator.clipboard.writeText(text).catch(() => {});
                      }}
                      disabled={!description.trim()}
                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="TikTok caption / description will appear here…"
                  rows={5}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-[6rem]"
                />
                {descriptionError ? (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{descriptionError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400 text-center">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
