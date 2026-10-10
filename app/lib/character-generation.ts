import type { CharacterIdentity } from '@/app/lib/characters';

export const CHARACTER_IMAGE_QUALITIES = ['low', 'medium', 'high', 'xhigh', 'max'] as const;
export type CharacterImageQuality = (typeof CHARACTER_IMAGE_QUALITIES)[number];
export const DEFAULT_CHARACTER_IMAGE_QUALITY: CharacterImageQuality = 'high';

export function isCharacterImageQuality(value: string): value is CharacterImageQuality {
  return (CHARACTER_IMAGE_QUALITIES as readonly string[]).includes(value);
}

export function buildCharacterImagePrompt(
  name: string,
  identity: CharacterIdentity
): string {
  return `Two images are attached, in this order:
1) environment.jpg — the Pinterest photo. This is the SCENE to keep.
2) character.jpg — ${name}'s identity photo. This is WHO she is. Face reference only.

Task: Recreate environment.jpg exactly, but replace the person with ${name}.

Keep from environment.jpg:
- location, background, sky, buildings, trees, furniture, walls
- lighting, time of day, color grade
- camera angle, crop, framing, selfie distance
- body pose, hand placement, gaze
- outfit, hair styling of the scene, accessories that belong to the outfit

Keep from character.jpg + spec below, and nothing else:
- ${name}'s face, facial structure, eyes, brows, nose, lips, skin tone, likeness

Do NOT use character.jpg's bedroom, couch, wall, lighting, pose, crop, or clothes.
The output must be recognizable as the Pinterest location. If the Pinterest photo is outdoors, the result must be outdoors. If it is a standing selfie in a green top, ${name} is standing in that same green top in that same place.

Appearance spec for ${name}'s face/likeness only:
${JSON.stringify({ character: identity }, null, 2)}

Rules:
- One person only: ${name} in the Pinterest environment
- Photorealistic smartphone photo
- No watermarks, logos, UI, extra limbs, or text`;
}
