'use client';

interface ToastProps {
  message: string;
  status: 'processing' | 'success' | 'failed' | null;
  onClose: () => void;
}

export function Toast({ message, status, onClose }: ToastProps) {
  const statusStyles =
    status === 'failed'
      ? 'bg-red-600 dark:bg-red-700'
      : status === 'success'
        ? 'bg-green-600 dark:bg-green-700'
        : 'bg-zinc-800 dark:bg-zinc-700';

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium text-sm flex items-center gap-3 animate-slide-up max-w-md ${statusStyles}`}
    >
      {status === 'processing' ? (
        <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : status === 'failed' ? (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{message || 'Posted successfully'}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
