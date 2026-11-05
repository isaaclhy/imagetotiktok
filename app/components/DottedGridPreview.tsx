'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE28_DEFAULT_SEED,
  IMAGE_TEMPLATE28_SLIDE_COUNT,
  loadTemplate28Fonts,
  paintTemplate28Slide,
  template28BodyFontStack,
  template28DisplayFontStack,
  template28UiFontStack,
} from '@/app/lib/image-template-28-dotted';

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

type DottedGridPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
  seed?: number;
};

/** Same `paintTemplate28Slide` call as the download, scaled into the 3:4 frame. */
export function DottedGridPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE28_SLIDE_COUNT,
  isCover,
  isCta,
  seed = IMAGE_TEMPLATE28_DEFAULT_SEED,
}: DottedGridPreviewProps) {
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
      await loadTemplate28Fonts();
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate28Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        seed,
        promo,
        displayFontFamily: template28DisplayFontStack(),
        bodyFontFamily: template28BodyFontStack(),
        uiFontFamily: template28UiFontStack(),
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cover, cta, seed]);

  return (
    <div className="absolute inset-0 bg-white">
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Dotted question slide"
      />
    </div>
  );
}
