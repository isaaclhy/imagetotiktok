'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE23_SLIDE_COUNT,
  loadTemplate23Fonts,
  paintTemplate23Slide,
  template23Background,
  template23CanvasFontStack,
} from '@/app/lib/image-template-23-flat-dark';

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

type FlatDarkPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
  coverSubtitle?: string;
};

/**
 * Draws with the same `paintTemplate23Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function FlatDarkPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE23_SLIDE_COUNT,
  isCover,
  isCta,
  coverSubtitle,
}: FlatDarkPreviewProps) {
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
      const fontFamily = template23CanvasFontStack();
      await loadTemplate23Fonts(fontFamily);
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate23Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        coverSubtitle,
        promo,
        fontFamily,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cover, cta, coverSubtitle]);

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: template23Background(tabIndex, cta) }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Dark flat question slide"
      />
    </div>
  );
}
