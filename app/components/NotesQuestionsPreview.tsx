'use client';

import { useMemo } from 'react';
import {
  IMAGE_TEMPLATE16_AVATAR,
  IMAGE_TEMPLATE16_BG,
  IMAGE_TEMPLATE16_BODY_SIZE,
  IMAGE_TEMPLATE16_BODY_TOP,
  IMAGE_TEMPLATE16_BODY_WEIGHT,
  IMAGE_TEMPLATE16_OPTION_GAP,
  IMAGE_TEMPLATE16_OPTION_SIZE,
  IMAGE_TEMPLATE16_OPTION_WEIGHT,
  IMAGE_TEMPLATE16_BRAND,
  IMAGE_TEMPLATE16_BRAND_SIZE,
  IMAGE_TEMPLATE16_BRAND_Y,
  IMAGE_TEMPLATE16_FONT_STACK,
  IMAGE_TEMPLATE16_FOOTER_SIZE,
  IMAGE_TEMPLATE16_FOOTER_Y,
  IMAGE_TEMPLATE16_GOLD,
  IMAGE_TEMPLATE16_ICON_RADIUS,
  IMAGE_TEMPLATE16_ICON_SRC,
  IMAGE_TEMPLATE16_HEADER_LABEL,
  IMAGE_TEMPLATE16_HEADER_SIZE,
  IMAGE_TEMPLATE16_HEADER_Y,
  IMAGE_TEMPLATE16_LETTER_SPACING,
  IMAGE_TEMPLATE16_LINE_HEIGHT,
  IMAGE_TEMPLATE16_MUTED,
  IMAGE_TEMPLATE16_SIDE_PAD,
  IMAGE_TEMPLATE16_TEXT,
  isTemplate16CtaTab,
  measureNotesLines,
  template16Footer,
} from '@/app/lib/image-template-16-notes';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_SRC,
  IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO,
} from '@/app/lib/image-template-2-cover';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';

type NotesQuestionsPreviewProps = {
  text: string;
  tabIndex: number;
  questionCount?: number;
  showCta?: boolean;
};

export function NotesQuestionsPreview({
  text,
  tabIndex,
  questionCount,
  showCta,
}: NotesQuestionsPreviewProps) {
  const { question, options } = useMemo(
    () =>
      tabIndex === 0
        ? { question: text, options: '' }
        : splitCopycatQuestionAndOptions(text),
    [tabIndex, text]
  );
  const maxWidth = 1080 * (1 - IMAGE_TEMPLATE16_SIDE_PAD * 2);
  const questionLines = useMemo(
    () => measureNotesLines(question, maxWidth, 1080 * IMAGE_TEMPLATE16_BODY_SIZE),
    [question]
  );
  const optionLines = useMemo(
    () =>
      options
        ? measureNotesLines(
            options,
            maxWidth,
            1080 * IMAGE_TEMPLATE16_OPTION_SIZE,
            IMAGE_TEMPLATE16_OPTION_WEIGHT
          )
        : [],
    [options]
  );
  const isCta = showCta ?? isTemplate16CtaTab(tabIndex, questionCount);

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: IMAGE_TEMPLATE16_BG, fontFamily: IMAGE_TEMPLATE16_FONT_STACK }}
    >
      <div
        className="absolute left-0 right-0 flex items-center justify-between"
        style={{
          top: `${IMAGE_TEMPLATE16_HEADER_Y * 100}%`,
          paddingLeft: `${IMAGE_TEMPLATE16_SIDE_PAD * 100}%`,
          paddingRight: `${IMAGE_TEMPLATE16_SIDE_PAD * 100}%`,
          color: IMAGE_TEMPLATE16_GOLD,
          transform: 'translateY(-50%)',
        }}
      >
        <div className="flex items-center" style={{ gap: '0.6cqw' }}>
          <svg
            viewBox="0 0 24 24"
            className="shrink-0"
            style={{ width: `${IMAGE_TEMPLATE16_HEADER_SIZE * 88}cqw`, height: `${IMAGE_TEMPLATE16_HEADER_SIZE * 88}cqw` }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.8 5.2 8.2 12l6.6 6.8" />
          </svg>
          <span
            style={{
              fontSize: `${IMAGE_TEMPLATE16_HEADER_LABEL * 100}cqw`,
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            Notes
          </span>
        </div>
        <div className="flex items-center" style={{ gap: `${IMAGE_TEMPLATE16_HEADER_SIZE * 38}cqw` }}>
          <svg
            viewBox="0 0 24 24"
            className="shrink-0"
            style={{ width: `${IMAGE_TEMPLATE16_HEADER_SIZE * 100}cqw`, height: `${IMAGE_TEMPLATE16_HEADER_SIZE * 100}cqw` }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3.2v10.2" />
            <path d="M8.3 6.6 12 3.2l3.7 3.4" />
            <path d="M6.4 11.2v6.4c0 1 .8 1.9 1.9 1.9h7.4c1.1 0 1.9-.9 1.9-1.9v-6.4" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            className="shrink-0"
            style={{ width: `${IMAGE_TEMPLATE16_HEADER_SIZE * 100}cqw`, height: `${IMAGE_TEMPLATE16_HEADER_SIZE * 100}cqw` }}
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="8.15" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <circle cx="8.15" cy="12" r="1.05" />
            <circle cx="12" cy="12" r="1.05" />
            <circle cx="15.85" cy="12" r="1.05" />
          </svg>
        </div>
      </div>

      <div
        className="absolute left-0 flex items-center"
        style={{
          top: `${IMAGE_TEMPLATE16_BRAND_Y * 100}%`,
          paddingLeft: `${IMAGE_TEMPLATE16_SIDE_PAD * 100}%`,
          transform: 'translateY(-50%)',
        }}
      >
        <img
          src={IMAGE_TEMPLATE16_ICON_SRC}
          alt=""
          className="shrink-0 object-cover"
          style={{
            width: `${IMAGE_TEMPLATE16_AVATAR * 100}cqw`,
            height: `${IMAGE_TEMPLATE16_AVATAR * 100}cqw`,
            borderRadius: `${IMAGE_TEMPLATE16_ICON_RADIUS * 100}%`,
          }}
        />
        <span
          style={{
            marginLeft: '2.8cqw',
            color: IMAGE_TEMPLATE16_MUTED,
            fontSize: `${IMAGE_TEMPLATE16_BRAND_SIZE * 100}cqw`,
          }}
        >
          {IMAGE_TEMPLATE16_BRAND}
        </span>
      </div>

      <div
        className="absolute left-0 right-0"
        style={{
          top: `${IMAGE_TEMPLATE16_BODY_TOP * 100}%`,
          paddingLeft: `${IMAGE_TEMPLATE16_SIDE_PAD * 100}%`,
          paddingRight: `${IMAGE_TEMPLATE16_SIDE_PAD * 100}%`,
        }}
      >
        <div className="text-left" style={{ color: IMAGE_TEMPLATE16_TEXT }}>
          <p
            className="m-0"
            style={{
              fontSize: `${IMAGE_TEMPLATE16_BODY_SIZE * 100}cqw`,
              fontWeight: IMAGE_TEMPLATE16_BODY_WEIGHT,
              letterSpacing: `${IMAGE_TEMPLATE16_LETTER_SPACING}em`,
              lineHeight: IMAGE_TEMPLATE16_LINE_HEIGHT,
            }}
          >
            {questionLines.map((line, index) => (
              <span key={`${index}-${line}`} className="block">
                {line}
                {optionLines.length === 0 && index === questionLines.length - 1 ? (
                  <span
                    className="ml-[0.04em] inline-block align-[-0.08em] animate-pulse"
                    style={{
                      width: '0.045em',
                      height: '0.82em',
                      backgroundColor: IMAGE_TEMPLATE16_TEXT,
                    }}
                  />
                ) : null}
              </span>
            ))}
          </p>
          {optionLines.length > 0 ? (
            <p
              className="m-0"
              style={{
                marginTop: `${IMAGE_TEMPLATE16_OPTION_GAP}em`,
                fontSize: `${IMAGE_TEMPLATE16_OPTION_SIZE * 100}cqw`,
                fontWeight: IMAGE_TEMPLATE16_OPTION_WEIGHT,
                letterSpacing: `${IMAGE_TEMPLATE16_LETTER_SPACING}em`,
                lineHeight: 1.28,
              }}
            >
              {optionLines.map((line, index) => (
                <span key={`${index}-${line}`} className="block">
                  {line}
                  {index === optionLines.length - 1 ? (
                    <span
                      className="ml-[0.04em] inline-block align-[-0.08em] animate-pulse"
                      style={{
                        width: '0.045em',
                        height: '0.82em',
                        backgroundColor: IMAGE_TEMPLATE16_TEXT,
                      }}
                    />
                  ) : null}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>

      {isCta ? (
        <>
          <p
            className="absolute inset-x-[6%] z-20 text-center font-bold"
            style={{
              color: IMAGE_TEMPLATE16_TEXT,
              fontFamily: '"TikTok Sans", system-ui, sans-serif',
              fontSize: `${IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO * (4 / 3) * 100}cqw`,
              bottom: `${(IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO + IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO) * 100}%`,
            }}
          >
            {IMAGE_TEMPLATE2_Q5_PROMO_LABEL}
          </p>
          <img
            src={IMAGE_TEMPLATE2_Q5_PROMO_SRC}
            alt="Spill It on the App Store"
            className="absolute left-1/2 z-20 -translate-x-1/2"
            style={{
              width: `${IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO * 100}%`,
              maxWidth: 'none',
              top: `${(1 - IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO) * 100}%`,
            }}
          />
        </>
      ) : template16Footer(tabIndex, questionCount) ? (
      <p
        className="absolute m-0"
        style={{
          left: `${IMAGE_TEMPLATE16_SIDE_PAD * 100}%`,
          top: `${IMAGE_TEMPLATE16_FOOTER_Y * 100}%`,
          transform: 'translateY(-50%)',
          color: IMAGE_TEMPLATE16_TEXT,
          fontSize: `${IMAGE_TEMPLATE16_FOOTER_SIZE * 100}cqw`,
        }}
      >
        {template16Footer(tabIndex, questionCount)}
      </p>
      ) : null}
    </div>
  );
}
