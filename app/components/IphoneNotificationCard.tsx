'use client';

import type { CSSProperties } from 'react';
import {
  IMAGE_TEMPLATE8_Q5_BANNER_ASPECT,
  IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_SRC,
  IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
} from '@/app/lib/image-template-8-cover';
import { CHARACTER_NOTIFICATION_MIN_HEIGHT, CHARACTER_Q5_CTA } from '@/app/lib/character-slide-export';

/** Optical sizes from iOS lock screen at 393pt width. */
const W = 393;
const pt = (n: number) => `${(n / W) * 100}cqw`;

const SF_TEXT =
  '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, "Helvetica Neue", sans-serif';
const SF_ROUNDED =
  'ui-rounded, "SF Compact Rounded", "SF Pro Rounded", "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

const WORLD_CLOCKS = [
  { code: 'NYC', timeZone: 'America/New_York' },
  { code: 'AUS', timeZone: 'Australia/Sydney' },
  { code: 'BEI', timeZone: 'Asia/Shanghai' },
] as const;

const GLASS: CSSProperties = {
  background: 'rgba(28, 28, 30, 0.08)',
  border: '0.5px solid rgba(255, 255, 255, 0.16)',
  backdropFilter: 'blur(36px) saturate(110%)',
  WebkitBackdropFilter: 'blur(36px) saturate(110%)',
  boxShadow: 'inset 0 0.5px 0 rgba(255, 255, 255, 0.22)',
};

function formatLockDate(date: Date) {
  return date
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    .replace(',', '');
}

function formatLockTimeParts(date: Date) {
  const raw = date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s?(AM|PM)$/i, '');
  const [hours, minutes] = raw.split(':');
  return { hours, minutes };
}

function tzOffsetHours(date: Date, timeZone: string) {
  const local = Date.parse(date.toLocaleString('en-US'));
  const there = Date.parse(date.toLocaleString('en-US', { timeZone }));
  return Math.round((there - local) / 3_600_000);
}

function formatWorldClock(date: Date, timeZone: string) {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  const diff = tzOffsetHours(date, timeZone);
  const offset = diff > 0 ? `+${diff}` : `${diff}`;
  return { time, offset };
}

function CellularIcon() {
  return (
    <svg viewBox="0 0 18 12" className="h-[1.05em] w-[1.45em]" fill="currentColor" aria-hidden>
      <rect x="0" y="8.2" width="3.1" height="3.8" rx="0.45" />
      <rect x="4.7" y="5.6" width="3.1" height="6.4" rx="0.45" />
      <rect x="9.4" y="2.8" width="3.1" height="9.2" rx="0.45" />
      <rect x="14.1" y="0.2" width="3.1" height="11.8" rx="0.45" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 16 12" className="h-[1.15em] w-[1.4em]" fill="none" aria-hidden>
      <path d="M1.15 4.15C4.4 1.2 11.6 1.2 14.85 4.15" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M3.55 6.55C5.75 4.6 10.25 4.6 12.45 6.55" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M6.15 8.9C7.1 8.05 8.9 8.05 9.85 8.9" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <circle cx="8" cy="10.7" r="1.05" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 27 13" className="h-[1.12em] w-[2.25em]" fill="none" aria-hidden>
      <rect x="0.55" y="0.55" width="22.6" height="11.9" rx="2.5" stroke="currentColor" strokeWidth="1.15" opacity="0.9" />
      <rect x="2.15" y="2.15" width="16.2" height="8.7" rx="1.25" fill="currentColor" />
      <path d="M24.5 4.15v4.7c1.15-.45 1.15-4.25 0-4.7Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function FlashlightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[44%] w-[44%]" fill="currentColor" aria-hidden>
      <path d="M9 2.5h6c.4 0 .7.4.6.8l-1.2 5.2H9.6L8.4 3.3c-.1-.4.2-.8.6-.8Z" />
      <path d="M9.4 9.2h5.2v5.3c0 .4-.1.7-.4 1L12 20.8c-.2.4-.8.4-1 0l-2.2-5.3c-.3-.3-.4-.6-.4-1V9.2Z" />
      <circle cx="12" cy="11.4" r="1.05" fill="black" opacity="0.38" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[46%] w-[46%]" fill="currentColor" aria-hidden>
      <path d="M9.1 6.1 9.8 4.8c.2-.3.5-.5.9-.5h2.6c.4 0 .7.2.9.5l.7 1.3H18c1.1 0 2 .9 2 2v8.6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8.1c0-1.1.9-2 2-2h3.1Z" />
      <circle cx="12" cy="13.05" r="3.35" fill="black" opacity="0.38" />
      <circle cx="12" cy="13.05" r="2.15" fill="currentColor" />
      <circle cx="16.7" cy="8.55" r="0.7" fill="black" opacity="0.28" />
    </svg>
  );
}

function MessagesAppIcon() {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: pt(38),
        height: pt(38),
        minWidth: pt(38),
        minHeight: pt(38),
        borderRadius: pt(8.6),
        background: 'linear-gradient(180deg, #64ED80 0%, #1FC855 100%)',
      }}
    >
      <svg
        viewBox="0 0 40 40"
        aria-hidden
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <path
          fill="white"
          transform="translate(1.1 0)"
          d="M20 5.2c8.7 0 15.8 5.55 15.8 12.4S28.7 30.05 20 30.05c-1.28 0-2.52-.12-3.7-.36l-6.15 2.62c-.6.26-1.24-.37-1.04-.98l1.72-5.55C7.55 24.15 4.2 20.15 4.2 17.6 4.2 10.75 11.3 5.2 20 5.2Z"
        />
      </svg>
    </div>
  );
}

export function IphoneNotificationCard({
  appName = 'Dumbo bf ❤️',
  timeLabel = 'now',
  question,
}: {
  appName?: string;
  timeLabel?: string;
  question: string;
}) {
  const text = question.trim() || 'Your question';
  return (
    <div
      className="flex w-full items-center"
      style={{
        ...GLASS,
        fontFamily: SF_TEXT,
        borderRadius: pt(24),
        minHeight: pt(CHARACTER_NOTIFICATION_MIN_HEIGHT),
        padding: `${pt(10)} ${pt(12)} ${pt(11)} ${pt(10)}`,
      }}
    >
      <div className="flex items-center" style={{ gap: pt(10) }}>
        <MessagesAppIcon />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between" style={{ gap: pt(8) }}>
            <p
              className="min-w-0 wrap-break-word text-white"
              style={{
                fontSize: pt(15),
                fontWeight: 590,
                lineHeight: 1.18,
                letterSpacing: '-0.22px',
              }}
            >
              {appName}
            </p>
            <span
              className="shrink-0 text-white/50"
              style={{
                fontSize: pt(13),
                fontWeight: 400,
                paddingTop: '1px',
              }}
            >
              {timeLabel}
            </span>
          </div>
          <p
            className="wrap-break-word text-white/92"
            style={{
              marginTop: pt(1),
              fontSize: pt(15),
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: '-0.2px',
            }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

export function IphoneLockScreen({
  question,
  showCta = false,
  now = new Date(),
}: {
  question: string;
  showCta?: boolean;
  now?: Date;
}) {
  const dateLabel = formatLockDate(now);
  const { hours, minutes } = formatLockTimeParts(now);
  const clocks = WORLD_CLOCKS.map((clock) => ({
    code: clock.code,
    ...formatWorldClock(now, clock.timeZone),
  }));

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.28) 100%)',
        }}
      />

      <div
        className="absolute left-0 right-0 flex items-center justify-end text-white"
        style={{
          top: pt(16),
          paddingLeft: pt(24),
          paddingRight: pt(18),
          fontFamily: SF_TEXT,
          fontSize: pt(12),
          fontWeight: 590,
          letterSpacing: '-0.2px',
        }}
      >
        <span className="flex items-center" style={{ gap: pt(6) }}>
          <CellularIcon />
          <WifiIcon />
          <BatteryIcon />
        </span>
      </div>

      <div className="absolute left-0 right-0 text-center" style={{ top: pt(72) }}>
        <p
          className="text-white"
          style={{
            fontFamily: SF_TEXT,
            fontSize: pt(20),
            fontWeight: 590,
            letterSpacing: '0.15px',
            textShadow: '0 1px 8px rgba(0,0,0,0.18)',
          }}
        >
          {dateLabel}
        </p>
        <p
          className="leading-none"
          style={{
            fontFamily: SF_ROUNDED,
            marginTop: pt(-4),
            fontSize: pt(104),
            fontWeight: 200,
            letterSpacing: '-0.05em',
            color: 'rgba(255, 255, 255, 0.58)',
            fontSynthesis: 'none',
          }}
        >
          <span>{hours}</span>
          <span style={{ marginInline: '-0.03em', fontWeight: 200 }}>:</span>
          <span>{minutes}</span>
        </p>
      </div>

      <div
        className="absolute text-white"
        style={{
          left: pt(28),
          top: pt(200),
          fontFamily: SF_TEXT,
          fontSize: pt(16),
          fontWeight: 400,
          lineHeight: 1.34,
          letterSpacing: '-0.15px',
          textShadow: '0 1px 8px rgba(0,0,0,0.2)',
        }}
      >
        {clocks.map((clock) => (
          <div key={clock.code} className="flex items-baseline" style={{ gap: pt(10) }}>
            <span style={{ width: pt(36) }}>{clock.code}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {clock.time} {clock.offset}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute left-0 right-0" style={{ top: pt(282) }}>
        <div style={{ paddingLeft: pt(16), paddingRight: pt(16) }}>
          <IphoneNotificationCard appName="Dumbo bf ❤️" question={question} />
        </div>
        {showCta ? (
        <div
          className="flex flex-col items-center px-[6%]"
          style={{ marginTop: pt(18) }}
        >
          <p
            className="w-full text-center text-white wrap-break-word"
            style={{
              fontFamily: '"TikTok Sans", system-ui, -apple-system, sans-serif',
              fontSize: `${IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO * 100}cqw`,
              fontWeight: IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
              lineHeight: IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
              textShadow: '0 1px 8px rgba(0,0,0,0.55)',
            }}
          >
            {CHARACTER_Q5_CTA}
          </p>
          <img
            src={IMAGE_TEMPLATE8_Q5_BANNER_SRC}
            alt="Spill It - Couples Questions"
            className="overflow-hidden"
            style={{
              width: `${IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO * 100}%`,
              marginTop: `${IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO * 100}%`,
              borderRadius: `${
                ((IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO * IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO) /
                  IMAGE_TEMPLATE8_Q5_BANNER_ASPECT) *
                100
              }cqw`,
            }}
          />
        </div>
        ) : null}
      </div>

      <div
        className="absolute left-0 right-0 flex items-center justify-between"
        style={{ bottom: pt(42), paddingLeft: pt(46), paddingRight: pt(46) }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ ...GLASS, width: pt(50), height: pt(50), color: 'rgba(255, 255, 255, 0.92)' }}
        >
          <FlashlightIcon />
        </div>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ ...GLASS, width: pt(50), height: pt(50), color: 'rgba(255, 255, 255, 0.92)' }}
        >
          <CameraIcon />
        </div>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white"
        style={{ bottom: pt(8), width: pt(134), height: pt(5), opacity: 0.9 }}
      />
    </div>
  );
}
