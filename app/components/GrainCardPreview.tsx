'use client';

import { useEffect, useState } from 'react';
import {
  IMAGE_TEMPLATE31_FONT_STACK,
  IMAGE_TEMPLATE31_FRAME_BG,
  IMAGE_TEMPLATE31_GRAIN_SRC,
  IMAGE_TEMPLATE31_MARK_FONT_STACK,
  paintTemplate31Slide,
} from '@/app/lib/image-template-31-cards';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';

const EXPORT_W = 1080;
const EXPORT_H = 1440;

let grainPromise: Promise<HTMLImageElement> | null = null;
let promoPromise: Promise<HTMLImageElement> | null = null;

function loadImage(src: string, cache: Promise<HTMLImageElement> | null, setCache: (next: Promise<HTMLImageElement>) => void): Promise<HTMLImageElement> {
  if (!cache) {
    const next = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(src));
      image.src = src;
    });
    setCache(next);
    return next;
  }
  return cache;
}

function concreteFontFamily(stack: string): string {
  const probe = document.createElement('span');
  probe.style.fontFamily = stack;
  probe.style.position = 'absolute';
  probe.style.left = '-9999px';
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || stack;
}

export function GrainCardPreview({
  text,
  isCover,
  isCta = false,
  backgroundColor,
}: {
  text: string;
  isCover: boolean;
  isCta?: boolean;
  backgroundColor: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_W;
    canvas.height = EXPORT_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    void (async () => {
      const grain = await loadImage(IMAGE_TEMPLATE31_GRAIN_SRC, grainPromise, (next) => {
        grainPromise = next;
      }).catch(() => null);
      const promo = isCta
        ? await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC, promoPromise, (next) => {
            promoPromise = next;
          }).catch(() => null)
        : null;
      const fontFamily = concreteFontFamily(IMAGE_TEMPLATE31_FONT_STACK);
      const markFontFamily = concreteFontFamily(IMAGE_TEMPLATE31_MARK_FONT_STACK);
      const labelFontFamily = '"TikTok Sans", system-ui, sans-serif';
      try {
        await document.fonts.load(`400 72px ${fontFamily}`);
        await document.fonts.load(`400 48px ${fontFamily}`);
        await document.fonts.load(`500 32px ${markFontFamily}`);
        await document.fonts.load('700 36px "TikTok Sans"');
      } catch {
        /* fonts may already be ready */
      }
      if (cancelled) return;
      paintTemplate31Slide(ctx, EXPORT_W, EXPORT_H, {
        backgroundColor,
        text,
        isCover,
        isCta,
        grain,
        promo,
        fontFamily,
        markFontFamily,
        labelFontFamily,
      });
      const next = canvas.toDataURL('image/png');
      if (!cancelled) setUrl(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [text, isCover, isCta, backgroundColor]);

  return (
    <div
      className="relative mx-auto aspect-3/4 w-full max-w-[20.5rem] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700"
      style={{ backgroundColor: IMAGE_TEMPLATE31_FRAME_BG }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
