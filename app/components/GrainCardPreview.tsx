'use client';

import { useEffect, useState } from 'react';
import {
  IMAGE_TEMPLATE31_FONT_STACK,
  IMAGE_TEMPLATE31_FRAME_BG,
  IMAGE_TEMPLATE31_GRAIN_SRC,
  IMAGE_TEMPLATE31_MARK_FONT_STACK,
  paintTemplate31Slide,
} from '@/app/lib/image-template-31-cards';

const EXPORT_W = 1080;
const EXPORT_H = 1440;

let grainPromise: Promise<HTMLImageElement> | null = null;

function loadGrain(): Promise<HTMLImageElement> {
  if (!grainPromise) {
    grainPromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('grain'));
      image.src = IMAGE_TEMPLATE31_GRAIN_SRC;
    });
  }
  return grainPromise;
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
  backgroundColor,
}: {
  text: string;
  isCover: boolean;
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
      const grain = await loadGrain().catch(() => null);
      const fontFamily = concreteFontFamily(IMAGE_TEMPLATE31_FONT_STACK);
      const markFontFamily = concreteFontFamily(IMAGE_TEMPLATE31_MARK_FONT_STACK);
      try {
        await document.fonts.load(`400 72px ${fontFamily}`);
        await document.fonts.load(`italic 400 48px ${fontFamily}`);
        await document.fonts.load(`500 32px ${markFontFamily}`);
      } catch {
        /* fonts may already be ready */
      }
      if (cancelled) return;
      paintTemplate31Slide(ctx, EXPORT_W, EXPORT_H, {
        backgroundColor,
        text,
        isCover,
        grain,
        fontFamily,
        markFontFamily,
      });
      const next = canvas.toDataURL('image/png');
      if (!cancelled) setUrl(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [text, isCover, backgroundColor]);

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
