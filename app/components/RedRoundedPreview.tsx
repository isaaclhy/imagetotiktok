'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE22_CTA_TAB,
  IMAGE_TEMPLATE22_FONT_STACK,
  IMAGE_TEMPLATE22_FRAME_OUTER,
  IMAGE_TEMPLATE22_SLIDE_COUNT,
  paintTemplate22Slide,
} from '@/app/lib/image-template-22-red-rounded';

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

type RedRoundedPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCta?: boolean;
};

/**
 * Draws with the same `paintTemplate22Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function RedRoundedPreview({
  text,
  tabIndex,
  slideCount = IMAGE_TEMPLATE22_SLIDE_COUNT,
  isCta,
}: RedRoundedPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cta = isCta ?? tabIndex === IMAGE_TEMPLATE22_CTA_TAB;

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
        await document.fonts.load(`400 72px ${IMAGE_TEMPLATE22_FONT_STACK}`);
        await document.fonts.load('600 36px "Poppins"');
      } catch {
        /* faces may already be ready */
      }
      if (cancelled) return;
      const promo = cta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate22Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCta: cta,
        promo,
        fontFamily: IMAGE_TEMPLATE22_FONT_STACK,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cta]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: IMAGE_TEMPLATE22_FRAME_OUTER }}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ imageRendering: 'auto' }}
        aria-label="Red rounded card slide"
      />
    </div>
  );
}
