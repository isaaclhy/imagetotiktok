import Link from 'next/link';

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function SpillItPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: '#000000',
        fontFamily: 'var(--font-open-sans), Open Sans, sans-serif',
      }}
    >
      <h1
        className="text-4xl md:text-5xl font-bold text-white text-center mb-10"
        style={{ fontFamily: 'var(--font-open-sans), Open Sans, sans-serif' }}
      >
        Spill It - Card Games
      </h1>

      <Link
        href="https://apps.apple.com/gb/app/spill-it-card-games/id6758108818"
        target="_blank"
        rel="noopener noreferrer"
        className="relative inline-flex items-center gap-3 px-7 py-4 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.12) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -1px 1px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.3)',
          fontFamily: 'var(--font-open-sans), Open Sans, sans-serif',
        }}
      >
        <span
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%)',
          }}
        />
        <AppleIcon className="w-8 h-8 relative z-10" />
        <span className="relative z-10">Download on the App Store</span>
      </Link>
    </div>
  );
}
