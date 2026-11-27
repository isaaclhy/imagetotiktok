'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE32_FONT_STACK,
  IMAGE_TEMPLATE32_OLIVE,
  IMAGE_TEMPLATE32_SLIDE_COUNT,
  loadTemplate32Fonts,
  paintTemplate32Slide,
} from '@/app/lib/image-template-32-wavy-blob';

const EXPORT_W = 1080;
const EXPORT_H = 1440;

let promoImage: Promise<HTMLImageElement | null> | null = null;

function loadPromoImage(): Promise<HTMLImageElement | null> {
  if (!promoImage) {
    promoImage = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = IMAGE_TEMPLATE2_Q5_PROMO_SRC;
    });
  }
  return promoImage;
}

type WavyBlobPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
};

/**
 * Draws with the same `paintTemplate32Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function WavyBlobPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE32_SLIDE_COUNT,
  isCover,
  isCta,
}: WavyBlobPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coverSlide = isCover ?? (tabIndex === 0 && !isCta);
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
      await loadTemplate32Fonts();
      if (cancelled) return;
      const promo = cta ? await loadPromoImage() : null;
      if (cancelled) return;
      paintTemplate32Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: coverSlide,
        isCta: cta,
        promo,
        fontFamily: IMAGE_TEMPLATE32_FONT_STACK,
        labelFontFamily: '"TikTok Sans", system-ui, sans-serif',
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, coverSlide, cta]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: IMAGE_TEMPLATE32_OLIVE }}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Wavy blob question slide" />
    </div>
  );
}
