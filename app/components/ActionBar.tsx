'use client';

interface ActionBarProps {
  contentTab: 'image' | 'video' | 'automate';
  automateModel: 'gpt' | 'nana';
  setAutomateModel: (v: 'gpt' | 'nana') => void;
  onAutoGenerate: () => void;
  onDownload: () => void;
  onPost: () => void;
  isAutoGenerating: boolean;
  isGenerating: boolean;
  isPosting: boolean;
  canDownload: boolean;
  canPost: boolean;
  contentDisclosureEnabled: boolean;
  isYourBrand: boolean;
  isBrandedContent: boolean;
  postPrivacy: string;
}

export function ActionBar({
  contentTab,
  automateModel,
  setAutomateModel,
  onAutoGenerate,
  onDownload,
  onPost,
  isAutoGenerating,
  isGenerating,
  isPosting,
  canDownload,
  canPost,
  contentDisclosureEnabled,
  isYourBrand,
  isBrandedContent,
  postPrivacy,
}: ActionBarProps) {
  const showContentDisclosureTooltip = contentDisclosureEnabled && !isYourBrand && !isBrandedContent;
  const showBrandedContentTooltip = contentDisclosureEnabled && isBrandedContent && postPrivacy === 'SELF_ONLY';

  return (
    <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 mb-0">
      {contentTab === 'automate' ? (
        <div className="flex items-center gap-2">
          <label htmlFor="automate-model" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Model:</label>
          <select
            id="automate-model"
            value={automateModel}
            onChange={(e) => setAutomateModel(e.target.value as 'gpt' | 'nana')}
            className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
          >
            <option value="gpt">GPT</option>
            <option value="nana">Nana Banana</option>
          </select>
        </div>
      ) : (
        <div />
      )}
      {contentTab === 'video' && (
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={onAutoGenerate}
            disabled={isAutoGenerating}
            className="h-10 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Auto Generate"
          >
            {isAutoGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Automate
              </>
            )}
          </button>
          <button
            onClick={onDownload}
            disabled={isGenerating || isAutoGenerating || !canDownload}
            className="h-10 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </>
            )}
          </button>
          <div className="relative group">
            <button
              onClick={onPost}
              disabled={!canPost}
              className="h-10 px-4 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPosting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  Post
                </>
              )}
            </button>
            {showContentDisclosureTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 dark:bg-zinc-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                You need to indicate if your content promotes yourself, a third party, or both.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-zinc-800 dark:border-t-zinc-700"></div>
              </div>
            )}
            {showBrandedContentTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 dark:bg-zinc-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Branded content visibility cannot be set to private.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-zinc-800 dark:border-t-zinc-700"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
