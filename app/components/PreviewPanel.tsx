'use client';

import { useMemo, useState, useCallback } from 'react';
import type { CanvasData } from '@/app/lib/types';
import { wrapTextToLines, getComplementaryColor } from '@/app/lib/canvas-utils';
import { ROMANTIC_IMAGE_FILTER, type ConcreteQuestionType } from '@/app/lib/constants';
import { downloadDataUrl, extensionForMimeType } from '@/app/lib/download-data-url';

function GenerateImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function PromptGenerateButton({
  prompt,
  genKey,
  generatingKey,
  onGenerate,
}: {
  prompt: string;
  genKey: string;
  generatingKey: string | null;
  onGenerate: (prompt: string, key: string) => void;
}) {
  const busy = generatingKey === genKey;
  return (
    <button
      type="button"
      onClick={() => onGenerate(prompt, genKey)}
      disabled={busy || !prompt.trim()}
      className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Generate image (Gemini)"
      aria-label="Generate image"
    >
      {busy ? (
        <SpinnerIcon className="w-4 h-4 mx-auto animate-spin" />
      ) : (
        <GenerateImageIcon className="w-4 h-4 mx-auto" />
      )}
    </button>
  );
}

interface PreviewPanelProps {
  canvases: CanvasData[];
  currentCanvasId: string;
  currentCanvas: CanvasData;
  firstCard: CanvasData;
  onSelectCanvas: (id: string) => void;
  onAddCanvas: () => void;
  onDeleteCanvas: (id: string, e: React.MouseEvent) => void;
  backgroundColor: string;
  imageSize: string;
  textSize: string;
  mode: 'plain' | 'video';
  videoBackgroundUrl: string | null;
  videoThumbnailUrl: string | null;
  card2Texts?: Array<{ text: string; color: string }>;
  mounted: boolean;
  /** When on automate + nana, show these generated prompt results one by one */
  automateDailyResults?: string[] | null;
  /** API-generated video title, shown at top */
  automateDailyVideoTitle?: string | null;
  /** API-generated caption, shown above the template prompt */
  automateDailyTitle?: string | null;
  /** Random prompt template with {x} intact, shown above the 5 results */
  automateDailyTemplatePrompt?: string | null;
  automateDailyIndex?: number;
  onAutomateDailyIndexChange?: (i: number) => void;
  /** Retry/replace a single slot with new prompt + question */
  onRetryDailyItem?: (index: number) => void;
  /** Replace only the image prompt for a slot (keeps the question text) */
  onRetryDailyPromptOnly?: (index: number) => void;
  /** Set a specific image prompt for a slot (keeps the question text) */
  onSetDailyPrompt?: (index: number, prompt: string) => void;
  /** Replace only the question for a slot (keeps the image prompt) */
  onRetryDailyQuestionOnly?: (index: number) => void;
  /** Current daily questions (for per-card selectors) */
  automateDailyQuestions?: string[] | null;
  /** Current daily prompts (for per-card prompt selectors) */
  automateDailyPrompts?: string[] | null;
  /** Available question options for selectors */
  automateQuestionOptions?: string[];
  /** Available prompt options for selectors */
  automatePromptOptions?: string[];
  /** Available prompt options for the cover / first template selector */
  automateTemplatePromptOptions?: string[];
  /** Available template question/title options */
  automateTemplateQuestionOptions?: string[];
  /** Concrete question category used for the latest run */
  automateResolvedQuestionType?: ConcreteQuestionType | null;
  /** Set a specific question for a slot */
  onSetDailyQuestion?: (index: number, question: string) => void;
  /** Retry template prompt - new prompt + new API text for {x} */
  onRetryTemplatePrompt?: () => void | Promise<void>;
  isRetryingTemplatePrompt?: boolean;
  /** Template: new image prompt only, keep current {x} text */
  onRetryTemplatePromptOnly?: () => void;
  /** Template: new {x} text only, keep current image prompt */
  onRetryTemplateQuestionOnly?: () => void | Promise<void>;
  isRetryingTemplateQuestion?: boolean;
  /** Current template replacement text and setter for explicit selection */
  automateTemplateReplacementText?: string | null;
  onSetTemplateQuestion?: (question: string) => void;
  /** Current template raw prompt and setter for explicit selection */
  automateTemplatePromptRaw?: string | null;
  onSetTemplatePrompt?: (prompt: string) => void;
  /** Inline edit generated template prompt text */
  onEditTemplatePromptText?: (text: string) => void;
  /** Inline edit generated daily result text */
  onEditDailyResultText?: (index: number, text: string) => void;
  /** Regenerate API video title / caption from current daily questions */
  onRegenerateDailyVideoTitle?: () => void | Promise<void>;
  onRegenerateDailyCaption?: () => void | Promise<void>;
  isRetryingDailyVideoTitle?: boolean;
  isRetryingDailyCaption?: boolean;
  /** When true, hide canvas cards in the preview strip */
  isAutomateNanaMode?: boolean;
}

export function PreviewPanel({
  canvases,
  currentCanvasId,
  currentCanvas,
  firstCard,
  onSelectCanvas,
  onAddCanvas,
  onDeleteCanvas,
  backgroundColor,
  imageSize,
  textSize,
  mode,
  videoBackgroundUrl,
  videoThumbnailUrl,
  mounted,
  automateDailyResults,
  automateDailyVideoTitle,
  automateDailyTitle,
  automateDailyTemplatePrompt,
  automateDailyIndex = 0,
  onAutomateDailyIndexChange,
  onRetryDailyItem,
  onRetryDailyPromptOnly,
  onSetDailyPrompt,
  onRetryDailyQuestionOnly,
  automateDailyPrompts,
  automateDailyQuestions,
  automateQuestionOptions = [],
  automatePromptOptions = [],
  automateTemplatePromptOptions,
  automateTemplateQuestionOptions = [],
  automateResolvedQuestionType = null,
  onSetDailyQuestion,
  onRetryTemplatePrompt,
  isRetryingTemplatePrompt = false,
  onRetryTemplatePromptOnly,
  onRetryTemplateQuestionOnly,
  isRetryingTemplateQuestion = false,
  automateTemplateReplacementText,
  onSetTemplateQuestion,
  automateTemplatePromptRaw,
  onSetTemplatePrompt,
  onEditTemplatePromptText,
  onEditDailyResultText,
  onRegenerateDailyVideoTitle,
  onRegenerateDailyCaption,
  isRetryingDailyVideoTitle = false,
  isRetryingDailyCaption = false,
  isAutomateNanaMode = false,
}: PreviewPanelProps) {
  const showAutomateDaily = automateDailyResults && automateDailyResults.length > 0;
  const showCanvasCards = !isAutomateNanaMode;
  const templateActionsBusy = isRetryingTemplatePrompt || isRetryingTemplateQuestion;
  const resolvedCategoryLabel =
    automateResolvedQuestionType === 'me_or_you'
      ? 'Me or you'
      : automateResolvedQuestionType === 'flirty'
        ? 'Flirty'
        : automateResolvedQuestionType === 'brave'
          ? 'Brave'
          : automateResolvedQuestionType === 'funny'
            ? 'Funny'
            : null;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [questionSelectValueByIndex, setQuestionSelectValueByIndex] = useState<Record<number, string>>({});
  const [templateQuestionSelectValue, setTemplateQuestionSelectValue] = useState('');
  const [promptSelectValueByIndex, setPromptSelectValueByIndex] = useState<Record<number, string>>({});
  const [templatePromptSelectValue, setTemplatePromptSelectValue] = useState('');
  const [generatingImageKey, setGeneratingImageKey] = useState<string | null>(null);
  const [generateImageError, setGenerateImageError] = useState<string | null>(null);

  const handleGenerateImage = useCallback(async (prompt: string, key: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setGeneratingImageKey(key);
    setGenerateImageError(null);
    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = (await res.json()) as { error?: string; imageUrl?: string; mimeType?: string };
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || 'Image generation failed');
      }
      const ext = extensionForMimeType(data.mimeType);
      downloadDataUrl(data.imageUrl, `prompt-${key}-${Date.now()}.${ext}`);
    } catch (e) {
      setGenerateImageError(e instanceof Error ? e.message : 'Image generation failed');
    } finally {
      setGeneratingImageKey(null);
    }
  }, []);

  const handleCopy = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // ignore
    }
  }, []);

  const previewContent = useMemo(() => {
    const [widthStr, heightStr] = (imageSize || '1080x1920').split('x').map((s) => s.trim());
    const width = parseInt(widthStr) || 1080;
    const height = parseInt(heightStr) || 1920;
    const fontSize = parseInt(currentCanvas.textSize || textSize) || 200;
    const previewFontSize = fontSize * 0.08;
    const aspectRatio = width / height;
    const isFirstCanvas = currentCanvasId === '1';
    const canvasWidthScale = width / 1080;
    const titleFontSize = (fontSize * canvasWidthScale) / 2.5;
    const titleMaxWidth = width * 0.9;
    const titleLines = mounted && isFirstCanvas ? wrapTextToLines(firstCard.text, titleMaxWidth, titleFontSize) : [];
    const isEndingCard = currentCanvasId === 'end';
    const useVideoBg = isFirstCanvas && mode === 'video' && !!videoBackgroundUrl;
    const showPlainBg = !useVideoBg;

    return (
      <div
        className="rounded-lg border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-3 relative overflow-hidden"
        style={{
          backgroundColor: showPlainBg ? backgroundColor : undefined,
          aspectRatio: `${width} / ${height}`,
          height: '100%',
          width: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          contain: 'layout style paint',
          willChange: 'contents',
        }}
      >
        {useVideoBg && videoBackgroundUrl && (
          <img src={videoBackgroundUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ pointerEvents: 'none', filter: ROMANTIC_IMAGE_FILTER }} />
        )}
        {(isFirstCanvas || isEndingCard) ? (
          <div
            className={isEndingCard ? 'flex flex-col items-center justify-center' : 'flex flex-col items-center justify-center relative w-full h-full'}
            style={{ width: '100%', height: '100%', ...(useVideoBg ? { position: 'absolute' as const, inset: 0 } : {}) }}
          >
            {isEndingCard && (
              <svg className="flex-shrink-0" style={{ width: `${previewFontSize * 1.5}px`, height: `${previewFontSize * 1.5}px`, color: currentCanvas.textColor, marginBottom: `${previewFontSize * 0.8}px` }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            )}
            {isFirstCanvas ? (
              titleLines.length > 0 ? (
                <div className="flex flex-col items-center gap-0" style={{ maxWidth: '95%' }}>
                  {titleLines.map((line, i) => (
                    <span key={i} className="font-bold text-center px-[0.45em] py-[0.2em] rounded-[0.25em]" style={{ color: '#000000', backgroundColor: '#FFFFFF', fontFamily: 'var(--font-inter), sans-serif', fontSize: `${previewFontSize}px`, lineHeight: 1.4 }}>{line}</span>
                  ))}
                </div>
              ) : (
                <p className="font-bold text-center px-3 py-1.5 rounded-lg" style={{ color: '#000000', backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: '95%', fontSize: `${previewFontSize}px`, lineHeight: 1.4, minHeight: '1em' }}>{firstCard.text || 'Your title'}</p>
              )
            ) : (
              <p className="font-bold text-center break-words overflow-hidden px-2" style={{ color: currentCanvas.textColor, width: '100%', maxWidth: '95%', wordWrap: 'break-word', overflowWrap: 'break-word', fontSize: `${previewFontSize}px`, lineHeight: 1.4, minHeight: '1em', maxHeight: '100%', contain: 'layout style paint', willChange: 'auto' }}>{currentCanvas.text}</p>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4" style={{ pointerEvents: 'none', contain: 'layout style paint' }}>
            <div
              className="bg-white rounded-2xl border-4 shadow-lg flex flex-col items-start justify-start overflow-hidden relative"
              style={{ width: '75%', aspectRatio, maxHeight: '65%', pointerEvents: 'auto', contain: 'layout style paint', paddingTop: '35%', paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingBottom: '1rem', borderColor: getComplementaryColor(backgroundColor) }}
            >
              <p className="font-bold text-left break-words px-2 overflow-hidden" style={{ color: currentCanvas.textColor || '#000000', width: '100%', maxWidth: '95%', wordWrap: 'break-word', overflowWrap: 'break-word', fontSize: `${previewFontSize}px`, lineHeight: '1.4', minHeight: '1em', maxHeight: '100%', contain: 'layout style paint', willChange: 'auto' }}>{currentCanvas.text || 'Your text will appear here'}</p>
            </div>
          </div>
        )}
      </div>
    );
  }, [mounted, backgroundColor, imageSize, currentCanvas.textSize, textSize, currentCanvasId, firstCard.textColor, firstCard.text, currentCanvas.textColor, currentCanvas.text, mode, videoBackgroundUrl]);

  return (
    <div className="flex flex-col h-auto lg:h-full lg:max-h-screen p-3 sm:p-4 bg-white dark:bg-zinc-900 rounded-xl lg:rounded-2xl border border-zinc-200 dark:border-zinc-800 lg:border-0 lg:shadow-lg overflow-visible lg:overflow-hidden">
      <div className="mb-3 shrink-0 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {isAutomateNanaMode ? 'Results' : 'Preview'}
        </label>
        {isAutomateNanaMode && resolvedCategoryLabel ? (
          <span className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-200">
            {resolvedCategoryLabel}
          </span>
        ) : null}
      </div>
      <div
        className="flex-1 flex items-stretch lg:items-center justify-center min-h-0 mb-0 lg:mb-3 p-0 lg:p-2 w-full overflow-visible lg:overflow-hidden"
        style={{ position: 'relative', contain: 'layout style paint' }}
      >
        {((showAutomateDaily && automateDailyResults) || (isAutomateNanaMode && (automateDailyVideoTitle || automateDailyTitle || automateDailyTemplatePrompt))) ? (
          <div className="w-full h-auto lg:h-full flex flex-col gap-3 overflow-visible lg:overflow-auto pr-0 lg:pr-1">
            {generateImageError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {generateImageError}
                <button type="button" onClick={() => setGenerateImageError(null)} className="ml-2 underline">
                  Dismiss
                </button>
              </p>
            )}
            {automateDailyVideoTitle && (
              <div className="flex gap-2 items-start p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/80">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Title</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    {automateDailyVideoTitle}
                  </p>
                </div>
                <div className="shrink-0 flex gap-1">
                  <button
                    type="button"
                    onClick={() => onRegenerateDailyVideoTitle?.()}
                    disabled={isRetryingDailyVideoTitle}
                    className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Regenerate title"
                    aria-label="Regenerate title"
                  >
                    {isRetryingDailyVideoTitle ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(automateDailyVideoTitle, -3)}
                    className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    title="Copy"
                    aria-label="Copy"
                  >
                    {copiedIndex === -3 ? (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            {automateDailyTitle && (
              <div className="flex gap-2 items-start p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/80">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Caption</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                    {automateDailyTitle}
                  </p>
                </div>
                <div className="shrink-0 flex gap-1">
                  <button
                    type="button"
                    onClick={() => onRegenerateDailyCaption?.()}
                    disabled={isRetryingDailyCaption}
                    className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Regenerate caption"
                    aria-label="Regenerate caption"
                  >
                    {isRetryingDailyCaption ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(automateDailyTitle, -2)}
                    className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                    title="Copy"
                    aria-label="Copy"
                  >
                    {copiedIndex === -2 ? (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            {automateDailyTemplatePrompt && (
              <div className="p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Template prompt</p>
                    <textarea
                      value={automateDailyTemplatePrompt}
                      onChange={(e) => onEditTemplatePromptText?.(e.target.value)}
                      className="w-full min-h-[140px] resize-y rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 px-2 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed"
                      style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                      aria-label="Edit template prompt text inline"
                    />
                  </div>
                  <div className="shrink-0 flex flex-col gap-1">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onRetryTemplatePrompt?.()}
                        disabled={templateActionsBusy}
                        className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Retry: new prompt and question text"
                        aria-label="Retry: new prompt and question text"
                      >
                        {isRetryingTemplatePrompt ? (
                          <svg className="w-4 h-4 mx-auto animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        ) : (
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(automateDailyTemplatePrompt, -1)}
                        className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                        title="Copy"
                        aria-label="Copy"
                      >
                        {copiedIndex === -1 ? (
                          <svg className="w-4 h-4 mx-auto text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                      </button>
                      <PromptGenerateButton
                        prompt={automateDailyTemplatePrompt}
                        genKey="template"
                        generatingKey={generatingImageKey}
                        onGenerate={handleGenerateImage}
                      />
                    </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onRetryTemplatePromptOnly?.()}
                      disabled={templateActionsBusy}
                      className="w-[96px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      title="New image prompt only (same text that replaced {x})"
                      aria-label="New prompt only"
                    >
                      Prompt
                    </button>
                    <select
                      value={templatePromptSelectValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTemplatePromptSelectValue(value);
                        if (!value) return;
                        onSetTemplatePrompt?.(value);
                        setTemplatePromptSelectValue('');
                      }}
                      className="w-[120px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap"
                      title="Pick specific prompt for template"
                      aria-label="Pick specific prompt for template"
                    >
                      <option value="">Pick prompt</option>
                      {(automateTemplatePromptOptions ?? automatePromptOptions)
                        .filter((p) => {
                          const used = new Set((automateDailyPrompts ?? []).filter(Boolean));
                          if (automateTemplatePromptRaw && p === automateTemplatePromptRaw) return true;
                          return !used.has(p);
                        })
                        .map((p, optionIndex) => (
                          <option key={`${p}-${optionIndex}`} value={p}>
                            {p}
                          </option>
                        ))}
                    </select>
                  </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onRetryTemplateQuestionOnly?.()}
                        disabled={templateActionsBusy}
                        className="w-[96px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        title="New text for {x} only (same image prompt)"
                        aria-label="New question only"
                      >
                        {isRetryingTemplateQuestion ? (
                          <svg className="w-4 h-4 mx-auto animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        ) : (
                          'Question'
                        )}
                      </button>
                      <select
                        value={templateQuestionSelectValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTemplateQuestionSelectValue(value);
                          if (!value) return;
                          onSetTemplateQuestion?.(value);
                          setTemplateQuestionSelectValue('');
                        }}
                        className="w-[120px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap"
                        title="Pick specific question for template"
                        aria-label="Pick specific question for template"
                      >
                        <option value="">Pick question</option>
                        {automateTemplateQuestionOptions
                          .filter((q, optionIndex, filtered) => {
                            const used = new Set((automateDailyQuestions ?? []).filter(Boolean));
                            const isAllowedCurrent = automateTemplateReplacementText && q === automateTemplateReplacementText;
                            if (!isAllowedCurrent && used.has(q)) return false;
                            return filtered.indexOf(q) === optionIndex;
                          })
                          .map((q, optionIndex) => (
                            <option key={`${q}-${optionIndex}`} value={q}>
                              {q}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {automateDailyResults?.map((text, i) => (
              <div
                key={i}
                className="flex gap-2 items-start p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
              >
                <textarea
                  value={text}
                  onChange={(e) => onEditDailyResultText?.(i, e.target.value)}
                  className="flex-1 min-w-0 min-h-[140px] resize-y rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900/40 px-2 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                  aria-label={`Edit result text inline for item ${i + 1}`}
                />
                <div className="shrink-0 flex flex-col gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onRetryDailyItem?.(i)}
                      className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                      title="Retry: new prompt and question"
                      aria-label="Retry: new prompt and question"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(text, i)}
                      className="p-2 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                      title="Copy"
                      aria-label="Copy"
                    >
                      {copiedIndex === i ? (
                        <svg className="w-4 h-4 mx-auto text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                    </button>
                    <PromptGenerateButton
                      prompt={text}
                      genKey={`daily-${i}`}
                      generatingKey={generatingImageKey}
                      onGenerate={handleGenerateImage}
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onRetryDailyPromptOnly?.(i)}
                      className="w-[96px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap"
                      title="New image prompt only (same question)"
                      aria-label="New prompt only"
                    >
                      Prompt
                    </button>
                    <select
                      value={promptSelectValueByIndex[i] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPromptSelectValueByIndex((prev) => ({ ...prev, [i]: value }));
                        if (!value) return;
                        onSetDailyPrompt?.(i, value);
                        setPromptSelectValueByIndex((prev) => ({ ...prev, [i]: '' }));
                      }}
                      className="w-[120px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap"
                      title="Pick specific prompt"
                      aria-label={`Select specific prompt for item ${i + 1}`}
                    >
                      <option value="">Pick prompt</option>
                      {automatePromptOptions
                        .filter((p) => !new Set((automateDailyPrompts ?? []).filter((_, idx) => idx !== i)).has(p))
                        .map((p, optionIndex) => (
                          <option key={`${p}-${optionIndex}`} value={p}>
                            {p}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onRetryDailyQuestionOnly?.(i)}
                      className="w-[96px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap"
                      title="New question only (same image prompt)"
                      aria-label="New question only"
                    >
                      Question
                    </button>
                    <select
                      value={questionSelectValueByIndex[i] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setQuestionSelectValueByIndex((prev) => ({ ...prev, [i]: value }));
                        if (!value) return;
                        onSetDailyQuestion?.(i, value);
                        setQuestionSelectValueByIndex((prev) => ({ ...prev, [i]: '' }));
                      }}
                      className="w-[120px] px-2 py-1.5 rounded-md text-xs font-medium bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap"
                      title="Pick a specific unused question"
                      aria-label={`Select specific question for item ${i + 1}`}
                    >
                      <option value="">Pick question</option>
                      {automateQuestionOptions
                        .filter((q, optionIndex, filtered) => {
                          const isUnused = !new Set((automateDailyQuestions ?? []).filter((_, idx) => idx !== i)).has(q);
                          if (!isUnused) return false;
                          return filtered.indexOf(q) === optionIndex;
                        })
                        .map((q, optionIndex) => (
                          <option key={`${q}-${optionIndex}`} value={q}>
                            {q}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isAutomateNanaMode ? (
          <div className="w-full min-h-[160px] lg:h-full flex items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              Tap Generate Daily TikTok to see prompts
            </p>
          </div>
        ) : (
          previewContent
        )}
      </div>
      {!showAutomateDaily && !(isAutomateNanaMode && (automateDailyVideoTitle || automateDailyTitle || automateDailyTemplatePrompt)) && (
      <div className="flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {showCanvasCards ? (
          canvases.map((canvas) => {
            const [widthStr, heightStr] = (canvas.imageSize || '1080x1920').split('x').map((s) => s.trim());
            const width = parseInt(widthStr) || 1080;
            const height = parseInt(heightStr) || 1920;
            const aspectRatio = width / height;
            const isFirstCanvas = canvas.id === '1';
            const useThumbBg = isFirstCanvas && mode === 'video' && !!videoThumbnailUrl;
            const canvasWidthScale = width / 1080;
            const baseFs = parseInt(canvas.textSize || '200') || 200;
            const titleFontSize = (baseFs * canvasWidthScale) / 2.5;
            const titleMaxWidth = width * 0.9;
            const thumbTitleLines = mounted && isFirstCanvas ? wrapTextToLines(canvas.text, titleMaxWidth, titleFontSize) : [];

            return (
              <div key={canvas.id} className="contents">
                {(canvas.id === '1' || canvas.id === 'end') && (
                  <div
                    onClick={(e) => { e.stopPropagation(); onSelectCanvas(canvas.id); }}
                    className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${canvas.id === currentCanvasId ? 'border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                    style={{ backgroundColor: canvas.backgroundColor }}
                  >
                    {useThumbBg && videoThumbnailUrl && (
                      <img src={videoThumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: ROMANTIC_IMAGE_FILTER }} />
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center p-1 ${canvas.id === 'end' ? 'flex-col gap-1' : 'flex-col gap-1'}`}>
                      {canvas.id === 'end' && (
                        <svg className="flex-shrink-0" style={{ width: '12px', height: '12px', color: canvas.textColor }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      )}
                      {canvas.id === '1' ? (
                        thumbTitleLines.length > 0 ? (
                          <div className="flex flex-col items-center gap-0">
                            {thumbTitleLines.map((line, i) => (
                              <span key={i} className="font-bold text-center text-xs leading-tight px-1 py-0.5 rounded" style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#000000', backgroundColor: '#FFFFFF' }}>{line}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-bold text-center text-xs leading-tight px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#000000', backgroundColor: '#FFFFFF' }}>{canvas.text || '•'}</span>
                        )
                      ) : (
                        <p className="font-bold text-center text-xs leading-tight px-2" style={{ color: canvas.textColor }}>{canvas.text || '•'}</p>
                      )}
                    </div>
                  </div>
                )}
                {canvas.id !== '1' && canvas.id !== 'end' && (
                  <div
                    onClick={(e) => { e.stopPropagation(); onSelectCanvas(canvas.id); }}
                    className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${canvas.id === currentCanvasId ? 'border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'} z-10`}
                    style={{ backgroundColor: canvas.backgroundColor }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
                      <div className="bg-white rounded-lg border-4 shadow-lg flex flex-col items-start justify-start pointer-events-none relative overflow-hidden" style={{ width: '75%', aspectRatio, maxHeight: '65%', paddingTop: '35%', paddingLeft: '0.25rem', paddingRight: '0.25rem', paddingBottom: '0.5rem', borderColor: getComplementaryColor(canvas.backgroundColor || '#000000') }} />
                    </div>
                    {canvases.length > 3 && canvas.id !== '1' && canvas.id !== 'end' && (
                      <button onClick={(e) => onDeleteCanvas(canvas.id, e)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10" title="Delete canvas">×</button>
                    )}
                  </div>
                )}
              </div>
            );
          })
          ) : null }
          {showCanvasCards && (
            <button onClick={onAddCanvas} className="flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#3B82F6] dark:hover:border-[#3B82F6] flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-[#3B82F6] transition-colors bg-zinc-50 dark:bg-zinc-800" title="Add new canvas">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
