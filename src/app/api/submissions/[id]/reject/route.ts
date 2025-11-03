import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskSubmissions, tasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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
    const { employerId, reviewerNotes } = body;

    // Validate required fields
    if (!employerId) {
      return NextResponse.json(
        { 
          error: "Employer ID is required",
          code: "MISSING_EMPLOYER_ID" 
        },
        { status: 400 }
      );
    }

    if (!reviewerNotes || reviewerNotes.trim() === '') {
      return NextResponse.json(
        { 
          error: "Reviewer notes are required - reason for rejection must be provided",
          code: "MISSING_REVIEWER_NOTES" 
        },
        { status: 400 }
      );
    }

    // Get submission with task details
    const submission = await db
      .select({
        submission: taskSubmissions,
        task: tasks
      })
      .from(taskSubmissions)
      .leftJoin(tasks, eq(taskSubmissions.taskId, tasks.id))
      .where(eq(taskSubmissions.id, submissionId))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json(
        { 
          error: "Submission not found",
          code: "SUBMISSION_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    const { submission: submissionData, task: taskData } = submission[0];

    // Validate submission exists
    if (!submissionData) {
      return NextResponse.json(
        { 
          error: "Submission not found",
          code: "SUBMISSION_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Validate task exists
    if (!taskData) {
      return NextResponse.json(
        { 
          error: "Associated task not found",
          code: "TASK_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Validate employer matches task employer
    if (taskData.employerId !== employerId) {
      return NextResponse.json(
        { 
          error: "You are not authorized to reject this submission",
          code: "NOT_AUTHORIZED" 
        },
        { status: 403 }
      );
    }

    // Validate submission status is "pending"
    if (submissionData.status !== 'pending') {
      return NextResponse.json(
        { 
          error: `Cannot reject submission with status: ${submissionData.status}. Only pending submissions can be rejected.`,
          code: "INVALID_STATUS" 
        },
        { status: 409 }
      );
    }

    // Update submission to rejected status
    const updated = await db
      .update(taskSubmissions)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
        reviewerNotes: reviewerNotes.trim()
      })
      .where(eq(taskSubmissions.id, submissionId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: "Failed to update submission",
          code: "UPDATE_FAILED" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT /api/submissions/[id]/reject error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}