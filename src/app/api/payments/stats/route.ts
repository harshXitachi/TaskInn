import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and, sql, or } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');

    // Validate userId parameter
    if (!requestedUserId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Security: Users can only view their own statistics
    if (requestedUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to view other users statistics', code: 'UNAUTHORIZED_ACCESS' },
        { status: 403 }
      );
    }

    // Calculate total earnings (completed earnings, bonuses, referrals)
    const totalEarningsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, user.id),
          eq(payments.status, 'completed'),
          or(
            eq(payments.paymentType, 'earning'),
            eq(payments.paymentType, 'bonus'),
            eq(payments.paymentType, 'referral')
          )
        )
      );

    const totalEarnings = totalEarningsResult[0]?.total || 0;

    // Calculate total withdrawals (completed withdrawals)
    const totalWithdrawalsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, user.id),
          eq(payments.status, 'completed'),
          eq(payments.paymentType, 'withdrawal')
        )
      );

    const totalWithdrawals = totalWithdrawalsResult[0]?.total || 0;

    // Calculate pending earnings (pending earnings, bonuses, referrals)
    const pendingEarningsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, user.id),
          eq(payments.status, 'pending'),
          or(
            eq(payments.paymentType, 'earning'),
            eq(payments.paymentType, 'bonus'),
            eq(payments.paymentType, 'referral')
          )
        )
      );

    const pendingEarnings = pendingEarningsResult[0]?.total || 0;

    // Calculate pending withdrawals (pending withdrawals)
    const pendingWithdrawalsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, user.id),
          eq(payments.status, 'pending'),
          eq(payments.paymentType, 'withdrawal')
        )
      );

    const pendingWithdrawals = pendingWithdrawalsResult[0]?.total || 0;

    // Calculate total transactions count
    const totalTransactionsResult = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(payments)
      .where(eq(payments.userId, user.id));

    const totalTransactions = totalTransactionsResult[0]?.count || 0;

    // Calculate available balance
    const availableBalance = totalEarnings - totalWithdrawals;

    // Prepare response
    const stats = {
      userId: user.id,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalWithdrawals: Number(totalWithdrawals.toFixed(2)),
      pendingEarnings: Number(pendingEarnings.toFixed(2)),
      pendingWithdrawals: Number(pendingWithdrawals.toFixed(2)),
      availableBalance: Number(availableBalance.toFixed(2)),
      totalTransactions: Number(totalTransactions),
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
