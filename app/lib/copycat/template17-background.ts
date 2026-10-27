import { IMAGE_TEMPLATE17_COVER_SRC } from '@/app/lib/image-template-17-split';
import backgroundIds from '@/app/lib/copycat/template17-background-ids.json';
import { stableCopycatQuestionId } from '@/app/lib/copycat/question-id';

/** Question ids that have a committed JPEG at `public/copycat-backgrounds/<id>.jpg`. */
export const TEMPLATE17_BACKGROUND_IDS: ReadonlySet<string> = new Set(backgroundIds as string[]);

export const COPYCAT_BACKGROUNDS_PUBLIC_DIR = '/copycat-backgrounds';

export function template17BackgroundUrl(questionId: string): string {
  return `${COPYCAT_BACKGROUNDS_PUBLIC_DIR}/${questionId}.jpg`;
}

/**
 * Background for one template 17 slide.
 * A question whose stable id is in the committed set uses that JPEG.
 * Covers and every other question keep the shared `template-17-cover.jpg`.
 */
export function template17BackgroundSrcForSlide(
  slide: { text: string; options?: string[] } | null | undefined
): string {
  if (!slide?.text.trim()) return IMAGE_TEMPLATE17_COVER_SRC;
  const id = stableCopycatQuestionId(slide.text, slide.options);
  if (!TEMPLATE17_BACKGROUND_IDS.has(id)) return IMAGE_TEMPLATE17_COVER_SRC;
  return template17BackgroundUrl(id);
}

/**
 * Tab to open after a new random post.
 * Cover is 0 and has no question id, so it always uses the shared photo.
 * Question tabs start at 1. Returns the first question that has its own JPEG,
 * or 0 when this post has none.
 */
export function template17TabForQuestions(
  slides: { text: string; options?: string[] }[] | null | undefined
): number {
  if (!slides?.length) return 0;
  const index = slides.findIndex(
    (slide) => template17BackgroundSrcForSlide(slide) !== IMAGE_TEMPLATE17_COVER_SRC
  );
  return index >= 0 ? index + 1 : 0;
}
