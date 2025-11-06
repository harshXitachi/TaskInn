import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, taskSubmissions } from '@/db/schema';
import { eq, and, gte, lte, like, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single task by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const task = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, parseInt(id)))
        .limit(1);

      if (task.length === 0) {
        return NextResponse.json(
          { error: 'Task not found', code: 'TASK_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(task[0], { status: 200 });
    }

    // List tasks with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const employerId = searchParams.get('employerId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortField = searchParams.get('sort') ?? 'createdAt';
    const sortOrder = searchParams.get('order') ?? 'desc';

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(tasks.title, `%${search}%`),
          like(tasks.description, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    if (categoryId) {
      if (isNaN(parseInt(categoryId))) {
        return NextResponse.json(
          { error: 'Valid category ID is required', code: 'INVALID_CATEGORY_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(tasks.categoryId, parseInt(categoryId)));
    }

    if (employerId) {
      conditions.push(eq(tasks.employerId, employerId));
    }

    if (minPrice) {
      const minPriceNum = parseFloat(minPrice);
      if (isNaN(minPriceNum)) {
        return NextResponse.json(
          { error: 'Valid minimum price is required', code: 'INVALID_MIN_PRICE' },
          { status: 400 }
        );
      }
      conditions.push(gte(tasks.price, minPriceNum));
    }

    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      if (isNaN(maxPriceNum)) {
        return NextResponse.json(
          { error: 'Valid maximum price is required', code: 'INVALID_MAX_PRICE' },
          { status: 400 }
        );
      }
      conditions.push(lte(tasks.price, maxPriceNum));
    }

    // Build query
    let query = db.select().from(tasks);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn =
      sortField === 'price'
        ? tasks.price
        : sortField === 'timeEstimate'
        ? tasks.timeEstimate
        : tasks.createdAt;

    query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      employerId,
      price,
      timeEstimate,
      slots,
      requirements,
      expiresAt,
      currency,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!employerId) {
      return NextResponse.json(
        { success: false, error: 'Employer ID is required', code: 'MISSING_EMPLOYER_ID' },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'Price is required', code: 'MISSING_PRICE' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required', code: 'MISSING_CATEGORY_ID' },
        { status: 400 }
      );
    }

    // Validate currency
    if (!currency || !['USD', 'USDT'].includes(currency)) {
      return NextResponse.json(
        { success: false, error: 'Currency must be USD or USDT', code: 'INVALID_CURRENCY' },
        { status: 400 }
      );
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Validate categoryId
    const categoryIdNum = parseInt(categoryId);
    if (isNaN(categoryIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Category ID must be a valid integer', code: 'INVALID_CATEGORY_ID' },
        { status: 400 }
      );
    }

    // Validate slots if provided
    let slotsNum = 1;
    if (slots !== undefined && slots !== null) {
      slotsNum = parseInt(slots);
      if (isNaN(slotsNum) || slotsNum <= 0) {
        return NextResponse.json(
          { success: false, error: 'Slots must be a positive integer', code: 'INVALID_SLOTS' },
          { status: 400 }
        );
      }
    }

    // Validate timeEstimate if provided
    if (timeEstimate !== undefined && timeEstimate !== null) {
      const timeEstimateNum = parseInt(timeEstimate);
      if (isNaN(timeEstimateNum)) {
        return NextResponse.json(
          { success: false, error: 'Time estimate must be a valid integer', code: 'INVALID_TIME_ESTIMATE' },
          { status: 400 }
        );
      }
    }

    // Note: We do NOT deduct money when creating a task
    // Money is only deducted when approving worker submissions

    // Prepare values for insertion
    const timeEstimateValue = (timeEstimate !== undefined && timeEstimate !== null) ? parseInt(timeEstimate) : null;
    const requirementsValue = requirements ? (typeof requirements === 'string' ? requirements : JSON.stringify(requirements)) : null;
    const expiresAtValue = expiresAt ? (expiresAt instanceof Date ? expiresAt : new Date(expiresAt)) : null;

    // Use Drizzle ORM insert
    const insertedTask = await db
      .insert(tasks)
      .values({
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryIdNum,
        employerId: employerId.trim(),
        price: priceNum,
        currency,
        slots: slotsNum,
        timeEstimate: timeEstimateValue,
        requirements: requirementsValue,
        expiresAt: expiresAtValue,
        status: 'open',
        slotsFilled: 0,
      })
      .returning();

    return NextResponse.json({ success: true, data: insertedTask[0] }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const taskId = parseInt(id);

    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      status,
      price,
      timeEstimate,
      slots,
      requirements,
      expiresAt,
    } = body;

    // Build update data
    const updateData: any = {
      // No updatedAt field in schema
    };

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (categoryId !== undefined) {
      const categoryIdNum = parseInt(categoryId);
      if (isNaN(categoryIdNum)) {
        return NextResponse.json(
          { success: false, error: 'Category ID must be a valid integer', code: 'INVALID_CATEGORY_ID' },
          { status: 400 }
        );
      }
      updateData.categoryId = categoryIdNum;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json(
          { success: false, error: 'Price must be a positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
      updateData.price = priceNum;
    }

    if (timeEstimate !== undefined) {
      if (timeEstimate === null) {
        updateData.timeEstimate = null;
      } else {
        const timeEstimateNum = parseInt(timeEstimate);
        if (isNaN(timeEstimateNum)) {
          return NextResponse.json(
            { success: false, error: 'Time estimate must be a valid integer', code: 'INVALID_TIME_ESTIMATE' },
            { status: 400 }
          );
        }
        updateData.timeEstimate = timeEstimateNum;
      }
    }

    if (slots !== undefined) {
      const slotsNum = parseInt(slots);
      if (isNaN(slotsNum) || slotsNum <= 0) {
        return NextResponse.json(
          { success: false, error: 'Slots must be a positive integer', code: 'INVALID_SLOTS' },
          { status: 400 }
        );
      }
      updateData.slots = slotsNum;
    }

    if (requirements !== undefined) {
      if (requirements === null) {
        updateData.requirements = null;
      } else {
        updateData.requirements = typeof requirements === 'string' ? requirements : JSON.stringify(requirements);
      }
    }

    if (expiresAt !== undefined) {
      if (expiresAt === null) {
        updateData.expiresAt = null;
      } else {
        // Convert expiresAt to Date object if it's a string
        updateData.expiresAt = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      }
    }

    const updatedTask = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    return NextResponse.json({ success: true, data: updatedTask[0] }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const employerId = searchParams.get('employerId');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const taskId = parseInt(id);

    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (existingTask.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Task not found', code: 'TASK_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Optional: Verify employer owns the task (if employerId is provided)
    if (employerId && existingTask[0].employerId !== employerId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own tasks', code: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    // Delete related task submissions first to avoid foreign key constraint violation
    await db.delete(taskSubmissions).where(eq(taskSubmissions.taskId, taskId));

    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Task deleted successfully',
        data: deletedTask[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
