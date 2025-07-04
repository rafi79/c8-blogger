import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// In-memory credentials storage (replace with database in production)
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

    const { platform, username, email, password } = await request.json();

    if (!platform || !password) {
      return NextResponse.json(
        { message: 'Platform and password are required' },
        { status: 400 }
      );
    }

    // Validate platform-specific requirements
    if (platform === 'facebook' && !email) {
      return NextResponse.json(
        { message: 'Email is required for Facebook' },
        { status: 400 }
      );
    }

    if ((platform === 'twitter' || platform === 'instagram') && !username) {
      return NextResponse.json(
        { message: 'Username is required for this platform' },
        { status: 400 }
      );
    }

    // Check if credentials already exist for this platform
    const existingCredential = credentials.find(
      c => c.userId === user.userId && c.platform === platform
    );

    if (existingCredential) {
      return NextResponse.json(
        { message: 'Credentials for this platform already exist' },
        { status: 409 }
      );
    }

    // Encrypt password
    const encryptedPassword = await bcrypt.hash(password, 12);

    // Create new credential entry
    const newCredential = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: user.userId,
      platform,
      username: username || undefined,
      email: email || undefined,
      password: encryptedPassword,
      verified: false,
      createdAt: new Date().toISOString()
    };

    credentials.push(newCredential);

    return NextResponse.json({
      message: 'Credentials saved successfully',
      credentialId: newCredential._id
    }, { status: 201 });
  } catch (error) {
    console.error('Credentials storage error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}