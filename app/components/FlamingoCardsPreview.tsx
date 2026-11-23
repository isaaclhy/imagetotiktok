'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE31_DEFAULT_COLOR,
  IMAGE_TEMPLATE31_GRAIN_SRC,
  IMAGE_TEMPLATE31_SANS_STACK,
  IMAGE_TEMPLATE31_SERIF_STACK,
  IMAGE_TEMPLATE31_SLIDE_COUNT,
  loadTemplate31Fonts,
  paintTemplate31Slide,
} from '@/app/lib/image-template-31-flamingo';

const EXPORT_W = 1080;
const EXPORT_H = 1440;

let promoImage: Promise<HTMLImageElement | null> | null = null;
let grainImage: Promise<HTMLImageElement | null> | null = null;

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

function loadGrainImage(): Promise<HTMLImageElement | null> {
  if (!grainImage) grainImage = loadImage(IMAGE_TEMPLATE31_GRAIN_SRC);
  return grainImage;
}

type FlamingoCardsPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
  color?: string;
};

/**
 * Draws with the same `paintTemplate31Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function FlamingoCardsPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE31_SLIDE_COUNT,
  isCover,
  isCta,
  color = IMAGE_TEMPLATE31_DEFAULT_COLOR,
}: FlamingoCardsPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cover = isCover ?? (tabIndex === 0 && !isCta);
  const cta = isCta ?? false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const draw = async () => {
      canvas.width = EXPORT_W;
      canvas.height = EXPORT_H;
      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) return;
      await loadTemplate31Fonts();
      if (cancelled) return;
      const [promo, grain] = await Promise.all([
        cta ? loadPromoImage() : Promise.resolve(null),
        loadGrainImage(),
      ]);
      if (cancelled) return;
      paintTemplate31Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        color,
        grain,
        promo,
        serifFamily: IMAGE_TEMPLATE31_SERIF_STACK,
        sansFamily: IMAGE_TEMPLATE31_SANS_STACK,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cover, cta, color]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#000000' }}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Flamingo cards question slide"
      />
    </div>
  );
}
