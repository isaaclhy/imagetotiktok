/**
 * Picks a static Gen Z cover for one Copycat post.
 *
 * Tone comes from that post's own questions (not the repeated source caption).
 * The same post always gets the same cover. Pass `avoid` to step to the next
 * fitting line when the next random post would reuse the previous cover.
 * Numbers in a cover are only the real question count, a slide index inside
 * that count, or the time "2am".
 */

import { sha256Hex } from './question-id';
import {
  coverTemplates,
  type CoverScope,
  type CoverTemplate,
  type CoverTone,
} from './cover-bank';

export type { CoverTone };

export type CopycatCoverSlide = {
  text: string;
  options?: string[];
};

export type CopycatCoverPost = {
  id: string;
  coverText: string;
  slideText: CopycatCoverSlide[];
};

export type CopycatAudience = 'bf' | 'gf' | 'partner' | 'friend';

type Pack = {
  who: string;
  short: string;
  him: string;
  he: string;
  his: string;
  hes: string;
  hell: string;
  self: string;
  s: string;
  es: string;
  is: string;
  has: string;
  was: string;
  does: string;
};

const PACKS: Record<CopycatAudience, Pack> = {
  bf: {
    who: 'boyfriend',
    short: 'bf',
    him: 'him',
    he: 'he',
    his: 'his',
    hes: "he's",
    hell: "he'll",
    self: 'himself',
    s: 's',
    es: 'es',
    is: 'is',
    has: 'has',
    was: 'was',
    does: 'does',
  },
  gf: {
    who: 'girlfriend',
    short: 'gf',
    him: 'her',
    he: 'she',
    his: 'her',
    hes: "she's",
    hell: "she'll",
    self: 'herself',
    s: 's',
    es: 'es',
    is: 'is',
    has: 'has',
    was: 'was',
    does: 'does',
  },
  partner: {
    who: 'partner',
    short: 'partner',
    him: 'them',
    he: 'they',
    his: 'their',
    hes: "they're",
    hell: "they'll",
    self: 'themself',
    s: '',
    es: '',
    is: 'are',
    has: 'have',
    was: 'were',
    does: 'do',
  },
  friend: {
    who: 'bestie',
    short: 'bestie',
    him: 'them',
    he: 'they',
    his: 'their',
    hes: "they're",
    hell: "they'll",
    self: 'themself',
    s: '',
    es: '',
    is: 'are',
    has: 'have',
    was: 'were',
    does: 'do',
  },
};

/** Template 17's title block fits about three lines at this width. */
const COVER_LINE_CHARS = 20;
const COVER_MAX_LINES = 3;
const TOKEN =
  /\{(hell|hes|self|short|who|him|his|has|was|does|is|es|he|s|n|k)\}/g;

const HARSH_TONES = new Set<CoverTone>(['cheat', 'jealous', 'redflag', 'fight', 'lie', 'spicy']);

const TONE_PRIORITY: CoverTone[] = [
  'cheat',
  'jealous',
  'redflag',
  'fight',
  'lie',
  'spicy',
  'situationship',
  'quiz',
  'wyr',
  'choice',
  'funny',
  'secret',
  'deep',
  'soft',
  'hypothetical',
  'knowyou',
];

function visibleSlides(post: CopycatCoverPost): CopycatCoverSlide[] {
  return post.slideText.filter((slide) => {
    const text = slide.text.trim();
    if (!text) return false;
    return !(
      /WANT\s*1,?000/i.test(text) ||
      /Download the app/i.test(text) ||
      /apps\.apple\.com/i.test(text) ||
      /Feel closer with/i.test(text) ||
      /couple[_\s-]?cards/i.test(text) ||
      /^get (the|our) app$/i.test(text)
    );
  });
}

function slideBlob(slide: CopycatCoverSlide): string {
  return [slide.text, ...(slide.options ?? [])]
    .join(' ')
    .toLowerCase()
    .replace(/[\u2018\u2019\u201b]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');
}

function isChoiceSlide(slide: CopycatCoverSlide, blob: string): boolean {
  if (/would you rather/.test(blob)) return false;
  if (/this or that/.test(blob)) return true;
  const options = slide.options ?? [];
  if (
    options.length === 2 &&
    options.join(' ').length <= 48 &&
    slide.text.length <= 90
  ) {
    return true;
  }
  return /\bor\b/.test(blob) && slide.text.length <= 64;
}

function emptyScores(): Record<CoverTone, number> {
  return {
    cheat: 0,
    jealous: 0,
    redflag: 0,
    fight: 0,
    lie: 0,
    spicy: 0,
    situationship: 0,
    quiz: 0,
    wyr: 0,
    choice: 0,
    funny: 0,
    secret: 0,
    deep: 0,
    soft: 0,
    hypothetical: 0,
    knowyou: 0,
    neutral: 0,
  };
}

function scoreSlide(slide: CopycatCoverSlide, scores: Record<CoverTone, number>): void {
  const blob = slideBlob(slide);
  const question = slide.text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201b]/g, "'")
    .replace(/[\u201c\u201d]/g, '"');
  const add = (tone: CoverTone) => {
    scores[tone] += 1;
  };
  let specific = false;
  const hit = (tone: CoverTone) => {
    add(tone);
    specific = true;
  };
  if (/would you rather/.test(blob)) {
    add('wyr');
    specific = true;
  }
  if (
    /\b(cheat|cheating|cheated|loyal|loyalty)\b/.test(question) ||
    /\bside piece\b/.test(question) ||
    /\banother (girl|guy|boy|man|woman|person)\b/.test(question)
  ) {
    hit('cheat');
  }
  if (
    /\b(jealous|jealousy|possessive)\b/.test(question) ||
    /\bflirts? with (me|you|him|her)\b/.test(question)
  ) {
    hit('jealous');
  }
  if (/\b(red flag|red flags|ick|toxic|ghosted|ghosting|bare minimum)\b/.test(question)) {
    hit('redflag');
  }
  if (
    /\b(fight|fighting|argument|argue|arguing|annoying|annoyed)\b/.test(question) ||
    /\bmad at\b/.test(question)
  ) {
    hit('fight');
  }
  if (/\b(lie|lies|lied|lying)\b/.test(question) || /\bthe truth\b/.test(question)) hit('lie');
  if (
    /\b(spicy|flirty|flirt|flirting|horny|naked|naughty|hookup|thirsty|freaky)\b/.test(question) ||
    /\bhook up\b/.test(question) ||
    /\bmake ?out\b/.test(question) ||
    /\bturn(?:s|ed)? (?:me |you )?on\b/.test(question) ||
    /\bin bed\b/.test(question)
  ) {
    hit('spicy');
  }
  if (
    /\b(situationship|talking stage|exclusive|emotionally available)\b/.test(blob) ||
    /\bjust a vibe\b/.test(blob) ||
    /what are we/.test(blob) ||
    /\bdefine the relationship\b/.test(blob)
  ) {
    hit('situationship');
  }
  if (
    /\bout of 10\b/.test(blob) ||
    /\b(quiz|score)\b/.test(blob) ||
    /\bvibe check\b/.test(blob) ||
    /\brate (me|him|her|your|my)\b/.test(blob) ||
    /\bhow well do you\b/.test(blob)
  ) {
    hit('quiz');
  }
  if (
    /\b(silly|nickname|emoji|funny|dumb|chaos|goofy|meme|ridiculous)\b/.test(question) ||
    /\bweird/.test(question) ||
    /make (?:you|me|him|her|them) laugh/.test(question) ||
    /try not to laugh/.test(question) ||
    /warning label/.test(question) ||
    /\b(worm|bald|krispy)\b/.test(question)
  ) {
    hit('funny');
  }
  if (
    /\b(secret|secrets|hiding)\b/.test(blob) ||
    /never told/.test(blob) ||
    /never tell/.test(blob) ||
    /afraid to ask/.test(blob) ||
    /won'?t admit/.test(blob) ||
    /\bscared\b/.test(blob) ||
    /never told me/.test(blob) ||
    /haven't told/.test(blob)
  ) {
    hit('secret');
  }
  if (
    /taken for granted/.test(blob) ||
    /\b(insecure|insecurities|vulnerable|resent|neglected)\b/.test(blob) ||
    /\bprioriti[sz]e\b/.test(blob) ||
    /\bboundaries\b/.test(blob) ||
    /feel (more )?secure/.test(blob) ||
    /upset with/.test(blob) ||
    /\btrust\b/.test(blob) ||
    /\b(marriage|married)\b/.test(blob) ||
    /\b(leave me|leaving|settling)\b/.test(blob) ||
    /happy with me/.test(blob) ||
    /hardest part/.test(blob) ||
    /our future/.test(blob) ||
    /\bfear\b/.test(blob) ||
    /\bex(es)?\b/.test(blob) ||
    /change about/.test(blob) ||
    /hardest (thing|topic)/.test(blob) ||
    /\bfrustrat/.test(blob) ||
    /can'?t talk/.test(blob) ||
    /threat to/.test(blob) ||
    /compared me/.test(blob) ||
    /compared my/.test(blob) ||
    /family (disliked|dislike|didn'?t approve|doesn'?t approve)/.test(blob) ||
    /something missing/.test(blob) ||
    /without me/.test(blob) ||
    /annoys you/.test(blob) ||
    /performing a version/.test(blob) ||
    /thought about leaving/.test(blob) ||
    /change one thing/.test(blob) ||
    /\bdoubt/.test(blob)
  ) {
    hit('deep');
  }
  if (
    /\b(adorable|cute\w*|blush|cuddle|butterflies)\b/.test(blob) ||
    /\b(heart|proud)\b/.test(blob) ||
    /\blov(e|ing|ed)\b/.test(blob) ||
    /\bkiss/.test(blob) ||
    /miss you/.test(blob) ||
    /feel closer/.test(blob) ||
    /favorite thing/.test(blob) ||
    /warms your/.test(blob) ||
    /\b(happiest|closest|comfort)/.test(blob) ||
    /perfect day/.test(blob) ||
    /eyes go/.test(blob) ||
    /stuck in your head/.test(blob) ||
    /you'?d miss/.test(blob) ||
    /think of me/.test(blob) ||
    /next to you/.test(blob) ||
    /irresistible/.test(blob) ||
    /secretly love/.test(blob)
  ) {
    hit('soft');
  }
  if (
    /\b(favorite|nickname)\b/.test(blob) ||
    /\bdescribe me\b/.test(blob) ||
    /\bone word\b/.test(blob) ||
    /first thing/.test(blob) ||
    /surprised you/.test(blob) ||
    /surprises you/.test(blob) ||
    /what do you think of me/.test(blob) ||
    /reminds you of/.test(blob) ||
    /what am i to you/.test(blob) ||
    /notice me/.test(blob) ||
    /first (time we met|impression)/.test(blob) ||
    /remember forever/.test(blob)
  ) {
    hit('knowyou');
  }
  if (!specific && (/^if\b/.test(blob) || /\bwhat if\b/.test(blob) || /\bwhat would you\b/.test(blob))) {
    add('hypothetical');
  }
  if (!specific && isChoiceSlide(slide, blob)) add('choice');
}

export function classifyCopycatPost(post: CopycatCoverPost): {
  tone: CoverTone;
  audience: CopycatAudience;
  questionCount: number;
} {
  const slides = visibleSlides(post);
  const n = slides.length;
  const scores = emptyScores();
  for (const slide of slides) scoreSlide(slide, scores);

  const choiceMajority = n > 0 && scores.choice >= 2 && scores.choice >= Math.ceil(n * 0.6);
  const wyrMajority = n > 0 && scores.wyr >= 2 && scores.wyr >= Math.ceil(n * 0.5);
  let tone: CoverTone = 'neutral';
  if (wyrMajority && scores.wyr >= scores.choice) tone = 'wyr';
  else if (choiceMajority) tone = 'choice';
  else {
    let bestScore = 0;
    for (const candidate of TONE_PRIORITY) {
      if (scores[candidate] > bestScore) bestScore = scores[candidate];
    }
    if (bestScore >= 2) {
      const tied = TONE_PRIORITY.filter((candidate) => scores[candidate] === bestScore);
      const gentle = tied.filter((candidate) => !HARSH_TONES.has(candidate));
      tone = (gentle[0] ?? tied[0])!;
    }
  }

  return {
    tone,
    audience: detectAudience(post.coverText, slides),
    questionCount: n,
  };
}

function detectAudience(coverText: string, slides: CopycatCoverSlide[]): CopycatAudience {
  const cover = coverText.toLowerCase();
  const questions = slides.map(slideBlob).join('\n');
  let bf = 0;
  let gf = 0;
  let friend = 0;
  let partner = 0;
  if (/\b(boyfriend|your bf|your boy|your man|hubby)\b/.test(cover)) bf += 4;
  if (/\b(girlfriend|your gf|your girl|wifey)\b/.test(cover)) gf += 4;
  if (/\bpartner\b/.test(cover)) partner += 4;
  if (/\b(besties?|friends?)\b/.test(cover) && bf === 0 && gf === 0 && partner === 0) {
    friend += 4;
  }
  if (bf === 0 && gf === 0 && friend === 0 && partner === 0) {
    const him = /\b(him|his|he)\b/.test(cover);
    const her = /\b(her|she)\b/.test(cover);
    if (him && !her) bf += 2;
    if (her && !him) gf += 2;
  }
  gf += (questions.match(/introduce me as your boyfriend/g) ?? []).length * 3;
  bf += (questions.match(/introduce me as your girlfriend/g) ?? []).length * 3;
  bf += (questions.match(/\b(?:your|my) boyfriend\b/g) ?? []).length;
  gf += (questions.match(/\b(?:your|my) girlfriend\b/g) ?? []).length;
  if (/\b(?:your|my) partner\b/.test(questions)) partner += 2;

  const romantic = /\b(boyfriend|girlfriend|partner|dating|relationship|crush)\b/.test(questions);
  const friendQs = (questions.match(/\byour friends?\b/g) ?? []).length;
  if (friend >= 4 && !romantic) return 'friend';
  if (friendQs >= 3 && !romantic && bf === 0 && gf === 0 && partner === 0) return 'friend';

  const ranked: Array<[CopycatAudience, number]> = [
    ['bf', bf],
    ['gf', gf],
    ['partner', partner],
    ['friend', friend],
  ];
  ranked.sort((a, b) => b[1] - a[1]);
  if (ranked[0]![1] > 0) return ranked[0]![0];
  return 'partner';
}

function hashInt(input: string): number {
  return parseInt(sha256Hex(input).slice(0, 8), 16);
}

function renderTemplate(
  template: string,
  audience: CopycatAudience,
  questionCount: number,
  slideIndex: number
): string {
  const pack = PACKS[audience];
  const rendered = template.replace(TOKEN, (token) => {
    const key = token.slice(1, -1);
    if (key === 'n') return String(questionCount);
    if (key === 'k') return String(slideIndex);
    return pack[key as keyof Pack];
  });
  return rendered.replace(/\s+/g, ' ').trim().toLowerCase();
}

function coverLineCount(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let lines = 1;
  let column = words[0]!.length;
  for (let i = 1; i < words.length; i++) {
    const word = words[i]!;
    if (column + 1 + word.length > COVER_LINE_CHARS) {
      lines += 1;
      column = word.length;
    } else {
      column += 1 + word.length;
    }
  }
  return lines;
}

function countsAreHonest(text: string, questionCount: number, slideIndex: number): boolean {
  const stripped = text.replace(/2am/g, '');
  const nums = stripped.match(/\d+/g);
  if (!nums) return true;
  return nums.every((raw) => {
    const value = Number(raw);
    return value === questionCount || value === slideIndex;
  });
}

function fitsCover(text: string, questionCount: number, slideIndex: number): boolean {
  if (!text) return false;
  if (text.split(/\s+/).some((word) => word.length > COVER_LINE_CHARS)) return false;
  if (coverLineCount(text) > COVER_MAX_LINES) return false;
  return countsAreHonest(text, questionCount, slideIndex);
}

function scopeOk(scope: CoverScope, audience: CopycatAudience): boolean {
  if (audience === 'friend') return scope === 'friend' || scope === 'any';
  return scope === 'couple' || scope === 'any';
}

function renderPool(
  templates: CoverTemplate[],
  tone: CoverTone,
  audience: CopycatAudience,
  questionCount: number,
  slideIndex: number,
  includeCoupleForFriend = false
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const template of templates) {
    const friendBorrow =
      includeCoupleForFriend && audience === 'friend' && template.scope === 'couple';
    if (template.tone !== tone || (!scopeOk(template.scope, audience) && !friendBorrow)) continue;
    if (questionCount < 1 && /\{[nk]\}/.test(template.text)) continue;
    const text = renderTemplate(template.text, audience, questionCount, slideIndex);
    if (friendBorrow && /date night|soulmate|exclusive|cuddle|pillow|fall for|i love you/.test(text)) {
      continue;
    }
    if (!fitsCover(text, questionCount, slideIndex) || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

function fallbackCover(audience: CopycatAudience): string {
  return `ask ${PACKS[audience].him} these, for real`;
}

export function pickCopycatCover(
  post: CopycatCoverPost,
  options?: { avoid?: string | null }
): string {
  const { tone, audience, questionCount } = classifyCopycatPost(post);
  const n = questionCount > 0 ? questionCount : 1;
  const slideIndex = (hashInt(`${post.id}\nk`) % n) + 1;
  const templates = coverTemplates();
  let pool = renderPool(templates, tone, audience, questionCount, slideIndex);
  if (pool.length === 0 && audience === 'friend' && tone !== 'neutral') {
    pool = renderPool(templates, tone, audience, questionCount, slideIndex, true);
  }
  if (pool.length === 0 && tone !== 'neutral') {
    pool = renderPool(templates, 'neutral', audience, questionCount, slideIndex);
  }
  if (pool.length === 0) return fallbackCover(audience);

  const start = hashInt(`${post.id}\n${tone}\n${audience}`) % pool.length;
  const avoid = options?.avoid?.trim().toLowerCase() ?? '';
  if (!avoid) return pool[start]!;
  for (let step = 0; step < pool.length; step++) {
    const candidate = pool[(start + step) % pool.length]!;
    if (candidate.toLowerCase() !== avoid) return candidate;
  }
  return pool[start]!;
}
