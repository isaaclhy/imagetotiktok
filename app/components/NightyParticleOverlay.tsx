'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  NIGHTY_PARTICLE_FONT_STACK,
  type NightyParticleLines,
  type NightyParticleTiming,
} from '@/app/lib/constants';
import { nightyParticleLineOpacities } from '@/app/lib/nighty-particle-caption';

type NightyParticleOverlayProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  lines: NightyParticleLines;
  timing: NightyParticleTiming;
  accentColor: string;
};

const LINE_KEYS = [
  'line1',
  'line2',
  'line3',
  'line4',
  'line5',
  'line6',
  'line7',
  'line8',
  'line9',
] as const;

export function NightyParticleOverlay({
  videoRef,
  lines,
  timing,
  accentColor,
}: NightyParticleOverlayProps) {
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);
  const line4Ref = useRef<HTMLParagraphElement>(null);
  const line5Ref = useRef<HTMLParagraphElement>(null);
  const line6Ref = useRef<HTMLParagraphElement>(null);
  const line7Ref = useRef<HTMLParagraphElement>(null);
  const line8Ref = useRef<HTMLParagraphElement>(null);
  const line9Ref = useRef<HTMLParagraphElement>(null);
  const refs = {
    line1: line1Ref,
    line2: line2Ref,
    line3: line3Ref,
    line4: line4Ref,
    line5: line5Ref,
    line6: line6Ref,
    line7: line7Ref,
    line8: line8Ref,
    line9: line9Ref,
  };
  const timingRef = useRef(timing);
  timingRef.current = timing;

  useEffect(() => {
    let rafId = 0;
    const last: Record<(typeof LINE_KEYS)[number], number> = {
      line1: -1,
      line2: -1,
      line3: -1,
      line4: -1,
      line5: -1,
      line6: -1,
      line7: -1,
      line8: -1,
      line9: -1,
    };

    const tick = () => {
      const t = videoRef.current?.currentTime ?? 0;
      const ops = nightyParticleLineOpacities(t, timingRef.current);
      for (const key of LINE_KEYS) {
        const opacity = ops[key];
        const el = refs[key].current;
        if (!el || opacity === last[key]) continue;
        el.style.opacity = String(opacity);
        last[key] = opacity;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // refs are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef]);

  const lineClass =
    'w-full text-sm leading-[1.22] tracking-[-0.02em] wrap-break-word font-medium sm:text-base md:text-lg';

  const pairClass =
    'absolute inset-x-0 top-1/2 flex w-full -translate-y-1/2 flex-col items-center gap-2 text-center';

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-[20%]">
      <div className="relative w-full min-h-[6rem]">
        <div className={pairClass}>
          <p
            ref={line1Ref}
            className={lineClass}
            style={{
              color: '#ffffff',
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line1}
          </p>
          <p
            ref={line2Ref}
            className={lineClass}
            style={{
              color: accentColor,
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line2}
          </p>
        </div>
        <div className={pairClass}>
          <p
            ref={line3Ref}
            className={lineClass}
            style={{
              color: '#ffffff',
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line3}
          </p>
          <p
            ref={line4Ref}
            className={lineClass}
            style={{
              color: accentColor,
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line4}
          </p>
        </div>
        <div className={pairClass}>
          <p
            ref={line5Ref}
            className={lineClass}
            style={{
              color: '#ffffff',
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line5}
          </p>
          <p
            ref={line6Ref}
            className={lineClass}
            style={{
              color: accentColor,
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line6}
          </p>
        </div>
        <div className={pairClass}>
          <p
            ref={line7Ref}
            className={lineClass}
            style={{
              color: '#ffffff',
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line7}
          </p>
          <p
            ref={line8Ref}
            className={lineClass}
            style={{
              color: accentColor,
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line8}
          </p>
          <p
            ref={line9Ref}
            className={lineClass}
            style={{
              color: '#ffffff',
              fontFamily: NIGHTY_PARTICLE_FONT_STACK,
              opacity: 0,
              willChange: 'opacity',
            }}
          >
            {lines.line9}
          </p>
        </div>
      </div>
    </div>
  );
}
