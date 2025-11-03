import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskSubmissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate submission ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid submission ID is required',
          code: 'INVALID_SUBMISSION_ID',
        },
        { status: 400 }
      );
    }

    const submissionId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { workerId, submissionData } = body;

    // Validate required fields
    if (!workerId) {
      return NextResponse.json(
        {
          error: 'Worker ID is required',
          code: 'MISSING_WORKER_ID',
        },
        { status: 400 }
      );
    }

    if (!submissionData) {
      return NextResponse.json(
        {
          error: 'Submission data is required',
          code: 'MISSING_SUBMISSION_DATA',
        },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await db
      .select()
      .from(taskSubmissions)
      .where(eq(taskSubmissions.id, submissionId))
      .limit(1);

    if (existingSubmission.length === 0) {
      return NextResponse.json(
        {
          error: 'Submission not found',
          code: 'SUBMISSION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const submission = existingSubmission[0];

    // Verify worker matches submission worker
    if (submission.workerId !== workerId) {
      return NextResponse.json(
        {
          error: 'Not authorized to resubmit this submission',
          code: 'UNAUTHORIZED_WORKER',
        },
        { status: 403 }
      );
    }

    // Verify submission status is "rejected"
    if (submission.status !== 'rejected') {
      return NextResponse.json(
        {
          error: 'Only rejected submissions can be resubmitted',
          code: 'INVALID_SUBMISSION_STATUS',
        },
        { status: 409 }
      );
    }

    // Prepare submission data (stringify if object)
    const processedSubmissionData =
      typeof submissionData === 'object'
        ? JSON.stringify(submissionData)
        : submissionData;

    // Update submission
    const updatedSubmission = await db
      .update(taskSubmissions)
      .set({
        status: 'pending',
        submissionData: processedSubmissionData,
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewerNotes: null,
      })
      .where(eq(taskSubmissions.id, submissionId))
      .returning();

    if (updatedSubmission.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update submission',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSubmission[0], { status: 200 });
  } catch (error) {
    console.error('PUT /api/submissions/[id]/resubmit error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}