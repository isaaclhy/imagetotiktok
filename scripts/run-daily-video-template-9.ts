import { runDailySpillQuiz } from '@/app/lib/spill-quiz/run-daily';

async function main() {
  const result = await runDailySpillQuiz(9);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
