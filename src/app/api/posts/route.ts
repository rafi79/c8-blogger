import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock posts storage
const posts: any[] = [];

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

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userPosts = posts
      .filter(p => p.userId === user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ posts: userPosts });
  } catch (error) {
    console.error('Posts history error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}