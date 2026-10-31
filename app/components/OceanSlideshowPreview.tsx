'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE20_FONT_STACK,
  IMAGE_TEMPLATE20_FOOTER_FONT_STACK,
  paintTemplate20Slide,
} from '@/app/lib/image-template-20-ocean';

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

type OceanSlideshowPreviewProps = {
  text: string;
  isCover?: boolean;
  isCta?: boolean;
};

/**
 * Draws with the same `paintTemplate20Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function OceanSlideshowPreview({
  text,
  isCover = false,
  isCta = false,
}: OceanSlideshowPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        await document.fonts.load(`400 72px ${IMAGE_TEMPLATE20_FONT_STACK}`);
        await document.fonts.load(`700 96px ${IMAGE_TEMPLATE20_FONT_STACK}`);
        await document.fonts.load(`600 40px ${IMAGE_TEMPLATE20_FOOTER_FONT_STACK}`);
      } catch {
        /* faces may already be ready */
      }
      if (cancelled) return;
      const promo = isCta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate20Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        fontFamily: IMAGE_TEMPLATE20_FONT_STACK,
        footerFontFamily: IMAGE_TEMPLATE20_FOOTER_FONT_STACK,
        isCover,
        isCta,
        promo,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, isCover, isCta]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#064B74' }}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Ocean question slide"
      />
    </div>
  );
}
