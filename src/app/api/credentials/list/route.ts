import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// In-memory credentials storage (should match the store API)
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

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's credentials
    const userCredentials = credentials
      .filter(c => c.userId === user.userId)
      .map(c => ({
        _id: c._id,
        platform: c.platform,
        username: c.username,
        email: c.email,
        password: '•'.repeat(8), // Hide actual password
        verified: c.verified,
        createdAt: c.createdAt
      }));

    return NextResponse.json({
      credentials: userCredentials
    });
  } catch (error) {
    console.error('Credentials list error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}