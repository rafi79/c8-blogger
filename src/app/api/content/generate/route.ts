import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { generateSocialMediaContent } from '@/lib/gemini';

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { topic, tone, length, platforms } = await request.json();

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { message: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate content using Gemini AI
    const result = await generateSocialMediaContent({
      topic: topic.trim(),
      tone: tone || 'professional',
      length: length || 'medium',
      platforms: platforms || []
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: result.content,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}