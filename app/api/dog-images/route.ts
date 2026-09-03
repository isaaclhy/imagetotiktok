import { readdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
/** Reserved for the CTA tab — not used as a random card illustration. */
const EXCLUDED_FILES = new Set(['kawaii-cta-tab.png', 'kawaii-cta-tab-v2.png']);

export async function GET() {
  try {
    const dir = join(process.cwd(), 'public', 'dog-images');
    const files = await readdir(dir);
    const urls = files
      .filter((f) => IMAGE_EXT.test(f) && !EXCLUDED_FILES.has(f))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => `/dog-images/${f}`);
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ urls: [] as string[] });
  }
}
