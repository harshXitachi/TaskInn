import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single review by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, parseInt(id)))
        .limit(1);

      if (review.length === 0) {
        return NextResponse.json(
          { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(review[0], { status: 200 });
    }

    // List reviews with filtering and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const revieweeId = searchParams.get('revieweeId');
    const reviewerId = searchParams.get('reviewerId');
    const taskId = searchParams.get('taskId');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');

    // Build WHERE conditions
    const conditions = [];

    if (revieweeId) {
      conditions.push(eq(reviews.revieweeId, revieweeId));
    }

    if (reviewerId) {
      conditions.push(eq(reviews.reviewerId, reviewerId));
    }

    if (taskId) {
      const taskIdNum = parseInt(taskId);
      if (!isNaN(taskIdNum)) {
        conditions.push(eq(reviews.taskId, taskIdNum));
      }
    }

    if (minRating) {
      const minRatingNum = parseInt(minRating);
      if (!isNaN(minRatingNum)) {
        conditions.push(gte(reviews.rating, minRatingNum));
      }
    }

    if (maxRating) {
      const maxRatingNum = parseInt(maxRating);
      if (!isNaN(maxRatingNum)) {
        conditions.push(lte(reviews.rating, maxRatingNum));
      }
    }

    let query = db.select().from(reviews);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const { taskId, reviewerId, revieweeId, rating, comment } = body;

    // Validate required fields
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required', code: 'MISSING_TASK_ID' },
        { status: 400 }
      );
    }

    if (!reviewerId) {
      return NextResponse.json(
        { error: 'Reviewer ID is required', code: 'MISSING_REVIEWER_ID' },
        { status: 400 }
      );
    }

    if (!revieweeId) {
      return NextResponse.json(
        { error: 'Reviewee ID is required', code: 'MISSING_REVIEWEE_ID' },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Rating is required', code: 'MISSING_RATING' },
        { status: 400 }
      );
    }

    // Validate rating is integer between 1 and 5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        {
          error: 'Rating must be an integer between 1 and 5',
          code: 'INVALID_RATING',
        },
        { status: 400 }
      );
    }

    // Validate reviewerId and revieweeId are different
    if (reviewerId === revieweeId) {
      return NextResponse.json(
        {
          error: 'Reviewer and reviewee must be different users',
          code: 'SAME_USER_REVIEW',
        },
        { status: 400 }
      );
    }

    // Check for duplicate review (same task, reviewer, and reviewee)
    const existingReview = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.taskId, parseInt(taskId)),
          eq(reviews.reviewerId, reviewerId),
          eq(reviews.revieweeId, revieweeId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        {
          error: 'Review already exists for this task and user combination',
          code: 'DUPLICATE_REVIEW',
        },
        { status: 409 }
      );
    }

    // Create new review
    const newReview = await db
      .insert(reviews)
      .values({
        taskId: parseInt(taskId),
        reviewerId: reviewerId.trim(),
        revieweeId: revieweeId.trim(),
        rating: ratingNum,
        comment: comment ? comment.trim() : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}