'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export default function SpillItPage() {
  useEffect(() => {
    fetch('/api/spill-it/click', { method: 'POST', keepalive: true }).catch(() => {});
    window.location.href = 'https://apps.apple.com/app/id6758108818';
  }, []);

  return (
    <div
      className="h-screen relative flex flex-col items-start px-4 pt-[15vh] pb-8 overflow-hidden"
      style={{
        backgroundColor: '#000000',
        fontFamily: 'var(--font-open-sans), Open Sans, sans-serif',
      }}
    >
      <div className="absolute top-4 right-4 z-10 pointer-events-none text-white">
        <svg width="24" height="36" viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v20M8 8l4-4 4 4" />
        </svg>
      </div>

      <h1
        className="text-2xl md:text-3xl font-bold text-left mb-6 z-10"
        style={{ color: '#FFFFFF', fontFamily: 'var(--font-open-sans), Open Sans, sans-serif' }}
      >
        To download the app:
      </h1>

      <ol className="text-base md:text-lg font-normal text-left space-y-3 z-10 list-decimal list-inside text-white">
        <li>Tap on the <span className="bg-zinc-600 px-2 py-0.5 rounded">…</span> at the top right</li>
        <li>Then tap &quot;Open in browser&quot;</li>
      </ol>

      <div className="absolute left-0 right-0 px-4 pointer-events-none" style={{ top: '45%' }}>
        <Image
          src="/app-preview.png"
          alt="Spill It app preview"
          width={340}
          height={680}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}
