import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskSubmissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    // Validate task ID
    if (!taskId || isNaN(taskId)) {
      return NextResponse.json(
        { 
          error: "Valid task ID is required",
          code: "INVALID_TASK_ID" 
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { workerId, submissionData } = body;

    // Validate required fields
    if (!workerId) {
      return NextResponse.json(
        { 
          error: "workerId is required",
          code: "MISSING_WORKER_ID" 
        },
        { status: 400 }
      );
    }

    if (!submissionData) {
      return NextResponse.json(
        { 
          error: "submissionData is required",
          code: "MISSING_SUBMISSION_DATA" 
        },
        { status: 400 }
      );
    }

    // Find existing submission for this task and worker
    const existingSubmission = await db.select()
      .from(taskSubmissions)
      .where(
        and(
          eq(taskSubmissions.taskId, taskId),
          eq(taskSubmissions.workerId, workerId)
        )
      )
      .limit(1);

    if (existingSubmission.length === 0) {
      return NextResponse.json(
        { 
          error: "Submission not found. Worker must apply to the task first.",
          code: "SUBMISSION_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    const submission = existingSubmission[0];

    // Validate submission status is "applied"
    if (submission.status !== 'applied') {
      return NextResponse.json(
        { 
          error: `Cannot submit work for submission with status: ${submission.status}. Status must be 'applied'.`,
          code: "INVALID_STATUS" 
        },
        { status: 409 }
      );
    }

    // Prepare submission data (stringify if object)
    const processedSubmissionData = typeof submissionData === 'object' 
      ? JSON.stringify(submissionData) 
      : submissionData;

    // Update submission
    const updatedSubmission = await db.update(taskSubmissions)
      .set({
        status: 'pending',
        submissionData: processedSubmissionData,
        submittedAt: new Date(),
      })
      .where(eq(taskSubmissions.id, submission.id))
      .returning();

    if (updatedSubmission.length === 0) {
      return NextResponse.json(
        { 
          error: "Failed to update submission",
          code: "UPDATE_FAILED" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSubmission[0], { status: 200 });

  } catch (error) {
    console.error('PUT task submission error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}