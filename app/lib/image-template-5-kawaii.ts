import { IMAGE_TEMPLATE2_Q5_TAB_INDEX } from '@/app/lib/image-template-2-cover';

/** Stick-figure couple illustrations — same slots as Template 1 dog art. */
export const IMAGE_TEMPLATE5_COUPLE_SRCS = [
  '/image-templates/template-5-couple.png',
  '/image-templates/template-5-couple-2.png',
  '/image-templates/template-5-couple-3.png',
  '/image-templates/template-5-couple-4.png',
  '/image-templates/template-5-couple-5.png',
  '/image-templates/template-5-couple-6.png',
  '/image-templates/template-5-couple-7.png',
  '/image-templates/template-5-couple-8.png',
  '/image-templates/template-5-couple-9.png',
  '/image-templates/template-5-couple-10.png',
  '/image-templates/template-5-couple-11.png',
  '/image-templates/template-5-couple-12.png',
  '/image-templates/template-5-couple-13.png',
  '/image-templates/template-5-couple-14.png',
  '/image-templates/template-5-couple-15.png',
  '/image-templates/template-5-couple-16.png',
  '/image-templates/template-5-couple-17.png',
  '/image-templates/template-5-couple-18.png',
] as const;

/** Default / picker thumbnail. */
export const IMAGE_TEMPLATE5_COUPLE_SRC = IMAGE_TEMPLATE5_COUPLE_SRCS[0];

function shuffleCopy<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function pickCoupleUrlsWithoutReuse(pool: readonly string[], count: number): string[] {
  if (pool.length === 0) return Array.from({ length: count }, () => '');
  const picked: string[] = [];
  let deck: string[] = [];
  for (let i = 0; i < count; i++) {
    if (deck.length === 0) deck = shuffleCopy(pool);
    picked.push(deck.pop()!);
  }
  return picked;
}

function isTemplate5CoupleUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  return (IMAGE_TEMPLATE5_COUPLE_SRCS as readonly string[]).includes(url);
}

/** Cover + Q1–Q4 each get a couple variant; Q5 is promo-only. No CTA slide. */
export function buildTemplate5TabImageSources(): string[] {
  const couples = pickCoupleUrlsWithoutReuse(IMAGE_TEMPLATE5_COUPLE_SRCS, 5);
  return [couples[0]!, couples[1]!, couples[2]!, couples[3]!, couples[4]!, ''];
}

export function template5CoupleImageForTab(
  tabIndex: number,
  sources: readonly string[]
): string {
  if (tabIndex < 0 || tabIndex > 4 || tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX) return '';
  const slot = sources[tabIndex]?.trim();
  if (slot && isTemplate5CoupleUrl(slot)) return slot;
  return IMAGE_TEMPLATE5_COUPLE_SRCS[tabIndex % IMAGE_TEMPLATE5_COUPLE_SRCS.length]!;
}

export function template5TabSourcesNeedRepair(sources: string[]): boolean {
  if (sources.length !== 6) return true;
  if (sources[IMAGE_TEMPLATE2_Q5_TAB_INDEX] !== '') return true;
  for (let i = 0; i < 5; i++) {
    if (!isTemplate5CoupleUrl(sources[i])) return true;
  }
  return false;
}
