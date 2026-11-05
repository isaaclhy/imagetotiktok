'use client';

import { useEffect, useRef } from 'react';
import { IMAGE_TEMPLATE2_Q5_PROMO_SRC } from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE27_BG,
  IMAGE_TEMPLATE27_ICON_SRC,
  loadTemplate27Fonts,
  paintTemplate27Slide,
  template27CanvasFontStack,
  template27UiBoldFontStack,
  template27UiFontStack,
  type Template27Audience,
} from '@/app/lib/image-template-27-pink-cards';

const EXPORT_W = 1080;
const EXPORT_H = 1440;

let promoImage: Promise<HTMLImageElement> | null = null;
let iconImage: Promise<HTMLImageElement | null> | null = null;

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

function loadIconImage(): Promise<HTMLImageElement | null> {
  if (!iconImage) {
    iconImage = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = IMAGE_TEMPLATE27_ICON_SRC;
    });
  }
  return iconImage;
}

type PinkCardsPreviewProps = {
  text: string;
  tabIndex: number;
  slideCount?: number;
  isCover?: boolean;
  isCta?: boolean;
  audience?: Template27Audience;
};

/** Same `paintTemplate27Slide` call as the download, scaled into the 3:4 frame. */
export function PinkCardsPreview({
  text,
  tabIndex,
  slideCount = 7,
  isCover,
  isCta,
  audience = 'him',
}: PinkCardsPreviewProps) {
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
      await loadTemplate27Fonts();
      if (cancelled) return;
      const [promo, icon] = await Promise.all([
        cta ? loadPromoImage().catch(() => null) : Promise.resolve(null),
        loadIconImage(),
      ]);
      if (cancelled) return;
      paintTemplate27Slide(ctx, EXPORT_W, EXPORT_H, {
        text,
        tabIndex,
        slideCount,
        isCover: cover,
        isCta: cta,
        audience,
        promo,
        icon,
        fontFamily: template27CanvasFontStack(),
        uiFontFamily: template27UiFontStack(),
        uiBoldFontFamily: template27UiBoldFontStack(),
      });
    };

    void draw();
    return () => {
      cancelled = true;
    };
  }, [text, tabIndex, slideCount, cover, cta, audience]);

  return (
    <div className="absolute inset-0" style={{ backgroundColor: IMAGE_TEMPLATE27_BG }}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label="Pink tilted card question slide"
      />
    </div>
  );
}
