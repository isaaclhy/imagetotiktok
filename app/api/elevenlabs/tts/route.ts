import { NextRequest, NextResponse } from 'next/server';
import {
  FAB_AFFIRMATION_TTS_MODEL,
  FAB_AFFIRMATION_TTS_VOICE_ID,
  FAB_AFFIRMATION_TTS_VOICE_SETTINGS,
} from '@/app/lib/fab-video';

/**
 * POST /api/elevenlabs/tts
 * Body: { text: string, voiceId?: string, modelId?: string }
 * Returns audio/mpeg. Requires ELEVENLABS_API_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing ELEVENLABS_API_KEY' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const voiceId =
      (typeof body?.voiceId === 'string' && body.voiceId.trim()) ||
      process.env.ELEVENLABS_VOICE_ID?.trim() ||
      FAB_AFFIRMATION_TTS_VOICE_ID;
    const modelId =
      (typeof body?.modelId === 'string' && body.modelId.trim()) ||
      FAB_AFFIRMATION_TTS_MODEL;

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: { ...FAB_AFFIRMATION_TTS_VOICE_SETTINGS },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[elevenlabs/tts]', res.status, errText.slice(0, 400));
      return NextResponse.json(
        { error: `ElevenLabs TTS failed (${res.status})` },
        { status: 502 }
      );
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    console.error('[elevenlabs/tts] Error:', e);
    const msg = e instanceof Error ? e.message : 'TTS failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
