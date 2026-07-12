import { FUNNY_QUESTIONS, VIDEO_TEMPLATE2_PEXELS_QUERIES } from '@/app/lib/constants';

const DAILY_TEMPLATE_TITLES_FUNNY = [
  '5 Impossible Questions To Tease Your Boyfriend Tonight',
  '5 Questions To Ask Your Sweet Heart Tonight',
  '5 Fun Questions To Gaslight Your Boyfriend Tonight',
  'Does he pass the good boyfriend test?',
  '5 Questions To Test How Well Trained Your Boyfriend Is',
  '5 Impossible Questions To Test Your Boyfriend Tonight',
  '5 Questions Every Boyfriend Must Answer Tonight If He Loves You',
  '5 Questions To Test If Your Boyfriend Is The One',
  '5 Impossible QuestionS To Test If Your Boyfriend Is Husband Material',
  '5 Questions For Internation Rage Bait Boyfriend Day',
  '5 Questions To Ask Your Boyfriend When He\'s Busy Or Tired',
  '5 Questions Every Girlfriends Should Ask Their Boyfriend',
  '5 Questions To Make Your Boyfriend Take A Deep Breath',
  '5 Risky Questions To Ask Your Boyfriend Tonight',
  '5 Dumb Questions To Ragebait Your Boyfriend Tonight',
  '5 Fun Questions To Tease Your Boyfriend Tonight',
  '5 Cute Questions To Ask Your Boyfriend Before Moving In Together',
  '5 Dumb Questions To Ask Your Boyfriend Tonight',
  '5 Dumb Questions To Ask Your Boyfriend To Make Sure He Loves You',
  '5 Ragebait Questions To Ask Your Boyfriend Tonight',
  '5 Fun Questions To See How Much Does Your Boyfriend Loves You',
  '5 Simple Question To Test Your Boyfriend Tonight',
  '5 Cute Questions Every Boyfriend Must Answer Tonight',
  '5 Questions Every Boyfriend Gets Wrong',
  'Does Your Boyfriend Pass The Jealousy Test?',
  'Does Your boyfriend Pass The Loyalty Test?',
  '5 Cute Questions To Fall In Love With Your Boyfriend',
  '5 Questions A Good Boyfriend Should Get Right',
  '5 Cute Questions All Boyfriends Must Answer Tonight',
  '5 Questions Every Boyfriend Must Answer Tonight If They Love You',
  '5 Very Important Questions Your Boyfriend Need To Answer Tonight',
  '5 Niche Conversation Starters To Keep The Spark Alive',
  '5 Fun Questions To Check How Much Does He Love You',
  '5 Fun Questions To Ragebait Your Boo',
  'Does He Pass The Boyfriend Test',
  '5 Impossible Questions To Ask Your Boyfriend Tonight',
  '5 Dumb Questions To Annoy Your Boyfriend',
  '5 Cute Questions To Fall In Love With You Boyfriend Again',
] as const;

export const VIDEO_TEMPLATE2_QUESTION_COUNT = 7;

function shuffleCopy<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandomDailyFunnyTitle(exclude?: string): string {
  const pool = [...DAILY_TEMPLATE_TITLES_FUNNY];
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0]!;
  let next = pool[Math.floor(Math.random() * pool.length)]!;
  if (exclude && next === exclude) {
    next = pool.find((t) => t !== exclude) ?? next;
  }
  return next;
}

export function pickRandomFunnyQuestions(count: number): string[] {
  return shuffleCopy([...FUNNY_QUESTIONS]).slice(0, count);
}

export function pickRandomPexelsQuery(): string {
  const queries = [...VIDEO_TEMPLATE2_PEXELS_QUERIES];
  return queries[Math.floor(Math.random() * queries.length)]!;
}

export function pickRandomPexelsPage(): number {
  return 1 + Math.floor(Math.random() * 15);
}

export function pickDailyVideoTemplate2Content() {
  return {
    title: pickRandomDailyFunnyTitle(),
    questions: pickRandomFunnyQuestions(VIDEO_TEMPLATE2_QUESTION_COUNT),
    pexelsQuery: pickRandomPexelsQuery(),
    pexelsPage: pickRandomPexelsPage(),
  };
}
