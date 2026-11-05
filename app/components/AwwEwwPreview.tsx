'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  loadTemplate26Fonts,
  paintTemplate26Slide,
  IMAGE_TEMPLATE26_DEFAULT_BUNNY_SEED,
  template26Background,
  template26BoldFontStack,
  template26CanvasFontStack,
} from '@/app/lib/image-template-26-aww-eww';

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

type AwwEwwPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
  bunnySeed?: number;
};

/** Same `paintTemplate26Slide` call as the download, scaled into the 3:4 frame. */
export function AwwEwwPreview({
  text,
  tabIndex,
  slideCount = 7,
  isCover,
  isCta,
  bunnySeed = IMAGE_TEMPLATE26_DEFAULT_BUNNY_SEED,
}: AwwEwwPreviewProps) {
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
      await loadTemplate26Fonts();
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate26Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        promo,
        fontFamily: template26CanvasFontStack(),
        boldFontFamily: template26BoldFontStack(),
        bunnySeed,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cover, cta, bunnySeed]);

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: template26Background(tabIndex) }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Aww or eww question slide"
      />
    </div>
  );
}
