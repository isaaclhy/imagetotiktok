'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE18_CANVAS_BG,
  IMAGE_TEMPLATE18_CTA_TAB,
  IMAGE_TEMPLATE18_SLIDE_COUNT,
  paintTemplate18Slide,
} from '@/app/lib/image-template-18-pastel';

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

type PastelSlideshowPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCta?: boolean;
};

/**
 * Draws with the same `paintTemplate18Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function PastelSlideshowPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE18_SLIDE_COUNT,
  isCta,
}: PastelSlideshowPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cta = isCta ?? tabIndex === IMAGE_TEMPLATE18_CTA_TAB;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const draw = async () => {
      canvas.width = EXPORT_W;
      canvas.height = EXPORT_H;
      const ctx = canvas.getContext('2d');
      if (!ctx || cancelled) return;
      try {
        await document.fonts.load('400 72px "Libre Baskerville"');
        await document.fonts.load('700 36px "TikTok Sans"');
      } catch {
        /* faces may already be ready */
      }
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate18Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCta: cta,
        promo,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cta]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: IMAGE_TEMPLATE18_CANVAS_BG }}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Pastel question slide" />
    </div>
  );
}
