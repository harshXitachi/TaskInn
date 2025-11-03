import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Single record by ID
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(adminSettings)
        .where(eq(adminSettings.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Admin settings not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      // Exclude password hash from response
      const { adminPasswordHash, ...safeRecord } = record[0];
      return NextResponse.json(safeRecord, { status: 200 });
    }

    // List all records
    const records = await db.select().from(adminSettings);

    // Exclude password hash from all records
    const safeRecords = records.map(({ adminPasswordHash, ...record }) => record);
    return NextResponse.json(safeRecords, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, commissionRate, email } = body;

    // Validate required fields
    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'Username is required and cannot be empty', code: 'MISSING_USERNAME' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long', code: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    if (commissionRate === undefined || commissionRate === null) {
      return NextResponse.json(
        { error: 'Commission rate is required', code: 'MISSING_COMMISSION_RATE' },
        { status: 400 }
      );
    }

    if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 1) {
      return NextResponse.json(
        { error: 'Commission rate must be a number between 0 and 1', code: 'INVALID_COMMISSION_RATE' },
        { status: 400 }
      );
    }

    // Hash password
    const adminPasswordHash = bcrypt.hashSync(password, 10);

    // Create new admin settings record
    const newRecord = await db
      .insert(adminSettings)
      .values({
        adminUsername: username.trim(),
        adminPasswordHash,
        commissionRate,
        adminEmail: email ? email.trim() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Exclude password hash from response
    const { adminPasswordHash: _, ...safeRecord } = newRecord[0];
    return NextResponse.json(safeRecord, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, password, commissionRate, email } = body;

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Admin settings not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate fields if provided
    if (username !== undefined && username.trim() === '') {
      return NextResponse.json(
        { error: 'Username cannot be empty', code: 'INVALID_USERNAME' },
        { status: 400 }
      );
    }

    if (password !== undefined && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long', code: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    if (commissionRate !== undefined && (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 1)) {
      return NextResponse.json(
        { error: 'Commission rate must be a number between 0 and 1', code: 'INVALID_COMMISSION_RATE' },
        { status: 400 }
      );
    }

    // Prepare update object
    const updates: {
      adminUsername?: string;
      adminPasswordHash?: string;
      commissionRate?: number;
      adminEmail?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (username !== undefined) {
      updates.adminUsername = username.trim();
    }

    if (password !== undefined) {
      updates.adminPasswordHash = bcrypt.hashSync(password, 10);
    }

    if (commissionRate !== undefined) {
      updates.commissionRate = commissionRate;
    }

    if (email !== undefined) {
      updates.adminEmail = email ? email.trim() : null;
    }

    // Update record
    const updatedRecord = await db
      .update(adminSettings)
      .set(updates)
      .where(eq(adminSettings.id, parseInt(id)))
      .returning();

    // Exclude password hash from response
    const { adminPasswordHash: _, ...safeRecord } = updatedRecord[0];
    return NextResponse.json(safeRecord, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Admin settings not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete record
    const deletedRecord = await db
      .delete(adminSettings)
      .where(eq(adminSettings.id, parseInt(id)))
      .returning();

    // Exclude password hash from response
    const { adminPasswordHash: _, ...safeRecord } = deletedRecord[0];

    return NextResponse.json(
      {
        message: 'Admin settings deleted successfully',
        record: safeRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}