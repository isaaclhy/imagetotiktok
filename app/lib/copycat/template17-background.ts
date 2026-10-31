import { IMAGE_TEMPLATE17_COVER_SRC } from '@/app/lib/image-template-17-split';
import backgroundIds from '@/app/lib/copycat/template17-background-ids.json';
import { sha256Hex, stableCopycatQuestionId } from '@/app/lib/copycat/question-id';

type Template17QuestionSlide = { text: string; options?: string[] };

/**
 * Question ids that have a committed JPEG at `public/copycat-backgrounds/<id>.jpg`.
 * Sorted so fallback slots stay put if the JSON array is reordered.
 */
const TEMPLATE17_BACKGROUND_POOL: readonly string[] = Object.freeze(
  [...new Set(backgroundIds as string[])].sort()
);

/** Question ids that have a committed JPEG at `public/copycat-backgrounds/<id>.jpg`. */
export const TEMPLATE17_BACKGROUND_IDS: ReadonlySet<string> = new Set(TEMPLATE17_BACKGROUND_POOL);

export const COPYCAT_BACKGROUNDS_PUBLIC_DIR = '/copycat-backgrounds';

export function template17BackgroundUrl(questionId: string): string {
  return `${COPYCAT_BACKGROUNDS_PUBLIC_DIR}/${questionId}.jpg`;
}

/** Even slot in the committed photo pool. Stable for a given question id. */
function fallbackPoolSlot(questionId: string): number {
  const size = TEMPLATE17_BACKGROUND_POOL.length;
  const n = Number.parseInt(sha256Hex(questionId).slice(0, 10), 16);
  return n % size;
}

function fallbackBackgroundUrl(questionId: string, avoidUrls: readonly string[]): string {
  const size = TEMPLATE17_BACKGROUND_POOL.length;
  if (size === 0) return IMAGE_TEMPLATE17_COVER_SRC;
  const avoid = new Set(avoidUrls);
  let slot = fallbackPoolSlot(questionId);
  let url = template17BackgroundUrl(TEMPLATE17_BACKGROUND_POOL[slot]!);
  let guard = 0;
  while (avoid.has(url) && guard < size - 1) {
    slot = (slot + 1) % size;
    url = template17BackgroundUrl(TEMPLATE17_BACKGROUND_POOL[slot]!);
    guard += 1;
  }
  return url;
}

function dedicatedUrl(slide: Template17QuestionSlide | null | undefined): string | undefined {
  if (!slide?.text.trim()) return undefined;
  const id = stableCopycatQuestionId(slide.text, slide.options);
  if (!TEMPLATE17_BACKGROUND_IDS.has(id)) return undefined;
  return template17BackgroundUrl(id);
}

function backgroundForQuestion(
  slide: Template17QuestionSlide,
  previousUrl?: string,
  nextSlide?: Template17QuestionSlide
): string {
  if (!slide.text.trim()) return IMAGE_TEMPLATE17_COVER_SRC;
  const own = dedicatedUrl(slide);
  if (own) return own;
  const id = stableCopycatQuestionId(slide.text, slide.options);
  const avoid: string[] = [];
  if (previousUrl) avoid.push(previousUrl);
  const nextDedicated = dedicatedUrl(nextSlide);
  if (nextDedicated) avoid.push(nextDedicated);
  return fallbackBackgroundUrl(id, avoid);
}

/**
 * Background for one template 17 slide.
 * A question whose stable id is in the committed set uses that JPEG.
 * Any other question takes a photo from that same set, chosen by a stable
 * hash of its id. Pass the neighboring questions in this post so a fallback
 * photo is not repeated on the previous or next slide. Covers (no question)
 * keep the shared `template-17-cover.jpg`.
 */
export function template17BackgroundSrcForSlide(
  slide: Template17QuestionSlide | null | undefined,
  earlierSlides?: readonly Template17QuestionSlide[],
  laterSlides?: readonly Template17QuestionSlide[]
): string {
  if (!slide?.text.trim()) return IMAGE_TEMPLATE17_COVER_SRC;
  const chain = [...(earlierSlides ?? []), slide];
  let previousUrl: string | undefined;
  let resolved = IMAGE_TEMPLATE17_COVER_SRC;
  for (let i = 0; i < chain.length; i++) {
    const next = i + 1 < chain.length ? chain[i + 1] : laterSlides?.[0];
    resolved = backgroundForQuestion(chain[i]!, previousUrl, next);
    previousUrl = resolved;
  }
  return resolved;
}

/**
 * Photo for carousel index `slideIndex` (0 is the cover).
 * Preview and export both use this so neighboring fallback photos stay apart.
 */
export function template17BackgroundSrcAt(
  questionSlides: readonly Template17QuestionSlide[],
  slideIndex: number
): string {
  if (slideIndex <= 0) return template17BackgroundSrcForSlide(undefined);
  const questionIndex = slideIndex - 1;
  return template17BackgroundSrcForSlide(
    questionSlides[questionIndex],
    questionSlides.slice(0, questionIndex),
    questionSlides.slice(questionIndex + 1)
  );
}

/**
 * Tab to open after a new random post.
 * Cover is 0 and has no question id, so it always uses the shared photo.
 * Question tabs start at 1. Returns the first question that has a photo,
 * or 0 when this post has none.
 */
export function template17TabForQuestions(
  slides: Template17QuestionSlide[] | null | undefined
): number {
  if (!slides?.length) return 0;
  const index = slides.findIndex(
    (slide) => template17BackgroundSrcForSlide(slide) !== IMAGE_TEMPLATE17_COVER_SRC
  );
  return index >= 0 ? index + 1 : 0;
}
