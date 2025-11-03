import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, walletTransactions } from '@/db/schema';
import { eq, and, sql, gte, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const currencyType = searchParams.get('currencyType') || 'USD';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Validate userId matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to earnings data', code: 'UNAUTHORIZED_ACCESS' },
        { status: 403 }
      );
    }

    // Validate currency type
    if (!['USD', 'USDT_TRC20'].includes(currencyType)) {
      return NextResponse.json(
        { error: 'Invalid currency type. Must be USD or USDT_TRC20', code: 'INVALID_CURRENCY_TYPE' },
        { status: 400 }
      );
    }

    // Get user's wallet for specified currency
    const userWallet = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, userId),
          eq(wallets.currencyType, currencyType)
        )
      )
      .limit(1);

    // If wallet doesn't exist, return zeros
    if (userWallet.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalEarnings: 0,
            availableBalance: 0,
            thisMonthEarnings: 0,
            totalWithdrawn: 0,
          },
          transactions: [],
        },
      });
    }

    const wallet = userWallet[0];
    const walletId = wallet.id;

    // Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Calculate totalEarnings: SUM of task_payment transactions with completed status and positive amount
    const totalEarningsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${walletTransactions.amount}), 0)`,
      })
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.walletId, walletId),
          eq(walletTransactions.transactionType, 'task_payment'),
          eq(walletTransactions.status, 'completed'),
          sql`${walletTransactions.amount} > 0`
        )
      );

    const totalEarnings = Number(totalEarningsResult[0]?.total || 0);

    // Get available balance from wallet
    const availableBalance = Number(wallet.balance);

    // Calculate thisMonthEarnings: SUM of task_payment transactions from current month
    const thisMonthEarningsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${walletTransactions.amount}), 0)`,
      })
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.walletId, walletId),
          eq(walletTransactions.transactionType, 'task_payment'),
          eq(walletTransactions.status, 'completed'),
          sql`${walletTransactions.amount} > 0`,
          gte(walletTransactions.createdAt, startOfMonth)
        )
      );

    const thisMonthEarnings = Number(thisMonthEarningsResult[0]?.total || 0);

    // Calculate totalWithdrawn: SUM of ABS(amount) for withdrawal transactions
    const totalWithdrawnResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(ABS(${walletTransactions.amount})), 0)`,
      })
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.walletId, walletId),
          eq(walletTransactions.transactionType, 'withdrawal'),
          eq(walletTransactions.status, 'completed')
        )
      );

    const totalWithdrawn = Number(totalWithdrawnResult[0]?.total || 0);

    // Fetch transaction history with pagination
    const transactions = await db
      .select({
        id: walletTransactions.id,
        type: walletTransactions.transactionType,
        amount: walletTransactions.amount,
        currencyType: walletTransactions.currencyType,
        status: walletTransactions.status,
        description: walletTransactions.description,
        createdAt: walletTransactions.createdAt,
      })
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.walletId, walletId),
          sql`${walletTransactions.transactionType} IN ('task_payment', 'withdrawal')`
        )
      )
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEarnings,
          availableBalance,
          thisMonthEarnings,
          totalWithdrawn,
        },
        transactions,
      },
    });
  } catch (error) {
    console.error('GET worker earnings error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
