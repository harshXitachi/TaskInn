import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskSubmissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['approved', 'rejected', 'revision_requested'] as const;
type ValidStatus = typeof VALID_STATUSES[number];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid submission ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const submissionId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { status, reviewerNotes } = body;

    // Validate required status field
    if (!status) {
      return NextResponse.json(
        { 
          error: "Status is required",
          code: "MISSING_STATUS" 
        },
        { status: 400 }
      );
    }

    // Validate status is one of allowed values
    if (!VALID_STATUSES.includes(status as ValidStatus)) {
      return NextResponse.json(
        { 
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: "INVALID_STATUS" 
        },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await db.select()
      .from(taskSubmissions)
      .where(eq(taskSubmissions.id, submissionId))
      .limit(1);

    if (existingSubmission.length === 0) {
      return NextResponse.json(
        { 
          error: 'Submission not found',
          code: "SUBMISSION_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      status: string;
      reviewedAt: string;
      reviewerNotes?: string;
    } = {
      status: status.trim(),
      reviewedAt: new Date().toISOString(),
    };

    // Add reviewer notes if provided
    if (reviewerNotes !== undefined) {
      updateData.reviewerNotes = reviewerNotes.trim();
    }

    // Update the submission
    const updatedSubmission = await db.update(taskSubmissions)
      .set(updateData)
      .where(eq(taskSubmissions.id, submissionId))
      .returning();

    if (updatedSubmission.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update submission',
          code: "UPDATE_FAILED" 
        },
        { status: 500 }
      );
    }

    // Note: If status is "approved", payment creation would be triggered here
    // This is handled by a separate payment creation service/endpoint
    if (status === 'approved') {
      // TODO: Trigger payment creation workflow
      // This would typically call a payment service or queue a payment job
      console.log(`Submission ${submissionId} approved - payment creation should be triggered`);
    }

    return NextResponse.json(updatedSubmission[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}