'use client';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isGenerating: boolean;
}

export function DownloadModal({ isOpen, onClose, onConfirm, isGenerating }: DownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => !isGenerating && onClose()} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">Confirm Download</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">Download all card images as a ZIP file?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={async () => {
              onClose();
              await onConfirm();
            }}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Downloading...
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
