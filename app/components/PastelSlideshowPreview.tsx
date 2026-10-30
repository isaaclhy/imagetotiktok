'use client';

import { useMemo } from 'react';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_SRC,
  IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO,
} from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE18_CTA_TAB,
  IMAGE_TEMPLATE18_FONT_CSS,
  IMAGE_TEMPLATE18_FONT_WEIGHT,
  IMAGE_TEMPLATE18_FOOTER,
  IMAGE_TEMPLATE18_FOOTER_SIZE,
  IMAGE_TEMPLATE18_FOOTER_Y,
  IMAGE_TEMPLATE18_PROGRESS_ACTIVE,
  IMAGE_TEMPLATE18_PROGRESS_GAP,
  IMAGE_TEMPLATE18_PROGRESS_H,
  IMAGE_TEMPLATE18_PROGRESS_INSET,
  IMAGE_TEMPLATE18_PROGRESS_TRACK,
  IMAGE_TEMPLATE18_PROGRESS_Y,
  IMAGE_TEMPLATE18_SANS_STACK,
  IMAGE_TEMPLATE18_SLIDE_COUNT,
  IMAGE_TEMPLATE18_TEXT,
  IMAGE_TEMPLATE18_VIGNETTE,
  layoutTemplate18Text,
  template18Accent,
  template18Background,
  template18Kind,
} from '@/app/lib/image-template-18-pastel';

const PREVIEW_W = 1080;
const PREVIEW_H = 1440;

type PastelSlideshowPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCta?: boolean;
};

export function PastelSlideshowPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE18_SLIDE_COUNT,
  isCta,
}: PastelSlideshowPreviewProps) {
  const cta = isCta ?? tabIndex === IMAGE_TEMPLATE18_CTA_TAB;
  const kind = template18Kind(tabIndex, cta);
  const questionCount = Math.max(0, slideCount - 1);
  const background = template18Background(tabIndex, cta);
  const accent = template18Accent(tabIndex, cta);

  const layout = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return layoutTemplate18Text(ctx, PREVIEW_W, PREVIEW_H, text, kind);
  }, [text, kind]);

  const segments =
    kind === 'cover' || questionCount <= 0
      ? []
      : Array.from({ length: questionCount }, (_, index) => {
          const gap = IMAGE_TEMPLATE18_PROGRESS_GAP * 100;
          const inset = IMAGE_TEMPLATE18_PROGRESS_INSET * 100;
          const seg =
            (100 - inset * 2 - gap * (questionCount - 1)) / questionCount;
          const ratio =
            index < tabIndex - 1 ? 1 : index === tabIndex - 1 ? IMAGE_TEMPLATE18_PROGRESS_ACTIVE : 0;
          return { left: inset + index * (seg + gap), width: seg, ratio };
        });

  return (
    <div className="absolute inset-0" style={{ backgroundColor: background }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: IMAGE_TEMPLATE18_VIGNETTE }}
        aria-hidden
      />
      {segments.map((segment, index) => (
        <div
          key={index}
          className="absolute overflow-hidden"
          style={{
            left: `${segment.left}%`,
            top: `${IMAGE_TEMPLATE18_PROGRESS_Y * 100}%`,
            width: `${segment.width}%`,
            height: `${IMAGE_TEMPLATE18_PROGRESS_H * 100}%`,
            borderRadius: 999,
            backgroundColor: IMAGE_TEMPLATE18_PROGRESS_TRACK,
          }}
        >
          {segment.ratio > 0 ? (
            <div
              className="h-full"
              style={{
                width: `${segment.ratio * 100}%`,
                backgroundColor: accent,
              }}
            />
          ) : null}
        </div>
      ))}
      {layout && layout.lines.length > 0 ? (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{
            top: `${(layout.top / PREVIEW_H) * 100}%`,
            width: `${(layout.maxWidth / PREVIEW_W) * 100}%`,
            color: IMAGE_TEMPLATE18_TEXT,
            fontFamily: IMAGE_TEMPLATE18_FONT_CSS,
            fontWeight: IMAGE_TEMPLATE18_FONT_WEIGHT,
            fontSize: `${(layout.fontSize / PREVIEW_W) * 100}cqw`,
            lineHeight: layout.lineHeight / layout.fontSize,
          }}
        >
          {layout.lines.map((line, index) => (
            <span key={`${index}-${line}`} className="block">
              {line}
            </span>
          ))}
        </div>
      ) : null}
      {kind === 'cta' ? (
        <>
          <p
            className="absolute inset-x-[6%] z-10 m-0 text-center font-bold"
            style={{
              color: IMAGE_TEMPLATE18_TEXT,
              fontFamily: IMAGE_TEMPLATE18_SANS_STACK,
              fontSize: `${IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO * (4 / 3) * 100}cqw`,
              bottom: `${(IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO + IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO) * 100}%`,
            }}
          >
            {IMAGE_TEMPLATE2_Q5_PROMO_LABEL}
          </p>
          <img
            src={IMAGE_TEMPLATE2_Q5_PROMO_SRC}
            alt="Spill It on the App Store"
            className="absolute left-1/2 z-10 -translate-x-1/2"
            style={{
              width: `${IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO * 100}%`,
              maxWidth: 'none',
              top: `${(1 - IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO) * 100}%`,
            }}
          />
        </>
      ) : (
        <p
          className="absolute inset-x-[8%] z-10 m-0 text-center font-bold"
          style={{
            top: `${IMAGE_TEMPLATE18_FOOTER_Y * 100}%`,
            transform: 'translateY(-50%)',
            color: IMAGE_TEMPLATE18_TEXT,
            fontFamily: IMAGE_TEMPLATE18_SANS_STACK,
            fontSize: `${IMAGE_TEMPLATE18_FOOTER_SIZE * 100}cqw`,
          }}
        >
          {IMAGE_TEMPLATE18_FOOTER}
        </p>
      )}
    </div>
  );
}
