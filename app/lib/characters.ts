import type { StudioAppId } from '@/app/lib/apps';

export type CharacterIdentity = {
  gender_presentation: string;
  age_appearance: string;
  hair: {
    color: string;
    length: string;
    texture: string;
    style: string;
    part: string;
    volume: string;
    stray_hairs: string;
  };
  face: {
    shape: string;
    skin_tone: string;
    complexion: string;
    forehead: string;
    eyebrows: { color: string; shape: string };
    eyes: { color: string; shape: string; lashes: string };
    nose: { shape: string; feature: string };
    lips: { shape: string; color: string; definition: string };
    cheeks: { appearance: string };
    jawline: string;
    chin: string;
  };
  expression: {
    default: string;
    eyes: string;
    mouth: string;
    overall: string;
  };
  accessories: {
    nose_piercing: { type: string; color: string };
    necklace: { type: string; color: string; pendant: string };
  };
  makeup: {
    style: string;
    skin: string;
    eyes: string;
    cheeks: string;
    lips: string;
  };
  overall_appearance: {
    style: string;
    aesthetic: string;
    photographic_consistency: string;
    distinctive_features: string[];
  };
};

export type CharacterCard = {
  id: string;
  name: string;
  coverSrc: string;
  identity: CharacterIdentity;
  /** Pinterest searches used as the scene reference. One is chosen at random each fetch. */
  referenceQueries: readonly string[];
  /** Shared photo behind Q1–Q5 iPhone notification slides. */
  questionBackgroundSrc: string;
};

export const AVA_CHARACTER_IDENTITY: CharacterIdentity = {
  gender_presentation: 'female',
  age_appearance: 'young adult',
  hair: {
    color: 'light golden blonde',
    length: 'long',
    texture: 'straight with subtle natural waves',
    style: 'loose hair falling naturally over shoulders',
    part: 'slightly off-center part',
    volume: 'full with natural volume at the roots',
    stray_hairs: 'a few fine natural flyaways',
  },
  face: {
    shape: 'soft oval',
    skin_tone: 'fair warm beige',
    complexion: 'smooth natural complexion with subtle freckles and rosy cheeks',
    forehead: 'medium height',
    eyebrows: {
      color: 'light blonde to medium blonde',
      shape: 'natural, softly arched, moderately defined',
    },
    eyes: {
      color: 'light blue-green',
      shape: 'almond-shaped',
      lashes: 'long and naturally prominent',
    },
    nose: {
      shape: 'small and narrow',
      feature: 'small silver nose ring on one nostril',
    },
    lips: {
      shape: 'medium-full',
      color: 'soft rosy pink',
      definition: 'naturally defined',
    },
    cheeks: {
      appearance: 'softly rounded with visible natural rosy blush',
    },
    jawline: 'soft and gently defined',
    chin: 'small and rounded',
  },
  expression: {
    default: 'bright, cheerful, friendly',
    eyes: 'looking directly toward camera',
    mouth: 'wide genuine smile showing upper teeth',
    overall: 'happy and approachable',
  },
  accessories: {
    nose_piercing: {
      type: 'small hoop',
      color: 'silver',
    },
    necklace: {
      type: 'delicate fine chain necklace',
      color: 'gold',
      pendant: 'small subtle pendant',
    },
  },
  makeup: {
    style: 'natural minimal makeup',
    skin: 'light natural coverage',
    eyes: 'subtle eye makeup with defined lashes',
    cheeks: 'natural rosy blush',
    lips: 'soft pink natural lip color',
  },
  overall_appearance: {
    style: 'natural lifestyle influencer',
    aesthetic: 'bright, feminine, youthful, casual',
    photographic_consistency: 'realistic smartphone photography',
    distinctive_features: [
      'long golden blonde hair',
      'light blue-green eyes',
      'fair warm complexion',
      'bright genuine smile',
      'small silver nose hoop',
      'soft oval face',
      'natural rosy cheeks',
    ],
  },
};

export const CHARACTERS_BY_APP: Record<StudioAppId, CharacterCard[]> = {
  'spill-it': [
    {
      id: 'ava',
      name: 'Ava',
      coverSrc: '/characters/ava-cover.jpg',
      identity: AVA_CHARACTER_IDENTITY,
      referenceQueries: [
        'woman in bed selfie cold',
        'girl in bed selfie under blanket',
        'sick in bed selfie woman',
        'cozy morning bed selfie woman',
        'woman lying in bed phone selfie',
        'cold girl in bed selfie',
        'woman under covers selfie',
        'cozy bedroom selfie girl blanket',
        'woman pajamas bed selfie',
        'girl tucked in bed selfie',
        'rainy day bed selfie woman',
        'woman messy hair bed selfie',
        'cozy winter bed selfie girl',
        'woman hoodie in bed selfie',
        'girl with blanket selfie in bed',
        'woman cold bedroom selfie',
      ],
      questionBackgroundSrc: '/characters/ava-question-bg.png',
    },
  ],
  fab: [],
  nighty: [],
};

export function getCharactersForApp(appId: StudioAppId): CharacterCard[] {
  return CHARACTERS_BY_APP[appId] ?? [];
}

export function getCharacterById(
  appId: StudioAppId,
  characterId: string | null | undefined
): CharacterCard | null {
  if (!characterId) return null;
  return getCharactersForApp(appId).find((card) => card.id === characterId) ?? null;
}
