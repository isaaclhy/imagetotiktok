'use client';

import { FAB_NOTES_FOOTER } from '@/app/lib/fab-video';

type FabNotesOverlayProps = {
  title: string;
  questions: string[];
};

/** Static iPhone Notes–style card. Does not move with video playback. */
export function FabNotesOverlay({ title, questions }: FabNotesOverlayProps) {
  const visibleQuestions = questions.filter((q) => q.trim()).slice(0, 5);

  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center px-5 pt-[12%] pointer-events-none sm:px-6 sm:pt-[14%]">
      <div
        className="w-full max-w-[74%] rounded-[14px] overflow-hidden"
        style={{ backgroundColor: '#000000' }}
      >
        {/* iOS Notes header chrome */}
        <div
          className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/10"
          style={{ color: '#E4B84A' }}
        >
          <div className="flex items-center gap-0.5 min-w-0">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[10px] font-medium tracking-tight sm:text-[11px]">Notes</span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-4-4 4-4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h11a4 4 0 010 8h-1" />
            </svg>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4 4-4 4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14H8a4 4 0 010-8h1" />
            </svg>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0-12l-4 4m4-4l4 4" />
            </svg>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="12" r="1.2" />
              <circle cx="12" cy="12" r="1.2" />
              <circle cx="16" cy="12" r="1.2" />
            </svg>
          </div>
        </div>

        <div className="px-3.5 pt-3 pb-4 sm:px-4 sm:pt-3.5 sm:pb-5">
          {title.trim() ? (
            <p className="mb-5 text-center text-[13px] font-semibold leading-snug text-white sm:mb-6 sm:text-[14px]">
              {title.trim()}
            </p>
          ) : null}

          {visibleQuestions.length > 0 ? (
            <ol className="mb-6 list-none space-y-2 text-left text-[10px] leading-snug text-white sm:mb-7 sm:space-y-2.5 sm:text-[11px]">
              {visibleQuestions.map((q, i) => (
                <li key={`${i}-${q.slice(0, 24)}`} className="flex gap-1.5">
                  <span className="shrink-0 tabular-nums">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          ) : null}

          <p className="text-center text-[9px] leading-snug text-white sm:text-[10px]">{FAB_NOTES_FOOTER}</p>
        </div>
      </div>
    </div>
  );
}
