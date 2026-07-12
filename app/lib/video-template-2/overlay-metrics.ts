export const TEMPLATE2_COVER_FONT_WEIGHT = 700;
export const TIKTOK_SANS_FAMILY = 'TikTok Sans';

export const VIDEO_TEMPLATE2_TITLE_TOP_RATIO = 0.11;
export const VIDEO_TEMPLATE2_MAX_DURATION_SEC = 9;
export const VIDEO_TEMPLATE2_CONTENT_MAX_WIDTH_RATIO = 0.72;
export const VIDEO_TEMPLATE2_DIM_OVERLAY = 'rgba(0, 0, 0, 0.28)';

export const VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES = [
  'Search "Spill It - Couples Questions"',
  'for more questions',
] as const;

export function videoTemplate2TitleFontSizePx(frameH: number): number {
  return Math.max(40, Math.floor(frameH * 0.024));
}

export function videoTemplate2QuestionFontSizePx(frameH: number): number {
  return Math.max(28, Math.floor(frameH * 0.016));
}

export function videoTemplate2FooterFontSizePx(frameH: number): number {
  return Math.max(28, Math.floor(frameH * 0.017));
}

export function videoTemplate2SectionGapPx(frameH: number): number {
  return Math.max(48, Math.floor(frameH * 0.117));
}

export function videoTemplate2TitleListGapPx(frameH: number): number {
  return Math.max(32, Math.floor(frameH * 0.085));
}
