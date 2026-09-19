/** Centered cover title like Template 2, but half the frame wide. */
export const IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO = 0.5;

/** Q5 top-middle CTA — search prompt for more questions. */
export const IMAGE_TEMPLATE8_Q5_SEARCH_LINES = [
  'Download for more fun questions!',
] as const;
export const IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO = 0.16;
export const IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO = 0.036;
export const IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT = 1.25;
export const IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT = 600;

/** App Store-style banner under the Q5 search copy. */
export const IMAGE_TEMPLATE8_Q5_BANNER_SRC =
  '/image-templates/template-8-q5-app-banner.png';
export const IMAGE_TEMPLATE8_Q5_BANNER_ASPECT = 888 / 256;
export const IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO = 0.88;
export const IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO = 0.04;
/** Corner radius as a fraction of banner height. */
export const IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO = 0.14;

export function imageTemplate8Q5SearchBlockHeight(frameWidth: number): number {
  const fontSize = frameWidth * IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO;
  return (
    IMAGE_TEMPLATE8_Q5_SEARCH_LINES.length *
    fontSize *
    IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT
  );
}

export function imageTemplate8Q5BannerLayout(
  frameWidth: number,
  frameHeight: number
): { x: number; y: number; width: number; height: number } {
  const width = frameWidth * IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO;
  const height = width / IMAGE_TEMPLATE8_Q5_BANNER_ASPECT;
  const searchBottom =
    frameHeight * IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO +
    imageTemplate8Q5SearchBlockHeight(frameWidth);
  const y = searchBottom + frameHeight * IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO;
  return { x: (frameWidth - width) / 2, y, width, height };
}

export function drawImageTemplate8Q5SearchLabel(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  fontFamily: string
) {
  const fontSize = Math.round(frameWidth * IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO);
  const lineHeight = fontSize * IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT;
  let y = frameHeight * IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO;
  ctx.save();
  ctx.font = `${IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.max(4, frameWidth * 0.008);
  for (const line of IMAGE_TEMPLATE8_Q5_SEARCH_LINES) {
    ctx.fillText(line, frameWidth / 2, y);
    y += lineHeight;
  }
  ctx.restore();
}

export function drawImageTemplate8Q5Banner(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  banner: CanvasImageSource
) {
  const layout = imageTemplate8Q5BannerLayout(frameWidth, frameHeight);
  const radius = layout.height * IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(layout.x, layout.y, layout.width, layout.height, radius);
  ctx.clip();
  ctx.drawImage(banner, layout.x, layout.y, layout.width, layout.height);
  ctx.restore();
}
