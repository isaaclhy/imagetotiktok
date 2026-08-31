import { extractAverageColor } from '@/app/lib/canvas-utils';
import { COUPLES_NATURE_VIDEO_FILTER, VIDEO_TEMPLATE2_HIGHLIGHT_BACKGROUND } from '@/app/lib/constants';
import { VIDEO_TEMPLATE2_DIM_OVERLAY } from '@/app/lib/video-template-2/overlay-metrics';

const DIM_OVERLAY_ALPHA = Number(VIDEO_TEMPLATE2_DIM_OVERLAY.match(/[\d.]+$/)?.[0] ?? 0.38);

/**
 * Sample the graded + dimmed video tone for complementary title highlights.
 * Pexels Videos API has no avg_color — only a poster `image` URL — so we
 * derive it client-side from that thumbnail.
 */
export async function sampleCouplesNatureHighlightBackground(
  posterUrl: string | null | undefined
): Promise<string> {
  if (!posterUrl?.trim()) return VIDEO_TEMPLATE2_HIGHLIGHT_BACKGROUND;
  const sampled = await extractAverageColor(posterUrl, {
    cssFilter: COUPLES_NATURE_VIDEO_FILTER,
    dimOverlay: DIM_OVERLAY_ALPHA,
  });
  return sampled ?? VIDEO_TEMPLATE2_HIGHLIGHT_BACKGROUND;
}
