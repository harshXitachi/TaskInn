import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, adminSettings } from '@/db/schema';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    // Admin analytics mode: return ALL payments if authorized
    if (all === 'true') {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Admin authentication required', code: 'ADMIN_AUTH_REQUIRED' },
          { status: 401 }
        );
      }

      const adminId = authHeader.replace('Bearer ', '').trim();
      
      // Validate admin ID against adminSettings table
      const adminCheck = await db.select()
        .from(adminSettings)
        .where(eq(adminSettings.id, parseInt(adminId)))
        .limit(1);

      if (adminCheck.length === 0) {
        return NextResponse.json(
          { error: 'Invalid admin credentials', code: 'INVALID_ADMIN' },
          { status: 403 }
        );
      }

      // Admin authenticated - return ALL payments
      const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200);
      const offset = parseInt(searchParams.get('offset') ?? '0');
      const paymentType = searchParams.get('paymentType');
      const status = searchParams.get('status');

      const conditions = [];

      if (paymentType) {
        const validTypes = ['earning', 'withdrawal', 'bonus', 'referral'];
        if (!validTypes.includes(paymentType)) {
          return NextResponse.json({ 
            error: 'Invalid payment type. Must be one of: earning, withdrawal, bonus, referral',
            code: 'INVALID_PAYMENT_TYPE'
          }, { status: 400 });
        }
        conditions.push(eq(payments.paymentType, paymentType));
      }

      if (status) {
        const validStatuses = ['pending', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
          return NextResponse.json({ 
            error: 'Invalid status. Must be one of: pending, completed, failed',
            code: 'INVALID_STATUS'
          }, { status: 400 });
        }
        conditions.push(eq(payments.status, status));
      }

      let query = db.select().from(payments);

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      query = query.orderBy(desc(payments.createdAt));

      const results = await query.limit(limit).offset(offset);

      return NextResponse.json(results, { status: 200 });
    }

    // Regular user mode: require authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Single payment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const payment = await db.select()
        .from(payments)
        .where(and(
          eq(payments.id, parseInt(id)),
          eq(payments.userId, user.id)
        ))
        .limit(1);

      if (payment.length === 0) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      return NextResponse.json(payment[0], { status: 200 });
    }

    // List payments with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const filterUserId = searchParams.get('userId');
    const paymentType = searchParams.get('paymentType');
    const status = searchParams.get('status');

    let query = db.select().from(payments);

    // Build WHERE conditions
    const conditions = [eq(payments.userId, user.id)];

    // Apply additional filters
    if (filterUserId) {
      // Only allow users to filter by their own userId for security
      if (filterUserId !== user.id) {
        return NextResponse.json({ 
          error: 'Cannot access other users\' payments',
          code: 'UNAUTHORIZED_ACCESS'
        }, { status: 403 });
      }
    }

    if (paymentType) {
      const validTypes = ['earning', 'withdrawal', 'bonus', 'referral'];
      if (!validTypes.includes(paymentType)) {
        return NextResponse.json({ 
          error: 'Invalid payment type. Must be one of: earning, withdrawal, bonus, referral',
          code: 'INVALID_PAYMENT_TYPE'
        }, { status: 400 });
      }
      conditions.push(eq(payments.paymentType, paymentType));
    }

    if (status) {
      const validStatuses = ['pending', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be one of: pending, completed, failed',
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
      conditions.push(eq(payments.status, status));
    }

    // Apply all conditions
    query = query.where(and(...conditions));

    // Sort by createdAt DESC (newest first)
    query = query.orderBy(desc(payments.createdAt));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

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

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { amount, paymentType, taskSubmissionId, currency, notes } = body;

    // Validate required fields
    if (!amount) {
      return NextResponse.json({ 
        error: "Amount is required",
        code: "MISSING_AMOUNT" 
      }, { status: 400 });
    }

    if (!paymentType) {
      return NextResponse.json({ 
        error: "Payment type is required",
        code: "MISSING_PAYMENT_TYPE" 
      }, { status: 400 });
    }

    // Validate amount is positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ 
        error: "Amount must be a positive number",
        code: "INVALID_AMOUNT" 
      }, { status: 400 });
    }

    // Validate paymentType
    const validPaymentTypes = ['earning', 'withdrawal', 'bonus', 'referral'];
    if (!validPaymentTypes.includes(paymentType)) {
      return NextResponse.json({ 
        error: "Payment type must be one of: earning, withdrawal, bonus, referral",
        code: "INVALID_PAYMENT_TYPE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: any = {
      userId: user.id,
      amount: parsedAmount,
      paymentType,
      currency: currency || 'USD',
      status: 'pending',
      // createdAt will use database default
    };

    // Add optional fields if provided
    if (taskSubmissionId !== undefined && taskSubmissionId !== null) {
      insertData.taskSubmissionId = parseInt(taskSubmissionId);
    }

    if (notes) {
      insertData.notes = notes.trim();
    }

    // Insert payment record
    const newPayment = await db.insert(payments)
      .values(insertData)
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
