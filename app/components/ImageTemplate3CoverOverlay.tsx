import {
  formatImageTemplate3CoverSubtitle,
  IMAGE_TEMPLATE3_COVER_FONT_STACK,
  IMAGE_TEMPLATE3_COVER_SUBTITLE_FONT_WEIGHT,
  IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT,
  IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO,
  IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO,
} from '@/app/lib/image-template-3-cover-overlay';

type ImageTemplate3CoverOverlayProps = {
  title: string;
  /** Template 4 centers the title vertically instead of sitting it in the upper third. */
  centerTitle?: boolean;
  /** Black outline around the title; off for a cleaner shadow-only look. */
  strokeTitle?: boolean;
  /** Bare text for the bracketed line under the title; parentheses are added here. */
  subtitle?: string;
};

const COVER_TITLE_BASE_STYLE: React.CSSProperties = {
  fontFamily: IMAGE_TEMPLATE3_COVER_FONT_STACK,
  fontWeight: IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT,
  fontSynthesis: 'none',
  color: '#ffffff',
};

const COVER_TITLE_STROKE_STYLE: React.CSSProperties = {
  ...COVER_TITLE_BASE_STYLE,
  WebkitTextStroke: '3px #000000',
  paintOrder: 'stroke fill',
  textShadow:
    '1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 2px 8px rgba(0,0,0,0.35)',
};

/** Without the stroke the shadow is all that separates white text from the photo. */
const COVER_TITLE_PLAIN_STYLE: React.CSSProperties = {
  ...COVER_TITLE_BASE_STYLE,
  textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
};

/** Preview overlay — stroked title with an optional bracketed subtitle. */
export function ImageTemplate3CoverOverlay({
  title,
  centerTitle = false,
  strokeTitle = true,
  subtitle = '',
}: ImageTemplate3CoverOverlayProps) {
  const trimmedTitle = title.trim();
  const bracketed = formatImageTemplate3CoverSubtitle(subtitle);
  if (!trimmedTitle && !bracketed) return null;

  const titleStyle = strokeTitle ? COVER_TITLE_STROKE_STYLE : COVER_TITLE_PLAIN_STYLE;

  return (
    <div
      className="absolute inset-x-0 z-10 flex flex-col items-center pointer-events-none px-[6%]"
      style={
        centerTitle
          ? { top: '50%', transform: 'translateY(-50%)' }
          : { top: `${IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO * 100}%` }
      }
    >
      {trimmedTitle ? (
        <p
          className="max-w-full text-center leading-[1.14] tracking-[-0.02em] wrap-break-word"
          style={{
            ...titleStyle,
            maxWidth: `${IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO * 100}%`,
            fontSize: 'max(32px, 6.6cqw)',
          }}
        >
          {trimmedTitle}
        </p>
      ) : null}
      {bracketed ? (
        <p
          className="mt-[0.5em] max-w-full text-center leading-[1.2] tracking-[-0.01em] wrap-break-word"
          style={{
            ...titleStyle,
            fontWeight: IMAGE_TEMPLATE3_COVER_SUBTITLE_FONT_WEIGHT,
            maxWidth: `${IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO * 100}%`,
            fontSize: 'max(18px, 4cqw)',
          }}
        >
          {bracketed}
        </p>
      ) : null}
    </div>
  );
}
