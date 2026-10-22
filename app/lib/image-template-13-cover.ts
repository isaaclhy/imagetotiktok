/** Fallback cover until a generated photo replaces it. */
export const IMAGE_TEMPLATE13_COVER_SRC = '/image-templates/template-13-cover.jpg';
/** Phone-screen red from the cover prompt. */
export const IMAGE_TEMPLATE13_BG = '#520817';
export const IMAGE_TEMPLATE13_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE13_SLIDE_COUNT = 6;
/** Inset from the left and right edges of every text slide. */
export const IMAGE_TEMPLATE13_SIDE_PAD = 0.15;
export const IMAGE_TEMPLATE13_TEXT_WIDTH = 1 - IMAGE_TEMPLATE13_SIDE_PAD * 2;
export const IMAGE_TEMPLATE13_COVER_SIZE = 0.084;
export const IMAGE_TEMPLATE13_QUESTION_SIZE = 0.07;
export const IMAGE_TEMPLATE13_FONT_WEIGHT = 800;
export const IMAGE_TEMPLATE13_LETTER_SPACING = '0em';
export const IMAGE_TEMPLATE13_PROGRESS_Y = 0.055;
export const IMAGE_TEMPLATE13_PROGRESS_H = 0.01;
export const IMAGE_TEMPLATE13_PROGRESS_INSET = IMAGE_TEMPLATE13_SIDE_PAD;

export function template13ProgressRatio(index: number, total: number): number {
  return Math.min(1, Math.max(0, (index + 1) / Math.max(1, total)));
}

export function drawTemplate13ProgressBar(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  progress: number
): void {
  const barX = frameWidth * IMAGE_TEMPLATE13_PROGRESS_INSET;
  const barW = frameWidth * (1 - IMAGE_TEMPLATE13_PROGRESS_INSET * 2);
  const barY = frameHeight * IMAGE_TEMPLATE13_PROGRESS_Y;
  const barH = Math.max(5, Math.round(frameHeight * IMAGE_TEMPLATE13_PROGRESS_H));
  const fill = Math.min(1, Math.max(0, progress));
  const radius = barH / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, radius);
  ctx.fill();
  const fillW = Math.max(barH, barW * fill);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillW, barH, radius);
  ctx.fill();
}
export const IMAGE_TEMPLATE13_COVER_TEXTS = [
  '5 ragebait questions to ask your babe tonight',
  'babe, answer these if you love me?',
  'babe, do you still love me?',
  'answer these questions if you love me',
  'babe, answer these easy questions if you love me',
  'answer these easy questions if you love me',
  "You don't love me if you don't answer these questions",
  'best questions for date nights',
] as const;

export const IMAGE_TEMPLATE13_DEFAULT_SCREEN_TEXT = IMAGE_TEMPLATE13_COVER_TEXTS[0];

/** Next cover line, in order, skipping the one just used. */
export function nextTemplate13CoverText(current?: string): string {
  const index = IMAGE_TEMPLATE13_COVER_TEXTS.findIndex((line) => line === current?.trim());
  return IMAGE_TEMPLATE13_COVER_TEXTS[(index + 1) % IMAGE_TEMPLATE13_COVER_TEXTS.length]!;
}

/** Cover prompt. `screenText` is the only line rendered on the phone. */
export function buildTemplate13CoverPrompt(screenText: string): string {
  const line = screenText.trim() || IMAGE_TEMPLATE13_DEFAULT_SCREEN_TEXT;
  return `Create an extremely photorealistic, candid close-up photograph for a viral emotional TikTok video, matching the composition of a casually filmed phone lying on a bed.

COMPOSITION — MOST IMPORTANT: An extreme close-up of a black iPhone lying on soft, wrinkled grey bedsheets, in this exact orientation and no other. The phone runs on the same diagonal, from the upper right down toward the lower center, shifted to the right so both the left edge and the right edge of the phone are fully visible. Pale bedsheet shows on both sides of the phone and below it. Do not crop either side of the phone. The top of the phone is still cut off by the frame. The bottom of the phone, including the home indicator, stays visible above the bottom edge. The top of the phone stays cropped, but both side edges stay inside the picture. Do not turn the phone upright, sideways, or onto the opposite diagonal. The phone should feel accidentally captured at very close range, as if someone pointed their camera down at it while lying in bed. Slightly awkward, off-centre composition, similar to a paused frame from an ordinary TikTok video. No wide shot, no neatly centred product photography.

PHONE SCREEN: A dark, deep burgundy-red (#520817) screen, nearly solid wine red, occupying the majority of the visible phone area. Most of the screen is empty. Near the bottom portion of the visible screen, show a small, dark, translucent rounded iOS-style notification banner. Include a tiny grey circle with a white capital letter B and a small green iMessage icon overlapping the bottom right of that circle, a small heart emoji, and small white text reading exactly: "${line}" Include a subtle "now" timestamp. The notification should be relatively small compared with the large expanse of burgundy screen. Wrap that sentence inside the banner so every word is fully visible. Do not let any letter run off the banner, the phone, or the edge of the picture. Keep the whole notification inset from the left and right edges, because those edges are cropped. Add realistic minimal camera and flashlight icons near the bottom, with the white home indicator visible if it falls within the crop.

The notification must contain only this sentence and no other words: "${line}" Every letter of that sentence must be fully visible.

CAMERA ANGLE: Close, slightly tilted overhead shot, with the phone positioned diagonally across the frame. The perspective should be imperfect and natural, not geometrically straight or symmetrical. Focus on the screen and notification. Keep both side edges of the phone inside the frame.

ENVIRONMENT: Soft, rumpled, light grey or off-white duvet surrounding the visible phone edges. Natural fabric creases, subtle shadows, and realistic textures. The duvet stays pale and clearly lit, the same brightness as a normal phone photo of light bedsheets. Do not sink the bedding into shadow.

MOOD AND PHOTOGRAPHY: Intimate, lonely, nostalgic, emotionally heavy. Authentic amateur smartphone photography, subtle image grain, slightly soft focus, and realistic glass reflections. Exposure matches a well-lit phone photo: the pale sheets are bright, and the burgundy screen stays a visible wine red rather than near-black. It should look like a real frame taken from a viral TikTok, not an advertisement or staged photoshoot.

STRICT NEGATIVE CONSTRAINTS: The top of the phone stays out of frame. Both side edges of the phone stay visible. No distant camera angle. No centred product shot. No studio lighting. No polished commercial photography. No dim, underexposed, or low-light exposure. No clipped, cropped, or cut-off letters in the notification. No 3D rendering, CGI, illustrations, extra objects, decorative graphics, or text overlays outside the phone screen. Vertical 9:16 aspect ratio.`;
}
