import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, title, message } = body;

    // Validate required fields
    if (!email || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email, title, and message are required',
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
    const collection = db.collection('support');

    // Insert the support request
    const result = await collection.insertOne({
      email,
      title,
      message,
      createdAt: new Date(),
      status: 'pending', // You can add status tracking if needed
    });

    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully',
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error('Error submitting support request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit support request',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
