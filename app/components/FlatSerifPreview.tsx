'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE25_FONT_STACK,
  IMAGE_TEMPLATE25_SLIDE_COUNT,
  loadTemplate25Fonts,
  paintTemplate25Slide,
  template25Background,
} from '@/app/lib/image-template-25-flat-serif';

const EXPORT_W = 1080;
const EXPORT_H = 1440;

let promoImage: Promise<HTMLImageElement> | null = null;

function loadPromoImage(): Promise<HTMLImageElement> {
  if (!promoImage) {
    promoImage = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        promoImage = null;
        reject(new Error('Failed to load the App Store image'));
      };
      img.src = IMAGE_TEMPLATE2_Q5_PROMO_SRC;
    });
  }
  return promoImage;
}

type FlatSerifPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
};

/**
 * Draws with the same `paintTemplate25Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function FlatSerifPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE25_SLIDE_COUNT,
  isCover,
  isCta,
}: FlatSerifPreviewProps) {
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
      await loadTemplate25Fonts();
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate25Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        promo,
        fontFamily: IMAGE_TEMPLATE25_FONT_STACK,
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
      style={{ backgroundColor: template25Background(tabIndex, cta) }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Flat serif question slide"
      />
    </div>
  );
}
