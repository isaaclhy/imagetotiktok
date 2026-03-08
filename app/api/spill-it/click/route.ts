import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('bleamies');
    const collection = db.collection('spill_it_app_store_clicks');

    const count = await collection.countDocuments();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching click count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch click count' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db('bleamies');
    const collection = db.collection('spill_it_app_store_clicks');

    await collection.insertOne({
      clickedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording app store click:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record click' },
      { status: 500 }
    );
  }
}
