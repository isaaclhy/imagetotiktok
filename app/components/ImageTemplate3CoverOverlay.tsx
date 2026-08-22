import {
  IMAGE_TEMPLATE3_COVER_FONT_STACK,
  IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT,
  IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO,
  IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO,
  IMAGE_TEMPLATE3_COVER_TYPE_LABEL_FONT_WEIGHT,
  IMAGE_TEMPLATE3_COVER_TYPE_LABEL_Y_RATIO,
} from '@/app/lib/image-template-3-cover-overlay';

type ImageTemplate3CoverOverlayProps = {
  title: string;
  typeLabel: string;
};

const COVER_TITLE_STROKE_STYLE: React.CSSProperties = {
  fontFamily: IMAGE_TEMPLATE3_COVER_FONT_STACK,
  fontWeight: IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT,
  fontSynthesis: 'none',
  color: '#ffffff',
  WebkitTextStroke: '3px #000000',
  paintOrder: 'stroke fill',
  textShadow:
    '1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 2px 8px rgba(0,0,0,0.35)',
};

const COVER_LABEL_STROKE_STYLE: React.CSSProperties = {
  fontFamily: IMAGE_TEMPLATE3_COVER_FONT_STACK,
  fontWeight: IMAGE_TEMPLATE3_COVER_TYPE_LABEL_FONT_WEIGHT,
  fontSynthesis: 'none',
  color: '#ffffff',
  WebkitTextStroke: '3px #000000',
  paintOrder: 'stroke fill',
  textShadow:
    '1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 2px 6px rgba(0,0,0,0.3)',
};

/** Preview overlay — title top, question-type label mid-frame (text only, no pill bg). */
export function ImageTemplate3CoverOverlay({ title, typeLabel }: ImageTemplate3CoverOverlayProps) {
  const label = typeLabel.trim().toLowerCase();

  return (
    <>
      {title.trim() ? (
        <div
          className="absolute inset-x-0 z-10 flex justify-center pointer-events-none px-[6%]"
          style={{ top: `${IMAGE_TEMPLATE3_COVER_TITLE_TOP_RATIO * 100}%` }}
        >
          <p
            className="max-w-full text-center leading-[1.14] tracking-[-0.02em] wrap-break-word"
            style={{
              ...COVER_TITLE_STROKE_STYLE,
              maxWidth: `${IMAGE_TEMPLATE3_COVER_TITLE_MAX_WIDTH_RATIO * 100}%`,
              fontSize: 'max(32px, 6.6cqw)',
            }}
          >
            {title.trim()}
          </p>
        </div>
      ) : null}
      {label ? (
        <div
          className="absolute left-1/2 z-10 pointer-events-none"
          style={{
            top: `${IMAGE_TEMPLATE3_COVER_TYPE_LABEL_Y_RATIO * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <p
            className="text-center whitespace-nowrap leading-none tracking-[-0.01em]"
            style={{
              ...COVER_LABEL_STROKE_STYLE,
              fontSize: 'max(22px, 3.8cqw)',
            }}
          >
            {label}
          </p>
        </div>
      ) : null}
    </>
  );
}
