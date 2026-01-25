import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, feedback } = body;

    // Validate required fields
    if (!email || !feedback) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and feedback are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('bleamies');
    const collection = db.collection('feedback');

    // Insert the feedback
    const result = await collection.insertOne({
      email,
      feedback,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit feedback',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
