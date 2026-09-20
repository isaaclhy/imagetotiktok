/** Dark luxury romantic grade for celebrity couples preview `<img>`s. */
export const IMAGE_TEMPLATE11_CSS_FILTER =
  'brightness(0.82) contrast(1.18) saturate(0.78) sepia(0.22)';

/**
 * Canvas grade after the photo is drawn — deep shadows, soft gold wash, heavy vignette.
 * Pair with `ctx.filter = IMAGE_TEMPLATE11_CSS_FILTER` while drawing the photo.
 */
export function drawImageTemplate11LuxuryOverlay(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number
) {
  // Deep cool-black crush
  ctx.fillStyle = 'rgba(8, 4, 10, 0.22)';
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  // Subtle champagne / rose gold wash through the midtones
  const wash = ctx.createLinearGradient(0, 0, frameWidth, frameHeight);
  wash.addColorStop(0, 'rgba(120, 70, 50, 0.1)');
  wash.addColorStop(0.45, 'rgba(90, 40, 55, 0.06)');
  wash.addColorStop(1, 'rgba(40, 20, 50, 0.12)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  // Soft center glow so faces stay readable
  const bloom = ctx.createRadialGradient(
    frameWidth * 0.5,
    frameHeight * 0.42,
    0,
    frameWidth * 0.5,
    frameHeight * 0.42,
    Math.max(frameWidth, frameHeight) * 0.42
  );
  bloom.addColorStop(0, 'rgba(255, 210, 180, 0.07)');
  bloom.addColorStop(0.55, 'rgba(180, 120, 100, 0.02)');
  bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  // Heavy romantic vignette
  const vignette = ctx.createRadialGradient(
    frameWidth * 0.5,
    frameHeight * 0.44,
    Math.min(frameWidth, frameHeight) * 0.12,
    frameWidth * 0.5,
    frameHeight * 0.44,
    Math.max(frameWidth, frameHeight) * 0.82
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.45, 'rgba(20, 8, 16, 0.12)');
  vignette.addColorStop(0.75, 'rgba(10, 4, 12, 0.38)');
  vignette.addColorStop(1, 'rgba(4, 1, 6, 0.62)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, frameWidth, frameHeight);
}
