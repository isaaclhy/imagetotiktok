import {
  SPILL_QUIZ_VOICE_KNOW_HER,
  type SpillQuizVoiceSettings,
} from '@/app/lib/spill-quiz/voices';
import {
  spillQuizTtsModel,
  spillQuizVoiceId,
  spillQuizVoiceSettings,
  type SpillQuizTemplateId,
} from '@/app/lib/spill-quiz/script';

export type SpillQuizTtsProvider = 'elevenlabs' | 'openai';

type SpeechLine = {
  text: string;
  audio: Buffer;
  provider: SpillQuizTtsProvider;
};

function withoutSpeed(settings: SpillQuizVoiceSettings) {
  return {
    stability: settings.stability,
    similarity_boost: settings.similarity_boost,
    style: settings.style,
    use_speaker_boost: settings.use_speaker_boost,
  };
}

async function elevenLabsSpeech(text: string, voiceId: string, modelId: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY');

  const settings = spillQuizVoiceSettings();
  const request = async (voice: string, voiceSettings: object) => {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    });
    return res;
  };

  let voice = voiceId;
  let res = await request(voice, settings);
  if (!res.ok && voice !== SPILL_QUIZ_VOICE_KNOW_HER) {
    voice = SPILL_QUIZ_VOICE_KNOW_HER;
    res = await request(voice, settings);
  }
  if (!res.ok) {
    res = await request(voice, withoutSpeed(settings));
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`ElevenLabs TTS failed (${res.status}) ${errText.slice(0, 180)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function openAiSpeech(text: string, templateId: SpillQuizTemplateId): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });
  const speech = await client.audio.speech.create({
    model: 'tts-1-hd',
    voice: templateId === 8 ? 'nova' : 'shimmer',
    input: text,
  });
  return Buffer.from(await speech.arrayBuffer());
}

export async function synthesizeSpillQuizLines(
  templateId: SpillQuizTemplateId,
  lines: string[]
): Promise<{ provider: SpillQuizTtsProvider; clips: SpeechLine[] }> {
  const texts = lines.map((line) => line.trim()).filter(Boolean);
  if (texts.length === 0) throw new Error('Quiz script is empty');

  const useEleven = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const useOpenAi = Boolean(process.env.OPENAI_API_KEY?.trim());
  if (!useEleven && !useOpenAi) {
    throw new Error('Set ELEVENLABS_API_KEY (preferred) or OPENAI_API_KEY for spoken quiz videos');
  }

  const provider: SpillQuizTtsProvider = useEleven ? 'elevenlabs' : 'openai';
  const clips: SpeechLine[] = [];
  for (const text of texts) {
    const audio = useEleven
      ? await elevenLabsSpeech(text, spillQuizVoiceId(templateId), spillQuizTtsModel())
      : await openAiSpeech(text, templateId);
    if (audio.length < 64) throw new Error('TTS returned empty audio');
    clips.push({ text, audio, provider });
  }
  return { provider, clips };
}
