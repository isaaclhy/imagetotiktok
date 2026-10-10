import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import OpenAI, { toFile } from 'openai';
import { getCharacterById } from '@/app/lib/characters';
import {
  buildCharacterImagePrompt,
  DEFAULT_CHARACTER_IMAGE_QUALITY,
  isCharacterImageQuality,
} from '@/app/lib/character-generation';
import { originalPinterestUrlFromSrc } from '@/app/lib/pinterest';
import { resolveStudioAppId } from '@/app/lib/apps';

export const maxDuration = 120;

const PINIMG_HEADERS = {
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  Referer: 'https://www.pinterest.com/',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

function extForMime(mime: string): string {
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  return 'jpg';
}

async function loadImageFile(
  src: string,
  fallbackName: string
): Promise<Awaited<ReturnType<typeof toFile>>> {
  const original = originalPinterestUrlFromSrc(src);
  let bytes: Buffer;
  let mimeType = 'image/jpeg';

  if (/^https?:\/\//i.test(original)) {
    const res = await fetch(original, { headers: PINIMG_HEADERS });
    if (!res.ok) {
      throw new Error(`Failed to fetch reference image (${res.status})`);
    }
    bytes = Buffer.from(await res.arrayBuffer());
    mimeType = res.headers.get('Content-Type')?.split(';')[0]?.trim() || mimeType;
  } else {
    const rel = original.replace(/^\/+/, '');
    const filePath = path.join(process.cwd(), 'public', rel);
    bytes = await fs.readFile(filePath);
    if (rel.endsWith('.png')) mimeType = 'image/png';
    else if (rel.endsWith('.webp')) mimeType = 'image/webp';
  }

  return toFile(bytes, `${fallbackName}.${extForMime(mimeType)}`, { type: mimeType });
}

/**
 * POST /api/openai/character-image
 * Body: { appId, characterId, referenceImageUrl }
 * Scene reference (Pinterest) + identity photo + character JSON → gpt-image-2.5-flare.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const appId = resolveStudioAppId(typeof body?.appId === 'string' ? body.appId : null);
    const characterId = typeof body?.characterId === 'string' ? body.characterId.trim() : '';
    const referenceImageUrl =
      typeof body?.referenceImageUrl === 'string' ? body.referenceImageUrl.trim() : '';
    const qualityRaw = typeof body?.quality === 'string' ? body.quality.trim() : '';
    const quality = isCharacterImageQuality(qualityRaw)
      ? qualityRaw
      : DEFAULT_CHARACTER_IMAGE_QUALITY;

    if (!characterId) {
      return NextResponse.json({ error: 'characterId is required' }, { status: 400 });
    }
    if (!referenceImageUrl) {
      return NextResponse.json({ error: 'referenceImageUrl is required' }, { status: 400 });
    }

    const character = getCharacterById(appId, characterId);
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const prompt = buildCharacterImagePrompt(character.name, character.identity);
    const environmentImage = await loadImageFile(referenceImageUrl, 'environment');
    const characterImage = await loadImageFile(character.coverSrc, 'character');

    const client = new OpenAI({ apiKey });
    const result = await client.images.edit({
      model: 'gpt-image-2.5-flare',
      image: [environmentImage, characterImage],
      prompt,
      size: '1024x1536',
      quality: quality as unknown as 'low' | 'medium' | 'high',
      output_format: 'png',
    });

    const first = result.data?.[0];
    const b64 = first && 'b64_json' in first ? first.b64_json : null;
    if (!b64) {
      return NextResponse.json({ error: 'No image data in response' }, { status: 502 });
    }

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${b64}`,
      provider: 'openai',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to generate character image';
    console.error('Character image error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
