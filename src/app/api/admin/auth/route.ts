import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username) {
      return NextResponse.json(
        { 
          error: 'Username is required',
          code: 'MISSING_USERNAME'
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_PASSWORD'
        },
        { status: 400 }
      );
    }

    // Log authentication attempt for security monitoring
    console.log('Admin login attempt:', {
      username,
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Query admin_settings table to find admin by username
    const admin = await db.select()
      .from(adminSettings)
      .where(eq(adminSettings.adminUsername, username))
      .limit(1);

    if (admin.length === 0) {
      console.log('Admin login failed: Username not found', { username });
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const adminRecord = admin[0];

    // Verify password using bcrypt
    const isPasswordValid = bcrypt.compareSync(password, adminRecord.adminPasswordHash);

    if (!isPasswordValid) {
      console.log('Admin login failed: Invalid password', { username });
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Log successful authentication
    console.log('Admin login successful:', {
      username,
      timestamp: new Date().toISOString()
    });

    // Return success response with admin details (exclude password hash)
    return NextResponse.json({
      id: adminRecord.id,
      username: adminRecord.adminUsername,
      email: adminRecord.adminEmail,
      commissionRate: adminRecord.commissionRate,
      createdAt: adminRecord.createdAt,
      updatedAt: adminRecord.updatedAt
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/admin/auth error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}