import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BASE_COLOR = { h: 268, s: 97, l: 36 }; // #5B04B3

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function getColor(index: number): string {
  if (index === 0) return '#5B04B3';
  const hShift = (seededRandom(index) - 0.5) * 40;
  const sShift = (seededRandom(index + 100) - 0.5) * 15;
  const lShift = (seededRandom(index + 200) - 0.5) * 10;
  const h = Math.round(((BASE_COLOR.h + hShift) % 360 + 360) % 360);
  const s = Math.round(Math.min(45, Math.max(25, 35 + sShift)));
  const l = Math.round(Math.min(75, Math.max(60, 68 + lShift)));
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export interface QuestionVideoProps {
  title: string;
  questions: string[];
}

export const QuestionVideo: React.FC<QuestionVideoProps> = ({ title, questions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const framesPerTitle = fps * 5;
  const framesPerQuestion = fps * 10;
  const totalSlides = 2 + questions.length; // title, questions, CTA
  const slides = [title, ...questions];

  let slideIndex: number;
  let localFrame: number;
  if (frame < framesPerTitle) {
    slideIndex = 0;
    localFrame = frame;
  } else {
    const afterTitle = frame - framesPerTitle;
    slideIndex = Math.min(1 + Math.floor(afterTitle / framesPerQuestion), totalSlides - 1);
    localFrame = afterTitle - (slideIndex - 1) * framesPerQuestion;
  }

  const slideText = slides[slideIndex] || '';
  const isTitle = slideIndex === 0;
  const isCtaSlide = slideIndex === totalSlides - 1;
  const currentSlideDuration = isTitle ? framesPerTitle : framesPerQuestion;
  const bgColor = getColor(slideIndex);

  const fadeIn = isTitle ? 1 : interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    localFrame,
    [currentSlideDuration - 15, currentSlideDuration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const scale = isTitle ? 1 : interpolate(localFrame, [0, 15], [0.9, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 80,
      }}
    >
      {isTitle && <MonogramBackground frame={frame} fps={fps} />}
      {!isTitle && <PopUpLogos frame={frame - framesPerTitle} fps={fps} />}
      <div
        style={{
          color: '#FFFFFF',
          fontSize: 48,
          fontWeight: 800,
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 2,
          marginTop: 120,
          textShadow: '0 2px 8px rgba(0,0,0,0.25)',
          zIndex: 1,
        }}
      >
        Spill It
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '90%',
          zIndex: 1,
        }}
      >
        {isCtaSlide ? (
          <div
            style={{
              opacity,
              transform: `scale(${scale})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              color: '#FFFFFF',
              textAlign: 'center',
              fontFamily: 'Inter, system-ui, sans-serif',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 600 }}>Search</div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: 1 }}>Spill It - Card Games</div>
            <div style={{ fontSize: 44, fontWeight: 600 }}>on App Store for more questions</div>
          </div>
        ) : (
          <div
            style={{
              opacity,
              transform: `scale(${scale})`,
              color: '#FFFFFF',
              fontSize: 52,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.3,
              fontFamily: 'Inter, system-ui, sans-serif',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {slideText}
          </div>
        )}
      </div>
      <CountdownTimer localFrame={localFrame} slideDuration={currentSlideDuration} fps={fps} isTitle={isTitle} />
      <Sequence from={0} durationInFrames={1}>
        <Audio src={staticFile('whoosh.wav')} volume={0.6} />
      </Sequence>
      <CorrectSounds questionCount={questions.length} framesPerTitle={framesPerTitle} framesPerQuestion={framesPerQuestion} />
      <TickSounds questionCount={questions.length} fps={fps} framesPerTitle={framesPerTitle} framesPerQuestion={framesPerQuestion} />
    </AbsoluteFill>
  );
};

const CorrectSounds: React.FC<{
  questionCount: number;
  framesPerTitle: number;
  framesPerQuestion: number;
}> = ({ questionCount, framesPerTitle, framesPerQuestion }) => {
  const correctFrames: number[] = [];
  correctFrames.push(framesPerTitle);
  for (let q = 0; q <= questionCount; q++) {
    correctFrames.push(framesPerTitle + (q + 1) * framesPerQuestion);
  }
  return (
    <>
      {correctFrames.map((fromFrame, i) => (
        <Sequence key={i} from={fromFrame} durationInFrames={30}>
          <Audio src={staticFile('correct.wav')} volume={0.5} />
        </Sequence>
      ))}
    </>
  );
};

const TickSounds: React.FC<{
  questionCount: number;
  fps: number;
  framesPerTitle: number;
  framesPerQuestion: number;
}> = ({ questionCount, fps, framesPerTitle, framesPerQuestion }) => {
  const ticks: number[] = [];
  // Title slide: last 3 seconds of 5-second slide (seconds 2, 3, 4)
  for (let s = 2; s < 5; s++) {
    ticks.push(s * fps);
  }
  // Question slides + CTA slide
  for (let q = 0; q <= questionCount; q++) {
    const slideStart = framesPerTitle + q * framesPerQuestion;
    for (let s = 7; s < 10; s++) {
      ticks.push(slideStart + s * fps);
    }
  }

  return (
    <>
      {ticks.map((frame, i) => (
        <Sequence key={i} from={frame} durationInFrames={fps}>
          <Audio src={staticFile('tick.wav')} volume={0.5} />
        </Sequence>
      ))}
    </>
  );
};

const LOGO_SIZE = 64;
const LOGO_GAP = 32;
const LOGO_STEP = LOGO_SIZE + LOGO_GAP;

const DISAPPEAR_INTERVAL = 1.5; // one logo disappears every ~50ms
const FADE_DURATION = 30; // fade out over ~1 second

const MonogramBackground: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const cols = Math.ceil(1080 / LOGO_STEP) + 2;
  const rows = Math.ceil(1920 / LOGO_STEP) + 2;
  const totalLogos = cols * rows;

  const logos = useMemo(() => {
    const items: Array<{ x: number; y: number }> = [];
    for (let row = 0; row < rows; row++) {
      const offset = row % 2 === 1;
      for (let col = 0; col < cols; col++) {
        items.push({
          x: col * LOGO_STEP + (offset ? LOGO_STEP / 2 : 0) - LOGO_STEP,
          y: row * LOGO_STEP - LOGO_STEP,
        });
      }
    }
    return items;
  }, [cols, rows]);

  const disappearOrder = useMemo(() => {
    const toIndex = (r: number, c: number) => r * cols + c;
    const visited = new Set<number>();
    const order: number[] = [];

    // Start from a random icon near the center
    const startRow = Math.floor(rows / 2);
    const startCol = Math.floor(cols / 2);
    const startIdx = toIndex(startRow, startCol);
    visited.add(startIdx);
    order.push(startIdx);

    const frontier: number[] = [startIdx];
    let seed = 77;

    while (order.length < totalLogos && frontier.length > 0) {
      // Pick a random item from the frontier
      const pick = Math.floor(seededRandom(seed++) * frontier.length);
      const current = frontier[pick];
      const row = Math.floor(current / cols);
      const col = current % cols;

      // Get unvisited neighbors (up, down, left, right)
      const neighbors: number[] = [];
      if (row > 0 && !visited.has(toIndex(row - 1, col))) neighbors.push(toIndex(row - 1, col));
      if (row < rows - 1 && !visited.has(toIndex(row + 1, col))) neighbors.push(toIndex(row + 1, col));
      if (col > 0 && !visited.has(toIndex(row, col - 1))) neighbors.push(toIndex(row, col - 1));
      if (col < cols - 1 && !visited.has(toIndex(row, col + 1))) neighbors.push(toIndex(row, col + 1));

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(seededRandom(seed++) * neighbors.length)];
        visited.add(next);
        order.push(next);
        frontier.push(next);
      } else {
        frontier.splice(pick, 1);
      }
    }

    return order;
  }, [totalLogos, cols, rows]);

  const disappearFrameMap = useMemo(() => {
    const map = new Map<number, number>();
    disappearOrder.forEach((logoIdx, order) => {
      map.set(logoIdx, order * DISAPPEAR_INTERVAL);
    });
    return map;
  }, [disappearOrder]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      {logos.map((logo, i) => {
        const startFade = disappearFrameMap.get(i) ?? Infinity;
        let opacity = 0.12;
        if (frame >= startFade) {
          opacity = interpolate(
            frame,
            [startFade, startFade + FADE_DURATION],
            [0.12, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          );
        }
        if (opacity <= 0.001) return null;
        return (
          <Img
            key={i}
            src={staticFile('spill-logo.png')}
            style={{
              position: 'absolute',
              left: logo.x,
              top: logo.y,
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              opacity,
              objectFit: 'contain',
            }}
          />
        );
      })}
    </div>
  );
};

const TIMER_SIZE = 120;
const STROKE_WIDTH = 10;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CountdownTimer: React.FC<{
  localFrame: number;
  slideDuration: number;
  fps: number;
  isTitle: boolean;
}> = ({ localFrame, slideDuration, fps, isTitle }) => {
  const secondsLeft = Math.ceil((slideDuration - localFrame) / fps);
  const progress = localFrame / slideDuration;
  const dashOffset = CIRCUMFERENCE * progress;

  const timerColor = isTitle
    ? '#FFFFFF'
    : secondsLeft <= 3 ? '#EF4444' : secondsLeft <= 5 ? '#FACC15' : '#FFFFFF';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 260,
        zIndex: 1,
      }}
    >
      {isTitle && (
        <div
          style={{
          color: '#FFFFFF',
          fontSize: 42,
          fontWeight: 700,
          fontFamily: 'Inter, system-ui, sans-serif',
          marginBottom: 20,
          letterSpacing: 2,
          }}
        >
          Starting in
        </div>
      )}
      <div
        style={{
          position: 'relative',
          width: TIMER_SIZE,
          height: TIMER_SIZE,
        }}
      >
        <svg
          width={TIMER_SIZE}
          height={TIMER_SIZE}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={timerColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: timerColor,
            fontSize: 40,
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {secondsLeft}
        </div>
      </div>
    </div>
  );
};

const POP_APPEAR_INTERVAL = 6; // ~200ms at 30fps
const POP_FADE_IN = 10;

const PopUpLogos: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const cols = Math.ceil(1080 / LOGO_STEP) + 2;
  const rows = Math.ceil(1920 / LOGO_STEP) + 2;
  const totalLogos = cols * rows;

  const logos = useMemo(() => {
    const items: Array<{ x: number; y: number }> = [];
    for (let row = 0; row < rows; row++) {
      const offset = row % 2 === 1;
      for (let col = 0; col < cols; col++) {
        items.push({
          x: col * LOGO_STEP + (offset ? LOGO_STEP / 2 : 0) - LOGO_STEP,
          y: row * LOGO_STEP - LOGO_STEP,
        });
      }
    }
    return items;
  }, [cols, rows]);

  const appearOrder = useMemo(() => {
    const toIndex = (r: number, c: number) => r * cols + c;
    const visited = new Set<number>();
    const order: number[] = [];
    const startRow = Math.floor(rows / 2);
    const startCol = Math.floor(cols / 2);
    const startIdx = toIndex(startRow, startCol);
    visited.add(startIdx);
    order.push(startIdx);
    const frontier: number[] = [startIdx];
    let seed = 13;
    while (order.length < totalLogos && frontier.length > 0) {
      const pick = Math.floor(seededRandom(seed++) * frontier.length);
      const current = frontier[pick];
      const row = Math.floor(current / cols);
      const col = current % cols;
      const neighbors: number[] = [];
      if (row > 0 && !visited.has(toIndex(row - 1, col))) neighbors.push(toIndex(row - 1, col));
      if (row < rows - 1 && !visited.has(toIndex(row + 1, col))) neighbors.push(toIndex(row + 1, col));
      if (col > 0 && !visited.has(toIndex(row, col - 1))) neighbors.push(toIndex(row, col - 1));
      if (col < cols - 1 && !visited.has(toIndex(row, col + 1))) neighbors.push(toIndex(row, col + 1));
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(seededRandom(seed++) * neighbors.length)];
        visited.add(next);
        order.push(next);
        frontier.push(next);
      } else {
        frontier.splice(pick, 1);
      }
    }
    return order;
  }, [totalLogos, cols, rows]);

  const appearFrameMap = useMemo(() => {
    const map = new Map<number, number>();
    appearOrder.forEach((logoIdx, order) => {
      map.set(logoIdx, order * POP_APPEAR_INTERVAL);
    });
    return map;
  }, [appearOrder]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {logos.map((logo, i) => {
        const startFrame = appearFrameMap.get(i) ?? Infinity;
        if (frame < startFrame) return null;
        const age = frame - startFrame;

        const logoOpacity = age >= POP_FADE_IN ? 0.12 : interpolate(age, [0, POP_FADE_IN], [0, 0.12], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
        const popScale = age >= POP_FADE_IN ? 1 : interpolate(age, [0, POP_FADE_IN], [0.5, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) });

        return (
          <Img
            key={i}
            src={staticFile('spill-logo.png')}
            style={{
              position: 'absolute',
              left: logo.x,
              top: logo.y,
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              opacity: logoOpacity,
              transform: `scale(${popScale})`,
              objectFit: 'contain',
            }}
          />
        );
      })}
    </div>
  );
};
