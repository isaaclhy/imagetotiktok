import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('bleamies');
    const collection = db.collection('levels');

    const levels = await collection
      .find({
        $or: [
          { name: 'Friends' },
          { level: 'Friends' },
          { name: 'Couples' },
          { level: 'Couples' },
        ],
      })
      .toArray();

    const seen = new Set<string>();
    const categories: string[] = [];
    for (const level of levels) {
      if (!level.categories?.length) continue;
      for (const cat of level.categories) {
        const name =
          cat.name || cat.category || cat.title || '';
        if (name && !seen.has(name)) {
          seen.add(name);
          categories.push(name);
        }
      }
    }
    categories.sort();

    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch categories';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
