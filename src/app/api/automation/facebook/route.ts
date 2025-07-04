// src/app/api/automation/facebook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { postToFacebook } from '@/scripts/facebook-automation.mjs';

// Mock credentials storage
const credentials: any[] = [];

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
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { content, image } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    const facebookCredential = credentials.find(
      c => c.userId === user.userId && c.platform === 'facebook'
    );

    if (!facebookCredential) {
      return NextResponse.json(
        { message: 'Facebook credentials not found. Please add your Facebook account first.' },
        { status: 404 }
      );
    }

    const result = await postToFacebook({
      email: facebookCredential.email!,
      password: facebookCredential.password,
      content: content.trim(),
      imagePath: image
    });

    if (result.success) {
      return NextResponse.json({
        message: 'Posted to Facebook successfully',
        platform: 'facebook',
        status: 'success'
      });
    } else {
      return NextResponse.json({
        message: result.message || 'Failed to post to Facebook',
        platform: 'facebook',
        status: 'failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Facebook automation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
