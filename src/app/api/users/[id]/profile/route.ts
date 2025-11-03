import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate ID from params
    const { id } = await params;
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Define allowed fields for update
    const allowedFields = [
      'name',
      'bio',
      'phone',
      'profilePicture',
      'skills',
      'experience',
      'education',
      'location',
      'onboardingCompleted',
      'interests',
      'availability'
    ];

    // Build update object with only allowed fields
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        const value = body[field];

        // Validate and sanitize based on field type
        switch (field) {
          case 'name':
            if (typeof value !== 'string' || value.trim() === '') {
              return NextResponse.json(
                { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
                { status: 400 }
              );
            }
            updates.name = value.trim();
            break;

          case 'bio':
          case 'phone':
          case 'profilePicture':
          case 'skills':
          case 'experience':
          case 'education':
          case 'location':
          case 'interests':
          case 'availability':
            if (value !== null && value !== undefined) {
              if (typeof value !== 'string') {
                return NextResponse.json(
                  { error: `${field} must be a string`, code: `INVALID_${field.toUpperCase()}` },
                  { status: 400 }
                );
              }
              updates[field] = value.trim();
            } else {
              updates[field] = null;
            }
            break;

          case 'onboardingCompleted':
            if (typeof value !== 'boolean') {
              return NextResponse.json(
                { error: 'onboardingCompleted must be a boolean', code: 'INVALID_ONBOARDING_STATUS' },
                { status: 400 }
              );
            }
            updates.onboardingCompleted = value;
            break;

          default:
            break;
        }
      }
    }

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    // Perform the update
    const updatedUser = await db.update(user)
      .set(updates)
      .where(eq(user.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update user', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Remove sensitive fields from response
    const { emailVerified, ...safeUser } = updatedUser[0];

    return NextResponse.json(safeUser, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/users/[id]/profile error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}