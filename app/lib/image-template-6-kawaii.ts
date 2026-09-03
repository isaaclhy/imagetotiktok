import { IMAGE_TEMPLATE2_Q5_TAB_INDEX } from '@/app/lib/image-template-2-cover';

/** Soft-pink kawaii bear illustrations for Template 6. */
export const IMAGE_TEMPLATE6_BEAR_SRCS = [
  '/image-templates/template-6-bear.png',
  '/image-templates/template-6-bear-2.png',
  '/image-templates/template-6-bear-3.png',
  '/image-templates/template-6-bear-4.png',
  '/image-templates/template-6-bear-5.png',
  '/image-templates/template-6-bear-6.png',
  '/image-templates/template-6-bear-7.png',
  '/image-templates/template-6-bear-8.png',
  '/image-templates/template-6-bear-9.png',
  '/image-templates/template-6-bear-10.png',
  '/image-templates/template-6-bear-11.png',
  '/image-templates/template-6-bear-12.png',
  '/image-templates/template-6-bear-13.png',
  '/image-templates/template-6-bear-14.png',
  '/image-templates/template-6-bear-15.png',
  '/image-templates/template-6-bear-16.png',
  '/image-templates/template-6-bear-17.png',
  '/image-templates/template-6-bear-18.png',
  '/image-templates/template-6-bear-19.png',
  '/image-templates/template-6-bear-20.png',
  '/image-templates/template-6-bear-21.png',
  '/image-templates/template-6-bear-22.png',
  '/image-templates/template-6-bear-23.png',
  '/image-templates/template-6-bear-24.png',
  '/image-templates/template-6-bear-25.png',
  '/image-templates/template-6-bear-26.png',
  '/image-templates/template-6-bear-27.png',
  '/image-templates/template-6-bear-28.png',
  '/image-templates/template-6-bear-29.png',
  '/image-templates/template-6-bear-30.png',
  '/image-templates/template-6-bear-31.png',
  '/image-templates/template-6-bear-32.png',
  '/image-templates/template-6-bear-33.png',
  '/image-templates/template-6-bear-34.png',
  '/image-templates/template-6-bear-35.png',
  '/image-templates/template-6-bear-36.png',
  '/image-templates/template-6-bear-37.png',
  '/image-templates/template-6-bear-38.png',
  '/image-templates/template-6-bear-39.png',
  '/image-templates/template-6-bear-40.png',
  '/image-templates/template-6-bear-41.png',
  '/image-templates/template-6-bear-42.png',
  '/image-templates/template-6-bear-43.png',
  '/image-templates/template-6-bear-44.png',
  '/image-templates/template-6-bear-45.png',
  '/image-templates/template-6-bear-46.png',
  '/image-templates/template-6-bear-47.png',
] as const;

/** Default / picker thumbnail. */
export const IMAGE_TEMPLATE6_BEAR_SRC = IMAGE_TEMPLATE6_BEAR_SRCS[0];

/** Matches the blush pink baked into the bear art. */
export const IMAGE_TEMPLATE6_FRAME_BG = '#FEF2F6';

/** Title/body ink — same charcoal as Template 1. */
export const IMAGE_TEMPLATE6_TEXT_COLOR = '#2f2a31';

/** Marker swipe — sampled from the bear’s tan fur. */
export const IMAGE_TEMPLATE6_HIGHLIGHT_COLOR = '#E6BD91';

function shuffleCopy<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function pickBearUrlsWithoutReuse(pool: readonly string[], count: number): string[] {
  if (pool.length === 0) return Array.from({ length: count }, () => '');
  const picked: string[] = [];
  let deck: string[] = [];
  for (let i = 0; i < count; i++) {
    if (deck.length === 0) deck = shuffleCopy(pool);
    picked.push(deck.pop()!);
  }
  return picked;
}

function isTemplate6BearUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  return (IMAGE_TEMPLATE6_BEAR_SRCS as readonly string[]).includes(url);
}

/** Cover + Q1–Q4 each get a bear; Q5 is promo-only. No CTA slide. */
export function buildTemplate6TabImageSources(): string[] {
  const bears = pickBearUrlsWithoutReuse(IMAGE_TEMPLATE6_BEAR_SRCS, 5);
  return [bears[0]!, bears[1]!, bears[2]!, bears[3]!, bears[4]!, ''];
}

export function template6BearImageForTab(
  tabIndex: number,
  sources: readonly string[]
): string {
  if (tabIndex < 0 || tabIndex > 4 || tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX) return '';
  const slot = sources[tabIndex]?.trim();
  if (slot && isTemplate6BearUrl(slot)) return slot;
  return IMAGE_TEMPLATE6_BEAR_SRCS[tabIndex % IMAGE_TEMPLATE6_BEAR_SRCS.length]!;
}

export function template6TabSourcesNeedRepair(sources: string[]): boolean {
  if (sources.length !== 6) return true;
  if (sources[IMAGE_TEMPLATE2_Q5_TAB_INDEX] !== '') return true;
  for (let i = 0; i < 5; i++) {
    if (!isTemplate6BearUrl(sources[i])) return true;
  }
  return false;
}
