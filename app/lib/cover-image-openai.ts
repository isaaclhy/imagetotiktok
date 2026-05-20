import OpenAI from 'openai';

export const COVER_IMAGE_PROMPT_IDS = [
  'pmpt_697bd67b55d48190ba24de5df8a84f3c0e7de9c8192b5cdc',
  'pmpt_6990f9a317588194827b173df4b3d6a30d4beef4679a5add',
  'pmpt_6991006af1cc8195a60c91937fc07b7100c73c923d7ad252',
] as const;

function extractOutputText(res: {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}): string {
  const out = res?.output ?? [];
  for (const item of out) {
    const content = item?.content ?? [];
    for (const c of content) {
      if (c?.type === 'output_text' && typeof c?.text === 'string') return c.text;
    }
  }
  return '';
}

export function pickCoverPromptId(promptIdParam: string | null | undefined): string {
  if (promptIdParam && COVER_IMAGE_PROMPT_IDS.includes(promptIdParam as (typeof COVER_IMAGE_PROMPT_IDS)[number])) {
    return promptIdParam;
  }
  return COVER_IMAGE_PROMPT_IDS[Math.floor(Math.random() * COVER_IMAGE_PROMPT_IDS.length)]!;
}

export async function buildCoverImagePromptText(
  questiontext: string,
  promptId?: string | null
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  if (!questiontext.trim()) throw new Error('questiontext is required');

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    prompt: {
      id: pickCoverPromptId(promptId),
      variables: { questiontext },
    },
  });

  const imagePrompt =
    (response as { output_text?: string }).output_text ??
    extractOutputText(response as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> });

  if (!imagePrompt?.trim()) throw new Error('No image prompt generated');
  return imagePrompt.trim();
}
