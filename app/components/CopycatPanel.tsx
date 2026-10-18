'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  copycatPostSlideBodiesClean,
  FLAMINGO_CARDS_FEED,
  isCopycatPromoNoiseSlide,
  type CopycatPost,
} from '@/app/lib/copycat/flamingo-cards';
import { getFlamingoCardsPosts } from '@/app/lib/copycat/flamingo-convos';
import { IMAGE_TEMPLATE2_PASTEL_COLORS } from '@/app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_SRC,
  IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO,
  IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO,
} from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE6_BEAR_SRCS,
  IMAGE_TEMPLATE6_FRAME_BG,
  IMAGE_TEMPLATE6_TEXT_COLOR,
} from '@/app/lib/image-template-6-kawaii';
import {
  IMAGE_TEMPLATE8_Q5_BANNER_ASPECT,
  IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_SRC,
  IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_LINES,
  IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
} from '@/app/lib/image-template-8-cover';
import { IMAGE_TEMPLATE13_BG } from '@/app/lib/image-template-13-cover';
import {
  IMAGE_TEMPLATE14_CARD_INSET_X,
  IMAGE_TEMPLATE14_CARD_INSET_Y,
  IMAGE_TEMPLATE14_CARD_RADIUS_RATIO,
  IMAGE_TEMPLATE14_COLORS,
  IMAGE_TEMPLATE14_COVER_SIZE_RATIO,
  IMAGE_TEMPLATE14_FONT_STACK,
  IMAGE_TEMPLATE14_FRAME_BG,
  IMAGE_TEMPLATE14_GRAIN_SRC,
  IMAGE_TEMPLATE14_LINE_HEIGHT,
  IMAGE_TEMPLATE14_MARK,
  IMAGE_TEMPLATE14_MARK_SIZE_RATIO,
  IMAGE_TEMPLATE14_MARK_Y_RATIO,
  IMAGE_TEMPLATE14_QUESTION_SIZE_RATIO,
  template14TextForBackground,
} from '@/app/lib/image-template-14-cards';

const TIKTOK_SANS_STACK = '"TikTok Sans", system-ui, -apple-system, sans-serif';

export type CopycatTemplateId = 1 | 2 | 6 | 13 | 14;

type CopycatPanelProps = {
  competitorId: string;
  templateId: CopycatTemplateId;
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

function templateFrameAspect(templateId: CopycatTemplateId): string {
  if (templateId === 13) return 'aspect-[9/16]';
  return 'aspect-3/4';
}

function CopycatSlidePreview({
  templateId,
  tabIndex,
  text,
  leftAlign = false,
  template14Color,
  illustrationSrc,
  isCtaSlide = false,
}: {
  templateId: CopycatTemplateId;
  tabIndex: number;
  text: string;
  leftAlign?: boolean;
  template14Color?: string;
  illustrationSrc?: string;
  isCtaSlide?: boolean;
}) {
  const isCover = tabIndex === 0;
  const showTemplate2StyleCta =
    (templateId === 1 || templateId === 2 || templateId === 6 || templateId === 14) && isCtaSlide;
  const showTemplate13Cta = templateId === 13 && isCtaSlide;
  const showSpillItMark =
    !showTemplate2StyleCta && !showTemplate13Cta && templateId !== 1 && templateId !== 6;
  const spillItMark = IMAGE_TEMPLATE14_MARK;
  const alignLeft = Boolean(leftAlign && !isCover);
  const pastelBg =
    IMAGE_TEMPLATE2_PASTEL_COLORS[tabIndex % IMAGE_TEMPLATE2_PASTEL_COLORS.length]!;
  const card14Bg = template14Color ?? IMAGE_TEMPLATE14_COLORS[0]!;
  const card14Text = template14TextForBackground(card14Bg);
  const bodyAlignClass = alignLeft
    ? 'left-[11%] w-[78%] -translate-y-1/2 text-left'
    : 'left-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 text-center';

  if (templateId === 14) {
    return (
      <div
        className="@container relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4"
        style={{ backgroundColor: IMAGE_TEMPLATE14_FRAME_BG }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${IMAGE_TEMPLATE14_CARD_INSET_X * 100}%`,
            top: `${IMAGE_TEMPLATE14_CARD_INSET_Y * 100}%`,
            width: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_X * 2) * 100}%`,
            height: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_Y * 2) * 100}%`,
            borderRadius: `${IMAGE_TEMPLATE14_CARD_RADIUS_RATIO * 100}cqw`,
            backgroundColor: card14Bg,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGE_TEMPLATE14_GRAIN_SRC})`,
              backgroundSize: '80px',
              opacity: 0.85,
              mixBlendMode: 'multiply',
            }}
          />
          <p
            className={`absolute z-10 whitespace-pre-wrap wrap-break-word ${bodyAlignClass}`}
            style={{
              top: `${(showTemplate2StyleCta ? IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO : 0.5) * 100}%`,
              color: card14Text,
              fontFamily: IMAGE_TEMPLATE14_FONT_STACK,
              fontSize: `${(isCover ? IMAGE_TEMPLATE14_COVER_SIZE_RATIO : IMAGE_TEMPLATE14_QUESTION_SIZE_RATIO) * 100}cqw`,
              fontWeight: 400,
              lineHeight: IMAGE_TEMPLATE14_LINE_HEIGHT,
            }}
          >
            {text}
          </p>
          {showTemplate2StyleCta ? (
            <>
              <p
                className="absolute inset-x-[6%] z-10 text-center font-bold"
                style={{
                  color: card14Text === '#FFFFFF' ? card14Text : 'rgba(255,255,255,0.95)',
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
          ) : (
            <p
              className="absolute inset-x-[8%] z-10 text-center"
              style={{
                top: `${IMAGE_TEMPLATE14_MARK_Y_RATIO * 100}%`,
                color: card14Text,
                fontFamily: IMAGE_TEMPLATE14_FONT_STACK,
                fontSize: `${IMAGE_TEMPLATE14_MARK_SIZE_RATIO * 100}cqw`,
              }}
            >
              {IMAGE_TEMPLATE14_MARK}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (templateId === 13) {
    return (
      <div
        className="@container relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-[9/16]"
        style={{ backgroundColor: IMAGE_TEMPLATE13_BG }}
      >
        <div
          className={`absolute inset-0 flex items-center px-[11%] ${
            alignLeft ? 'justify-start text-left' : 'justify-center text-center'
          }`}
        >
          <p
            className="w-full whitespace-pre-wrap wrap-break-word font-semibold text-white"
            style={{
              fontFamily: TIKTOK_SANS_STACK,
              fontSize: isCover ? '5.4cqw' : '4.8cqw',
              lineHeight: 1.3,
              textAlign: alignLeft ? 'left' : 'center',
            }}
          >
            {text}
          </p>
        </div>
        {showTemplate13Cta ? (
          <div
            className="absolute left-0 right-0 z-20 flex flex-col items-center px-[6%]"
            style={{ top: `${IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO * 100}%` }}
          >
            <p
              className="w-full text-center text-white wrap-break-word"
              style={{
                fontFamily: TIKTOK_SANS_STACK,
                fontSize: `${IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO * 100}cqw`,
                fontWeight: IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
                lineHeight: IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
                textShadow: '0 1px 8px rgba(0,0,0,0.55)',
              }}
            >
              {IMAGE_TEMPLATE8_Q5_SEARCH_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
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
        ) : showSpillItMark ? (
          <p
            className="absolute inset-x-[8%] z-10 text-center text-white/95"
            style={{
              bottom: '9%',
              fontFamily: TIKTOK_SANS_STACK,
              fontSize: '3.2cqw',
              fontWeight: 600,
            }}
          >
            {spillItMark}
          </p>
        ) : null}
      </div>
    );
  }

  if (templateId === 2) {
    return (
      <div
        className="@container relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 aspect-3/4"
        style={{ backgroundColor: pastelBg }}
      >
        <p
          className={`absolute z-10 whitespace-pre-wrap font-extrabold text-white wrap-break-word ${
            alignLeft
              ? 'left-[12%] w-[76%] -translate-y-1/2 text-left'
              : 'left-1/2 w-[60%] -translate-x-1/2 -translate-y-1/2 text-center'
          }`}
          style={{
            top: `${(showTemplate2StyleCta ? IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO : 0.5) * 100}%`,
            fontFamily: TIKTOK_SANS_STACK,
            fontSize: isCover ? '6.2cqw' : '5cqw',
            lineHeight: 1.2,
          }}
        >
          {text}
        </p>
        {showTemplate2StyleCta ? (
          <>
            <p
              className="absolute inset-x-[6%] z-10 text-center font-bold text-white/95"
              style={{
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
          <p
            className="absolute inset-x-[8%] z-10 text-center font-bold text-white/95"
            style={{
              bottom: '9%',
              fontFamily: TIKTOK_SANS_STACK,
              fontSize: '3cqw',
            }}
          >
            {spillItMark}
          </p>
        ) : null}
      </div>
    );
  }

  const frameBg = templateId === 6 ? IMAGE_TEMPLATE6_FRAME_BG : '#FEFEFE';
  const textColor = templateId === 6 ? IMAGE_TEMPLATE6_TEXT_COLOR : '#2f2a31';
  const showKawaiiArt = Boolean(illustrationSrc) && !showTemplate2StyleCta;
  const kawaiiTextTop = showTemplate2StyleCta
    ? `${IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO * 100}%`
    : '21%';
  const kawaiiTextTransform = alignLeft
    ? undefined
    : showTemplate2StyleCta
      ? 'translate(-50%, -50%)'
      : 'translateX(-50%)';
  return (
    <div
      className={`@container relative w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 ${templateFrameAspect(templateId)}`}
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
          maxHeight: showTemplate2StyleCta ? undefined : '36%',
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
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

export function CopycatPanel({ competitorId, templateId }: CopycatPanelProps) {
  const posts: CopycatPost[] = useMemo(
    () =>
      competitorId === 'flamingo-cards'
        ? getFlamingoCardsPosts(FLAMINGO_CARDS_FEED.posts)
        : [],
    [competitorId]
  );
  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [template14Color, setTemplate14Color] = useState(() => pickTemplate14Color());
  const [dogUrls, setDogUrls] = useState<string[]>([]);
  const [illustrations, setIllustrations] = useState<string[]>([]);
  const postBagRef = useRef<string[]>([]);
  const lastPostIdRef = useRef<string | null>(null);
  const didInitRef = useRef(false);

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

  const slideBodies = useMemo(() => {
    if (!selectedPost) return [];
    return [...copycatPostSlideBodiesClean(selectedPost), ''];
  }, [selectedPost]);

  const ctaTabIndex = slideBodies.length > 0 ? slideBodies.length - 1 : -1;
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
  }, [postIds]);

  // Fresh crypto draw whenever the template changes (and once on mount).
  useEffect(() => {
    if (postIds.length === 0) return;
    if (!didInitRef.current) {
      didInitRef.current = true;
      postBagRef.current = shuffleCrypto(postIds);
    }
    reshufflePost();
  }, [templateId, reshufflePost]);

  useEffect(() => {
    if (selectedTab >= slideBodies.length) setSelectedTab(0);
  }, [selectedTab, slideBodies.length]);

  useEffect(() => {
    if (templateId !== 1) return;
    let cancelled = false;
    fetch('/api/dog-images')
      .then((res) => res.json())
      .then((data: { urls?: string[] }) => {
        if (!cancelled) setDogUrls(Array.isArray(data.urls) ? data.urls : []);
      })
      .catch(() => {
        if (!cancelled) setDogUrls([]);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  // Crypto-random art per content slide; no hash / index modulo.
  useEffect(() => {
    if (templateId !== 1 && templateId !== 6) {
      setIllustrations([]);
      return;
    }
    const contentCount = Math.max(0, slideBodies.length - 1);
    if (contentCount === 0) {
      setIllustrations([]);
      return;
    }
    if (templateId === 6) {
      setIllustrations(pickNUniqueRandom(IMAGE_TEMPLATE6_BEAR_SRCS, contentCount));
      return;
    }
    if (dogUrls.length === 0) {
      setIllustrations([]);
      return;
    }
    setIllustrations(pickNUniqueRandom(dogUrls, contentCount));
  }, [templateId, selectedPostId, slideBodies.length, dogUrls]);

  if (competitorId !== 'flamingo-cards' || !selectedPost) {
    return (
      <div className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/40 px-4 py-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {postIds.length === 0 ? 'No posts loaded.' : 'Picking a random post…'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          Random post · {slideBodies.length} slides
        </p>
        <button
          type="button"
          onClick={reshufflePost}
          className="shrink-0 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
        >
          New random post
        </button>
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
            {index === 0 ? 'Cover' : index === ctaTabIndex ? 'CTA' : `Q${index}`}
          </button>
        ))}
      </div>
      <CopycatSlidePreview
        templateId={templateId}
        tabIndex={selectedTab}
        text={slideBodies[selectedTab] ?? ''}
        leftAlign={Boolean(
          selectedTab > 0 &&
            selectedTab !== ctaTabIndex &&
            questionSlides[selectedTab - 1]?.options?.length
        )}
        template14Color={template14Color}
        illustrationSrc={
          isCtaSlide || selectedTab >= illustrations.length
            ? undefined
            : illustrations[selectedTab]
        }
        isCtaSlide={isCtaSlide}
      />
    </div>
  );
}
