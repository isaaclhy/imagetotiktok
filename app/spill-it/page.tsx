'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const REVIEWS = [
  { text: 'We couldn\'t stop laughing, best date night game ever!', male: 'Jake', female: 'Emma', years: 3 },
  { text: 'This game brought us so much closer than we expected', male: 'Marcus', female: 'Sofia', years: 5 },
  { text: 'Perfect for spicing up our Friday nights at home together', male: 'Liam', female: 'Olivia', years: 2 },
  { text: 'We learned things about each other we never knew before', male: 'Noah', female: 'Ava', years: 7 },
  { text: 'Every couple needs this game, it\'s honestly so fun', male: 'Ethan', female: 'Mia', years: 1 },
  { text: 'Had our friends over and everyone wanted to play again', male: 'Daniel', female: 'Chloe', years: 4 },
  { text: 'The questions are deep, funny, and surprisingly romantic too', male: 'Ryan', female: 'Lily', years: 6 },
  { text: 'We play this every weekend now, absolutely love it', male: 'James', female: 'Zoe', years: 2 },
];

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

function ReviewSlideshow() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % REVIEWS.length);
        setFade(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-20 z-10 flex flex-col items-center">
      <div
        className="transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <div className="flex justify-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
          ))}
        </div>
        <p className="text-white/70 text-sm text-center font-medium">
          &ldquo;{REVIEWS[index].text}&rdquo;
        </p>
        <p className="text-white/40 text-xs text-center mt-2">
          {REVIEWS[index].female} & {REVIEWS[index].male} &middot; together {REVIEWS[index].years} {REVIEWS[index].years === 1 ? 'year' : 'years'}
        </p>
      </div>
    </div>
  );
}

export default function SpillItPage() {
  return (
    <div
      className="h-screen relative flex flex-col items-center p-8 pt-[8vh] overflow-hidden"
      style={{
        backgroundColor: '#000000',
        fontFamily: 'var(--font-open-sans), Open Sans, sans-serif',
      }}
    >
      <h1
        className="text-3xl md:text-5xl font-bold text-white text-center mb-10 z-10 whitespace-nowrap"
        style={{ fontFamily: 'var(--font-open-sans), Open Sans, sans-serif' }}
      >
        Spill It - Card Games
      </h1>

      <Link
        href="https://apps.apple.com/gb/app/spill-it-card-games/id6758108818"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center gap-2 w-full px-5 py-3 text-white rounded-2xl font-semibold text-lg whitespace-nowrap transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] overflow-hidden z-10"
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
        <AppleIcon className="w-6 h-6 relative z-10" />
        <span className="relative z-10">Download on the App Store</span>
      </Link>

      <ReviewSlideshow />

      <div className="absolute left-0 right-0 px-8 pointer-events-none" style={{ top: '55%' }}>
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
