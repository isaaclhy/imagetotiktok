import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import { IMAGE_TEMPLATE2_PASTEL_COLORS, IMAGE_TEMPLATE2_TOP_LABEL } from '@/app/lib/constants';
import {
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_ASPECT,
  IMAGE_TEMPLATE2_Q5_PROMO_SRC,
  IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO,
  IMAGE_TEMPLATE2_Q5_TAB_INDEX,
  IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO,
  IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO,
  IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO,
  IMAGE_TEMPLATE2_TEXT_COLOR,
  imageTemplate2Q5PromoLayout,
} from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE6_FRAME_BG,
  IMAGE_TEMPLATE6_TEXT_COLOR,
} from '@/app/lib/image-template-6-kawaii';
import {
  IMAGE_TEMPLATE13_BG,
  IMAGE_TEMPLATE13_CONTENT_BOTTOM,
  IMAGE_TEMPLATE13_COVER_SIZE,
  IMAGE_TEMPLATE13_FONT_STACK,
  IMAGE_TEMPLATE13_FONT_WEIGHT,
  IMAGE_TEMPLATE13_LETTER_SPACING,
  IMAGE_TEMPLATE13_OPTION_GAP,
  IMAGE_TEMPLATE13_OPTION_SIZE,
  IMAGE_TEMPLATE13_OPTION_WEIGHT,
  IMAGE_TEMPLATE13_PROMO_LABEL_GAP,
  IMAGE_TEMPLATE13_PROMO_LABEL_SIZE,
  IMAGE_TEMPLATE13_PROMO_TEXT_GAP,
  IMAGE_TEMPLATE13_PROMO_VISIBLE,
  IMAGE_TEMPLATE13_QUESTION_SIZE,
  IMAGE_TEMPLATE13_SIDE_PAD,
  IMAGE_TEMPLATE13_TEXT,
  IMAGE_TEMPLATE13_TEXT_WIDTH,
  drawTemplate13ProgressBar,
  template13ContentTop,
  template13ProgressRatio,
} from '@/app/lib/image-template-13-cover';
import {
  IMAGE_TEMPLATE14_COLORS,
  IMAGE_TEMPLATE14_FONT_STACK,
  IMAGE_TEMPLATE14_GRAIN_SRC,
  IMAGE_TEMPLATE14_LINE_HEIGHT,
  IMAGE_TEMPLATE14_MARK_SIZE_RATIO,
  IMAGE_TEMPLATE14_MARK_Y_RATIO,
  IMAGE_TEMPLATE14_TEXT_MAX_WIDTH_RATIO,
  paintTemplate14Slide,
  template14CardRect,
  template14TextForBackground,
} from '@/app/lib/image-template-14-cards';
import {
  paintTemplate15Cover,
  paintTemplate15QuestionCard,
} from '@/app/lib/image-template-15-cards';
import {
  IMAGE_TEMPLATE16_CTA_TAB,
  IMAGE_TEMPLATE16_ICON_SRC,
  paintTemplate16Slide,
} from '@/app/lib/image-template-16-notes';
import {
  IMAGE_TEMPLATE17_COVER_SRC,
  IMAGE_TEMPLATE17_ICON_SRC,
  IMAGE_TEMPLATE17_OPTION_WEIGHT,
  IMAGE_TEMPLATE17_TITLE_WEIGHT,
  paintTemplate17Slide,
  template17CanvasFontStack,
  template17PrimaryFontFamily,
} from '@/app/lib/image-template-17-split';
import {
  IMAGE_TEMPLATE18_DEFAULT_STYLE,
  IMAGE_TEMPLATE18_FONT_WEIGHT,
  paintTemplate18Slide,
  type Template18PastelTone,
  type Template18StyleId,
} from '@/app/lib/image-template-18-pastel';
import {
  IMAGE_TEMPLATE19_FONT_STACK,
  IMAGE_TEMPLATE19_LABEL_FONT_STACK,
  paintTemplate19Slide,
} from '@/app/lib/image-template-19-glow';
import {
  IMAGE_TEMPLATE20_FONT_STACK,
  IMAGE_TEMPLATE20_FOOTER_FONT_STACK,
  paintTemplate20Slide,
} from '@/app/lib/image-template-20-ocean';

const TIKTOK = '"TikTok Sans", system-ui, sans-serif';
const COMIC =
  '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif';
const COPYCAT_APP_NAME = 'Spill It';
const COPYCAT_COVER_HEARTS = '♥ ♥ ♥';
const COPYCAT_TEXT_ONLY_COVER_TOP = 0.38;
const COPYCAT_TEXT_ONLY_COVER_SIZE_T2 = 0.074;
const COPYCAT_TEXT_ONLY_COVER_SIZE_T14 = 0.088;

function drawCopycatAppMark(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  markY: number,
  options: {
    isCover: boolean;
    color: string;
    font: string;
    textBaseline?: CanvasTextBaseline;
    heartsLetterSpacing?: string;
  }
) {
  const { isCover, color, font } = options;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = options.textBaseline ?? 'middle';
  if (isCover) {
    const heartSize = Math.round(frameWidth * 0.036);
    ctx.font = `400 ${heartSize}px ${TIKTOK}`;
    ctx.letterSpacing = options.heartsLetterSpacing ?? '0.12em';
    ctx.fillText(COPYCAT_COVER_HEARTS, frameWidth / 2, markY - heartSize * 1.35);
    ctx.letterSpacing = '0px';
  }
  ctx.font = font;
  ctx.fillText(COPYCAT_APP_NAME, frameWidth / 2, markY);
}

export type CopycatExportTemplateId = 1 | 2 | 6 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export type CopycatExportSlide = {
  text: string;
  leftAlign: boolean;
  illustrationSrc?: string;
  isCta: boolean;
  isCover: boolean;
  /** Template 17 photo URL. Same path the preview uses. Covers omit it and use the shared cover. */
  backgroundSrc?: string;
};

function concreteFontFamily(stack: string): string {
  const probe = document.createElement('span');
  probe.style.fontFamily = stack;
  probe.style.position = 'absolute';
  probe.style.left = '-9999px';
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || stack;
}

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
  align: 'center' | 'left',
  paintLine?: (line: string, index: number) => void
) {
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const blockH = lines.length * lineHeight;
  let y = centerY - blockH / 2 + lineHeight / 2;
  lines.forEach((line, index) => {
    paintLine?.(line, index);
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
  return { top: centerY - blockH / 2, bottom: centerY + blockH / 2 };
}

function frameSize(_templateId: CopycatExportTemplateId): { w: number; h: number } {
  return { w: 1080, h: 1440 };
}

async function paintSlide(
  templateId: CopycatExportTemplateId,
  slide: CopycatExportSlide,
  tabIndex: number,
  template14Color: string,
  template15FrameBg?: string,
  slideCount = 6,
  template18?: {
    style: Template18StyleId;
    scanlines: boolean;
    pastelSlides?: readonly Template18PastelTone[];
  }
): Promise<Blob> {
  const { w, h } = frameSize(templateId);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to prepare canvas');

  if (templateId === 20) {
    const serif = concreteFontFamily(IMAGE_TEMPLATE20_FONT_STACK);
    const footer = concreteFontFamily(IMAGE_TEMPLATE20_FOOTER_FONT_STACK);
    try {
      await document.fonts.load(`400 72px ${serif}`);
      await document.fonts.load(`700 96px ${serif}`);
      await document.fonts.load(`600 40px ${footer}`);
    } catch {
      /* fonts may already be ready */
    }
    const promo = slide.isCta ? await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC) : null;
    paintTemplate20Slide(ctx, w, h, {
      text: slide.text,
      fontFamily: serif,
      footerFontFamily: footer,
      isCover: slide.isCover,
      isCta: slide.isCta,
      promo,
    });
    return canvasBlob(canvas);
  }

  if (templateId === 19) {
    const serif = concreteFontFamily(IMAGE_TEMPLATE19_FONT_STACK);
    const label = concreteFontFamily(IMAGE_TEMPLATE19_LABEL_FONT_STACK);
    try {
      await document.fonts.load(`400 96px ${serif}`);
      await document.fonts.load(`600 40px ${label}`);
      await document.fonts.load(`700 48px ${label}`);
    } catch {
      /* fonts may already be ready */
    }
    const promo = slide.isCta ? await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC) : null;
    paintTemplate19Slide(ctx, w, h, {
      text: slide.text,
      fontFamily: serif,
      labelFontFamily: label,
      isCover: slide.isCover,
      isCta: slide.isCta,
      promo,
    });
    return canvasBlob(canvas);
  }

  if (templateId === 17) {
    const family = template17PrimaryFontFamily();
    const fontFamily = template17CanvasFontStack(family);
    try {
      await document.fonts.load(`${IMAGE_TEMPLATE17_TITLE_WEIGHT} 72px "${family}"`);
      await document.fonts.load(`${IMAGE_TEMPLATE17_OPTION_WEIGHT} 48px "${family}"`);
      await document.fonts.load(`600 28px "${family}"`);
    } catch {
      /* fonts may already be ready */
    }
    const backgroundSrc = slide.backgroundSrc || IMAGE_TEMPLATE17_COVER_SRC;
    const [icon, image] = await Promise.all([
      loadImage(IMAGE_TEMPLATE17_ICON_SRC),
      loadImage(backgroundSrc).catch(() =>
        backgroundSrc === IMAGE_TEMPLATE17_COVER_SRC
          ? Promise.reject(new Error(`Failed to load ${backgroundSrc}`))
          : loadImage(IMAGE_TEMPLATE17_COVER_SRC)
      ),
    ]);
    paintTemplate17Slide(ctx, w, h, { text: slide.text, icon, image, fontFamily });
    return canvasBlob(canvas);
  }

  if (templateId === 18) {
    try {
      await document.fonts.load(`${IMAGE_TEMPLATE18_FONT_WEIGHT} 72px "Liberation Serif"`);
      await document.fonts.load(`italic ${IMAGE_TEMPLATE18_FONT_WEIGHT} 72px "Liberation Serif"`);
      await document.fonts.load(`${IMAGE_TEMPLATE18_FONT_WEIGHT} 72px "Libre Baskerville"`);
      await document.fonts.load('600 36px "Poppins"');
      await document.fonts.load('700 36px "TikTok Sans"');
    } catch {
      /* fonts may already be ready */
    }
    const promo = slide.isCta ? await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC) : null;
    paintTemplate18Slide(ctx, w, h, {
      text: slide.text,
      tabIndex,
      slideCount,
      isCta: slide.isCta,
      promo,
      style: template18?.style ?? IMAGE_TEMPLATE18_DEFAULT_STYLE,
      scanlines: template18?.scanlines ?? true,
      pastelSlides: template18?.pastelSlides,
    });
    return canvasBlob(canvas);
  }

  if (templateId === 16) {
    const icon = await loadImage(IMAGE_TEMPLATE16_ICON_SRC);
    const promo = slide.isCta ? await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC) : null;
    paintTemplate16Slide(ctx, w, h, {
      text: slide.text,
      tabIndex: slide.isCover ? 0 : slide.isCta ? IMAGE_TEMPLATE16_CTA_TAB : Math.max(1, tabIndex),
      icon,
      promo,
      questionCount: Math.max(1, slideCount - 1),
    });
    return canvasBlob(canvas);
  }

  if (templateId === 15) {
    try {
      await document.fonts.load(`400 40px "Playfair Display"`);
      await document.fonts.load(`500 72px "Playfair Display"`);
      await document.fonts.load(`700 36px "Playfair Display"`);
    } catch {
      /* fonts may already be ready */
    }
    if (slide.isCover) {
      const cover = slide.illustrationSrc ? await loadImage(slide.illustrationSrc) : null;
      paintTemplate15Cover(ctx, w, h, { image: cover, text: slide.text });
    } else {
      const promo = slide.isCta ? await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC) : null;
      paintTemplate15QuestionCard(ctx, w, h, {
        text: slide.text,
        isCta: slide.isCta,
        promo,
        frameBg: template15FrameBg,
      });
    }
    return canvasBlob(canvas);
  }

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
    if (slide.isCover) {
      // Card + grain + mark only; title drawn higher/larger for text-only covers.
      paintTemplate14Slide(ctx, w, h, {
        backgroundColor: template14Color,
        text: '',
        tabIndex: 1,
        grain,
        promo: null,
        skipMark: true,
      });
      const card = template14CardRect(w, h);
      const textColor = template14TextForBackground(template14Color);
      const fontSize = Math.round(w * COPYCAT_TEXT_ONLY_COVER_SIZE_T14);
      ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE14_FONT_STACK}`;
      ctx.fillStyle = textColor;
      const lines = wrapLines(ctx, slide.text, card.width * IMAGE_TEMPLATE14_TEXT_MAX_WIDTH_RATIO);
      drawWrappedBlock(
        ctx,
        lines,
        w / 2,
        card.y + card.height * COPYCAT_TEXT_ONLY_COVER_TOP,
        fontSize * IMAGE_TEMPLATE14_LINE_HEIGHT,
        'center'
      );
      const markY = card.y + card.height * IMAGE_TEMPLATE14_MARK_Y_RATIO;
      const markSize = Math.round(w * IMAGE_TEMPLATE14_MARK_SIZE_RATIO);
      drawCopycatAppMark(ctx, w, markY, {
        isCover: true,
        color: textColor,
        font: `400 ${markSize}px "Libre Baskerville", Georgia, serif`,
      });
    } else {
      paintTemplate14Slide(ctx, w, h, {
        backgroundColor: template14Color,
        text: slide.text,
        tabIndex: slide.isCta ? IMAGE_TEMPLATE2_Q5_TAB_INDEX : 1,
        grain,
        promo,
        leftAlign: slide.leftAlign,
        skipMark: !slide.isCta,
      });
      if (!slide.isCta) {
        const card = template14CardRect(w, h);
        const markY = card.y + card.height * IMAGE_TEMPLATE14_MARK_Y_RATIO;
        const markSize = Math.round(w * IMAGE_TEMPLATE14_MARK_SIZE_RATIO);
        drawCopycatAppMark(ctx, w, markY, {
          isCover: false,
          color: template14TextForBackground(template14Color),
          font: `400 ${markSize}px "Libre Baskerville", Georgia, serif`,
        });
      }
    }
    return canvasBlob(canvas);
  }

  if (templateId === 13) {
    ctx.fillStyle = IMAGE_TEMPLATE13_BG;
    ctx.fillRect(0, 0, w, h);
    drawTemplate13ProgressBar(ctx, w, h, template13ProgressRatio(tabIndex, slideCount));
    try {
      await document.fonts.load(`${IMAGE_TEMPLATE13_FONT_WEIGHT} 52px "Playfair Display"`);
      await document.fonts.load(`${IMAGE_TEMPLATE13_OPTION_WEIGHT} 52px "Playfair Display"`);
    } catch {
      /* fonts may already be ready */
    }
    {
      const fontSize = slide.isCover
        ? Math.round(w * IMAGE_TEMPLATE13_COVER_SIZE)
        : Math.round(w * IMAGE_TEMPLATE13_QUESTION_SIZE);
      const optionSize = Math.round(w * IMAGE_TEMPLATE13_OPTION_SIZE);
      const questionFont = `${IMAGE_TEMPLATE13_FONT_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE13_FONT_STACK}`;
      const optionFont = `${IMAGE_TEMPLATE13_OPTION_WEIGHT} ${optionSize}px ${IMAGE_TEMPLATE13_FONT_STACK}`;
      ctx.letterSpacing = IMAGE_TEMPLATE13_LETTER_SPACING;
      ctx.fillStyle = IMAGE_TEMPLATE13_TEXT;
      const maxW = w * IMAGE_TEMPLATE13_TEXT_WIDTH;
      const { question, options } = slide.isCover
        ? { question: slide.text, options: '' }
        : splitCopycatQuestionAndOptions(slide.text);
      ctx.font = questionFont;
      const questionLines = wrapLines(ctx, question, maxW);
      ctx.font = optionFont;
      const optionLines = options ? wrapLines(ctx, options, maxW) : [];
      const questionLineH = fontSize * 1.3;
      const optionLineH = optionSize * 1.35;
      const gap = optionLines.length ? questionLineH * IMAGE_TEMPLATE13_OPTION_GAP : 0;
      const textH =
        questionLines.length * questionLineH + gap + optionLines.length * optionLineH;
      const promoLabelSize = Math.round(w * IMAGE_TEMPLATE13_PROMO_LABEL_SIZE);
      const promoLabelGap = w * IMAGE_TEMPLATE13_PROMO_LABEL_GAP;
      const promoW = w * IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO;
      const promoH = promoW / IMAGE_TEMPLATE2_Q5_PROMO_ASPECT;
      const promoDefaultY = h * (1 - IMAGE_TEMPLATE13_PROMO_VISIBLE);
      const promoReserve =
        promoLabelSize + promoLabelGap + h * IMAGE_TEMPLATE13_PROMO_TEXT_GAP;
      const blockH = textH;
      const alignLeft = slide.leftAlign && optionLines.length > 0;
      const x = alignLeft ? w * IMAGE_TEMPLATE13_SIDE_PAD : w / 2;
      const minTop = template13ContentTop(h);
      const maxBottom = slide.isCta
        ? promoDefaultY - promoReserve
        : h * IMAGE_TEMPLATE13_CONTENT_BOTTOM;
      let top = h * COPYCAT_TEXT_ONLY_COVER_TOP - blockH / 2;
      if (top + blockH > maxBottom) top = maxBottom - blockH;
      if (top < minTop) top = minTop;
      ctx.textAlign = alignLeft ? 'left' : 'center';
      ctx.textBaseline = 'middle';
      let y = top;
      ctx.font = questionFont;
      for (const line of questionLines) {
        ctx.fillText(line, x, y + questionLineH / 2);
        y += questionLineH;
      }
      y += gap;
      ctx.font = optionFont;
      for (const line of optionLines) {
        ctx.fillText(line, x, y + optionLineH / 2);
        y += optionLineH;
      }
      ctx.letterSpacing = '0px';
      if (slide.isCta) {
        const promo = await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC);
        const promoY = Math.max(promoDefaultY, y + promoReserve);
        ctx.drawImage(promo, (w - promoW) / 2, promoY, promoW, promoH);
        ctx.font = `700 ${promoLabelSize}px ${TIKTOK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, w / 2, promoY - promoLabelGap);
      } else {
        drawCopycatAppMark(ctx, w, h * 0.91, {
          isCover: slide.isCover,
          color: 'rgba(255,255,255,0.95)',
          font: `600 ${Math.round(w * 0.032)}px ${TIKTOK}`,
          textBaseline: 'bottom',
        });
      }
    }
    return canvasBlob(canvas);
  }

  if (templateId === 2) {
    const bg =
      IMAGE_TEMPLATE2_PASTEL_COLORS[tabIndex % IMAGE_TEMPLATE2_PASTEL_COLORS.length]!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
    ctx.font = `700 ${Math.round(w * 0.03)}px ${TIKTOK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(IMAGE_TEMPLATE2_TOP_LABEL, w / 2, h * 0.08);
    try {
      await document.fonts.load(`800 ${Math.round(w * 0.062)}px "TikTok Sans"`);
      await document.fonts.load(`500 ${Math.round(w * 0.062)}px "TikTok Sans"`);
    } catch {
      /* fonts may already be ready */
    }
    const fontSize = slide.isCover
      ? Math.round(w * COPYCAT_TEXT_ONLY_COVER_SIZE_T2)
      : Math.round(w * IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO);
    const questionFont = `800 ${fontSize}px ${TIKTOK}`;
    const optionFont = `500 ${fontSize}px ${TIKTOK}`;
    ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
    const maxW = slide.leftAlign ? w * 0.76 : w * 0.6;
    const { question, options } = splitCopycatQuestionAndOptions(slide.text);
    ctx.font = questionFont;
    const questionLines = wrapLines(ctx, question, maxW);
    ctx.font = optionFont;
    const optionLines = options ? ['', ...wrapLines(ctx, options, maxW)] : [];
    const lines = [...questionLines, ...optionLines];
    const questionLineCount = questionLines.length;
    const lineHeight = fontSize * 1.2;
    const centerY =
      h *
      (slide.isCover
          ? COPYCAT_TEXT_ONLY_COVER_TOP
          : IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO);
    const x = slide.leftAlign ? w * 0.12 : w / 2;
    const block = drawWrappedBlock(
      ctx,
      lines,
      x,
      centerY,
      lineHeight,
      slide.leftAlign ? 'left' : 'center',
      (_line, index) => {
        ctx.font = index < questionLineCount ? questionFont : optionFont;
      }
    );
    if (slide.isCta) {
      const promo = await loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC);
      const labelSize = Math.round(h * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO);
      const labelGap = h * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
      const layout = imageTemplate2Q5PromoLayout(w, h, block.bottom + labelSize + labelGap);
      ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
      ctx.font = `700 ${labelSize}px ${TIKTOK}`;
      ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(IMAGE_TEMPLATE2_Q5_PROMO_LABEL, w / 2, layout.y - labelGap);
    } else {
      drawCopycatAppMark(ctx, w, h * 0.91, {
        isCover: slide.isCover,
        color: IMAGE_TEMPLATE2_TEXT_COLOR,
        font: `700 ${Math.round(w * 0.03)}px ${TIKTOK}`,
        textBaseline: 'bottom',
        heartsLetterSpacing: '0.02em',
      });
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
    const align = slide.leftAlign ? 'left' : 'center';
    const x = slide.leftAlign ? w * 0.12 : w / 2;
    let centerY = h * (slide.leftAlign ? 0.36 : IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO);
    const blockH = lines.length * lineHeight;
    const maxBottom =
      h * (1 - IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO) - h * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO * 2;
    if (centerY + blockH / 2 > maxBottom) {
      centerY = Math.max(h * 0.2, maxBottom - blockH / 2);
    }
    const block = drawWrappedBlock(ctx, lines, x, centerY, lineHeight, align);
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
      if (slide.isCover) {
        const heartSize = Math.round(w * 0.044);
        ctx.fillStyle = '#000000';
        ctx.font = `${heartSize}px ${TIKTOK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const gap = heartSize * 0.72;
        const startX = w / 2 - gap;
        for (let i = 0; i < 3; i++) {
          ctx.fillText('♥', startX + i * gap, artY - heartSize * 0.2);
        }
      }
      ctx.drawImage(art, artX, artY, artW, artH);
    }
  }
  return canvasBlob(canvas);
}

export async function exportCopycatSlidesZip(options: {
  templateId: CopycatExportTemplateId;
  slides: CopycatExportSlide[];
  template14Color?: string;
  template15FrameBg?: string;
  template18Style?: Template18StyleId;
  template18Scanlines?: boolean;
  template18PastelSlides?: readonly Template18PastelTone[];
}): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const color = options.template14Color ?? IMAGE_TEMPLATE14_COLORS[0]!;
  for (let i = 0; i < options.slides.length; i++) {
    const slide = options.slides[i]!;
    const blob = await paintSlide(
      options.templateId,
      slide,
      i,
      color,
      options.template15FrameBg,
      options.slides.length,
      {
        style: options.template18Style ?? IMAGE_TEMPLATE18_DEFAULT_STYLE,
        scanlines: options.template18Scanlines ?? true,
        pastelSlides: options.template18PastelSlides,
      }
    );
    const name = i === 0 ? 'cover' : `q${i}`;
    zip.file(`template-${options.templateId}-${name}.png`, blob);
  }

  return zip.generateAsync({ type: 'blob', compression: 'STORE' });
}
