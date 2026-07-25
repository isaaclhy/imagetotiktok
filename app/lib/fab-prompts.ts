/** Fab Prompt-tab heart-shaped paper image prompt. */
export const FAB_HEART_PAPER_PROMPT = `A realistic first-person POV iPhone photo of a young woman's left hand holding a {{PAPER_COLOR}} heart-shaped paper between her thumb and index finger. The hand is feminine with fair skin, slim fingers, short natural nails, and no jewelry or nail polish.

The heart-shaped paper is centered and fills approximately 70% of the frame. The handwritten message is the primary focus, perfectly legible, and takes up most of the paper. The camera is close to the paper, making the text easy to read.

The camera angle, hand position, lighting, composition, background, paper size, distance, perspective, and framing should remain identical in every generation.

Background is a softly blurred light oak wooden floor with warm natural daylight coming from a nearby window. Minimal shadows. Photorealistic iPhone 15 photo, 26mm equivalent lens, f/1.8, shallow depth of field, natural color grading.

The paper is a solid {{PAPER_COLOR}} with no patterns, gradients, textures, glitter, or designs.

Do not add any extra objects, decorations, sleeves, bracelets, rings, watches, or additional hands.

The ONLY things that should change between generations are:
1. The handwritten message.
2. The paper color.

Message:
"{{MESSAGE}}"`;

export const FAB_PAPER_COLORS = [
  'White',
  'Baby Pink',
  'Blush Pink',
  'Dusty Rose',
  'Lavender',
  'Lilac',
  'Powder Blue',
  'Baby Blue',
  'Sky Blue',
  'Sage Green',
  'Mint Green',
  'Butter Yellow',
  'Pastel Yellow',
  'Peach',
  'Apricot',
  'Cream',
  'Ivory',
  'Beige',
  'Latte',
  'Soft Grey',
] as const;

export const FAB_HEART_MESSAGES = [
  'attract everything meant for me.',
  'I am worthy of the life I dream of.',
  'Everything is working in my favor.',
  'I radiate confidence and beauty.',
  'I deserve love, peace, and abundance.',
  'I choose myself every single day.',
  'I am becoming my highest self.',
  'I trust the timing of my life.',
  'I am magnetic to good energy.',
  'I am enough exactly as I am.',
  'I welcome miracles into my life.',
  'My dream life is finding me.',
  'I glow from the inside out.',
  'I am the creator of my reality.',
  'I attract love effortlessly.',
  'I am confident, calm, and powerful.',
  'Every day I become more successful.',
  'The universe is always on my side.',
  'I deserve everything I desire.',
  'My future is brighter than ever.',
] as const;

export function fillFabHeartPaperPrompt(paperColor: string, message: string): string {
  return FAB_HEART_PAPER_PROMPT.replaceAll('{{PAPER_COLOR}}', paperColor).replaceAll(
    '{{MESSAGE}}',
    message
  );
}
