'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE21_COVER_MID,
  IMAGE_TEMPLATE21_SLIDE_COUNT,
  paintTemplate21Slide,
  template21CanvasFontStack,
} from '@/app/lib/image-template-21-bold-solid';

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

type BoldSolidPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
};

/**
 * Draws with the same `paintTemplate21Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function BoldSolidPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE21_SLIDE_COUNT,
  isCover,
  isCta,
}: BoldSolidPreviewProps) {
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
      const fontFamily = template21CanvasFontStack();
      try {
        await document.fonts.load(`600 96px ${fontFamily}`);
        await document.fonts.load(`500 52px ${fontFamily}`);
        await document.fonts.load(`600 48px ${fontFamily}`);
      } catch {
        /* faces may already be ready */
      }
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate21Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        promo,
        fontFamily,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cover, cta]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: IMAGE_TEMPLATE21_COVER_MID }}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Bold solid question slide"
      />
    </div>
  );
}
