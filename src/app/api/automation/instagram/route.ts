// src/app/api/automation/instagram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { postToInstagram } from '@/scripts/instagram-automation.mjs';

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

    if (!image) {
      return NextResponse.json({ message: 'Instagram requires an image' }, { status: 400 });
    }

    const instagramCredential = credentials.find(
      c => c.userId === user.userId && c.platform === 'instagram'
    );

    if (!instagramCredential) {
      return NextResponse.json(
        { message: 'Instagram credentials not found. Please add your Instagram account first.' },
        { status: 404 }
      );
    }

    const result = await postToInstagram({
      username: instagramCredential.username!,
      password: instagramCredential.password,
      content: content.trim(),
      imagePath: image
    });

    if (result.success) {
      return NextResponse.json({
        message: 'Posted to Instagram successfully',
        platform: 'instagram',
        status: 'success'
      });
    } else {
      return NextResponse.json({
        message: result.message || 'Failed to post to Instagram',
        platform: 'instagram',
        status: 'failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Instagram automation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}