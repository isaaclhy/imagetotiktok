'use client';

import { useState, useEffect } from 'react';
import type { CanvasData, CreatorInfo } from '@/app/lib/types';
import { COVER_IMAGE_PROMPTS, getDefaultAutomateCategories, type CoverImageStyle } from '@/app/lib/constants';

interface InputsCardProps {
  contentTab: 'image' | 'video' | 'automate';
  // Image form state
  backgroundColor: string;
  setBackgroundColor: (v: string) => void;
  theme: string;
  setTheme: (v: string) => void;
  mode: 'plain' | 'video';
  setMode: (v: 'plain' | 'video') => void;
  videoLoading: boolean;
  onChangeVideo: () => void;
  text: string;
  setText: (v: string) => void;
  firstCard: CanvasData;
  canvases: CanvasData[];
  setCanvases: React.Dispatch<React.SetStateAction<CanvasData[]>>;
  textSize: string;
  setTextSize: (v: string) => void;
  onAddCanvas: () => void;
  onDeleteCanvas: (id: string, e: React.MouseEvent) => void;
  // Post settings
  userInfo: { display_name?: string; avatar_url?: string } | null;
  postTitle: string;
  setPostTitle: (v: string) => void;
  postPrivacy: string;
  setPostPrivacy: (v: string) => void;
  creatorInfo: CreatorInfo | null;
  allowComment: boolean;
  setAllowComment: (v: boolean) => void;
  contentDisclosureEnabled: boolean;
  setContentDisclosureEnabled: (v: boolean) => void;
  isYourBrand: boolean;
  setIsYourBrand: (v: boolean) => void;
  isBrandedContent: boolean;
  setIsBrandedContent: (v: boolean) => void;
  musicUsageConsent: boolean;
  setMusicUsageConsent: (v: boolean) => void;
  // Automate tab
  automateModel?: 'gpt' | 'nana';
  automateCount?: string;
  setAutomateCount?: (v: string) => void;
  onAutomateDownload?: (coverPromptId: string, categories: string[]) => Promise<void>;
  isAutoGenerating?: boolean;
  onGenerateDailyTikTok?: () => void | Promise<void>;
  isGeneratingDailyTikTok?: boolean;
  automateQuestionType?: 'funny' | 'flirty' | 'me_or_you';
  setAutomateQuestionType?: (v: 'funny' | 'flirty' | 'me_or_you') => void;
  /** Daily TikTok: which sections to regenerate (Nana automate) */
  dailyGenIncludeQuestions?: boolean;
  setDailyGenIncludeQuestions?: (v: boolean) => void;
  dailyGenIncludeTitle?: boolean;
  setDailyGenIncludeTitle?: (v: boolean) => void;
  dailyGenIncludeCaption?: boolean;
  setDailyGenIncludeCaption?: (v: boolean) => void;
  dailyGenIncludeCoverImage?: boolean;
  setDailyGenIncludeCoverImage?: (v: boolean) => void;
}

export function InputsCard(props: InputsCardProps) {
  const {
    contentTab,
    backgroundColor,
    setBackgroundColor,
    theme,
    setTheme,
    mode,
    setMode,
    videoLoading,
    onChangeVideo,
    text,
    setText,
    firstCard,
    canvases,
    setCanvases,
    textSize,
    setTextSize,
    onAddCanvas,
    onDeleteCanvas,
    userInfo,
    postTitle,
    setPostTitle,
    postPrivacy,
    setPostPrivacy,
    creatorInfo,
    allowComment,
    setAllowComment,
    contentDisclosureEnabled,
    setContentDisclosureEnabled,
    isYourBrand,
    setIsYourBrand,
    isBrandedContent,
    setIsBrandedContent,
    musicUsageConsent,
    setMusicUsageConsent,
    automateModel = 'nana',
    automateCount = '5',
    setAutomateCount = () => {},
    onAutomateDownload,
    isAutoGenerating = false,
    onGenerateDailyTikTok,
    isGeneratingDailyTikTok = false,
    automateQuestionType = 'funny',
    setAutomateQuestionType = () => {},
    dailyGenIncludeQuestions = true,
    setDailyGenIncludeQuestions = () => {},
    dailyGenIncludeTitle = true,
    setDailyGenIncludeTitle = () => {},
    dailyGenIncludeCaption = true,
    setDailyGenIncludeCaption = () => {},
    dailyGenIncludeCoverImage = true,
    setDailyGenIncludeCoverImage = () => {},
  } = props;

  const [automateCoverStyle, setAutomateCoverStyle] = useState<CoverImageStyle>('creative');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoQuestions, setVideoQuestions] = useState<string[]>(['']);
  const [videoRandomLoading, setVideoRandomLoading] = useState(false);
  const [videoRendering, setVideoRendering] = useState(false);
  const [videoFilterOpen, setVideoFilterOpen] = useState(false);
  const [videoDragIndex, setVideoDragIndex] = useState<number | null>(null);
  const [videoDragOverIndex, setVideoDragOverIndex] = useState<number | null>(null);
  const [videoCategories, setVideoCategories] = useState<string[]>([]);
  const [videoSelectedCategories, setVideoSelectedCategories] = useState<Set<string>>(new Set());
  const [videoCategoriesLoading, setVideoCategoriesLoading] = useState(false);
  const [automateCategories, setAutomateCategories] = useState<string[]>([]);
  const [automateSelectedCategories, setAutomateSelectedCategories] = useState<Set<string>>(new Set());
  const [automateCategoriesLoading, setAutomateCategoriesLoading] = useState(false);

  useEffect(() => {
    if (videoFilterOpen && videoCategories.length === 0) {
      setVideoCategoriesLoading(true);
      fetch('/api/levels/categories')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const list = data.data as string[];
            setVideoCategories(list);
            setVideoSelectedCategories(new Set(list));
          }
        })
        .finally(() => setVideoCategoriesLoading(false));
    }
  }, [videoFilterOpen]);

  const toggleVideoCategory = (name: string) => {
    setVideoSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  useEffect(() => {
    if (contentTab === 'automate' && automateCategories.length === 0) {
      setAutomateCategoriesLoading(true);
      fetch('/api/levels/categories')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const list = data.data as string[];
            setAutomateCategories(list);
            setAutomateSelectedCategories(new Set(getDefaultAutomateCategories(list)));
          }
        })
        .finally(() => setAutomateCategoriesLoading(false));
    }
  }, [contentTab]);

  const toggleAutomateCategory = (name: string) => {
    setAutomateSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const automateCategoriesToUse =
    automateSelectedCategories.size === automateCategories.length && automateCategories.length > 0
      ? []
      : Array.from(automateSelectedCategories);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 hide-scrollbar">
        <div className="flex flex-col gap-4 py-3">
          {contentTab === 'video' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Questions</h3>
                <div className="flex items-center gap-2">
                <button
                  disabled={videoRandomLoading}
                  onClick={async () => {
                    setVideoRandomLoading(true);
                    const videoCatsToUse = videoSelectedCategories.size === videoCategories.length && videoCategories.length > 0
                      ? [] : Array.from(videoSelectedCategories);
                    const catParam = videoCatsToUse.length > 0 ? `&categories=${encodeURIComponent(videoCatsToUse.join(','))}` : '';
                    try {
                      const res = await fetch(`/api/levels/random?count=7${catParam}`);
                      const data = await res.json();
                      if (data.success && Array.isArray(data.data?.questions) && data.data.questions.length > 0) {
                        const questions = data.data.questions as string[];
                        setVideoQuestions(questions);
                        const { levelName, categoryName } = data.data;
                        const contextParts: string[] = [];
                        if (levelName) contextParts.push(`Level: ${levelName}`);
                        if (categoryName) contextParts.push(`Category: ${categoryName}`);
                        contextParts.push('Questions:');
                        questions.forEach((q: string) => contextParts.push(`- ${q}`));
                        const context = contextParts.join('\n\n');
                        try {
                          const titleRes = await fetch('/api/openai/title', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ context, level: levelName }),
                          });
                          const titleData = await titleRes.json();
                          if (titleRes.ok && titleData?.title?.trim()) {
                            setVideoTitle(titleData.title.trim());
                          } else {
                            setVideoTitle(categoryName || '');
                          }
                        } catch {
                          setVideoTitle(categoryName || '');
                        }
                      }
                    } catch {} finally {
                      setVideoRandomLoading(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {videoRandomLoading && (
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Random
                </button>
                <div className="relative">
                  <button
                    onClick={() => setVideoFilterOpen((prev) => !prev)}
                    className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                    title="Filter categories"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                  {videoFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3 z-10">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Categories</p>
                      {videoCategoriesLoading ? (
                        <p className="text-xs text-zinc-500">Loading…</p>
                      ) : videoCategories.length === 0 ? (
                        <p className="text-xs text-zinc-500">No categories available</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                          {videoCategories.map((cat) => (
                            <label key={cat} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-600 text-xs">
                              <input type="checkbox" checked={videoSelectedCategories.has(cat)} onChange={() => toggleVideoCategory(cat)} className="rounded" />
                              <span className="text-zinc-700 dark:text-zinc-300">{cat}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-12 shrink-0">Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={videoRandomLoading}
                  placeholder="Video title..."
                  className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Questions</label>
              <div className="space-y-3">
                {videoQuestions.map((q, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 items-center rounded-lg transition-colors ${videoDragOverIndex === index ? 'bg-zinc-100 dark:bg-zinc-800' : ''} ${videoDragIndex === index ? 'opacity-40' : ''}`}
                    draggable
                    onDragStart={() => setVideoDragIndex(index)}
                    onDragOver={(e) => { e.preventDefault(); setVideoDragOverIndex(index); }}
                    onDragLeave={() => setVideoDragOverIndex(null)}
                    onDrop={() => {
                      if (videoDragIndex !== null && videoDragIndex !== index) {
                        setVideoQuestions((prev) => {
                          const next = [...prev];
                          const [moved] = next.splice(videoDragIndex, 1);
                          next.splice(index, 0, moved);
                          return next;
                        });
                      }
                      setVideoDragIndex(null);
                      setVideoDragOverIndex(null);
                    }}
                    onDragEnd={() => { setVideoDragIndex(null); setVideoDragOverIndex(null); }}
                  >
                    <div className="cursor-grab active:cursor-grabbing shrink-0 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300" title="Drag to reorder">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => setVideoQuestions((prev) => prev.map((v, i) => (i === index ? e.target.value : v)))}
                      placeholder={`Question ${index + 1}...`}
                      className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm"
                    />
                    {videoQuestions.length > 1 && (
                      <button
                        onClick={() => setVideoQuestions((prev) => prev.filter((_, i) => i !== index))}
                        className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors shrink-0"
                        title="Remove question"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setVideoQuestions((prev) => [...prev, ''])}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 border-dashed rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm transition-colors"
                >
                  + Add Question
                </button>
              </div>
            </div>
          )}

          {contentTab === 'automate' && (
            <div className="space-y-4">
              {automateModel === 'nana' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Question type</label>
                    <select
                      value={automateQuestionType}
                      onChange={(e) => setAutomateQuestionType(e.target.value as 'funny' | 'flirty' | 'me_or_you')}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-sm"
                    >
                      <option value="funny">Funny</option>
                      <option value="flirty">Flirty</option>
                      <option value="me_or_you">Me or you</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Generate</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                      Turn off to skip that part when you click Generate Daily TikTok. Title and caption need five questions (generate questions first or use a prior run).
                    </p>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700 overflow-hidden bg-zinc-50/80 dark:bg-zinc-800/40">
                      {(
                        [
                          ['Title', dailyGenIncludeTitle, setDailyGenIncludeTitle] as const,
                          ['Caption', dailyGenIncludeCaption, setDailyGenIncludeCaption] as const,
                          ['Cover image', dailyGenIncludeCoverImage, setDailyGenIncludeCoverImage] as const,
                          ['Questions', dailyGenIncludeQuestions, setDailyGenIncludeQuestions] as const,
                        ] as const
                      ).map(([label, on, setOn]) => (
                        <div key={label} className="flex items-center justify-between gap-3 px-3 py-2.5">
                          <span className="text-sm text-zinc-800 dark:text-zinc-200">{label}</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={`${on ? 'Disable' : 'Enable'} ${label}`}
                            onClick={() => setOn(!on)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${
                              on ? 'bg-[#3B82F6]' : 'bg-zinc-300 dark:bg-zinc-600'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                on ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
              <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Automate</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Generate card sets with random categories, AI-generated titles, and cover images.</p>
              <div>
                <label htmlFor="automateCount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Number of sets to generate</label>
                <input
                  type="number"
                  id="automateCount"
                  min={1}
                  max={20}
                  value={automateCount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^\d+$/.test(v)) setAutomateCount(v === '' ? '' : String(Math.min(20, Math.max(1, parseInt(v, 10) || 1))));
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">All sets will be downloaded in one ZIP file (1–20 sets)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cover image style</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(COVER_IMAGE_PROMPTS) as CoverImageStyle[]).map((style) => (
                    <label key={style} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700">
                      <input
                        type="radio"
                        name="coverStyle"
                        checked={automateCoverStyle === style}
                        onChange={() => setAutomateCoverStyle(style)}
                        className="rounded-full"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300 capitalize">{style}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Choose the style for AI-generated cover images</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Categories to include (uncheck to exclude)</label>
                {automateCategoriesLoading ? (
                  <p className="text-xs text-zinc-500">Loading categories…</p>
                ) : automateCategories.length === 0 ? (
                  <p className="text-xs text-zinc-500">No categories available</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {automateCategories.map((cat) => (
                      <label key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700">
                        <input type="checkbox" checked={automateSelectedCategories.has(cat)} onChange={() => toggleAutomateCategory(cat)} className="rounded" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{cat}</span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Uncheck categories you want to exclude</p>
              </div>
              {onAutomateDownload && (
                <button
                  onClick={() => onAutomateDownload(COVER_IMAGE_PROMPTS[automateCoverStyle], automateCategoriesToUse)}
                  disabled={isAutoGenerating}
                  className="w-full py-3 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAutoGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Download'
                  )}
                </button>
              )}
                </>
              )}
            </div>
          )}

          {contentTab === 'image' && (
            <>
              {/* General settings */}
              <div className="flex-shrink-0 space-y-3">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">General</h3>
                <div className="flex items-center gap-3">
                  <label htmlFor="color" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Background Color</label>
                  <div className="flex gap-2 items-center flex-1 min-w-0">
                    <input type="color" id="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" />
                    <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} placeholder="#3B82F6" className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="textSize" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Text Size</label>
                  <input type="number" id="textSize" value={textSize} onChange={(e) => setTextSize(e.target.value)} placeholder="200" min={10} max={500} className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm" />
                </div>
              </div>

              {/* First Card section */}
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">First Card</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Mode</span>
                  <div className="flex rounded-full bg-zinc-200 dark:bg-zinc-700 p-0.5">
                    <button
                      type="button"
                      onClick={() => setMode('plain')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        mode === 'plain'
                          ? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
                      }`}
                    >
                      Plain
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('video')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        mode === 'video'
                          ? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
                      }`}
                    >
                      Image
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Title</label>
                  <div className="flex gap-2 items-center flex-1 min-w-0">
                    <input type="text" id="title" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter title for the first card..." className="flex-1 min-w-0 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm" />
                    <input type="color" id="titleTextColor" value={firstCard.textColor} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === '1' ? { ...c, textColor: e.target.value } : c)))} className="w-10 h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" title="Title text color" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-28 flex-shrink-0">Change Image</span>
                  <button type="button" onClick={onChangeVideo} disabled={mode === 'plain' || videoLoading || !theme.trim()} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-zinc-900">
                    {videoLoading ? 'Loading…' : 'Change Image'}
                  </button>
                </div>
              </div>

              {/* Content Cards section */}
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Content Cards</h3>
                <div className="space-y-3">
                  {canvases.filter((c) => c.id !== '1' && c.id !== 'end').map((canvas, index) => {
                    const cardNumber = index + 2;
                    return (
                      <div key={canvas.id} className="flex gap-3 items-center">
                        <input type="text" value={canvas.text} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === canvas.id ? { ...c, text: e.target.value } : c)))} placeholder={`Card ${cardNumber} text...`} className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm" />
                        <input type="color" value={canvas.textColor} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === canvas.id ? { ...c, textColor: e.target.value } : c)))} className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" title={`Card ${cardNumber} text color`} />
                        {canvases.filter((c) => c.id !== '1' && c.id !== 'end').length > 1 && (
                          <button onClick={(e) => onDeleteCanvas(canvas.id, e)} className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors flex-shrink-0" title="Remove card">×</button>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={onAddCanvas} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 border-dashed rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm transition-colors">+ Add Card</button>
                </div>
              </div>

              {/* Ending Card section */}
              {canvases.find((c) => c.id === 'end') && (
                <div className="flex-shrink-0 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                  <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Ending Card</h3>
                  <div className="flex gap-3 items-center">
                    <input type="text" value={canvases.find((c) => c.id === 'end')?.text || ''} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === 'end' ? { ...c, text: e.target.value } : c)))} placeholder="Enter ending card text..." className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-sm" />
                    <input type="color" value={canvases.find((c) => c.id === 'end')?.textColor || '#FFFFFF'} onChange={(e) => setCanvases((prev) => prev.map((c) => (c.id === 'end' ? { ...c, textColor: e.target.value } : c)))} className="w-16 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer flex-shrink-0" title="Ending card text color" />
                  </div>
                </div>
              )}
            </>
          )}

          {userInfo && contentTab !== 'automate' && (
            <>
              <div className="space-y-3 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Post Settings (Required for TikTok)</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Enter post title" maxLength={90} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-sm" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{postTitle.length}/90 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Privacy Status <span className="text-red-500">*</span></label>
                    <select value={postPrivacy} onChange={(e) => setPostPrivacy(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-sm">
                      <option value="">Select privacy status</option>
                      {(creatorInfo?.privacy_level_options || ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY']).map((option) => {
                        const isPrivate = option === 'SELF_ONLY';
                        const isDisabled = isPrivate && contentDisclosureEnabled && isBrandedContent;
                        const labelMap: Record<string, string> = { 'PUBLIC_TO_EVERYONE': 'Public', 'MUTUAL_FOLLOW_FRIENDS': 'Friends', 'FOLLOWER_OF_CREATOR': 'Followers', 'SELF_ONLY': 'Only Me (Private)' };
                        const label = labelMap[option] || option.replace(/_/g, ' ');
                        return <option key={option} value={option} disabled={isDisabled}>{label}{isDisabled ? ' (not available for branded content)' : ''}</option>;
                      })}
                    </select>
                    {contentDisclosureEnabled && isBrandedContent && postPrivacy === 'SELF_ONLY' && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Branded content visibility cannot be set to private. Please select a different privacy setting.</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Interaction Settings</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={allowComment} onChange={(e) => setAllowComment(e.target.checked)} disabled={creatorInfo?.comment_disabled === true} className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6] disabled:opacity-50 disabled:cursor-not-allowed" />
                        <span className={`text-sm ${creatorInfo?.comment_disabled === true ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300'}`}>Allow Comment{creatorInfo?.comment_disabled === true && <span className="ml-1 text-xs">(disabled in your TikTok settings)</span>}</span>
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">Note: Duet and Stitch are not available for photo posts</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">Content Disclosure</label>
                      <button type="button" onClick={() => { setContentDisclosureEnabled(!contentDisclosureEnabled); if (contentDisclosureEnabled) { setIsYourBrand(false); setIsBrandedContent(false); } }} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${contentDisclosureEnabled ? 'bg-[#3B82F6]' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${contentDisclosureEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Indicate if this content promotes yourself, a brand, product or service</p>
                    {contentDisclosureEnabled && (
                      <div className="space-y-2 pl-1 border-l-2 border-zinc-200 dark:border-zinc-700 ml-1">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={isYourBrand} onChange={(e) => setIsYourBrand(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6]" />
                          <div><span className="text-sm text-zinc-700 dark:text-zinc-300">Your brand</span><p className="text-xs text-zinc-500 dark:text-zinc-400">You are promoting yourself or your own business</p></div>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={isBrandedContent} onChange={(e) => { const isChecked = e.target.checked; setIsBrandedContent(isChecked); if (isChecked && postPrivacy === 'SELF_ONLY') setPostPrivacy(''); }} className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6]" />
                          <div><span className="text-sm text-zinc-700 dark:text-zinc-300">Branded content</span><p className="text-xs text-zinc-500 dark:text-zinc-400">You are promoting another brand or a third party</p>{isBrandedContent && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">Note: Branded content can only be set to public or friends visibility</p>}</div>
                        </label>
                        {(isYourBrand || isBrandedContent) && <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md"><p className="text-xs text-zinc-600 dark:text-zinc-400">{isBrandedContent ? "Your photo/video will be labeled as 'Paid partnership'" : "Your photo/video will be labeled as 'Promotional content'"}</p></div>}
                        {!isYourBrand && !isBrandedContent && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Please select at least one option to proceed with publishing</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Posting to TikTok as:</span>
                  <span className="font-semibold text-black dark:text-zinc-50">{userInfo.display_name || 'User'}</span>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={musicUsageConsent} onChange={(e) => setMusicUsageConsent(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#3B82F6] focus:ring-[#3B82F6]" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {contentDisclosureEnabled && isBrandedContent ? (
                      <>By posting, you agree to TikTok&apos;s <a href="https://www.tiktok.com/legal/branded-content-policy" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">Branded Content Policy</a> and <a href="https://www.tiktok.com/legal/music-usage-confirmation" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">Music Usage Confirmation</a></>
                    ) : (
                      <>By posting, you agree to TikTok&apos;s <a href="https://www.tiktok.com/legal/music-usage-confirmation" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">Music Usage Confirmation</a></>
                    )}
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
      {contentTab === 'video' && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
          <button
            disabled={videoQuestions.every((q) => !q.trim()) || videoRendering}
            onClick={async () => {
              const questions = videoQuestions.filter((q) => q.trim());
              if (questions.length === 0) return;
              setVideoRendering(true);
              try {
                const res = await fetch('/api/render', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: videoTitle.trim() || 'Spill It', questions }),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({ error: 'Render failed' }));
                  alert(err.error || 'Failed to render video');
                  return;
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'questions-video.mp4';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch {
                alert('Failed to render video. Please try again.');
              } finally {
                setVideoRendering(false);
              }
            }}
            className="w-full py-3 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {videoRendering ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rendering...
              </>
            ) : (
              'Download'
            )}
          </button>
        </div>
      )}
      {contentTab === 'automate' && automateModel === 'nana' && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={onGenerateDailyTikTok}
            disabled={isGeneratingDailyTikTok}
            className="w-full py-3 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingDailyTikTok ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Daily TikTok'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
