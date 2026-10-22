export type CopycatSlideText = {
  text: string;
  options?: string[];
};

export type CopycatPost = {
  id: string;
  views: number;
  coverText: string;
  slideText: CopycatSlideText[];
  handle?: string;
  platform?: 'tiktok' | 'instagram';
};

export const COPYCAT_MIN_VIEWS = 100_000;

export function filterCopycatPostsByMinViews(
  posts: CopycatPost[],
  minViews = COPYCAT_MIN_VIEWS
): CopycatPost[] {
  return posts.filter((post) => post.views >= minViews);
}

export type CopycatCompetitorFeed = {
  handle: string;
  minViews: number;
  postCount: number;
  posts: CopycatPost[];
  platform?: 'tiktok' | 'instagram';
};

/** Flamingo cards high-view posts used by the Copycat tab. */
export const FLAMINGO_CARDS_FEED: CopycatCompetitorFeed = {
  handle: 'flamingokiss1',
  minViews: 100000,
  postCount: 11,
  posts: [
    {
      id: '7693788475140705566',
      views: 805809,
      coverText: '5 dumb questions to crack your gf',
      slideText: [
        { text: 'Would you kiss a woman to save my life?' },
        { text: 'If I got turned into a baby, would you raise me or give me away?' },
        { text: 'Would you still like me if I went bald?' },
        { text: 'Have you had Krispy Kreme? Was it crispy?' },
        { text: 'If I was a worm, would you still talk to me?' },
      ],
    },
    {
      id: '7696330650902613278',
      views: 727955,
      coverText: 'Ragebait your boyfriend with these questions',
      slideText: [
        {
          text: 'If you were already married when we met, would you choose me or stay loyal to your wife?',
        },
        {
          text: "If I wasn't your type physically, do you think you'd still fall in love with me?",
        },
        {
          text: 'If loving me meant disappointing everyone else, would you still choose me?',
        },
        {
          text: "If I became someone your family didn't approve of, would you still fight for us?",
        },
        {
          text: "If meeting me meant losing something you've always dreamed of having, would you still choose me?",
        },
      ],
    },
    {
      id: '7684040403699600671',
      views: 608112,
      coverText: 'Do you remember our first kiss?',
      slideText: [
        {
          text: 'What was going through your mind right before you kissed me?',
          options: [
            'Should I do it?',
            'I hope they kiss me first.',
            "I couldn't stop looking at you.",
            'I was trying not to panic.',
          ],
        },
        {
          text: 'Who do you think was more nervous during our first kiss?',
          options: ['Me', 'You', 'Both of us', 'Neither — we acted cool'],
        },
        {
          text: "What's the one detail you still remember about that moment?",
          options: ['The place', 'What I was wearing', 'The way I looked at you', 'Everything'],
        },
        {
          text: 'If you could relive our first kiss exactly once, would you?',
          options: [
            'In a heartbeat',
            "Yes, but I'd kiss you longer",
            "I'd recreate it somewhere even more romantic",
            'No — I love making new memories with you instead',
          ],
        },
        {
          text: 'After our first kiss, what did you want to do next?',
          options: ['Kiss you again', 'Hold your hand', 'Tell everyone I liked you'],
        },
      ],
    },
    {
      id: '7692221727773887775',
      views: 359503,
      coverText: '6 random ahh questions for your BF',
      slideText: [
        {
          text: "Imagine you're in a room with 20+ girls, blindfolded. None of us can talk — how would you find me?",
        },
        { text: "What type of mom do you think I'll be?" },
        { text: 'If I randomly sent you "I messed up," what would be your first guess why?' },
        { text: "What's the weirdest compliment you've ever given me?" },
        { text: "What's the most random thing you've ever Googled at 2AM?" },
        { text: 'Which snack could you eat every day and never get tired of?' },
      ],
    },
    {
      id: '7697000453254499615',
      views: 323291,
      coverText: 'Aww or eww?',
      slideText: [
        { text: 'Sharing a toothbrush.', options: ['Aww', 'Eww'] },
        {
          text: 'Sitting on the same side of the booth instead of across from each other.',
          options: ['Aww', 'Eww'],
        },
        {
          text: "Baby talk when talking to each other on the phone, even when you're in public.",
          options: ['Aww', 'Eww'],
        },
        {
          text: "You're each other's wallpaper on your phones, laptops and even your work computers.",
          options: ['Aww', 'Eww'],
        },
        {
          text: 'Going as a "package" to every event either of you gets invited to.',
          options: ['Aww', 'Eww'],
        },
      ],
    },
    {
      id: '7696621539264875807',
      views: 291210,
      coverText: 'This or That: If we have a baby',
      slideText: [
        { text: 'Baby boy or baby girl?', options: ['Baby boy', 'baby girl'] },
        { text: 'One baby or twins?', options: ['One baby', 'twins'] },
        { text: 'Your eyes or my eyes?', options: ['Your eyes', 'my eyes'] },
        {
          text: 'Your personality or my personality?',
          options: ['Your personality', 'my personality'],
        },
        {
          text: 'Big birthday parties or small family celebrations?',
          options: ['Big birthday parties', 'small family celebrations'],
        },
        {
          text: 'Public school or private school?',
          options: ['Public school', 'private school'],
        },
      ],
    },
    {
      id: '7685463458711719198',
      views: 195846,
      coverText: 'Test His Jealous Side',
      slideText: [
        {
          text: 'When someone flirts with me in public, how would you react?',
          options: ['Laugh it off', 'Confront them', 'Ignore it', 'Get upset'],
        },
        {
          text: 'What do I do that makes you feel a little protective?',
          options: ['Too friendly', 'Revealing clothes', 'Talk to strangers', 'Share personal stories'],
        },
        {
          text: 'What kind of look from a stranger ruins your mood fast?',
          options: ['Flirty smile', 'Staring gaze', 'Disapproving glance', 'Lingering look'],
        },
        {
          text: 'Be honest, how jealous do you get over me?',
          options: ['A little', 'Sometimes', 'More than I say', 'A lot'],
        },
        {
          text: 'When we are out together, what makes you the most watchful?',
          options: ['Guys staring', 'Guys flirting', 'Me too nice', 'Bad vibe'],
        },
        {
          text: "If I did not notice someone crossing a line with me, what would you do?",
          options: ['Let it go', 'Tell me after', 'Step in calmly', 'Get upset'],
        },
      ],
    },
    {
      id: '7692288047332773151',
      views: 145586,
      coverText: 'What kinda boyfriend am I?',
      slideText: [
        {
          text: 'What kind of movie character am I?',
          options: ['The hero', 'The sidekick', 'The villain', 'The love interest'],
        },
        {
          text: 'Which drink suits me most?',
          options: ['Monster', 'Iced coffee', 'Coca-cola', 'Whiskey'],
        },
        {
          text: 'What animal best represents my boyfriend energy?',
          options: ['Puppy', 'Lion', 'Hawk', 'Dolphin'],
        },
      ],
    },
    {
      id: '7684041167650032927',
      views: 134375,
      coverText: 'Let your girl rate your boyfriend skills',
      slideText: [
        { text: 'Kissing' },
        { text: 'Texting' },
        { text: 'Listening' },
        { text: 'Gift-giving' },
        { text: 'Making me laugh' },
        { text: 'Making me feel safe' },
        { text: 'Giving compliments' },
        { text: 'Handling my mood swings' },
        { text: 'Remembering the little things' },
        { text: 'Being my personal photographer' },
      ],
    },
    {
      id: '7697079343524351262',
      views: 130475,
      coverText: 'If we had a baby together',
      slideText: [
        {
          text: "What would our kid call you when they're little?",
          options: ['Daddy', 'Dad', 'Papa', 'Whatever they invent'],
        },
        {
          text: 'What would you secretly hope our kid gets from me?',
          options: ['My kindness', 'My confidence', 'My personality', 'My smile'],
        },
        {
          text: 'What would our kid probably inherit from you?',
          options: ['Your looks', 'Your patience', 'Your humor', 'Your habits'],
        },
      ],
    },
    {
      id: '7694004809292188958',
      views: 124919,
      coverText: '3 questions only he could answer',
      slideText: [
        {
          text: 'Where do your eyes go first when you see me?',
          options: ['My eyes', 'My smile', 'My outfit', 'My whole face'],
        },
        {
          text: 'What sound do I make that gets stuck in your head?',
          options: ['My laugh', 'The way I say your name', 'My happy squeal', 'My random noises'],
        },
        {
          text: "What's something I do that you'd miss the second I stopped?",
          options: ['My hugs', 'My texts', 'My laugh', 'My little habits'],
        },
      ],
    },
  ],
};

const OPTION_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

/** Collapse OCR/JSON line breaks inside a title or question into single spaces. */
export function collapseCopycatInlineBreaks(text: string): string {
  return text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Drop carousel UI chrome OCR'd into titles/options
 * ("swipe →", "swipe to start →", app promo footer glued onto last option).
 */
export function stripCopycatSwipeChrome(text: string): string {
  return text
    .replace(/\s*swipe\s+to\s+start\s*→?/gi, '')
    .replace(/\s*swipe\s*[→➜➡›»>]\s*/gi, ' ')
    .replace(/\s*swipe\s*$/gi, '')
    .replace(/\s*Q\s*search\s+for\s+[\s\S]*$/i, '')
    .replace(/\s*search\s+for\s+more\s+questions[\s\S]*$/i, '')
    .replace(/\s*(?:•ll|all)?\s*<\s*Search\s+today[\s\S]*$/i, '')
    .replace(/\s*deep\s+questions\.?\s*couple\s+convos\.?[\s\S]*$/i, '')
    // App Store status-bar + 21Q listing OCR glued onto last carousel slides.
    .replace(/\s*9:?48[\s\S]*$/i, '')
    .replace(/\s*Cancel\s+[Q\s-]*Card Games[\s\S]*$/i, '')
    .replace(/\s*THE LOVE IAB\s*$/i, '')
    .replace(/\s*[→➜➡›»>]+\s*$/g, '')
    // Orphan openers left after stripping " (swipe to start →"
    .replace(/\s*[\(\[]\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalize cover / question / option text for display and export. */
export function cleanCopycatDisplayText(text: string): string {
  return stripCopycatSwipeChrome(collapseCopycatInlineBreaks(text));
}

/** Question + a. b. c. options for preview / export text. */
export function formatCopycatSlideBody(slide: CopycatSlideText): string {
  const question = cleanCopycatDisplayText(slide.text);
  if (!slide.options?.length) return question;
  const lines = slide.options.map(
    (option, index) =>
      `${OPTION_LETTERS[index] ?? String(index + 1)}. ${cleanCopycatDisplayText(option)}`
  );
  return `${question}\n\n${lines.join('\n')}`;
}

/** Split a formatted slide body into the question and a. b. c. options. */
export function splitCopycatQuestionAndOptions(text: string): {
  question: string;
  options: string;
} {
  const match = text.match(/^([\s\S]*?)\n\n((?:[a-z0-9]\.\s[\s\S]*))$/i);
  if (!match) return { question: text, options: '' };
  return { question: match[1]!.trimEnd(), options: match[2]! };
}

/** Cover + question slides for a post (question count follows the source post). */
export function copycatPostSlideBodies(post: CopycatPost): string[] {
  return [
    cleanCopycatDisplayText(post.coverText),
    ...post.slideText.map(formatCopycatSlideBody),
  ];
}

export function formatCopycatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (views >= 1_000) return `${Math.round(views / 1_000)}K`;
  return String(views);
}

export function formatCopycatEngagement(
  post: CopycatPost
): string {
  if (post.platform === 'instagram') {
    return `${formatCopycatViews(post.views)} likes`;
  }
  return `${formatCopycatViews(post.views)} views`;
}

/** Skip OCR junk slides that are App Store CTAs from scraped carousels. */
export function isCopycatPromoNoiseSlide(slide: CopycatSlideText): boolean {
  const text = slide.text.trim();
  return (
    /WANT\s*1,?000/i.test(text) ||
    /Download the app/i.test(text) ||
    /apps\.apple\.com/i.test(text)
  );
}

export function copycatPostSlideBodiesClean(post: CopycatPost): string[] {
  const slides = post.slideText.filter((slide) => !isCopycatPromoNoiseSlide(slide));
  return [
    cleanCopycatDisplayText(post.coverText),
    ...slides.map(formatCopycatSlideBody),
  ];
}
