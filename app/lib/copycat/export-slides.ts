import { IMAGE_TEMPLATE2_PASTEL_COLORS } from '@/app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_SRC,
  IMAGE_TEMPLATE2_Q5_TAB_INDEX,
  IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE6_FRAME_BG,
  IMAGE_TEMPLATE6_TEXT_COLOR,
} from '@/app/lib/image-template-6-kawaii';
import {
  drawImageTemplate8Q5Banner,
  drawImageTemplate8Q5SearchLabel,
  IMAGE_TEMPLATE8_Q5_BANNER_SRC,
} from '@/app/lib/image-template-8-cover';
import { IMAGE_TEMPLATE13_BG, IMAGE_TEMPLATE13_TEXT } from '@/app/lib/image-template-13-cover';
import {
  IMAGE_TEMPLATE14_COLORS,
  IMAGE_TEMPLATE14_GRAIN_SRC,
  IMAGE_TEMPLATE14_MARK,
  paintTemplate14Slide,
} from '@/app/lib/image-template-14-cards';

const TIKTOK = '"TikTok Sans", system-ui, sans-serif';
const COMIC =
  '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif';

export type CopycatExportTemplateId = 1 | 2 | 6 | 13 | 14;

export type CopycatExportSlide = {
  text: string;
  leftAlign: boolean;
  illustrationSrc?: string;
  isCta: boolean;
  isCover: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode PNG'));
    }, 'image/png');
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.replace(/\r/g, '').split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let current = words[0]!;
    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) current = next;
      else {
        lines.push(current);
        current = words[i]!;
      }
    }
    lines.push(current);
  }
  return lines;
}

function drawWrappedBlock(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  centerY: number,
  lineHeight: number,
  align: 'center' | 'left'
) {
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const blockH = lines.length * lineHeight;
  let y = centerY - blockH / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return { top: centerY - blockH / 2, bottom: centerY + blockH / 2 };
}

function frameSize(templateId: CopycatExportTemplateId): { w: number; h: number } {
  if (templateId === 13) return { w: 1080, h: 1920 };
  return { w: 1080, h: 1440 };
}

async function paintSlide(
  templateId: CopycatExportTemplateId,
  slide: CopycatExportSlide,
  tabIndex: number,
  template14Color: string
): Promise<Blob> {
  const { w, h } = frameSize(templateId);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to prepare canvas');

  if (templateId === 14) {
    const [grain, promo] = await Promise.all([
      loadImage(IMAGE_TEMPLATE14_GRAIN_SRC),
      loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC),
    ]);
    try {
      await document.fonts.load(`400 72px "Libre Baskerville"`);
      await document.fonts.load(`700 48px "TikTok Sans"`);
    } catch {
      /* fonts may already be ready */
    }
    paintTemplate14Slide(ctx, w, h, {
      backgroundColor: template14Color,
      text: slide.text,
      tabIndex: slide.isCta
        ? IMAGE_TEMPLATE2_Q5_TAB_INDEX
        : slide.isCover
          ? 0
          : 1,
      grain,
      promo,
    });
    return canvasBlob(canvas);
  }

  if (templateId === 13) {
    ctx.fillStyle = IMAGE_TEMPLATE13_BG;
    ctx.fillRect(0, 0, w, h);
    try {
      await document.fonts.load(`600 52px "TikTok Sans"`);
    } catch {
      /* fonts may already be ready */
    }
    if (slide.isCta) {
      const banner = await loadImage(IMAGE_TEMPLATE8_Q5_BANNER_SRC);
      drawImageTemplate8Q5SearchLabel(ctx, w, h, TIKTOK);
      drawImageTemplate8Q5Banner(ctx, w, h, banner);
    } else {
      const fontSize = slide.isCover ? Math.round(w * 0.054) : Math.round(w * 0.048);
      ctx.font = `600 ${fontSize}px ${TIKTOK}`;
      ctx.fillStyle = IMAGE_TEMPLATE13_TEXT;
      const maxW = w * 0.78;
      const lines = wrapLines(ctx, slide.text, maxW);
      const lineHeight = fontSize * 1.3;
      const x = slide.leftAlign ? w * 0.11 : w / 2;
      drawWrappedBlock(ctx, lines, x, h / 2, lineHeight, slide.leftAlign ? 'left' : 'center');
      ctx.font = `600 ${Math.round(w * 0.032)}px ${TIKTOK}`;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(IMAGE_TEMPLATE14_MARK, w / 2, h * 0.91);
    }
    return canvasBlob(canvas);
  }

  if (templateId === 2) {
    const bg =
      IMAGE_TEMPLATE2_PASTEL_COLORS[tabIndex % IMAGE_TEMPLATE2_PASTEL_COLORS.length]!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    try {
      await document.fonts.load(`800 ${Math.round(w * 0.062)}px "TikTok Sans"`);
    } catch {
      /* fonts may already be ready */
    }
    const fontSize = slide.isCover ? Math.round(w * 0.062) : Math.round(w * 0.05);
    ctx.font = `800 ${fontSize}px ${TIKTOK}`;
    ctx.fillStyle = '#FFFFFF';
    const maxW = slide.leftAlign ? w * 0.76 : w * 0.6;
    const lines = wrapLines(ctx, slide.text, maxW);
    const lineHeight = fontSize * 1.2;
    const centerY = h * (slide.isCta ? IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO : 0.5);
    const x = slide.leftAlign ? w * 0.12 : w / 2;
    const block = drawWrappedBlock(
      ctx,
      lines,
      x,
      centerY,
      lineHeight,
      slide.leftAlign ? 'left' : 'center'
    );
    if (slide.isCta) {
      const promo = await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC);
      const labelSize = Math.round(h * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
      const labelGap = h * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
      const layout = imageTemplate2Q5PromoLayout(w, h, block.bottom + labelSize + labelGap);
      ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
      ctx.font = `700 ${labelSize}px ${TIKTOK}`;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, w / 2, layout.y - labelGap);
    } else {
      ctx.font = `700 ${Math.round(w * 0.03)}px ${TIKTOK}`;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(IMAGE_TEMPLATE14_MARK, w / 2, h * 0.91);
    }
    return canvasBlob(canvas);
  }

  // Templates 1 and 6
  const frameBg = templateId === 6 ? IMAGE_TEMPLATE6_FRAME_BG : '#FEFEFE';
  const textColor = templateId === 6 ? IMAGE_TEMPLATE6_TEXT_COLOR : '#2f2a31';
  ctx.fillStyle = frameBg;
  ctx.fillRect(0, 0, w, h);
  const fontSize = slide.isCover ? Math.round(w * 0.05) : Math.round(w * 0.046);
  try {
    await document.fonts.load(`bold ${fontSize}px "Comic Sans MS"`);
  } catch {
    /* fonts may already be ready */
  }
  ctx.font = `bold ${fontSize}px ${COMIC}`;
  ctx.fillStyle = textColor;
  const maxW = slide.leftAlign ? w * 0.76 : w * 0.78;
  const lines = wrapLines(ctx, slide.text, maxW);
  const lineHeight = fontSize * 1.25;
  if (slide.isCta) {
    const centerY = h * IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO;
    const x = w / 2;
    const block = drawWrappedBlock(ctx, lines, x, centerY, lineHeight, 'center');
    const promo = await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC);
    const labelSize = Math.round(h * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO * (4 / 3));
    const labelGap = h * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
    const layout = imageTemplate2Q5PromoLayout(w, h, block.bottom + labelSize + labelGap);
    ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
    ctx.font = `bold ${labelSize}px ${COMIC}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, w / 2, layout.y - labelGap);
  } else {
    const topY = h * 0.21;
    const x = slide.leftAlign ? w * 0.12 : w / 2;
    ctx.textAlign = slide.leftAlign ? 'left' : 'center';
    ctx.textBaseline = 'top';
    let y = topY;
    const maxBlockH = h * 0.36;
    for (const line of lines) {
      if (y - topY > maxBlockH) break;
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    if (slide.illustrationSrc) {
      const art = await loadImage(slide.illustrationSrc);
      const maxArtW = w * 0.48;
      const maxArtH = h * 0.28;
      const scale = Math.min(maxArtW / art.width, maxArtH / art.height);
      const artW = art.width * scale;
      const artH = art.height * scale;
      const artX = (w - artW) / 2;
      const artY = h * 0.87 - artH;
      ctx.drawImage(art, artX, artY, artW, artH);
    }
  }
  return canvasBlob(canvas);
}

export async function exportCopycatSlidesZip(options: {
  templateId: CopycatExportTemplateId;
  slides: CopycatExportSlide[];
  template14Color?: string;
}): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const color = options.template14Color ?? IMAGE_TEMPLATE14_COLORS[0]!;
  for (let i = 0; i < options.slides.length; i++) {
    const slide = options.slides[i]!;
    const blob = await paintSlide(options.templateId, slide, i, color);
    const name = i === 0 ? 'cover' : `q${i}`;
    zip.file(`template-${options.templateId}-${name}.png`, blob);
  }

  return zip.generateAsync({ type: 'blob', compression: 'STORE' });
}
