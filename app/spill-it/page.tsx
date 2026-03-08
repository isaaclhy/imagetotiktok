'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SpillItPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('Spill It - Card Games');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
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
      <p className="text-base md:text-lg font-normal text-left z-10 text-white mt-4">
        or
      </p>
      <p className="text-base md:text-lg font-normal text-left z-10 text-white mt-2">
        Search &quot;Spill It - Card Games&quot; on the App Store
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-4 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium transition-colors z-10 inline-flex items-center gap-2"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy app name
          </>
        )}
      </button>

      <div className="absolute left-0 right-0 px-4 pointer-events-none flex justify-center" style={{ top: '58%' }}>
        <Image
          src="/app-preview.png"
          alt="Spill It app preview"
          width={300}
          height={600}
          className="w-full max-w-[300px] h-auto"
          quality={100}
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
