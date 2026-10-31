'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  IMAGE_TEMPLATE17_BG,
  IMAGE_TEMPLATE17_BRAND,
  IMAGE_TEMPLATE17_BRAND_GAP,
  IMAGE_TEMPLATE17_BRAND_SIZE,
  IMAGE_TEMPLATE17_BRAND_TRACKING,
  IMAGE_TEMPLATE17_BRAND_Y,
  IMAGE_TEMPLATE17_COVER_SRC,
  IMAGE_TEMPLATE17_DIM_GRADIENT,
  IMAGE_TEMPLATE17_DIM_START,
  IMAGE_TEMPLATE17_FONT_STACK,
  IMAGE_TEMPLATE17_ICON_RADIUS,
  IMAGE_TEMPLATE17_ICON_SIZE,
  IMAGE_TEMPLATE17_ICON_SRC,
  IMAGE_TEMPLATE17_LINE_GAP,
  IMAGE_TEMPLATE17_LINE_LENGTH,
  IMAGE_TEMPLATE17_LINE_THICKNESS,
  IMAGE_TEMPLATE17_OPTION_TRACKING,
  IMAGE_TEMPLATE17_OPTION_WEIGHT,
  IMAGE_TEMPLATE17_PHOTO_PLACEHOLDER,
  IMAGE_TEMPLATE17_TEXT,
  IMAGE_TEMPLATE17_TITLE_LINE_HEIGHT,
  IMAGE_TEMPLATE17_TITLE_SIZE,
  IMAGE_TEMPLATE17_TITLE_TOP,
  IMAGE_TEMPLATE17_TITLE_TRACKING,
  IMAGE_TEMPLATE17_TITLE_WEIGHT,
  IMAGE_TEMPLATE17_TITLE_WIDTH,
  layoutTemplate17Text,
  template17CanvasFontStack,
  template17PrimaryFontFamily,
  type Template17TextLayout,
} from '@/app/lib/image-template-17-split';

type SplitCoverPreviewProps = {
  text: string;
  /** Resolved template 17 photo. Falls back to the shared cover if it fails to load. */
  backgroundSrc?: string;
};

export function SplitCoverPreview({ text, backgroundSrc }: SplitCoverPreviewProps) {
  const preferred = backgroundSrc || IMAGE_TEMPLATE17_COVER_SRC;
  const [src, setSrc] = useState(preferred);
  const frameRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Template17TextLayout | null>(null);
  const [fontFamily, setFontFamily] = useState(IMAGE_TEMPLATE17_FONT_STACK);
  useEffect(() => {
    setSrc(preferred);
  }, [preferred]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let cancelled = false;
    const apply = () => {
      if (cancelled || !frameRef.current) return;
      const node = frameRef.current;
      const width = node.clientWidth;
      const height = node.clientHeight;
      if (width <= 0 || height <= 0) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const family = template17PrimaryFontFamily();
      const stack = template17CanvasFontStack(family);
      setFontFamily(stack);
      setLayout(layoutTemplate17Text(ctx, width, height, text, stack));
    };
    apply();
    const observer = new ResizeObserver(() => apply());
    observer.observe(frame);
    const fonts = document.fonts;
    const family = template17PrimaryFontFamily();
    void Promise.all([
      fonts.load(`${IMAGE_TEMPLATE17_TITLE_WEIGHT} 64px "${family}"`),
      fonts.load(`${IMAGE_TEMPLATE17_OPTION_WEIGHT} 48px "${family}"`),
      fonts.load(`600 32px "${family}"`),
    ]).then(() => apply());
    void fonts.ready.then(() => apply());
    const onFonts = () => apply();
    fonts.addEventListener('loadingdone', onFonts);
    return () => {
      cancelled = true;
      observer.disconnect();
      fonts.removeEventListener('loadingdone', onFonts);
    };
  }, [text]);

  return (
    <div
      ref={frameRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: IMAGE_TEMPLATE17_BG,
        fontFamily: `var(--font-inter), ${fontFamily}`,
      }}
    >
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
        style={{ backgroundColor: IMAGE_TEMPLATE17_PHOTO_PLACEHOLDER }}
        onError={() => {
          if (src !== IMAGE_TEMPLATE17_COVER_SRC) setSrc(IMAGE_TEMPLATE17_COVER_SRC);
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: `${IMAGE_TEMPLATE17_DIM_START * 100}%`,
          backgroundImage: IMAGE_TEMPLATE17_DIM_GRADIENT,
        }}
      />
      <div
        className="absolute left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center"
        style={{ top: `${IMAGE_TEMPLATE17_BRAND_Y * 100}%` }}
      >
        <div
          style={{
            width: `${IMAGE_TEMPLATE17_LINE_LENGTH * 100}cqw`,
            height: `${IMAGE_TEMPLATE17_LINE_THICKNESS * 100}cqw`,
            backgroundColor: IMAGE_TEMPLATE17_TEXT,
            marginRight: `${IMAGE_TEMPLATE17_LINE_GAP * 100}cqw`,
          }}
        />
        <img
          src={IMAGE_TEMPLATE17_ICON_SRC}
          alt=""
          className="shrink-0 object-cover"
          style={{
            width: `${IMAGE_TEMPLATE17_ICON_SIZE * 100}cqw`,
            height: `${IMAGE_TEMPLATE17_ICON_SIZE * 100}cqw`,
            borderRadius: `${IMAGE_TEMPLATE17_ICON_RADIUS * 100}%`,
          }}
        />
        <span
          style={{
            marginLeft: `${IMAGE_TEMPLATE17_BRAND_GAP * 100}cqw`,
            marginRight: `${IMAGE_TEMPLATE17_LINE_GAP * 100}cqw`,
            color: IMAGE_TEMPLATE17_TEXT,
            fontSize: `${IMAGE_TEMPLATE17_BRAND_SIZE * 100}cqw`,
            fontWeight: 600,
            letterSpacing: IMAGE_TEMPLATE17_BRAND_TRACKING,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {IMAGE_TEMPLATE17_BRAND}
        </span>
        <div
          style={{
            width: `${IMAGE_TEMPLATE17_LINE_LENGTH * 100}cqw`,
            height: `${IMAGE_TEMPLATE17_LINE_THICKNESS * 100}cqw`,
            backgroundColor: IMAGE_TEMPLATE17_TEXT,
          }}
        />
      </div>
      {layout ? (
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2 text-center"
          style={{
            top: layout.top,
            width: layout.maxWidth,
            color: IMAGE_TEMPLATE17_TEXT,
            fontFamily,
          }}
        >
          <div
            style={{
              fontSize: layout.questionSize,
              fontWeight: IMAGE_TEMPLATE17_TITLE_WEIGHT,
              letterSpacing: IMAGE_TEMPLATE17_TITLE_TRACKING,
              lineHeight: `${layout.questionLineHeight}px`,
            }}
          >
            {layout.questionLines.map((line, index) => (
              <div
                key={`q-${index}`}
                className="whitespace-nowrap"
                style={{ height: layout.questionLineHeight }}
              >
                {line}
              </div>
            ))}
          </div>
          {layout.optionLines.length > 0 ? (
            <div
              style={{
                marginTop: layout.gap,
                fontSize: layout.optionSize,
                fontWeight: IMAGE_TEMPLATE17_OPTION_WEIGHT,
                letterSpacing: IMAGE_TEMPLATE17_OPTION_TRACKING,
                lineHeight: `${layout.optionLineHeight}px`,
              }}
            >
              {layout.optionLines.map((line, index) => (
                <div
                  key={`o-${index}`}
                  className="whitespace-nowrap"
                  style={{ height: layout.optionLineHeight }}
                >
                  {line}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p
          className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-pre-wrap wrap-break-word text-center"
          style={{
            top: `${IMAGE_TEMPLATE17_TITLE_TOP * 100}%`,
            width: `${IMAGE_TEMPLATE17_TITLE_WIDTH * 100}%`,
            color: IMAGE_TEMPLATE17_TEXT,
            fontSize: `${IMAGE_TEMPLATE17_TITLE_SIZE * 100}cqw`,
            fontWeight: IMAGE_TEMPLATE17_TITLE_WEIGHT,
            lineHeight: IMAGE_TEMPLATE17_TITLE_LINE_HEIGHT,
            letterSpacing: IMAGE_TEMPLATE17_TITLE_TRACKING,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
