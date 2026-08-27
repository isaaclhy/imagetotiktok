import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import {
  TEMPLATE2_COVER_FONT_WEIGHT,
  TIKTOK_SANS_FAMILY,
  VIDEO_TEMPLATE2_CONTENT_MAX_WIDTH_RATIO,
  VIDEO_TEMPLATE2_DIM_OVERLAY,
  VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES,
  VIDEO_TEMPLATE2_TITLE_TOP_RATIO,
  videoTemplate2FooterFontSizePx,
  videoTemplate2QuestionFontSizePx,
  videoTemplate2SectionGapPx,
  videoTemplate2TitleFontSizePx,
  videoTemplate2TitleListGapPx,
} from '@/app/lib/video-template-2/overlay-metrics';

let fontRegistered = false;

function ensureTikTokSansFont(): void {
  if (fontRegistered) return;
  fontRegistered = true;

  const candidates = [
    'public/fonts/tiktok-sans/TikTokSans-700.ttf',
  ];

  for (const rel of candidates) {
    const fontPath = path.join(process.cwd(), rel);
    if (fs.existsSync(fontPath)) {
      GlobalFonts.registerFromPath(fontPath, TIKTOK_SANS_FAMILY);
      return;
    }
  }
}

function fontStack(): string {
  return `"${TIKTOK_SANS_FAMILY}", system-ui, -apple-system, sans-serif`;
}

function wrapTextLines(
  ctx: ReturnType<ReturnType<typeof createCanvas>['getContext']>,
  text: string,
  maxWidth: number
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawNaturalWhiteWrappedBlock(
  ctx: ReturnType<ReturnType<typeof createCanvas>['getContext']>,
  w: number,
  startY: number,
  text: string,
  options: { fontSizePx: number; maxWidthRatio?: number; lineHeightMult?: number }
): number {
  const trimmed = text.trim();
  if (!trimmed) return startY;

  const fontSize = options.fontSizePx;
  const maxWidth = w * (options.maxWidthRatio ?? VIDEO_TEMPLATE2_CONTENT_MAX_WIDTH_RATIO);
  const lineHeight = fontSize * (options.lineHeightMult ?? 1.16);
  ctx.font = `${TEMPLATE2_COVER_FONT_WEIGHT} ${fontSize}px ${fontStack()}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapTextLines(ctx, trimmed, maxWidth);
  if (lines.length === 0) return startY;

  const cx = w / 2;
  let y = startY + lineHeight / 2;
  for (const ln of lines) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
    ctx.shadowBlur = Math.max(6, fontSize * 0.14);
    ctx.shadowOffsetY = Math.max(1, fontSize * 0.04);
    ctx.fillText(ln, cx, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    y += lineHeight;
  }
  return y - lineHeight / 2 + lineHeight;
}

function drawVideoTemplate2Overlay(
  ctx: ReturnType<ReturnType<typeof createCanvas>['getContext']>,
  w: number,
  h: number,
  title: string,
  questions: string[]
): void {
  const titleFontSize = videoTemplate2TitleFontSizePx(h);
  const questionFontSize = videoTemplate2QuestionFontSizePx(h);
  const footerFontSize = videoTemplate2FooterFontSizePx(h);
  const questionLineHeightMult = 1.12;
  const footerLineHeightMult = 1.12;
  const questionGap = questionFontSize * 0.28;
  const titleListGap = videoTemplate2TitleListGapPx(h);
  const listFooterGap = videoTemplate2SectionGapPx(h);
  const maxWidthRatio = VIDEO_TEMPLATE2_CONTENT_MAX_WIDTH_RATIO;
  const maxWidth = w * maxWidthRatio;

  const questionEntries = questions
    .map((q, i) => {
      const text = `${i + 1}. ${q.trim()}`;
      ctx.font = `${TEMPLATE2_COVER_FONT_WEIGHT} ${questionFontSize}px ${fontStack()}`;
      return { text, lines: wrapTextLines(ctx, text, maxWidth) };
    })
    .filter((entry) => entry.lines.length > 0);

  const hasTitle = title.trim().length > 0;
  const hasQuestions = questionEntries.length > 0;
  const hasFooter = VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES.length > 0;

  let y = h * VIDEO_TEMPLATE2_TITLE_TOP_RATIO;

  if (hasTitle) {
    y = drawNaturalWhiteWrappedBlock(ctx, w, y, title, {
      fontSizePx: titleFontSize,
      maxWidthRatio,
    });
    if (hasQuestions || hasFooter) y += hasQuestions ? titleListGap : listFooterGap;
  }

  for (let i = 0; i < questionEntries.length; i++) {
    y = drawNaturalWhiteWrappedBlock(ctx, w, y, questionEntries[i]!.text, {
      fontSizePx: questionFontSize,
      lineHeightMult: questionLineHeightMult,
      maxWidthRatio,
    });
    if (i < questionEntries.length - 1) y += questionGap;
  }

  if (hasQuestions && hasFooter) y += listFooterGap;

  if (hasFooter) {
    for (const footerLine of VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES) {
      y = drawNaturalWhiteWrappedBlock(ctx, w, y, footerLine, {
        fontSizePx: footerFontSize,
        lineHeightMult: footerLineHeightMult,
        maxWidthRatio,
      });
    }
  }
}

/** Renders dim overlay + text as a PNG buffer sized to the video frame. */
export function renderVideoTemplate2OverlayPng(
  width: number,
  height: number,
  title: string,
  questions: string[]
): Buffer {
  ensureTikTokSansFont();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = VIDEO_TEMPLATE2_DIM_OVERLAY;
  ctx.fillRect(0, 0, width, height);
  drawVideoTemplate2Overlay(ctx, width, height, title, questions);

  return canvas.toBuffer('image/png');
}
