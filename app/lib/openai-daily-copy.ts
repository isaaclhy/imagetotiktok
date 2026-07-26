import OpenAI from 'openai';

/** Combined Spill It title + caption prompt (OpenAI platform). */
export const DAILY_COPY_PROMPT_ID = 'pmpt_6a6643bfe330819583ea4028ebac1b7b0071dd49edc1d12e';
export const DAILY_COPY_PROMPT_VERSION = '3';

export type DailyCopyResult = {
  title: string;
  description: string;
  raw: string;
};

function extractOutputText(res: {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}): string {
  if (typeof res.output_text === 'string' && res.output_text.trim()) {
    return res.output_text;
  }
  const out = res?.output ?? [];
  for (const item of out) {
    const content = item?.content ?? [];
    for (const c of content) {
      if (c?.type === 'output_text' && typeof c?.text === 'string') return c.text;
    }
  }
  return '';
}

/** Parse TITLE / DESCRIPTION / HASHTAGS blocks from the combined prompt output. */
export function parseDailyCopy(raw: string): DailyCopyResult {
  const text = raw.trim();
  const titleMatch = text.match(/^\s*TITLE:\s*(.+)$/im);
  const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*?)(?=\n\s*HASHTAGS:|$)/i);
  const tagsMatch = text.match(/HASHTAGS:\s*(.+)$/im);

  const title = (titleMatch?.[1] ?? '').trim();
  const descriptionBody = (descMatch?.[1] ?? '').trim();
  const hashtags = (tagsMatch?.[1] ?? '').trim();

  const description = [descriptionBody, hashtags].filter(Boolean).join('\n\n').trim();

  return {
    title: title || text.split('\n')[0]!.trim(),
    description: description || text,
    raw: text,
  };
}

export async function generateDailyCopy(questions: string): Promise<DailyCopyResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    prompt: {
      id: DAILY_COPY_PROMPT_ID,
      version: DAILY_COPY_PROMPT_VERSION,
    },
    input: `Questions:\n${questions}`,
  });

  const outputText = extractOutputText(
    response as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    }
  );

  if (!outputText?.trim()) throw new Error('No text generated');
  return parseDailyCopy(outputText);
}
