'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE29_CATS_SRC,
  IMAGE_TEMPLATE29_FONT_STACK,
  IMAGE_TEMPLATE29_SLIDE_COUNT,
  loadTemplate29Fonts,
  paintTemplate29Slide,
  template29Background,
} from '@/app/lib/image-template-29-dark-cats';

const EXPORT_W = 1080;
const EXPORT_H = 1440;

let promoImage: Promise<HTMLImageElement | null> | null = null;
let catsImage: Promise<HTMLImageElement | null> | null = null;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function loadPromoImage(): Promise<HTMLImageElement | null> {
  if (!promoImage) promoImage = loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC);
  return promoImage;
}

function loadCatsImage(): Promise<HTMLImageElement | null> {
  if (!catsImage) catsImage = loadImage(IMAGE_TEMPLATE29_CATS_SRC);
  return catsImage;
}

type DarkCatsPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
};

/**
 * Draws with the same `paintTemplate29Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function DarkCatsPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE29_SLIDE_COUNT,
  isCover,
  isCta,
}: DarkCatsPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cover = isCover ?? (tabIndex === 0 && !isCta);
  const cta = isCta ?? (tabIndex === slideCount - 1 && slideCount > 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const draw = async () => {
      canvas.width = EXPORT_W;
      canvas.height = EXPORT_H;
      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) return;
      await loadTemplate29Fonts();
      if (cancelled) return;
      const [promo, cats] = await Promise.all([
        cta ? loadPromoImage() : Promise.resolve(null),
        cover ? loadCatsImage() : Promise.resolve(null),
      ]);
      if (cancelled) return;
      paintTemplate29Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        promo,
        cats,
        fontFamily: IMAGE_TEMPLATE29_FONT_STACK,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cover, cta]);

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: template29Background(tabIndex, cta) }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Dark cats question slide"
      />
    </div>
  );
}
