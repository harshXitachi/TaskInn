import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { disputes, taskSubmissions } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single dispute by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const dispute = await db.select()
        .from(disputes)
        .where(eq(disputes.id, parseInt(id)))
        .limit(1);

      if (dispute.length === 0) {
        return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
      }

      return NextResponse.json(dispute[0], { status: 200 });
    }

    // List disputes with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const raisedById = searchParams.get('raisedById');
    const taskSubmissionId = searchParams.get('taskSubmissionId');

    let query = db.select().from(disputes);

    const conditions = [];

    if (status) {
      conditions.push(eq(disputes.status, status));
    }

    if (raisedById) {
      conditions.push(eq(disputes.raisedById, raisedById));
    }

    if (taskSubmissionId) {
      if (isNaN(parseInt(taskSubmissionId))) {
        return NextResponse.json({ 
          error: "Valid taskSubmissionId is required",
          code: "INVALID_TASK_SUBMISSION_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(disputes.taskSubmissionId, parseInt(taskSubmissionId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(disputes.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { taskSubmissionId, raisedById, reason, description } = body;

    // Validate required fields
    if (!taskSubmissionId) {
      return NextResponse.json({ 
        error: "taskSubmissionId is required",
        code: "MISSING_TASK_SUBMISSION_ID" 
      }, { status: 400 });
    }

    if (!raisedById) {
      return NextResponse.json({ 
        error: "raisedById is required",
        code: "MISSING_RAISED_BY_ID" 
      }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return NextResponse.json({ 
        error: "reason is required",
        code: "MISSING_REASON" 
      }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ 
        error: "description is required",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    // Validate taskSubmissionId is valid integer
    if (isNaN(parseInt(taskSubmissionId))) {
      return NextResponse.json({ 
        error: "taskSubmissionId must be a valid integer",
        code: "INVALID_TASK_SUBMISSION_ID" 
      }, { status: 400 });
    }

    // Check if submission exists
    const submission = await db.select()
      .from(taskSubmissions)
      .where(eq(taskSubmissions.id, parseInt(taskSubmissionId)))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json({ 
        error: "Task submission not found",
        code: "SUBMISSION_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if dispute already exists for this submission
    const existingDispute = await db.select()
      .from(disputes)
      .where(eq(disputes.taskSubmissionId, parseInt(taskSubmissionId)))
      .limit(1);

    if (existingDispute.length > 0) {
      return NextResponse.json({ 
        error: "Dispute already exists for this submission",
        code: "DISPUTE_ALREADY_EXISTS" 
      }, { status: 409 });
    }

    // Create new dispute
    const newDispute = await db.insert(disputes)
      .values({
        taskSubmissionId: parseInt(taskSubmissionId),
        raisedById: raisedById.trim(),
        reason: reason.trim(),
        description: description.trim(),
        status: "open",
        // createdAt will use database default
      })
      .returning();

    return NextResponse.json(newDispute[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
