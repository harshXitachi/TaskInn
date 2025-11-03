import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, like, or, desc, asc, and, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const roleParam = searchParams.get('role');
    const search = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const sortParam = searchParams.get('sort');
    const orderParam = searchParams.get('order');
    const statsParam = searchParams.get('stats');

    // Validate and parse limit (default 50, max 100)
    const limit = limitParam ? parseInt(limitParam) : 50;
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return NextResponse.json({ 
        error: 'Invalid limit parameter. Must be a positive number between 1 and 100',
        code: 'INVALID_LIMIT'
      }, { status: 400 });
    }

    // Validate and parse offset (default 0)
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: 'Invalid offset parameter. Must be a non-negative number',
        code: 'INVALID_OFFSET'
      }, { status: 400 });
    }

    // Validate sort field
    const sort = sortParam || 'createdAt';
    if (sort !== 'createdAt' && sort !== 'name') {
      return NextResponse.json({ 
        error: 'Invalid sort parameter. Must be either "createdAt" or "name"',
        code: 'INVALID_SORT'
      }, { status: 400 });
    }

    // Validate order
    const order = orderParam || 'desc';
    if (order !== 'asc' && order !== 'desc') {
      return NextResponse.json({ 
        error: 'Invalid order parameter. Must be either "asc" or "desc"',
        code: 'INVALID_ORDER'
      }, { status: 400 });
    }

    // Validate role if provided
    if (roleParam && roleParam !== 'worker' && roleParam !== 'employer' && roleParam !== 'admin') {
      return NextResponse.json({ 
        error: 'Invalid role parameter. Must be either "worker", "employer", or "admin"',
        code: 'INVALID_ROLE'
      }, { status: 400 });
    }

    // Stats mode - return summary counts
    if (statsParam === 'true') {
      const totalResult = await db.select({ count: count() }).from(user);
      const total = totalResult[0]?.count || 0;

      const workersResult = await db.select({ count: count() })
        .from(user)
        .where(eq(user.role, 'worker'));
      const workers = workersResult[0]?.count || 0;

      const employersResult = await db.select({ count: count() })
        .from(user)
        .where(eq(user.role, 'employer'));
      const employers = employersResult[0]?.count || 0;

      const adminsResult = await db.select({ count: count() })
        .from(user)
        .where(eq(user.role, 'admin'));
      const admins = adminsResult[0]?.count || 0;

      return NextResponse.json({
        total,
        workers,
        employers,
        admins
      }, { status: 200 });
    }

    // Normal mode - return filtered user list
    // Build where conditions
    const conditions = [];
    
    if (roleParam) {
      conditions.push(eq(user.role, roleParam));
    }

    if (search) {
      const searchCondition = or(
        like(user.name, `%${search}%`),
        like(user.email, `%${search}%`)
      );
      conditions.push(searchCondition!);
    }

    // Determine sort column
    const sortColumn = sort === 'name' ? user.name : user.createdAt;
    const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Build and execute query
    let query = db.select().from(user);

    if (conditions.length > 0) {
      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else {
        query = query.where(and(...conditions));
      }
    }

    const users = await query
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    // Exclude emailVerified field from response
    const sanitizedUsers = users.map(({ emailVerified, ...rest }) => rest);

    return NextResponse.json(sanitizedUsers, { status: 200 });

  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}