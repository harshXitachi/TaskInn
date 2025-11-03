import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, walletTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { ensureUserInDatabase } from '@/lib/user-sync';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Ensure user exists in database (auto-sync from Supabase)
    try {
      await ensureUserInDatabase(user);
    } catch (syncError) {
      console.error('Failed to sync user:', syncError);
      return NextResponse.json(
        { 
          error: 'Failed to sync user account. Please try again.', 
          code: 'USER_SYNC_FAILED',
          details: syncError instanceof Error ? syncError.message : 'Unknown sync error'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { currencyType, amount } = body;
    const userId = user.id; // Use authenticated user ID

    if (!currencyType) {
      return NextResponse.json(
        { error: 'Currency type is required', code: 'MISSING_CURRENCY_TYPE' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate currency type
    if (currencyType !== 'USD' && currencyType !== 'USDT_TRC20') {
      return NextResponse.json(
        { 
          error: 'Currency type must be either "USD" or "USDT_TRC20"', 
          code: 'INVALID_CURRENCY_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate amount is positive number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Find existing wallet
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, userId),
          eq(wallets.currencyType, currencyType)
        )
      )
      .limit(1);

    let wallet;

    if (existingWallet.length === 0) {
      // Create new wallet if not found
      const newWallet = await db
        .insert(wallets)
        .values({
          userId,
          currencyType,
          balance: numAmount,
        })
        .returning();

      wallet = newWallet[0];
    } else {
      // Update existing wallet balance
      const updatedWallet = await db
        .update(wallets)
        .set({
          balance: existingWallet[0].balance + numAmount,
        })
        .where(eq(wallets.id, existingWallet[0].id))
        .returning();

      wallet = updatedWallet[0];
    }

    // Create wallet transaction record
    await db.insert(walletTransactions).values({
      walletId: wallet.id,
      transactionType: 'deposit',
      amount: numAmount,
      currencyType,
      status: 'completed',
      description: 'Funds added to wallet',
    });

    return NextResponse.json(wallet, { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}