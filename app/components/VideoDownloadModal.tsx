'use client';

interface VideoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number) => Promise<void>;
  isExporting: boolean;
  videoCount: string;
  setVideoCount: (v: string) => void;
  exportProgress?: { current: number; total: number } | null;
}

export function VideoDownloadModal({
  isOpen,
  onClose,
  onConfirm,
  isExporting,
  videoCount,
  setVideoCount,
  exportProgress,
}: VideoDownloadModalProps) {
  if (!isOpen) return null;

  const parsed = parseInt(videoCount, 10);
  const count = Number.isFinite(parsed) ? Math.min(20, Math.max(1, parsed)) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => !isExporting && onClose()} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">Download videos</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Each video gets a random background, title, and questions. Multiple videos are bundled in one ZIP.
        </p>
        <div className="mb-6">
          <label htmlFor="videoDownloadCount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Number of videos
          </label>
          <input
            type="number"
            id="videoDownloadCount"
            min={1}
            max={20}
            value={videoCount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d+$/.test(v)) {
                setVideoCount(v === '' ? '' : String(Math.min(20, Math.max(1, parseInt(v, 10) || 1))));
              }
            }}
            disabled={isExporting}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] font-mono text-sm disabled:opacity-50"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">1–20 videos (export may take a few minutes)</p>
          {exportProgress ? (
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-2">
              Exporting video {exportProgress.current} of {exportProgress.total}…
            </p>
          ) : null}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(count)}
            disabled={isExporting || !videoCount.trim()}
            className="px-4 py-2 rounded-lg bg-black hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Exporting…
              </>
            ) : (
              'Download'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
