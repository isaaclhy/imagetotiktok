'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

function Laurel({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <Image
      src={side === 'left' ? '/laurel-right.png' : '/laurel-left.png'}
      alt=""
      width={36}
      height={68}
      className="w-9 h-17 object-contain"
      aria-hidden="true"
      unoptimized
    />
  );
}

export default function SpillItPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyAppName = async () => {
    const text = 'Spill It - Couples Questions';
    const showCopied = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showCopied();
      } catch {
        // no-op fallback: keep page stable if clipboard is blocked
      }
      document.body.removeChild(ta);
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showCopied();
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }
  };

  useEffect(() => {
    fetch('/api/spill-it/click', { method: 'POST', keepalive: true }).catch(() => {});
  }, []);

  return (
    <div
      className="h-screen relative flex flex-col items-start px-4 pt-[10vh] pb-8 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #14002e 0%, #1a0040 32%, #2a0160 62%, #4a0ea1 100%)',
        fontFamily: 'var(--font-open-sans), Open Sans, sans-serif',
      }}
    >
      <button
        type="button"
        onClick={handleCopyAppName}
        className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-base md:text-lg font-bold z-20 cursor-pointer"
      >
        Spill It - Couples Questions
      </button>
      <button
        type="button"
        onClick={handleCopyAppName}
        className="absolute top-10 right-4 z-20 flex flex-col items-center gap-1 text-white/90 text-xs font-medium cursor-pointer"
      >
        <svg
          className="w-6 h-6 animate-bounce -rotate-12"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M24 24C19 19.5 14.5 14.5 9 9M9 9L9.6 15.2M9 9L15.4 9.8"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{copied ? 'Copied!' : 'Click to copy app name'}</span>
      </button>
      <div className="relative z-20 w-full">
      <h1
        className="mt-6 text-4xl md:text-5xl font-bold text-left mb-6 leading-tight text-white"
        style={{ fontFamily: 'var(--font-open-sans), Open Sans, sans-serif' }}
      >
        Ready to
        <br />
        fall in love again?
      </h1>
      <div className="mt-9 flex items-start justify-center gap-6 text-white w-full">
        <div className="flex items-center gap-1.5">
          <Laurel side="left" />
          <div className="text-center leading-tight">
            <p className="text-3xl font-bold">5M+</p>
            <p className="text-xs text-white">cards swiped</p>
            <p className="text-xs text-white">globally</p>
          </div>
          <Laurel side="right" />
        </div>
        <div className="flex items-center gap-1.5">
          <Laurel side="left" />
          <div className="text-center leading-none">
            <p className="text-3xl font-bold">5</p>
            <p className="text-white text-xs leading-none mt-0.5 mb-0.5 tracking-tight">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
            <p className="text-xs text-white">2,000+ users</p>
          </div>
          <Laurel side="right" />
        </div>
      </div>
      </div>

      <div className="absolute left-0 right-0 px-4 flex flex-col items-center gap-5 z-10" style={{ top: '45%' }}>
        <a
          href="https://apps.apple.com/app/id6758108818"
          target="_blank"
          rel="noopener noreferrer"
          className="w-[90%] inline-flex justify-center items-center gap-2 rounded-xl bg-white/14 border border-white/30 px-4 py-3 text-white font-semibold text-base backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.365 1.43c0 1.14-.465 2.267-1.2 3.08-.79.87-2.08 1.55-3.2 1.47-.14-1.1.4-2.25 1.12-3 .78-.82 2.14-1.45 3.28-1.55zM20.54 17.35c-.51 1.14-.75 1.65-1.41 2.67-.92 1.43-2.22 3.22-3.83 3.23-1.42.02-1.79-.92-3.72-.91-1.93.01-2.34.93-3.76.9-1.61-.02-2.84-1.63-3.76-3.06-2.57-3.94-2.84-8.56-1.25-11 .85-1.3 2.2-2.07 3.47-2.07 1.3 0 2.12.92 3.68.92 1.51 0 2.43-.92 3.67-.92 1.13 0 2.33.61 3.18 1.67-2.78 1.53-2.33 5.54.73 6.57z" />
          </svg>
          Download on App Store
        </a>
        <Image
          src="/spill-preview.svg"
          alt="Spill It app preview"
          width={300}
          height={600}
          className="w-[95%] max-w-none h-auto pointer-events-none"
          unoptimized
          priority
        />
      </div>

      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-xl bg-[#7c3aed]/90 border border-[#c4b5fd]/60 text-white text-base font-semibold backdrop-blur-sm shadow-[0_10px_28px_rgba(76,29,149,0.45)] transition-all duration-300 ${
          copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
        role="status"
        aria-live="polite"
      >
        App name copied
      </div>
    </div>
  );
}
