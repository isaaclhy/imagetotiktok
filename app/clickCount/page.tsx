'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClickCountPage() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/spill-it/click');
        const data = await res.json();
        if (res.ok) {
          setCount(data.count);
        } else {
          setError(data.error || 'Failed to load');
        }
      } catch {
        setError('Failed to load click count');
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);

  return (
    <div
      className="min-h-screen p-8 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'var(--font-open-sans), Open Sans, sans-serif',
      }}
    >
      <Link
        href="/"
        className="absolute top-6 left-6 text-white/70 hover:text-white text-sm transition-colors"
      >
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold text-white/80 mb-2">App Store Download Clicks</h1>
      <p className="text-white/50 text-sm mb-8">Spill It - Card Games</p>

      {loading ? (
        <p className="text-white/60">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <p className="text-5xl font-bold text-white">{count?.toLocaleString() ?? 0}</p>
      )}
    </div>
  );
}
