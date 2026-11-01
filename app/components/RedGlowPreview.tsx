'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE19_BG,
  IMAGE_TEMPLATE19_FONT_STACK,
  IMAGE_TEMPLATE19_LABEL_FONT_STACK,
  paintTemplate19Slide,
  type Template19ColorId,
} from '@/app/lib/image-template-19-glow';

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

type RedGlowPreviewProps = {
  text: string;
  isCover?: boolean;
  isCta?: boolean;
  color?: Template19ColorId;
};

/**
 * Draws with the same `paintTemplate19Slide` call as the download, at the
 * export resolution, then scales it into the 3:4 frame.
 */
export function RedGlowPreview({
  text,
  isCover = false,
  isCta = false,
  color = 'red',
}: RedGlowPreviewProps) {
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
        await document.fonts.load(`400 96px ${IMAGE_TEMPLATE19_FONT_STACK}`);
        await document.fonts.load(`600 40px ${IMAGE_TEMPLATE19_LABEL_FONT_STACK}`);
        await document.fonts.load(`700 48px ${IMAGE_TEMPLATE19_LABEL_FONT_STACK}`);
      } catch {
        /* faces may already be ready */
      }
      if (cancelled) return;
      const promo = isCta ? await loadPromoImage().catch(() => null) : null;
      if (cancelled) return;
      paintTemplate19Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        fontFamily: IMAGE_TEMPLATE19_FONT_STACK,
        labelFontFamily: IMAGE_TEMPLATE19_LABEL_FONT_STACK,
        isCover,
        isCta,
        promo,
        color,
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, isCover, isCta, color]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: IMAGE_TEMPLATE19_BG }}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Red glow question slide" />
    </div>
  );
}
