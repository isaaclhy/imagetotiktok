/** Nano Banana 2 — Gemini image generation defaults (override via .env.local). */
export const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL?.trim() || 'gemini-3.1-flash-image-preview';

/**
 * Prompt tab one-off images. Defaults to Nano Banana 2 (free-tier friendly).
 * Set GEMINI_PROMPT_TAB_IMAGE_MODEL=gemini-3-pro-image-preview for Pro (paid quota).
 */
export const GEMINI_PROMPT_TAB_IMAGE_MODEL =
  process.env.GEMINI_PROMPT_TAB_IMAGE_MODEL?.trim() || GEMINI_IMAGE_MODEL;

/** Nano Banana Pro — higher quality, paid quota. Used by Image Template 4 covers. */
export const GEMINI_IMAGE_PRO_MODEL =
  process.env.GEMINI_IMAGE_PRO_MODEL?.trim() || 'gemini-3-pro-image-preview';

export const GEMINI_IMAGE_ASPECT_RATIO =
  process.env.GEMINI_IMAGE_ASPECT_RATIO?.trim() || '3:4';

export const GEMINI_IMAGE_SIZE = (process.env.GEMINI_IMAGE_SIZE?.trim() || '2K') as
  | '512'
  | '1K'
  | '2K'
  | '4K';

export const GEMINI_BATCH_POLL_INTERVAL_MS = Math.max(
  2000,
  parseInt(process.env.GEMINI_BATCH_POLL_INTERVAL_MS || '5000', 10) || 5000
);

export const GEMINI_BATCH_MAX_WAIT_MS = Math.max(
  60_000,
  parseInt(process.env.GEMINI_BATCH_MAX_WAIT_MS || '1800000', 10) || 1_800_000
);

export function isGeminiImageConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
