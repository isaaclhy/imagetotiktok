/** Fallback cover until a generated photo replaces it. */
export const IMAGE_TEMPLATE13_COVER_SRC = '/image-templates/template-13-cover.jpg';
/** Phone-screen red from the cover prompt. */
export const IMAGE_TEMPLATE13_BG = '#520817';
export const IMAGE_TEMPLATE13_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE13_SLIDE_COUNT = 6;
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

COMPOSITION — MOST IMPORTANT: An extreme close-up of a black iPhone lying diagonally on soft, wrinkled grey bedsheets. The phone is partially outside the camera frame. Its top and side edges are cut off by the image borders, and only a portion of the device is visible. Do NOT show the entire phone. The phone should feel accidentally captured at very close range, as if someone pointed their camera down at it while lying in bed. The device fills most of the image, with the framing cutting through the phone naturally. Slightly awkward, off-centre composition, similar to a paused frame from an ordinary TikTok video. No wide shot, no complete device, no neatly centred product photography.

PHONE SCREEN: A dark, deep burgundy-red (#520817) screen, nearly solid wine red, occupying the majority of the visible phone area. Most of the screen is empty. Near the bottom portion of the visible screen, show a small, dark, translucent rounded iOS-style notification banner. Include a tiny circular contact avatar, a small heart emoji, and small white text reading exactly: "${line}" Include a subtle "now" timestamp. The notification should be relatively small compared with the large expanse of burgundy screen. Add realistic minimal camera and flashlight icons near the bottom, with the white home indicator visible if it falls within the crop.

The notification must contain only this sentence and no other words: "${line}"

CAMERA ANGLE: Close, slightly tilted overhead shot, with the phone positioned diagonally across the frame. The perspective should be imperfect and natural, not geometrically straight or symmetrical. Focus on the screen and notification while allowing the edges of the device to disappear beyond the frame.

ENVIRONMENT: Soft, rumpled, light grey or off-white duvet surrounding the visible phone edges. Natural fabric creases, subtle shadows, muted colours and realistic textures. Dim bedroom lighting with the burgundy screen providing the main colour contrast.

MOOD AND PHOTOGRAPHY: Intimate, lonely, nostalgic, emotionally heavy, late at night. Authentic amateur smartphone photography, subtle image grain, slightly soft focus, natural low-light exposure, muted colours and realistic glass reflections. It should look like a real frame taken from a viral TikTok, not an advertisement or staged photoshoot.

STRICT NEGATIVE CONSTRAINTS: Never show the entire phone. No complete outline of the device. No distant camera angle. No centred product shot. No studio lighting. No polished commercial photography. No 3D rendering, CGI, illustrations, extra objects, decorative graphics, or text overlays outside the phone screen. Vertical 9:16 aspect ratio.`;
}
