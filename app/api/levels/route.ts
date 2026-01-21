import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('bleamies');
    const collection = db.collection('levels');

    // Retrieve all documents from the levels collection
    const levels = await collection.find({}).toArray();

    // Convert ObjectId to string for JSON serialization
    const serializedLevels = levels.map(level => ({
      _id: level._id.toString(),
      name: level.name,
      level: level.level,
      categories: level.categories || [],
    }));

    return NextResponse.json({
      success: true,
      data: serializedLevels,
      count: serializedLevels.length,
    });
  } catch (error: any) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch levels',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
