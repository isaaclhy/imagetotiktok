import { readdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

export async function GET() {
  try {
    const dir = join(process.cwd(), 'public', 'dog-images');
    const files = await readdir(dir);
    const urls = files
      .filter((f) => IMAGE_EXT.test(f))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => `/dog-images/${f}`);
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ urls: [] as string[] });
  }
}
