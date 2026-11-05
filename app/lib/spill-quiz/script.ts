import { FUNNY_QUESTIONS, VIDEO_TEMPLATE2_PEXELS_QUERIES } from '@/app/lib/constants';
import {
  SPILL_QUIZ_TTS_MODEL,
  SPILL_QUIZ_TTS_SETTINGS,
  SPILL_QUIZ_VOICE_KNOW_HER,
  SPILL_QUIZ_VOICE_QUIZ_BOYFRIEND,
  type SpillQuizVoiceSettings,
} from '@/app/lib/spill-quiz/voices';

export const SPILL_QUIZ_TEMPLATE_IDS = [8, 9] as const;
export type SpillQuizTemplateId = (typeof SPILL_QUIZ_TEMPLATE_IDS)[number];

export type SpillQuizTemplateKey = 'know-girlfriend' | 'quiz-boyfriend';

export type SpillQuizLineRole = 'hook' | 'cta' | 'question' | 'close';

export type SpillQuizLine = {
  role: SpillQuizLineRole;
  /** Spoken and shown. */
  text: string;
};

export type SpillQuizScript = {
  templateId: SpillQuizTemplateId;
  templateKey: SpillQuizTemplateKey;
  /** Library title and the main hook. */
  title: string;
  lines: SpillQuizLine[];
  pexelsQueries: readonly string[];
};

export const SPILL_QUIZ_FOOTER_LINES = [
  'Search "Spill It - Couples Questions"',
  'for more questions',
] as const;

export const SPILL_QUIZ_QUESTION_COUNT = 5;

const NUMBER_WORDS = ['One', 'Two', 'Three', 'Four', 'Five'] as const;

/** Facts he should know about her. Spoken to girls, then sent to him. */
const KNOW_HER_QUESTIONS = [
  "What's her coffee order?",
  "What show does she put on when she's had a day?",
  "What's the nickname she pretends to hate?",
  "What song is always in her headphones?",
  "What's her late-night snack?",
  'How does she actually like to be kissed?',
  'What makes her feel chosen?',
  "What's her love language when she goes quiet?",
  'What time does she really get tired?',
  "What's her comfort meal?",
  'What tiny thing can ruin her whole afternoon?',
  'Where does she want to be taken on a random Tuesday?',
  "What's her favorite kind of Sunday?",
  "What does she do when she's overstimulated?",
  "What's the compliment she never gets tired of?",
  'What scent does she wear?',
  "What's her rainy-day movie?",
  'What does she order every single time?',
  "What's the text from you that makes her smile instantly?",
  "What's the trip she keeps bringing up?",
  'What hobby does she talk about more than she does?',
  "How does she want to be held when she's upset?",
  "What's her favorite thing about the two of you?",
  'What makes her feel pretty?',
  "What's the snack she thinks she's hiding?",
  "What's her real morning mood?",
  'What song should you play when she is mad at you?',
  "What's her unpopular food opinion?",
  "What's the inside joke she brings up the most?",
  'What does her "I\'m fine" actually mean?',
  "What's her favorite photo of the two of you?",
  'What time of day is she the softest?',
  'What gift would actually land?',
  "What's the first thing she notices in a room?",
  'Who does she text when she has good news?',
  "What's the small plan that would make her week?",
] as const;

const QUIZ_BOYFRIEND_TITLES = [
  'Quiz your boyfriend',
  'Quiz your boyfriend tonight',
  'Five questions to quiz your boyfriend',
] as const;

const KNOW_HER_PEXELS_QUERIES = [
  'couple laughing',
  'couple cafe',
  'golden hour couple',
  'couple walking',
  'sunrise couples',
  'couple sunset',
] as const;

export function isSpillQuizTemplateId(value: number | null | undefined): value is SpillQuizTemplateId {
  return value === 8 || value === 9;
}

export function spillQuizTemplateKey(templateId: SpillQuizTemplateId): SpillQuizTemplateKey {
  return templateId === 8 ? 'know-girlfriend' : 'quiz-boyfriend';
}

export function spillQuizLabel(templateKey: SpillQuizTemplateKey): string {
  return templateKey === 'know-girlfriend'
    ? 'How well do you know your girlfriend'
    : 'Quiz your boyfriend';
}

function shuffleCopy<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function questionLine(index: number, text: string): SpillQuizLine {
  const word = NUMBER_WORDS[index] ?? String(index + 1);
  return { role: 'question', text: `${word}. ${text.trim()}` };
}

function pickKnowGirlfriendScript(): SpillQuizScript {
  const questions = shuffleCopy(KNOW_HER_QUESTIONS).slice(0, SPILL_QUIZ_QUESTION_COUNT);
  return {
    templateId: 8,
    templateKey: 'know-girlfriend',
    title: 'How well do you know your girlfriend?',
    pexelsQueries: KNOW_HER_PEXELS_QUERIES,
    lines: [
      { role: 'hook', text: 'Girls!' },
      { role: 'hook', text: 'How well do you know your girlfriend?' },
      {
        role: 'cta',
        text: 'Send this to him. If he gets them all right, unlimited kisses.',
      },
      ...questions.map((question, index) => questionLine(index, question)),
      { role: 'close', text: 'Search Spill It, Couples Questions, for more questions.' },
    ],
  };
}

function pickQuizBoyfriendScript(): SpillQuizScript {
  const title =
    QUIZ_BOYFRIEND_TITLES[Math.floor(Math.random() * QUIZ_BOYFRIEND_TITLES.length)]!;
  const pool = FUNNY_QUESTIONS.filter((question) => question.trim().length > 0 && question.length <= 140);
  const questions = shuffleCopy(pool.length >= SPILL_QUIZ_QUESTION_COUNT ? pool : FUNNY_QUESTIONS).slice(
    0,
    SPILL_QUIZ_QUESTION_COUNT
  );
  return {
    templateId: 9,
    templateKey: 'quiz-boyfriend',
    title,
    pexelsQueries: VIDEO_TEMPLATE2_PEXELS_QUERIES,
    lines: [
      { role: 'hook', text: title },
      { role: 'cta', text: 'Send this to him.' },
      ...questions.map((question, index) => questionLine(index, question)),
      { role: 'close', text: 'Search Spill It, Couples Questions, for more questions.' },
    ],
  };
}

export function pickSpillQuizScript(templateId: SpillQuizTemplateId): SpillQuizScript {
  return templateId === 8 ? pickKnowGirlfriendScript() : pickQuizBoyfriendScript();
}

export function spillQuizVoiceId(templateId: SpillQuizTemplateId): string {
  if (templateId === 8) {
    return process.env.SPILL_QUIZ_VOICE_KNOW_HER?.trim() || SPILL_QUIZ_VOICE_KNOW_HER;
  }
  return process.env.SPILL_QUIZ_VOICE_QUIZ_BOYFRIEND?.trim() || SPILL_QUIZ_VOICE_QUIZ_BOYFRIEND;
}

export function spillQuizTtsModel(): string {
  return process.env.SPILL_QUIZ_TTS_MODEL?.trim() || SPILL_QUIZ_TTS_MODEL;
}

export function spillQuizVoiceSettings(): SpillQuizVoiceSettings {
  return { ...SPILL_QUIZ_TTS_SETTINGS };
}

/** Browser preview uses the same voice ids. Env overrides apply only on the server. */
export function spillQuizPreviewVoiceId(templateId: SpillQuizTemplateId): string {
  return templateId === 8 ? SPILL_QUIZ_VOICE_KNOW_HER : SPILL_QUIZ_VOICE_QUIZ_BOYFRIEND;
}
