'use client';

import { useEffect, useRef, useState } from 'react';
import { FabAffirmationOverlay } from '@/app/components/FabAffirmationOverlay';
import {
  ensureBrowserVoicesLoaded,
  pickBrowserFemaleVoice,
  type FabAffirmationAudioSegment,
} from '@/app/lib/fab-tts';
import {
  FAB_AFFIRMATION_AMBIENT_GAIN,
  FAB_AFFIRMATION_SECONDS_PER_CLIP,
  FAB_AFFIRMATION_SPEECH_RATE,
  FAB_AFFIRMATION_TTS_GAP_SEC,
} from '@/app/lib/fab-video';

type FabMontagePreviewProps = {
  videoSrcs: string[];
  segments: FabAffirmationAudioSegment[];
  ambientSrc: string | null;
  isLoading: boolean;
  isTtsLoading: boolean;
};

/**
 * Background clips cycle on their own clock.
 * Affirmation text follows TTS: visible while that line plays, hidden in the gap after it ends.
 */
export function FabMontagePreview({
  videoSrcs,
  segments,
  ambientSrc,
  isLoading,
  isTtsLoading,
}: FabMontagePreviewProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const gapTimerRef = useRef<number | null>(null);
  const segmentIndexRef = useRef(0);
  const inGapRef = useRef(false);
  const gapRemainingRef = useRef(0);
  const gapStartedAtRef = useRef(0);
  const playAtRef = useRef<(i: number) => void>(() => {});
  const usingBrowserVoiceRef = useRef(false);

  const [clipIndex, setClipIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [activeText, setActiveText] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [ambientError, setAmbientError] = useState<string | null>(null);

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videoSrcs.length);
  }, [videoSrcs.length]);

  useEffect(() => {
    setClipIndex(0);
    setVisibleIndex(0);
    setIsPaused(false);
  }, [videoSrcs]);

  // Independent background montage cycle (paused when isPaused).
  useEffect(() => {
    if (videoSrcs.length === 0 || isPaused) return;
    const id = window.setInterval(() => {
      setClipIndex((i) => (i + 1) % videoSrcs.length);
    }, FAB_AFFIRMATION_SECONDS_PER_CLIP * 1000);
    return () => window.clearInterval(id);
  }, [videoSrcs.length, isPaused]);

  useEffect(() => {
    if (videoSrcs.length === 0) return;
    const target = videoRefs.current[clipIndex];
    if (!target) return;

    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setVisibleIndex(clipIndex);
    };

    videoRefs.current.forEach((el, i) => {
      if (!el || i === clipIndex) return;
      el.pause();
    });

    const start = async () => {
      try {
        target.currentTime = 0;
      } catch {
        // ignore
      }
      if (isPaused) {
        reveal();
        return;
      }
      try {
        await target.play();
      } catch {
        // ignore
      }
      if (cancelled) return;
      if (target.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        reveal();
      } else {
        target.addEventListener('loadeddata', reveal, { once: true });
        target.addEventListener('playing', reveal, { once: true });
      }
    };

    void start();
    return () => {
      cancelled = true;
      target.removeEventListener('loadeddata', reveal);
      target.removeEventListener('playing', reveal);
    };
  }, [clipIndex, videoSrcs, isPaused]);

  // Looping ambient bed under TTS (low volume).
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current = null;
    }
    setAmbientError(null);
    if (!ambientSrc || segments.length === 0) return;

    const bed = new Audio(ambientSrc);
    bed.loop = true;
    bed.volume = FAB_AFFIRMATION_AMBIENT_GAIN;
    bed.preload = 'auto';
    ambientRef.current = bed;

    const onError = () => {
      setAmbientError('Ambient file missing — add it under public/fab-ambiance/');
      ambientRef.current = null;
    };
    bed.addEventListener('error', onError);

    if (!isPaused) {
      void bed.play().catch(() => {
        // Autoplay may wait until user hits play; pause button / unmute gesture.
      });
    }

    return () => {
      bed.removeEventListener('error', onError);
      bed.pause();
      bed.src = '';
      if (ambientRef.current === bed) ambientRef.current = null;
    };
  }, [ambientSrc, segments]);

  // Pause / resume active video + TTS without resetting the timeline.
  useEffect(() => {
    if (isPaused) {
      videoRefs.current.forEach((el) => el?.pause());
      audioRef.current?.pause();
      ambientRef.current?.pause();
      if (usingBrowserVoiceRef.current && typeof window !== 'undefined') {
        window.speechSynthesis?.pause();
      }
      if (inGapRef.current && gapTimerRef.current != null) {
        window.clearTimeout(gapTimerRef.current);
        gapTimerRef.current = null;
        const elapsed = performance.now() - gapStartedAtRef.current;
        gapRemainingRef.current = Math.max(0, gapRemainingRef.current - elapsed);
      }
      return;
    }

    const active = videoRefs.current[clipIndex];
    void active?.play().catch(() => {});
    void ambientRef.current?.play().catch(() => {});

    if (inGapRef.current) {
      gapStartedAtRef.current = performance.now();
      gapTimerRef.current = window.setTimeout(() => {
        inGapRef.current = false;
        playAtRef.current((segmentIndexRef.current + 1) % Math.max(1, segments.length));
      }, gapRemainingRef.current);
      return;
    }

    if (usingBrowserVoiceRef.current && typeof window !== 'undefined') {
      window.speechSynthesis?.resume();
    } else {
      void audioRef.current?.play().catch(() => {});
    }
  }, [isPaused, clipIndex, segments.length]);

  // TTS timeline: show text only while the current line is speaking.
  useEffect(() => {
    if (segments.length === 0) {
      setActiveText('');
      segmentIndexRef.current = 0;
      return;
    }

    let cancelled = false;
    usingBrowserVoiceRef.current = segments[0]?.provider === 'browser';

    const clearGap = () => {
      if (gapTimerRef.current != null) {
        window.clearTimeout(gapTimerRef.current);
        gapTimerRef.current = null;
      }
    };

    const stopVoice = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
      }
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };

    const startGapThenNext = (i: number) => {
      setActiveText('');
      inGapRef.current = true;
      gapRemainingRef.current = FAB_AFFIRMATION_TTS_GAP_SEC * 1000;
      gapStartedAtRef.current = performance.now();
      gapTimerRef.current = window.setTimeout(() => {
        inGapRef.current = false;
        playAt((i + 1) % segments.length);
      }, gapRemainingRef.current);
    };

    const playAt = (i: number) => {
      if (cancelled) return;
      clearGap();
      inGapRef.current = false;
      stopVoice();

      const segment = segments[i];
      if (!segment) {
        setActiveText('');
        return;
      }

      segmentIndexRef.current = i;
      setActiveText(segment.text);

      if (segment.provider === 'browser') {
        const speak = () => {
          if (cancelled) return;
          const utterance = new SpeechSynthesisUtterance(segment.text);
          utterance.rate = FAB_AFFIRMATION_SPEECH_RATE;
          utterance.pitch = 0.95;
          const voice = pickBrowserFemaleVoice();
          if (voice) utterance.voice = voice;
          utterance.onend = () => {
            if (cancelled) return;
            startGapThenNext(i);
          };
          utterance.onerror = () => {
            if (cancelled) return;
            // Fallback timer if speech fails / is blocked.
            gapTimerRef.current = window.setTimeout(
              () => {
                if (!cancelled) startGapThenNext(i);
              },
              Math.max(0.4, segment.durationSec) * 1000
            );
          };
          if (isPaused) return;
          window.speechSynthesis.speak(utterance);
        };

        void ensureBrowserVoicesLoaded().then(speak);
        return;
      }

      const audio = new Audio(segment.audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        if (cancelled) return;
        startGapThenNext(i);
      };

      if (isPaused) return;

      void audio.play().catch(() => {
        gapTimerRef.current = window.setTimeout(
          () => {
            if (cancelled) return;
            startGapThenNext(i);
          },
          Math.max(0.4, segment.durationSec) * 1000
        );
      });
    };

    playAtRef.current = playAt;
    setIsPaused(false);
    playAt(0);

    return () => {
      cancelled = true;
      clearGap();
      inGapRef.current = false;
      stopVoice();
      setActiveText('');
    };
    // Restart only when segments change; pause is handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isPaused must not reset TTS
  }, [segments]);

  const canToggle = videoSrcs.length > 0;
  const isBrowserVoice = segments[0]?.provider === 'browser';

  return (
    <div className="relative w-full max-w-sm mx-auto md:mx-0 aspect-9/16 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-black min-w-0">
      {videoSrcs.length === 0 ? (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-900">
          <p className="text-xs text-zinc-400">{isLoading ? 'Loading clips…' : 'No videos yet'}</p>
        </div>
      ) : (
        videoSrcs.map((src, i) => (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={src}
            muted
            playsInline
            preload="auto"
            className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-75 ${
              i === visibleIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))
      )}
      {isTtsLoading ? (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center pointer-events-none">
          <p className="rounded-md bg-black/50 px-2 py-1 text-[10px] text-zinc-200">Generating voice…</p>
        </div>
      ) : isBrowserVoice && !isTtsLoading ? (
        <div className="absolute inset-x-0 top-3 z-20 flex justify-center pointer-events-none">
          <p className="rounded-md bg-black/50 px-2 py-1 text-[10px] text-zinc-200">Browser voice (free)</p>
        </div>
      ) : null}
      {ambientError ? (
        <div className="absolute inset-x-0 top-10 z-20 flex justify-center pointer-events-none px-3">
          <p className="rounded-md bg-black/60 px-2 py-1 text-[10px] text-amber-200 text-center">
            {ambientError}
          </p>
        </div>
      ) : null}
      <FabAffirmationOverlay text={activeText} />
      {canToggle ? (
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? 'Play preview' : 'Pause preview'}
          className="absolute bottom-3 right-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/70"
        >
          {isPaused ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );
}
