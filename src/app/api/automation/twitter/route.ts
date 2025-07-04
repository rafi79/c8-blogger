import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { postToTwitter } from '@/scripts/twitter-automation.mjs';

// Access to the same credentials storage
const credentials: Array<{
  _id: string;
  userId: string;
  platform: string;
  username?: string;
  email?: string;
  password: string;
  verified: boolean;
  createdAt: string;
}> = [];

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

    const { content, image } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    // Find Twitter credentials for this user
    const twitterCredential = credentials.find(
      c => c.userId === user.userId && c.platform === 'twitter'
    );

    if (!twitterCredential) {
      return NextResponse.json(
        { message: 'Twitter credentials not found. Please add your Twitter account first.' },
        { status: 404 }
      );
    }

    // Decrypt password
    const decryptedPassword = twitterCredential.password; // In production, decrypt this properly

    // Post to Twitter
    const result = await postToTwitter({
      username: twitterCredential.username!,
      password: decryptedPassword,
      content: content.trim(),
      imagePath: image
    });

    if (result.success) {
      return NextResponse.json({
        message: 'Posted to Twitter successfully',
        platform: 'twitter',
        status: 'success'
      });
    } else {
      return NextResponse.json({
        message: result.message || 'Failed to post to Twitter',
        platform: 'twitter',
        status: 'failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Twitter automation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}