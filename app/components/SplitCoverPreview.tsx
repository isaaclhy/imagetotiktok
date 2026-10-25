'use client';

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
  IMAGE_TEMPLATE17_ICON_SIZE,
  IMAGE_TEMPLATE17_ICON_SRC,
  IMAGE_TEMPLATE17_LINE_GAP,
  IMAGE_TEMPLATE17_LINE_LENGTH,
  IMAGE_TEMPLATE17_LINE_THICKNESS,
  IMAGE_TEMPLATE17_PHOTO_PLACEHOLDER,
  IMAGE_TEMPLATE17_TEXT,
  IMAGE_TEMPLATE17_TITLE_LINE_HEIGHT,
  IMAGE_TEMPLATE17_TITLE_SIZE,
  IMAGE_TEMPLATE17_TITLE_TOP,
  IMAGE_TEMPLATE17_TITLE_TRACKING,
  IMAGE_TEMPLATE17_TITLE_WEIGHT,
  IMAGE_TEMPLATE17_TITLE_WIDTH,
} from '@/app/lib/image-template-17-split';

type SplitCoverPreviewProps = {
  text: string;
};

export function SplitCoverPreview({ text }: SplitCoverPreviewProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: IMAGE_TEMPLATE17_BG, fontFamily: IMAGE_TEMPLATE17_FONT_STACK }}
    >
      <img
        src={IMAGE_TEMPLATE17_COVER_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
        style={{ backgroundColor: IMAGE_TEMPLATE17_PHOTO_PLACEHOLDER }}
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
          }}
        />
        <div
          style={{
            width: `${IMAGE_TEMPLATE17_LINE_LENGTH * 100}cqw`,
            height: `${IMAGE_TEMPLATE17_LINE_THICKNESS * 100}cqw`,
            backgroundColor: IMAGE_TEMPLATE17_TEXT,
            marginLeft: `${IMAGE_TEMPLATE17_LINE_GAP * 100}cqw`,
          }}
        />
        <span
          style={{
            marginLeft: `${IMAGE_TEMPLATE17_BRAND_GAP * 100}cqw`,
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
      </div>
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
    </div>
  );
}
