/** Dreamy, romantic filter for Pexels image (Image mode) – preview, carousel, and export */
export const ROMANTIC_IMAGE_FILTER =
  'brightness(0.82) contrast(0.88) saturate(0.72) sepia(0.18) hue-rotate(-8deg)';

/** Font for first-card title (TikTok-style clean sans-serif). */
export const TITLE_FONT = 'Inter, sans-serif';

/** Fallback background colors when no avgColor from image (e.g. AI cover). */
export const CARD_BG_FALLBACK_PALETTE = [
  '#1a1a2e',
  '#16213e',
  '#2d2d44',
  '#2c3e50',
  '#3d2c4a',
  '#2d3a4a',
  '#34495e',
  '#3d3d5c',
];

/** Cover image prompt IDs for automate flow. Keys are display names. */
export const COVER_IMAGE_PROMPTS = {
  boards: 'pmpt_6991006af1cc8195a60c91937fc07b7100c73c923d7ad252',
  'paper style': 'pmpt_6990f9a317588194827b173df4b3d6a30d4beef4679a5add',
  creative: 'pmpt_697bd67b55d48190ba24de5df8a84f3c0e7de9c8192b5cdc',
} as const;

export type CoverImageStyle = keyof typeof COVER_IMAGE_PROMPTS;

/** Couples-level categories only (case-insensitive). Default automate selection uses these. */
export const COUPLES_CATEGORIES = [
  'after dark',
  'deeper conversations',
  'first impressions',
  'how well do you know me',
  'spicy',
  'travelling',
];

export function getDefaultAutomateCategories(categories: string[]): string[] {
  const couplesSet = new Set(COUPLES_CATEGORIES);
  return categories.filter((c) => couplesSet.has(c.toLowerCase().trim()));
}
