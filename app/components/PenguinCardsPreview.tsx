'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE24_DEFAULT_LOOK,
  loadTemplate24Fonts,
  paintTemplate24Slide,
  template24CanvasFontStack,
  template24SlideCount,
  type Template24Look,
} from '@/app/lib/image-template-24-penguin';

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

type PenguinCardsPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
  look?: Template24Look;
};

/**
 * Draws with the same `paintTemplate24Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function PenguinCardsPreview({
  text,
  tabIndex,
  slideCount,
  isCover,
  isCta,
  look = IMAGE_TEMPLATE24_DEFAULT_LOOK,
}: PenguinCardsPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const count = slideCount ?? template24SlideCount(look.cardColors.length || 5);
  const cover = isCover ?? (tabIndex === 0 && !isCta);
  const cta = isCta ?? (tabIndex === count - 1 && count > 1);
  const lookKey = [
    look.background,
    look.highlightColor,
    look.highlightWord,
    look.cardColors.join(','),
    look.rotations.join(','),
  ].join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const draw = async () => {
      canvas.width = EXPORT_W;
      canvas.height = EXPORT_H;
      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) return;
      const fontFamily = template24CanvasFontStack();
      await loadTemplate24Fonts(fontFamily);
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate24Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount: count,
        isCover: cover,
        isCta: cta,
        look,
        promo,
        fontFamily,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, count, cover, cta, look, lookKey]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: look.background }}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Penguin cards question slide"
      />
    </div>
  );
}
