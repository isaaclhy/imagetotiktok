import OpenAI from 'openai';

/** Combined Spill It title + caption prompt (OpenAI platform). */
export const DAILY_COPY_PROMPT_ID = 'pmpt_6a6643bfe330819583ea4028ebac1b7b0071dd49edc1d12e';
export const DAILY_COPY_PROMPT_VERSION = '4';

export type DailyCopyQuestionType = 'funny' | 'flirty' | 'me_or_you' | 'brave';

export type DailyCopyResult = {
  title: string;
  description: string;
  raw: string;
};

const TYPE_LABEL: Record<DailyCopyQuestionType, string> = {
  funny: 'Funny',
  flirty: 'Flirty',
  me_or_you: 'Me or you',
  brave: 'Brave',
};

/** Extra tone hints sent with the questions so the stored prompt can adapt per type. */
const TYPE_GUIDANCE: Record<DailyCopyQuestionType, string> = {
  funny:
    'Playful, chaotic, light ragebait humor. Awkward / funny boyfriend questions. Curious and slightly confrontational, never mean.',
  flirty:
    'Spicy, teasing, romantic tension. Temptation and flirty energy — never NSFW-explicit, never crude.',
  me_or_you:
    'Competitive couples comparison. "Me or you" / who would win energy. Playful rivalry, not cruelty.',
  brave:
    'Deep, uncomfortable-but-healthy honesty. Brave / vulnerable relationship questions. Serious curiosity, not cruelty.',
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

export function isDailyCopyQuestionType(value: unknown): value is DailyCopyQuestionType {
  return value === 'funny' || value === 'flirty' || value === 'me_or_you' || value === 'brave';
}

/**
 * Generate title + caption for Spill It daily TikTok.
 * OpenAI prompt variables: {{type}}, {{type_label}}, {{type_guidance}}, {{questions}}
 */
export async function generateDailyCopy(
  questions: string,
  type: DailyCopyQuestionType = 'funny'
): Promise<DailyCopyResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    prompt: {
      id: DAILY_COPY_PROMPT_ID,
      version: DAILY_COPY_PROMPT_VERSION,
      variables: {
        type,
        type_label: TYPE_LABEL[type],
        type_guidance: TYPE_GUIDANCE[type],
        questions,
      },
    },
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
