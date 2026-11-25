import { stableCopycatQuestionId } from './question-id';
import { cleanCopycatDisplayText } from './flamingo-cards';
import catalogJson from './question-tone.json';

/**
 * How Copy Cat cards were marked for a future second app.
 * The mark belongs to the question plus its answer options. Post covers are
 * context only: a spicy cover does not retag a clearly nonsexual question.
 *
 * - sexual: asks about sex, sexual acts, arousal, sexual history, or kink.
 * - flirty: teasing, coy, or sensual tension, including kissing and attraction,
 *   without an explicit sex act.
 * - both: explicitly sexual and also teasing or flirtatious.
 * - ambiguous: more than one reading is reasonable, or the text is too garbled
 *   to judge. Flagged for review and left out of the combined selection.
 * - neutral: everything else. Friendship, generic personal questions, and
 *   nonsexual romance (love, trust, commitment, the future, sweet memories)
 *   are neutral.
 *
 * Select either kind with `sexualOrFlirty` (tone sexual, flirty, or both).
 */
export const COPYCAT_QUESTION_TONE_CRITERIA = `Copy Cat cards are marked for reuse in a separate app. Each mark is on the question plus its answer options. Post covers are context only, and a spicy cover does not retag a clearly nonsexual question. Blank slides and app-promo slides are not questions and are not marked. sexual: the card asks about sex, sexual acts, arousal, sexual history, or kink. flirty: teasing, coy, or sensual tension, including kissing and attraction, without an explicit sex act. both: explicitly sexual and also teasing or flirtatious. ambiguous: more than one reading is reasonable, or the text is too garbled to judge; these stay out of the combined selection for review. neutral: everything else, including friendship, generic personal questions, and nonsexual romance. Filter either kind with sexualOrFlirty, which is true only for sexual, flirty, and both.`;

export const COPYCAT_QUESTION_TONES = ['sexual', 'flirty', 'both', 'ambiguous', 'neutral'] as const;

export type CopycatQuestionTone = (typeof COPYCAT_QUESTION_TONES)[number];

export type CopycatQuestionMark = {
  id: string;
  question: string;
  options: string[];
  tone: CopycatQuestionTone;
  /** True when the tone is `sexual` or `both`. */
  sexual: boolean;
  /** True when the tone is `flirty` or `both`. */
  flirty: boolean;
  /** True for `both` only. */
  both: boolean;
  /** True when a human should review the card before reusing it. */
  ambiguous: boolean;
  /** sexual, flirty, or both. Ambiguous and neutral are false. */
  sexualOrFlirty: boolean;
  /** Why a non-neutral mark was chosen. Empty for neutral. */
  note: string;
  /** Copycat feed files this card was read from. */
  sources: string[];
};

type CatalogFile = {
  criteria: string;
  questions: CopycatQuestionMark[];
};

const catalog = catalogJson as CatalogFile;

export const COPYCAT_QUESTION_MARKS: readonly CopycatQuestionMark[] = catalog.questions;

const marksById = new Map<string, CopycatQuestionMark>(
  COPYCAT_QUESTION_MARKS.map((mark) => [mark.id, mark])
);

export function isCopycatQuestionTone(value: string): value is CopycatQuestionTone {
  return (COPYCAT_QUESTION_TONES as readonly string[]).includes(value);
}

export function copycatQuestionToneFlags(tone: CopycatQuestionTone): Pick<
  CopycatQuestionMark,
  'sexual' | 'flirty' | 'both' | 'ambiguous' | 'sexualOrFlirty'
> {
  const sexual = tone === 'sexual' || tone === 'both';
  const flirty = tone === 'flirty' || tone === 'both';
  return {
    sexual,
    flirty,
    both: tone === 'both',
    ambiguous: tone === 'ambiguous',
    sexualOrFlirty: sexual || flirty,
  };
}

/** Look up a card by the text Copycat already displays. Raw OCR text is cleaned first. */
export function getCopycatQuestionMark(
  question: string,
  options?: string[]
): CopycatQuestionMark | undefined {
  const text = cleanCopycatDisplayText(question);
  const cleanedOptions = options?.map((option) => cleanCopycatDisplayText(option)).filter(Boolean);
  return marksById.get(stableCopycatQuestionId(text, cleanedOptions));
}

export type CopycatQuestionToneFilter = CopycatQuestionTone | 'sexual-or-flirty';

/** Cards for reuse. `sexual-or-flirty` is the combined selection and leaves out ambiguous. */
export function listCopycatQuestionMarks(
  filter?: CopycatQuestionToneFilter
): CopycatQuestionMark[] {
  if (!filter) return [...COPYCAT_QUESTION_MARKS];
  if (filter === 'sexual-or-flirty') {
    return COPYCAT_QUESTION_MARKS.filter((mark) => mark.sexualOrFlirty);
  }
  return COPYCAT_QUESTION_MARKS.filter((mark) => mark.tone === filter);
}

export function copycatQuestionToneCounts(): Record<CopycatQuestionTone, number> & {
  unique: number;
  sexualOrFlirty: number;
} {
  const counts: Record<CopycatQuestionTone, number> = {
    sexual: 0,
    flirty: 0,
    both: 0,
    ambiguous: 0,
    neutral: 0,
  };
  for (const mark of COPYCAT_QUESTION_MARKS) counts[mark.tone] += 1;
  return {
    ...counts,
    unique: COPYCAT_QUESTION_MARKS.length,
    sexualOrFlirty: counts.sexual + counts.flirty + counts.both,
  };
}

export function copycatQuestionToneCatalogCriteria(): string {
  return catalog.criteria;
}
