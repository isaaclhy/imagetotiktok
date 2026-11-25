import assert from 'node:assert/strict';
import test from 'node:test';
import { FLAMINGO_CARDS_FEED, isCopycatPromoNoiseSlide, type CopycatPost } from './flamingo-cards';
import { FLAMINGO_CONVO_FEED } from './flamingo-convo';
import {
  FLAMINGO_APPREELS_FEED,
  FLAMINGO_CARDS_IG_FEED,
  FLAMINGO_CONVOS_FEED,
  FLAMINGO_QUESTIONS_FEED,
  QUESTIONS_21_QUIZ_FEED,
} from './flamingo-convos';
import { COUPLE_CARDS_FEED } from './couple-cards';
import { COUPLE_DEEP_QUESTIONS_FEED } from './coupledeepquestions';
import { COUPLE_SYX_FEED } from './couple-syx';
import { CRAY_CRAY_QUESTIONS_03_FEED } from './craycrayquestions03';
import { CRAY_CRAY_QUESTIONS_7_FEED } from './craycrayquestions7';
import { DEEP_QUESTIONS_APP_FEED } from './deepquestionsapp';
import { FLAMINGO_CARDS_TIKTOK_FEED } from './flamingo-cards-tiktok';
import { GOLDEN_THOUGHTS_DAILY_FEED } from './goldenthoughtsdaily';
import { HH_TALK_FEED } from './hhtalk';
import { HOOK_POSTS_FEED } from './hook-posts';
import { ITS_ALL_ABOUT_LOVING_YOU_FEED } from './itsallaboutlovingyou';
import { LVRSBAE_FEED } from './lvrsbae';
import { MISUNDERSTOOD_COU4_FEED } from './misunderstood-cou4';
import { QUESTIONS_21_FEED } from './questions-21';
import { QUESTIONS_FOR_TONIGHT_FEED } from './questionsfortonight';
import { SANDRA_WRITES_THIS_FEED } from './sandrawritesthis';
import { SPILL_CARDS_APP_FEED } from './spillcardsapp';
import { TRY_DEEPEN_FEED } from './trydeepen';
import { WE_DEEP_ONE_FEED } from './wedeepone';
import { stableCopycatQuestionId } from './question-id';
import {
  COPYCAT_QUESTION_MARKS,
  COPYCAT_QUESTION_TONE_CRITERIA,
  copycatQuestionToneCatalogCriteria,
  copycatQuestionToneCounts,
  copycatQuestionToneFlags,
  getCopycatQuestionMark,
  listCopycatQuestionMarks,
  type CopycatQuestionTone,
} from './question-tone';

/**
 * Run with:
 * node --experimental-strip-types --experimental-loader ./app/lib/copycat/node-ts-loader.mjs --test app/lib/copycat/question-tone.test.ts
 */

const FEEDS: Array<{ source: string; posts: CopycatPost[] }> = [
  { source: 'flamingo-cards', posts: FLAMINGO_CARDS_FEED.posts },
  { source: 'flamingo-convos', posts: FLAMINGO_CONVOS_FEED.posts },
  { source: 'flamingoappreels', posts: FLAMINGO_APPREELS_FEED.posts },
  { source: 'flamingocards', posts: FLAMINGO_CARDS_IG_FEED.posts },
  { source: 'flamingoquestions', posts: FLAMINGO_QUESTIONS_FEED.posts },
  { source: '21questionsquiz', posts: QUESTIONS_21_QUIZ_FEED.posts },
  { source: 'flamingo-convo', posts: FLAMINGO_CONVO_FEED.posts },
  { source: 'questions-21', posts: QUESTIONS_21_FEED.posts },
  { source: 'itsallaboutlovingyou', posts: ITS_ALL_ABOUT_LOVING_YOU_FEED.posts },
  { source: 'trydeepen', posts: TRY_DEEPEN_FEED.posts },
  { source: 'wedeepone', posts: WE_DEEP_ONE_FEED.posts },
  { source: 'coupledeepquestions', posts: COUPLE_DEEP_QUESTIONS_FEED.posts },
  { source: 'craycrayquestions03', posts: CRAY_CRAY_QUESTIONS_03_FEED.posts },
  { source: 'craycrayquestions7', posts: CRAY_CRAY_QUESTIONS_7_FEED.posts },
  { source: 'deepquestionsapp', posts: DEEP_QUESTIONS_APP_FEED.posts },
  { source: 'flamingo-cards-tiktok', posts: FLAMINGO_CARDS_TIKTOK_FEED.posts },
  { source: 'questionsfortonight', posts: QUESTIONS_FOR_TONIGHT_FEED.posts },
  { source: 'couple-syx', posts: COUPLE_SYX_FEED.posts },
  { source: 'misunderstood-cou4', posts: MISUNDERSTOOD_COU4_FEED.posts },
  { source: 'sandrawritesthis', posts: SANDRA_WRITES_THIS_FEED.posts },
  { source: 'couple-cards', posts: COUPLE_CARDS_FEED.posts },
  { source: 'hhtalk', posts: HH_TALK_FEED.posts },
  { source: 'goldenthoughtsdaily', posts: GOLDEN_THOUGHTS_DAILY_FEED.posts },
  { source: 'lvrsbae', posts: LVRSBAE_FEED.posts },
  { source: 'spillcardsapp', posts: SPILL_CARDS_APP_FEED.posts },
  { source: 'hook-posts', posts: HOOK_POSTS_FEED.posts },
];

type Collected = {
  id: string;
  question: string;
  options: string[];
  sources: string[];
};

function collectQuestions(): { questions: Map<string, Collected>; skippedEmpty: number; skippedPromo: number } {
  const questions = new Map<string, Collected>();
  let skippedEmpty = 0;
  let skippedPromo = 0;
  for (const feed of FEEDS) {
    for (const post of feed.posts) {
      for (const slide of post.slideText) {
        if (!slide.text.trim()) {
          skippedEmpty += 1;
          continue;
        }
        if (isCopycatPromoNoiseSlide(slide)) {
          skippedPromo += 1;
          continue;
        }
        const options = slide.options?.length ? [...slide.options] : [];
        const id = stableCopycatQuestionId(slide.text, options);
        const existing = questions.get(id);
        if (!existing) {
          questions.set(id, { id, question: slide.text, options: [...options], sources: [feed.source] });
          continue;
        }
        assert.equal(existing.question, slide.text);
        assert.deepEqual(existing.options, options);
        if (!existing.sources.includes(feed.source)) existing.sources.push(feed.source);
      }
    }
  }
  return { questions, skippedEmpty, skippedPromo };
}

const FIXTURES: Array<{ question: string; options?: string[]; tone: CopycatQuestionTone }> = [
  { question: 'Would you kiss a woman to save my life?', tone: 'neutral' },
  { question: 'Have you had Krispy Kreme? Was it crispy?', tone: 'neutral' },
  { question: 'Do you feel like I prioritize our relationship enough?', tone: 'neutral' },
  { question: 'When did you first know I loved you?', tone: 'neutral' },
  { question: 'Listening', tone: 'neutral' },
  {
    question: 'When someone flirts with me in public, how would you react?',
    options: ['Laugh it off', 'Confront them', 'Ignore it', 'Get upset'],
    tone: 'neutral',
  },
  {
    question: 'What was going through your mind right before you kissed me?',
    options: [
      'Should I do it?',
      'I hope they kiss me first.',
      "I couldn't stop looking at you.",
      'I was trying not to panic.',
    ],
    tone: 'flirty',
  },
  { question: 'Kissing', tone: 'flirty' },
  { question: 'Are you more obsessed with shower kisses or cuddling in bed after?', tone: 'flirty' },
  { question: 'My lips or my body?', options: ['My lips', 'my body'], tone: 'flirty' },
  { question: 'Do you think we have good sex or are we both just being polite?', tone: 'sexual' },
  {
    question: 'A giver or a receiver in bed?',
    options: ['A giver', 'a receiver in bed'],
    tone: 'both',
  },
  { question: "What's something you've been too shy to ask me in bed?", tone: 'both' },
  { question: 'Dominant or submissive?', options: ['Dominant', 'submissive'], tone: 'both' },
  { question: 'How do you really feel about our physical intimacy?', tone: 'ambiguous' },
  { question: 'A weekend in bed or a weekend at a luxury hotel?', tone: 'ambiguous' },
  { question: 'Lights on or lights low?', tone: 'ambiguous' },
];

test('tone criteria explain sexual, flirty, both, ambiguous, and neutral', () => {
  assert.equal(copycatQuestionToneCatalogCriteria(), COPYCAT_QUESTION_TONE_CRITERIA);
  assert.match(COPYCAT_QUESTION_TONE_CRITERIA, /sexual/);
  assert.match(COPYCAT_QUESTION_TONE_CRITERIA, /flirty/);
  assert.match(COPYCAT_QUESTION_TONE_CRITERIA, /both/);
  assert.match(COPYCAT_QUESTION_TONE_CRITERIA, /ambiguous/);
  assert.match(COPYCAT_QUESTION_TONE_CRITERIA, /neutral/);
  assert.match(COPYCAT_QUESTION_TONE_CRITERIA, /nonsexual romance/);
  assert.match(COPYCAT_QUESTION_TONE_CRITERIA, /sexualOrFlirty/);
});

test('every Copy Cat question card is marked once and the original text is unchanged', () => {
  const { questions } = collectQuestions();
  assert.equal(questions.size, COPYCAT_QUESTION_MARKS.length);

  const seen = new Set<string>();
  for (const mark of COPYCAT_QUESTION_MARKS) {
    assert.equal(seen.has(mark.id), false);
    seen.add(mark.id);
    const source = questions.get(mark.id);
    assert.ok(source, mark.id);
    assert.equal(mark.question, source.question);
    assert.deepEqual(mark.options, source.options);
    assert.deepEqual([...mark.sources].sort(), [...source.sources].sort());
    assert.equal(mark.id, stableCopycatQuestionId(mark.question, mark.options));
  }

  for (const source of questions.values()) {
    assert.ok(seen.has(source.id), source.question);
  }

  for (const source of questions.values()) {
    assert.equal(isCopycatPromoNoiseSlide({ text: source.question, options: source.options }), false);
    assert.notEqual(source.question.trim(), '');
  }
});

test('tone flags stay consistent and ambiguous cards stay out of the combined selection', () => {
  const counts = copycatQuestionToneCounts();
  assert.equal(counts.unique, COPYCAT_QUESTION_MARKS.length);
  assert.equal(
    counts.sexual + counts.flirty + counts.both + counts.ambiguous + counts.neutral,
    counts.unique
  );
  assert.equal(counts.sexualOrFlirty, counts.sexual + counts.flirty + counts.both);
  assert.equal(listCopycatQuestionMarks('sexual-or-flirty').length, counts.sexualOrFlirty);
  assert.equal(
    listCopycatQuestionMarks('sexual-or-flirty').some((mark) => mark.tone === 'ambiguous' || mark.tone === 'neutral'),
    false
  );

  for (const mark of COPYCAT_QUESTION_MARKS) {
    const flags = copycatQuestionToneFlags(mark.tone);
    assert.equal(mark.sexual, flags.sexual);
    assert.equal(mark.flirty, flags.flirty);
    assert.equal(mark.both, flags.both);
    assert.equal(mark.ambiguous, flags.ambiguous);
    assert.equal(mark.sexualOrFlirty, flags.sexualOrFlirty);
    if (mark.tone === 'neutral') assert.equal(mark.note, '');
    else assert.ok(mark.note.trim().length >= 3, mark.id);
  }
});

test('reviewed examples keep the judgments locked to the card text', () => {
  for (const fixture of FIXTURES) {
    const mark = getCopycatQuestionMark(fixture.question, fixture.options);
    assert.ok(mark, fixture.question);
    assert.equal(mark.question, fixture.question);
    if (fixture.options) assert.deepEqual(mark.options, fixture.options);
    assert.equal(mark.tone, fixture.tone, fixture.question);
  }
});

test('lookup cleans OCR whitespace without changing the stored question', () => {
  const mark = getCopycatQuestionMark('Kissing\n');
  assert.equal(mark?.question, 'Kissing');
  assert.equal(mark?.tone, 'flirty');
});
