'use client';

type FabAffirmationOverlayProps = {
  text: string;
};

/** Centered affirmation text over the montage preview. */
export function FabAffirmationOverlay({ text }: FabAffirmationOverlayProps) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-8 pointer-events-none">
      <p
        className="w-full max-w-[82%] text-center text-[15px] font-semibold leading-snug text-white sm:text-base md:text-lg"
        style={{ textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
      >
        {trimmed}
      </p>
    </div>
  );
}
