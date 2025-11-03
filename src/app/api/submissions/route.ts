import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskSubmissions, tasks } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single submission by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          success: false,
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const submission = await db.select()
        .from(taskSubmissions)
        .where(eq(taskSubmissions.id, parseInt(id)))
        .limit(1);

      if (submission.length === 0) {
        return NextResponse.json({ 
          success: false,
          error: 'Submission not found',
          code: "SUBMISSION_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: submission[0] }, { status: 200 });
    }

    // List submissions with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const workerId = searchParams.get('workerId');
    const taskId = searchParams.get('taskId');
    const employerId = searchParams.get('employerId');

    // Build filter conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(taskSubmissions.status, status));
    }

    if (workerId) {
      conditions.push(eq(taskSubmissions.workerId, workerId));
    }

    if (taskId) {
      if (isNaN(parseInt(taskId))) {
        return NextResponse.json({ 
          success: false,
          error: "Valid task ID is required",
          code: "INVALID_TASK_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(taskSubmissions.taskId, parseInt(taskId)));
    }

    // Build base query
    let query = db
      .select({
        id: taskSubmissions.id,
        taskId: taskSubmissions.taskId,
        workerId: taskSubmissions.workerId,
        status: taskSubmissions.status,
        submissionData: taskSubmissions.submissionData,
        submittedAt: taskSubmissions.submittedAt,
        reviewedAt: taskSubmissions.reviewedAt,
        reviewerNotes: taskSubmissions.reviewerNotes,
        // Join task details
        taskTitle: tasks.title,
        taskDescription: tasks.description,
        taskPrice: tasks.price,
        taskEmployerId: tasks.employerId,
      })
      .from(taskSubmissions)
      .leftJoin(tasks, eq(taskSubmissions.taskId, tasks.id));

    // Apply filters if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Filter by employer if provided
    if (employerId) {
      query = query.where(eq(tasks.employerId, employerId));
    }

    // Sort by submittedAt DESC (newest first) and apply pagination
    const results = await query
      .orderBy(desc(taskSubmissions.submittedAt))
      .limit(limit)
      .offset(offset);

    // Format results
    const formattedResults = results.map((row) => ({
      id: row.id,
      taskId: row.taskId,
      taskTitle: row.taskTitle || 'Unknown Task',
      taskDescription: row.taskDescription || '',
      reward: row.taskPrice || 0,
      workerId: row.workerId,
      status: row.status,
      submissionText: row.submissionData || '',
      submissionData: row.submissionData,
      attachmentUrl: null, // Parse from submissionData if needed
      submittedAt: row.submittedAt,
      reviewedAt: row.reviewedAt,
      feedback: row.reviewerNotes,
      employerId: row.taskEmployerId,
    }));

    return NextResponse.json({ success: true, data: formattedResults }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}