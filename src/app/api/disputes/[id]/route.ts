import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { disputes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    // Fetch dispute by ID
    const dispute = await db.select()
      .from(disputes)
      .where(eq(disputes.id, parseInt(id)))
      .limit(1);

    if (dispute.length === 0) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dispute[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, resolution, resolvedById } = body;

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { 
          error: "Status is required",
          code: "MISSING_REQUIRED_FIELD" 
        },
        { status: 400 }
      );
    }

    // Validate status is one of allowed values
    const allowedStatuses = ['under_review', 'resolved', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: "Status must be one of: under_review, resolved, closed",
          code: "INVALID_STATUS" 
        },
        { status: 400 }
      );
    }

    // Validate resolution is provided when status is resolved
    if (status === 'resolved' && (!resolution || resolution.trim() === '')) {
      return NextResponse.json(
        { 
          error: "Resolution text is required when status is 'resolved'",
          code: "MISSING_RESOLUTION" 
        },
        { status: 400 }
      );
    }

    // Check if dispute exists
    const existingDispute = await db.select()
      .from(disputes)
      .where(eq(disputes.id, parseInt(id)))
      .limit(1);

    if (existingDispute.length === 0) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: status.trim()
    };

    // Add optional fields if provided
    if (resolution !== undefined) {
      updateData.resolution = resolution.trim();
    }

    if (resolvedById !== undefined) {
      updateData.resolvedById = resolvedById.trim();
    }

    // Auto-generate resolvedAt when status is resolved or closed
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    // Update dispute
    const updated = await db.update(disputes)
      .set(updateData)
      .where(eq(disputes.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update dispute' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}