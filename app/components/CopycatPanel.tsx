'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  copycatPostSlideBodiesClean,
  filterCopycatPostsByMinViews,
  FLAMINGO_CARDS_FEED,
  isCopycatPromoNoiseSlide,
  splitCopycatQuestionAndOptions,
  type CopycatPost,
} from '@/app/lib/copycat/flamingo-cards';
import { getFlamingoCardsPosts } from '@/app/lib/copycat/flamingo-convos';
import { getFlamingoConvoPosts } from '@/app/lib/copycat/flamingo-convo';
import { getQuestions21Posts } from '@/app/lib/copycat/questions-21';
import { getItsAllAboutLovingYouPosts } from '@/app/lib/copycat/itsallaboutlovingyou';
import { getTryDeepenPosts } from '@/app/lib/copycat/trydeepen';
import { getCoupleCardsPosts } from '@/app/lib/copycat/couple-cards';
import { getHhTalkPosts } from '@/app/lib/copycat/hhtalk';
import { getGoldenThoughtsDailyPosts } from '@/app/lib/copycat/goldenthoughtsdaily';
import { getLvrsbaePosts } from '@/app/lib/copycat/lvrsbae';
import { getSpillCardsAppPosts } from '@/app/lib/copycat/spillcardsapp';
import { getHookPosts } from '@/app/lib/copycat/hook-posts';
import { exportCopycatSlidesZip } from '@/app/lib/copycat/export-slides';
import { IMAGE_TEMPLATE2_PASTEL_COLORS, IMAGE_TEMPLATE2_TOP_LABEL } from '@/app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_SRC,
  IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO,
  IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO,
  IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO,
  IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO,
  IMAGE_TEMPLATE2_TEXT_COLOR,
} from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE6_BEAR_SRCS,
  IMAGE_TEMPLATE6_FRAME_BG,
  IMAGE_TEMPLATE6_TEXT_COLOR,
} from '@/app/lib/image-template-6-kawaii';
import {
  IMAGE_TEMPLATE13_BG,
  IMAGE_TEMPLATE13_COVER_SIZE,
  IMAGE_TEMPLATE13_FONT_STACK,
  IMAGE_TEMPLATE13_FONT_WEIGHT,
  IMAGE_TEMPLATE13_LETTER_SPACING,
  IMAGE_TEMPLATE13_OPTION_GAP,
  IMAGE_TEMPLATE13_OPTION_SIZE,
  IMAGE_TEMPLATE13_OPTION_WEIGHT,
  IMAGE_TEMPLATE13_PROMO_LABEL_GAP,
  IMAGE_TEMPLATE13_PROMO_LABEL_SIZE,
  IMAGE_TEMPLATE13_PROMO_VISIBLE,
  IMAGE_TEMPLATE13_PROGRESS_H,
  IMAGE_TEMPLATE13_PROGRESS_INSET,
  IMAGE_TEMPLATE13_PROGRESS_Y,
  IMAGE_TEMPLATE13_QUESTION_SIZE,
  IMAGE_TEMPLATE13_SIDE_PAD,
  IMAGE_TEMPLATE13_TEXT_WIDTH,
  template13ProgressRatio,
} from '@/app/lib/image-template-13-cover';
import {
  IMAGE_TEMPLATE15_COVER_SIZE_RATIO,
  IMAGE_TEMPLATE15_CARD_BG,
  IMAGE_TEMPLATE15_CARD_BORDER,
  IMAGE_TEMPLATE15_CARD_BORDER_RATIO,
  IMAGE_TEMPLATE15_CARD_INSET_X,
  IMAGE_TEMPLATE15_CARD_INSET_Y,
  IMAGE_TEMPLATE15_CARD_RADIUS_RATIO,
  IMAGE_TEMPLATE15_FRAME_BG,
  IMAGE_TEMPLATE15_QUESTION_FONT_STACK,
  pickTemplate15FrameColor,
  IMAGE_TEMPLATE15_LINE_HEIGHT,
  IMAGE_TEMPLATE15_MARK,
  IMAGE_TEMPLATE15_MARK_SIZE_RATIO,
  IMAGE_TEMPLATE15_MARK_TOP_RATIO,
  IMAGE_TEMPLATE15_QUESTION_SIZE_RATIO,
  IMAGE_TEMPLATE15_QUESTION_TOP_RATIO,
  IMAGE_TEMPLATE15_TEXT,
  IMAGE_TEMPLATE15_TEXT_INSET_X,
} from '@/app/lib/image-template-15-cards';
import {
  fetchPinterestCoverImage,
  IMAGE_TEMPLATE15_PINTEREST_QUERY,
  PINTEREST_COVER_CANDIDATE_POOL,
} from '@/app/lib/pinterest';
import {
  IMAGE_TEMPLATE14_CARD_INSET_X,
  IMAGE_TEMPLATE14_CARD_INSET_Y,
  IMAGE_TEMPLATE14_EDGE_BLUR_RATIO,
  IMAGE_TEMPLATE14_EDGE_SCALE,
  IMAGE_TEMPLATE14_CARD_RADIUS_RATIO,
  IMAGE_TEMPLATE14_COLORS,
  IMAGE_TEMPLATE14_FONT_STACK,
  IMAGE_TEMPLATE14_FRAME_BG,
  IMAGE_TEMPLATE14_GRAIN_SRC,
  IMAGE_TEMPLATE14_LINE_HEIGHT,
  IMAGE_TEMPLATE14_OPTION_GAP,
  IMAGE_TEMPLATE14_OPTION_LINE_HEIGHT,
  IMAGE_TEMPLATE14_OPTION_SIZE_RATIO,
  IMAGE_TEMPLATE14_OPTION_TOP_RATIO,
  IMAGE_TEMPLATE14_MARK_SIZE_RATIO,
  IMAGE_TEMPLATE14_MARK_Y_RATIO,
  IMAGE_TEMPLATE14_CTA_TEXT_CENTER_RATIO,
  IMAGE_TEMPLATE14_CTA_TEXT_MAX_HEIGHT_RATIO,
  template14QuestionSizeRatio,
  template14TextForBackground,
} from '@/app/lib/image-template-14-cards';
import { NotesQuestionsPreview } from '@/app/components/NotesQuestionsPreview';
import { SplitCoverPreview } from '@/app/components/SplitCoverPreview';
import {
  template17BackgroundSrcAt,
  template17TabForQuestions,
} from '@/app/lib/copycat/template17-background';

const TIKTOK_SANS_STACK = '"TikTok Sans", system-ui, -apple-system, sans-serif';
const COPYCAT_APP_NAME = 'Spill It';
const COPYCAT_COVER_HEARTS = '♥ ♥ ♥';
/** Text-only covers and template-13 questions sit above center — closer to natural eye level. */
const COPYCAT_TEXT_ONLY_COVER_TOP = 0.38;
const COPYCAT_TEXT_ONLY_COVER_SIZE_T2 = 0.074;
const COPYCAT_TEXT_ONLY_COVER_SIZE_T14 = 0.088;

export type CopycatTemplateId = 1 | 2 | 6 | 13 | 14 | 15 | 16 | 17;

function CopycatAppMarkFooter({
  isCover,
  color,
  fontFamily,
  fontSize,
  fontWeight,
  bottom,
  top,
  heartsLetterSpacing = '0.12em',
}: {
  isCover: boolean;
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight?: number | string;
  bottom?: string;
  top?: string;
  heartsLetterSpacing?: string;
}) {
  return (
    <div
      className="absolute inset-x-[8%] z-10 flex flex-col items-center text-center"
      style={{
        bottom,
        top,
        color,
        fontFamily,
        transform: top ? 'translateY(-50%)' : undefined,
      }}
    >
      {isCover ? (
        <span
          className="leading-none"
          style={{ fontSize: '3.6cqw', marginBottom: '0.35em', letterSpacing: heartsLetterSpacing }}
          aria-hidden
        >
          {COPYCAT_COVER_HEARTS}
        </span>
      ) : null}
      <span style={{ fontSize, fontWeight }}>{COPYCAT_APP_NAME}</span>
    </div>
  );
}

type CopycatPanelProps = {
  competitorId: string;
  templateId: CopycatTemplateId;
  /** When true, draw only from the curated hook posts, ignoring competitor feeds. */
  useHookPosts?: boolean;
  onNewRandomPost?: () => void;
};

/** Unbiased int in [0, maxExclusive) via crypto (not Math.random). */
function cryptoRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0]!;
  } while (x >= limit);
  return x % maxExclusive;
}

function shuffleCrypto<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/** Draw next id from a without-replacement bag; reshuffle when empty (never repeats last if possible). */
function drawFromBag(
  bag: string[],
  allIds: string[],
  excludeLast?: string | null
): { next: string; bag: string[] } {
  let nextBag = bag;
  if (nextBag.length === 0) {
    const pool = allIds.filter((id) => id !== excludeLast);
    nextBag = shuffleCrypto(pool.length > 0 ? pool : allIds);
  }
  const next = nextBag[0]!;
  return { next, bag: nextBag.slice(1) };
}

function pickNUniqueRandom(pool: readonly string[], count: number): string[] {
  if (pool.length === 0 || count <= 0) return [];
  const out: string[] = [];
  let deck = shuffleCrypto(pool);
  for (let i = 0; i < count; i++) {
    if (deck.length === 0) deck = shuffleCrypto(pool);
    out.push(deck[0]!);
    deck = deck.slice(1);
  }
  return out;
}

function pickTemplate14Color(exclude?: string): string {
  const pool = IMAGE_TEMPLATE14_COLORS.filter(
    (color) => color.toLowerCase() !== exclude?.trim().toLowerCase()
  );
  const colors = pool.length > 0 ? pool : IMAGE_TEMPLATE14_COLORS;
  return colors[cryptoRandomInt(colors.length)]!;
}

function templateFrameAspect(_templateId: CopycatTemplateId): string {
  return 'aspect-3/4';
}

function CopycatSlidePreview({
  templateId,
  tabIndex,
  text,
  leftAlign = false,
  template14Color,
  template15FrameBg,
  illustrationSrc,
  isCtaSlide = false,
  slideCount = 6,
  backgroundSrc,
}: {
  templateId: CopycatTemplateId;
  tabIndex: number;
  text: string;
  leftAlign?: boolean;
  template14Color?: string;
  template15FrameBg?: string;
  illustrationSrc?: string;
  isCtaSlide?: boolean;
  slideCount?: number;
  backgroundSrc?: string;
}) {
  const isCover = tabIndex === 0;
  const showTemplate2StyleCta =
    (templateId === 1 ||
      templateId === 2 ||
      templateId === 6 ||
      templateId === 14 ||
      templateId === 15 ||
      templateId === 16) &&
    isCtaSlide;
  const showTemplate13Cta = templateId === 13 && isCtaSlide;
  const showSpillItMark =
    !showTemplate2StyleCta &&
    !showTemplate13Cta &&
    templateId !== 1 &&
    templateId !== 6 &&
    templateId !== 17;
  const alignLeft = Boolean(leftAlign && !isCover) || templateId === 2;
  const pastelBg =
    IMAGE_TEMPLATE2_PASTEL_COLORS[tabIndex % IMAGE_TEMPLATE2_PASTEL_COLORS.length]!;
  const card14Bg = template14Color ?? IMAGE_TEMPLATE14_COLORS[0]!;
  const card14Text = template14TextForBackground(card14Bg);
  const bodyAlignClass = alignLeft
    ? 'left-[11%] w-[78%] -translate-y-1/2 text-left'
    : 'left-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 text-center';

  if (templateId === 17) {
    return (
      <div className="@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4 bg-black">
        <SplitCoverPreview text={text} backgroundSrc={backgroundSrc} />
      </div>
    );
  }

  if (templateId === 16) {
    return (
      <div className="@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4 bg-white">
        <NotesQuestionsPreview
          text={text}
          tabIndex={tabIndex}
          questionCount={Math.max(1, slideCount - 1)}
          showCta={isCtaSlide}
        />
      </div>
    );
  }

  if (templateId === 15) {
    if (isCover) {
      return (
        <div className="@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4 bg-[#CDB892]">
          {illustrationSrc ? (
            <img
              src={illustrationSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 animate-pulse bg-[#CDB892]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-black/28" />
          <p
            className="absolute left-1/2 top-1/2 z-10 w-[78%] -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap wrap-break-word text-center text-white"
            style={{
              fontFamily: IMAGE_TEMPLATE15_QUESTION_FONT_STACK,
              fontSize: `${IMAGE_TEMPLATE15_COVER_SIZE_RATIO * 100}cqw`,
              fontWeight: 500,
              lineHeight: 1.2,
              textShadow: '0 2px 12px rgba(0,0,0,0.45)',
            }}
          >
            {text}
          </p>
          <CopycatAppMarkFooter
            isCover
            color="rgba(255,255,255,0.95)"
            fontFamily={TIKTOK_SANS_STACK}
            fontSize="3cqw"
            fontWeight={700}
            bottom="9%"
          />
        </div>
      );
    }

    const cardRadius = `${IMAGE_TEMPLATE15_CARD_RADIUS_RATIO * 100}cqw`;
    const cardBorder = `${IMAGE_TEMPLATE15_CARD_BORDER_RATIO * 100}cqw`;
    return (
      <div
        className="@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4"
        style={{
          backgroundColor: template15FrameBg ?? IMAGE_TEMPLATE15_FRAME_BG,
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${IMAGE_TEMPLATE15_CARD_INSET_X * 100}%`,
            top: `${IMAGE_TEMPLATE15_CARD_INSET_Y * 100}%`,
            width: `${(1 - IMAGE_TEMPLATE15_CARD_INSET_X * 2) * 100}%`,
            height: `${(1 - IMAGE_TEMPLATE15_CARD_INSET_Y * 2) * 100}%`,
            borderRadius: cardRadius,
            backgroundColor: IMAGE_TEMPLATE15_CARD_BORDER,
            padding: cardBorder,
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden"
            style={{
              backgroundColor: IMAGE_TEMPLATE15_CARD_BG,
              borderRadius: `calc(${cardRadius} - ${cardBorder})`,
            }}
          >
            <p
              className="absolute left-1/2 z-10 -translate-x-1/2"
              style={{
                top: `${IMAGE_TEMPLATE15_MARK_TOP_RATIO * 100}%`,
                color: IMAGE_TEMPLATE15_TEXT,
                fontFamily: IMAGE_TEMPLATE15_QUESTION_FONT_STACK,
                fontSize: `${IMAGE_TEMPLATE15_MARK_SIZE_RATIO * 100}cqw`,
                fontWeight: 500,
              }}
            >
              {IMAGE_TEMPLATE15_MARK}
            </p>
            <p
              className="absolute z-10 whitespace-pre-wrap wrap-break-word text-left"
              style={{
                left: `${IMAGE_TEMPLATE15_TEXT_INSET_X * 100}%`,
                width: `${(1 - IMAGE_TEMPLATE15_TEXT_INSET_X * 2) * 100}%`,
                top: `${IMAGE_TEMPLATE15_QUESTION_TOP_RATIO * 100}%`,
                color: IMAGE_TEMPLATE15_TEXT,
                fontFamily: IMAGE_TEMPLATE15_QUESTION_FONT_STACK,
                fontSize: `${IMAGE_TEMPLATE15_QUESTION_SIZE_RATIO * 100}cqw`,
                fontWeight: 500,
                lineHeight: IMAGE_TEMPLATE15_LINE_HEIGHT,
              }}
            >
              {text}
            </p>
          </div>
        </div>
        {showTemplate2StyleCta ? (
          <>
            <p
              className="absolute inset-x-[6%] z-20 text-center font-bold"
              style={{
                color: IMAGE_TEMPLATE15_TEXT,
                fontFamily: IMAGE_TEMPLATE15_QUESTION_FONT_STACK,
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
        ) : null}
      </div>
    );
  }

  if (templateId === 14) {
    return (
      <div
        className="@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4"
        style={{ backgroundColor: IMAGE_TEMPLATE14_FRAME_BG }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${IMAGE_TEMPLATE14_CARD_INSET_X * 100}%`,
            top: `${IMAGE_TEMPLATE14_CARD_INSET_Y * 100}%`,
            width: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_X * 2) * 100}%`,
            height: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_Y * 2) * 100}%`,
            borderRadius: `${IMAGE_TEMPLATE14_CARD_RADIUS_RATIO * 100}cqw`,
            backgroundColor: card14Bg,
            transform: `scale(${IMAGE_TEMPLATE14_EDGE_SCALE})`,
            filter: `blur(${IMAGE_TEMPLATE14_EDGE_BLUR_RATIO * 100}cqw)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: `${IMAGE_TEMPLATE14_CARD_INSET_X * 100}%`,
            top: `${IMAGE_TEMPLATE14_CARD_INSET_Y * 100}%`,
            width: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_X * 2) * 100}%`,
            height: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_Y * 2) * 100}%`,
            borderRadius: `${IMAGE_TEMPLATE14_CARD_RADIUS_RATIO * 100}cqw`,
            backgroundColor: card14Bg,
          }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGE_TEMPLATE14_GRAIN_SRC})`,
              backgroundSize: '80px',
              opacity: 0.85,
              mixBlendMode: 'multiply',
            }}
          />
        </div>
        <div
          className="absolute z-10"
          style={{
            left: `${IMAGE_TEMPLATE14_CARD_INSET_X * 100}%`,
            top: `${IMAGE_TEMPLATE14_CARD_INSET_Y * 100}%`,
            width: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_X * 2) * 100}%`,
            height: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_Y * 2) * 100}%`,
          }}
        >
          {(() => {
            const { question, options } = isCover
              ? { question: text, options: '' }
              : splitCopycatQuestionAndOptions(text);
            const hasOptions = Boolean(options);
            return (
          <div
            className={`absolute z-10 wrap-break-word ${
              hasOptions || alignLeft
                ? hasOptions
                  ? 'left-[11%] w-[78%] text-left'
                  : 'left-[11%] w-[78%] -translate-y-1/2 text-left'
                : bodyAlignClass
            }`}
            style={{
              top: `${(hasOptions
                ? IMAGE_TEMPLATE14_OPTION_TOP_RATIO
                : showTemplate2StyleCta
                  ? IMAGE_TEMPLATE14_CTA_TEXT_CENTER_RATIO
                  : isCover
                    ? COPYCAT_TEXT_ONLY_COVER_TOP
                    : 0.5) * 100}%`,
              color: card14Text,
              fontFamily: IMAGE_TEMPLATE14_FONT_STACK,
              maxHeight: showTemplate2StyleCta
                ? `${IMAGE_TEMPLATE14_CTA_TEXT_MAX_HEIGHT_RATIO * 100}%`
                : undefined,
              overflow: showTemplate2StyleCta ? 'hidden' : undefined,
            }}
          >
            <p
              className="m-0 whitespace-pre-wrap"
              style={{
                fontSize: `${(isCover
                  ? COPYCAT_TEXT_ONLY_COVER_SIZE_T14
                  : template14QuestionSizeRatio(question, showTemplate2StyleCta)) * 100}cqw`,
                fontWeight: 400,
                lineHeight: IMAGE_TEMPLATE14_LINE_HEIGHT,
              }}
            >
              {question}
            </p>
            {hasOptions ? (
              <p
                className="m-0 whitespace-pre-wrap"
                style={{
                  marginTop: `${IMAGE_TEMPLATE14_OPTION_GAP}em`,
                  fontSize: `${IMAGE_TEMPLATE14_OPTION_SIZE_RATIO * 100}cqw`,
                  fontWeight: 400,
                  lineHeight: IMAGE_TEMPLATE14_OPTION_LINE_HEIGHT,
                }}
              >
                {options}
              </p>
            ) : null}
          </div>
            );
          })()}
          {showTemplate2StyleCta ? null : (
            <CopycatAppMarkFooter
              isCover={isCover}
              color={card14Text}
              fontFamily={IMAGE_TEMPLATE14_FONT_STACK}
              fontSize={`${IMAGE_TEMPLATE14_MARK_SIZE_RATIO * 100}cqw`}
              top={`${IMAGE_TEMPLATE14_MARK_Y_RATIO * 100}%`}
            />
          )}
        </div>
        {showTemplate2StyleCta ? (
          <>
            <p
              className="absolute inset-x-[6%] z-20 text-center font-bold"
              style={{
                color: '#FFFFFF',
                fontFamily: TIKTOK_SANS_STACK,
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
        ) : null}
      </div>
    );
  }

  if (templateId === 13) {
    return (
      <div
        className="@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4"
        style={{ backgroundColor: IMAGE_TEMPLATE13_BG }}
      >
        <div
          className="absolute z-20 overflow-hidden rounded-full"
          style={{
            left: `${IMAGE_TEMPLATE13_PROGRESS_INSET * 100}%`,
            right: `${IMAGE_TEMPLATE13_PROGRESS_INSET * 100}%`,
            top: `${IMAGE_TEMPLATE13_PROGRESS_Y * 100}%`,
            height: `${IMAGE_TEMPLATE13_PROGRESS_H * 100}%`,
            backgroundColor: 'rgba(255,255,255,0.35)',
          }}
        >
          <div
            className="h-full bg-white"
            style={{ width: `${template13ProgressRatio(tabIndex, slideCount) * 100}%` }}
          />
        </div>
        {isCover ? (
          <p
            className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap wrap-break-word text-center text-white"
            style={{
              top: `${COPYCAT_TEXT_ONLY_COVER_TOP * 100}%`,
              width: `${IMAGE_TEMPLATE13_TEXT_WIDTH * 100}%`,
              fontFamily: IMAGE_TEMPLATE13_FONT_STACK,
              fontSize: `${IMAGE_TEMPLATE13_COVER_SIZE * 100}cqw`,
              fontWeight: IMAGE_TEMPLATE13_FONT_WEIGHT,
              letterSpacing: IMAGE_TEMPLATE13_LETTER_SPACING,
              lineHeight: 1.3,
            }}
          >
            {text}
          </p>
        ) : (
          (() => {
            const { question, options } = splitCopycatQuestionAndOptions(text);
            const t13AlignLeft = alignLeft && Boolean(options);
            return (
              <div
                className={`absolute z-10 -translate-y-1/2 whitespace-pre-wrap wrap-break-word text-white ${
                  t13AlignLeft ? 'text-left' : 'left-1/2 -translate-x-1/2 text-center'
                }`}
                style={{
                  top: `${COPYCAT_TEXT_ONLY_COVER_TOP * 100}%`,
                  left: t13AlignLeft ? `${IMAGE_TEMPLATE13_SIDE_PAD * 100}%` : undefined,
                  width: `${IMAGE_TEMPLATE13_TEXT_WIDTH * 100}%`,
                  fontFamily: IMAGE_TEMPLATE13_FONT_STACK,
                  letterSpacing: IMAGE_TEMPLATE13_LETTER_SPACING,
                  textAlign: t13AlignLeft ? 'left' : 'center',
                }}
              >
                <p
                  style={{
                    fontSize: `${IMAGE_TEMPLATE13_QUESTION_SIZE * 100}cqw`,
                    fontWeight: IMAGE_TEMPLATE13_FONT_WEIGHT,
                    lineHeight: 1.3,
                  }}
                >
                  {question}
                </p>
                {options ? (
                  <p
                    style={{
                      marginTop: `${IMAGE_TEMPLATE13_QUESTION_SIZE * 1.3 * IMAGE_TEMPLATE13_OPTION_GAP * 100}cqw`,
                      fontSize: `${IMAGE_TEMPLATE13_OPTION_SIZE * 100}cqw`,
                      fontWeight: IMAGE_TEMPLATE13_OPTION_WEIGHT,
                      lineHeight: 1.35,
                    }}
                  >
                    {options}
                  </p>
                ) : null}
              </div>
            );
          })()
        )}
        {showTemplate13Cta ? (
          <>
            <p
              className="absolute inset-x-0 z-10 text-center font-bold text-white"
              style={{
                fontFamily: TIKTOK_SANS_STACK,
                fontSize: `${IMAGE_TEMPLATE13_PROMO_LABEL_SIZE * 100}cqw`,
                lineHeight: 1,
                bottom: `calc(${IMAGE_TEMPLATE13_PROMO_VISIBLE * 100}% + ${IMAGE_TEMPLATE13_PROMO_LABEL_GAP * 100}cqw)`,
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
                top: `${(1 - IMAGE_TEMPLATE13_PROMO_VISIBLE) * 100}%`,
              }}
            />
          </>
        ) : showSpillItMark ? (
          <CopycatAppMarkFooter
            isCover={isCover}
            color="rgba(255,255,255,0.95)"
            fontFamily={TIKTOK_SANS_STACK}
            fontSize="3.2cqw"
            fontWeight={600}
            bottom="9%"
          />
        ) : null}
      </div>
    );
  }

  if (templateId === 2) {
    const { question, options } = splitCopycatQuestionAndOptions(text);
    return (
      <div
        className="@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4"
        style={{ backgroundColor: pastelBg }}
      >
        <p
          className="absolute inset-x-[8%] top-[8%] z-10 text-center font-bold"
          style={{
            color: IMAGE_TEMPLATE2_TEXT_COLOR,
            fontFamily: TIKTOK_SANS_STACK,
            fontSize: '3cqw',
          }}
        >
          {IMAGE_TEMPLATE2_TOP_LABEL}
        </p>
        <div
          className={`absolute z-10 wrap-break-word ${
            alignLeft
              ? 'left-[12%] w-[76%] -translate-y-1/2 text-left'
              : 'left-1/2 w-[60%] -translate-x-1/2 -translate-y-1/2 text-center'
          }`}
          style={{
            top: `${(isCover
                ? COPYCAT_TEXT_ONLY_COVER_TOP
                : IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO) * 100}%`,
            color: IMAGE_TEMPLATE2_TEXT_COLOR,
            fontFamily: TIKTOK_SANS_STACK,
            fontSize: isCover
              ? `${COPYCAT_TEXT_ONLY_COVER_SIZE_T2 * 100}cqw`
              : `${IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO * 100}cqw`,
            lineHeight: 1.2,
          }}
        >
          <p className="whitespace-pre-wrap font-extrabold">{question}</p>
          {options ? (
            <p className="mt-[0.55em] whitespace-pre-wrap font-medium">{options}</p>
          ) : null}
        </div>
        {showTemplate2StyleCta ? (
          <>
            <p
              className="absolute inset-x-[6%] z-10 text-center font-bold"
              style={{
                color: IMAGE_TEMPLATE2_TEXT_COLOR,
                fontFamily: TIKTOK_SANS_STACK,
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
        ) : showSpillItMark ? (
          <CopycatAppMarkFooter
            isCover={isCover}
            color={IMAGE_TEMPLATE2_TEXT_COLOR}
            fontFamily={TIKTOK_SANS_STACK}
            fontSize="3cqw"
            fontWeight={700}
            bottom="9%"
            heartsLetterSpacing="0.02em"
          />
        ) : null}
      </div>
    );
  }

  const frameBg = templateId === 6 ? IMAGE_TEMPLATE6_FRAME_BG : '#FEFEFE';
  const textColor = templateId === 6 ? IMAGE_TEMPLATE6_TEXT_COLOR : '#2f2a31';
  const showKawaiiArt = Boolean(illustrationSrc) && !showTemplate2StyleCta;
  const kawaiiTextTop = showTemplate2StyleCta
    ? `${(alignLeft ? 0.36 : IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO) * 100}%`
    : '21%';
  const kawaiiTextTransform = showTemplate2StyleCta
    ? alignLeft
      ? 'translateY(-50%)'
      : 'translate(-50%, -50%)'
    : alignLeft
      ? undefined
      : 'translateX(-50%)';
  return (
    <div
      className={`@container relative w-full max-w-[20.5rem] mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 ${templateFrameAspect(templateId)}`}
      style={{ backgroundColor: frameBg }}
    >
      <p
        className={`absolute z-10 whitespace-pre-wrap font-bold wrap-break-word ${
          alignLeft
            ? 'left-[12%] w-[76%] text-left'
            : 'left-1/2 w-[78%] text-center'
        }`}
        style={{
          top: kawaiiTextTop,
          transform: kawaiiTextTransform,
          color: textColor,
          fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif',
          fontSize: isCover ? '5cqw' : '4.6cqw',
          lineHeight: 1.25,
          maxHeight: showTemplate2StyleCta ? '40%' : '36%',
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
      {showKawaiiArt && isCover ? (
        <p
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 text-center leading-none"
          style={{
            bottom: '43%',
            color: '#000000',
            fontSize: '4.4cqw',
            letterSpacing: '-0.12em',
          }}
          aria-hidden
        >
          ♥♥♥
        </p>
      ) : null}
      {showKawaiiArt ? (
        <img
          src={illustrationSrc}
          alt=""
          className="pointer-events-none absolute left-1/2 z-10 max-h-[28%] max-w-[48%] -translate-x-1/2 object-contain bottom-[13%]"
        />
      ) : null}
      {showTemplate2StyleCta ? (
        <>
          <p
            className="absolute inset-x-[6%] z-20 text-center font-bold"
            style={{
              color: textColor,
              fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif',
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
      ) : null}
    </div>
  );
}

export function CopycatPanel({
  competitorId,
  templateId,
  useHookPosts = false,
  onNewRandomPost,
}: CopycatPanelProps) {
  const posts: CopycatPost[] = useMemo(() => {
    if (useHookPosts) return getHookPosts();
    const raw =
      competitorId === 'flamingo-cards'
        ? getFlamingoCardsPosts(FLAMINGO_CARDS_FEED.posts)
        : competitorId === 'flamingo-convo'
          ? getFlamingoConvoPosts()
          : competitorId === '21-questions'
          ? getQuestions21Posts()
          : competitorId === 'its-all-about-loving-you'
            ? getItsAllAboutLovingYouPosts()
            : competitorId === 'try-deepen'
              ? getTryDeepenPosts()
              : competitorId === 'couple-cards'
                ? getCoupleCardsPosts()
                : competitorId === 'hh-talk'
                  ? getHhTalkPosts()
                  : competitorId === 'golden-thoughts-daily'
                    ? getGoldenThoughtsDailyPosts()
                    : competitorId === 'lvrsbae'
                      ? getLvrsbaePosts()
                      : competitorId === 'spill-cards-app'
                        ? getSpillCardsAppPosts()
                        : [];
    if (competitorId === 'flamingo-cards') return filterCopycatPostsByMinViews(raw);
    return raw;
  }, [competitorId, useHookPosts]);
  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);
  const postSourceKey = useHookPosts ? 'hook-posts' : competitorId;

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [template14Color, setTemplate14Color] = useState(() => pickTemplate14Color());
  const [template15FrameBg, setTemplate15FrameBg] = useState(() =>
    pickTemplate15FrameColor()
  );
  const [dogUrls, setDogUrls] = useState<string[]>([]);
  const [illustrations, setIllustrations] = useState<string[]>([]);
  const [template15CoverSrc, setTemplate15CoverSrc] = useState('');
  const [template15CoverError, setTemplate15CoverError] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const postBagRef = useRef<string[]>([]);
  const lastPostIdRef = useRef<string | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? null,
    [posts, selectedPostId]
  );

  const questionSlides = useMemo(
    () =>
      selectedPost
        ? selectedPost.slideText.filter((slide) => !isCopycatPromoNoiseSlide(slide))
        : [],
    [selectedPost]
  );

  const slideBodies = useMemo(
    () => (selectedPost ? copycatPostSlideBodiesClean(selectedPost) : []),
    [selectedPost]
  );

  // CTA is the last question slide itself — never a separate empty tab.
  const ctaTabIndex = slideBodies.length > 1 ? slideBodies.length - 1 : -1;
  const isCtaSlide = selectedTab === ctaTabIndex && ctaTabIndex > 0;

  const reshufflePost = useCallback(() => {
    if (postIds.length === 0) {
      setSelectedPostId(null);
      return;
    }
    const drawn = drawFromBag(postBagRef.current, postIds, lastPostIdRef.current);
    postBagRef.current = drawn.bag;
    lastPostIdRef.current = drawn.next;
    setSelectedPostId(drawn.next);
    setSelectedTab(0);
    setTemplate14Color((current) => pickTemplate14Color(current));
    setTemplate15FrameBg((current) => pickTemplate15FrameColor(current));
  }, [postIds]);

  // Fresh crypto draw whenever the template or post source changes (and once on mount).
  useEffect(() => {
    if (postIds.length === 0) {
      setSelectedPostId(null);
      return;
    }
    postBagRef.current = [];
    lastPostIdRef.current = null;
    reshufflePost();
  }, [templateId, postSourceKey, reshufflePost]);

  useEffect(() => {
    if (selectedTab >= slideBodies.length) setSelectedTab(0);
  }, [selectedTab, slideBodies.length]);

  // New random post lands on the cover, which has no question id and always
  // uses the shared photo. Open the first question that has its own JPEG.
  useEffect(() => {
    if (templateId !== 17) return;
    const tab = template17TabForQuestions(questionSlides);
    if (tab > 0) setSelectedTab(tab);
  }, [selectedPostId, templateId, questionSlides]);

  useEffect(() => {
    if (templateId !== 1) return;
    let cancelled = false;
    fetch('/api/dog-images')
      .then((res) => res.json())
      .then((data: { urls?: string[] }) => {
        if (!cancelled) setDogUrls(Array.isArray(data.urls) ? data.urls : []);
        console.log('dog urls', data.urls);
      })
      .catch(() => {
        if (!cancelled) setDogUrls([]);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  useEffect(() => {
    if (templateId !== 15) {
      setTemplate15CoverSrc('');
      setTemplate15CoverError(null);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setTemplate15CoverError(null);
    fetchPinterestCoverImage({
      query: IMAGE_TEMPLATE15_PINTEREST_QUERY,
      poolSize: PINTEREST_COVER_CANDIDATE_POOL,
      signal: controller.signal,
    })
      .then((result) => {
        if (cancelled) return;
        setTemplate15CoverSrc(result.imageUrl);
        setTemplate15CoverError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setTemplate15CoverSrc('');
        setTemplate15CoverError(
          e instanceof Error ? e.message : 'Failed to fetch Pinterest cover'
        );
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [templateId]);

  // Crypto-random art for cover + non-CTA questions (last question shows promo instead).
  useEffect(() => {
    if (templateId !== 1 && templateId !== 6) {
      setIllustrations([]);
      return;
    }
    const artCount =
      slideBodies.length > 1 ? slideBodies.length - 1 : slideBodies.length;
    if (artCount <= 0) {
      setIllustrations([]);
      return;
    }
    if (templateId === 6) {
      setIllustrations(pickNUniqueRandom(IMAGE_TEMPLATE6_BEAR_SRCS, artCount));
      return;
    }
    if (dogUrls.length === 0) {
      setIllustrations([]);
      return;
    }
    setIllustrations(pickNUniqueRandom(dogUrls, artCount));
  }, [templateId, selectedPostId, slideBodies.length, dogUrls]);

  const handleGenerateCaption = useCallback(async () => {
    if (slideBodies.length === 0) return;
    setCaptionError(null);
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/openai/copycat-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cover: slideBodies[0] ?? '',
          questions: slideBodies.slice(1),
        }),
      });
      const data = (await res.json()) as { caption?: string; error?: string };
      if (!res.ok || !data.caption?.trim()) {
        throw new Error(data.error || 'Failed to generate caption');
      }
      setCaption(data.caption.trim());
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setCaptionError(e instanceof Error ? e.message : 'Failed to generate caption');
    } finally {
      setIsGeneratingCaption(false);
    }
  }, [slideBodies]);

  useEffect(() => {
    setCaption('');
    setCaptionError(null);
    if (!selectedPostId || slideBodies.length === 0) return;
    void handleGenerateCaption();
  }, [selectedPostId, handleGenerateCaption, slideBodies.length]);

  const handleDownload = useCallback(async () => {
    if (!selectedPost || slideBodies.length === 0 || isDownloading) return;
    setIsDownloading(true);
    try {
      const slides = slideBodies.map((text, index) => {
        const isCta = index === ctaTabIndex && ctaTabIndex > 0;
        const isCover = index === 0;
        return {
          text,
          isCta,
          isCover,
          backgroundSrc:
            templateId === 17 ? template17BackgroundSrcAt(questionSlides, index) : undefined,
          leftAlign: Boolean(
            templateId === 2 ||
              (index > 0 && questionSlides[index - 1]?.options?.length)
          ),
          illustrationSrc:
            templateId === 15
              ? index === 0
                ? template15CoverSrc || undefined
                : undefined
              : isCta || index >= illustrations.length
                ? undefined
                : illustrations[index],
        };
      });
      const zipBlob = await exportCopycatSlidesZip({
        templateId,
        slides,
        template14Color,
        template15FrameBg,
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `copycat-template-${templateId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    } catch (e) {
      console.error('Copycat download failed:', e);
      alert(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  }, [
    selectedPost,
    slideBodies,
    isDownloading,
    ctaTabIndex,
    questionSlides,
    illustrations,
    template15CoverSrc,
    templateId,
    template14Color,
    template15FrameBg,
  ]);

  if (!selectedPost) {
    return (
      <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/40 px-4 py-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {postIds.length === 0 ? 'No posts loaded.' : 'Picking a random post…'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          {useHookPosts ? 'Hook post' : 'Random post'} · {slideBodies.length} slides
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (useHookPosts || !onNewRandomPost) reshufflePost();
              else onNewRandomPost();
            }}
            disabled={isDownloading}
            className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 disabled:opacity-50"
          >
            New random post
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={
              isDownloading ||
              slideBodies.length === 0 ||
              (templateId === 15 && !template15CoverSrc)
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <svg
                  className="h-3.5 w-3.5 shrink-0 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Downloading…
              </>
            ) : (
              'Download'
            )}
          </button>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {slideBodies.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedTab(index)}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors ${
              selectedTab === index
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
              {index === 0 ? 'Cover' : `Q${index}`}
          </button>
        ))}
      </div>
      {templateId === 15 && template15CoverError ? (
        <p className="text-xs text-red-600 dark:text-red-400">{template15CoverError}</p>
      ) : null}
      <CopycatSlidePreview
        templateId={templateId}
        tabIndex={selectedTab}
        slideCount={slideBodies.length}
        text={slideBodies[selectedTab] ?? ''}
        backgroundSrc={
          templateId === 17 ? template17BackgroundSrcAt(questionSlides, selectedTab) : undefined
        }
        leftAlign={Boolean(
          templateId === 2 ||
            (selectedTab > 0 && questionSlides[selectedTab - 1]?.options?.length)
        )}
        template14Color={template14Color}
        template15FrameBg={template15FrameBg}
        illustrationSrc={
          templateId === 15
            ? selectedTab === 0
              ? template15CoverSrc || undefined
              : undefined
            : isCtaSlide || selectedTab >= illustrations.length
              ? undefined
              : illustrations[selectedTab]
        }
        isCtaSlide={isCtaSlide}
      />
      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Caption</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void handleGenerateCaption()}
              disabled={isGeneratingCaption || slideBodies.length === 0}
              className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-800 hover:border-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500"
            >
              {isGeneratingCaption ? 'Generating…' : caption ? 'Regenerate' : 'Generate'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!caption.trim()) return;
                void navigator.clipboard.writeText(caption).catch(() => {});
              }}
              disabled={!caption.trim()}
              className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-800 hover:border-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500"
            >
              Copy
            </button>
          </div>
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="lazy gen z caption shows up here…"
          rows={3}
          className="w-full resize-y rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500"
        />
        {captionError ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{captionError}</p>
        ) : (
          <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            Under 10 words, plus #couplesgoals #datenightideas #relationshipgoals
            #coupleschallenge.
          </p>
        )}
      </div>
    </div>
  );
}
