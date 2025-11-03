import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, walletTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fromWalletId, toWalletId, amount, taskId, submissionId } = body;

    // Validate required fields
    if (!fromWalletId) {
      return NextResponse.json(
        { error: 'From wallet ID is required', code: 'MISSING_FROM_WALLET_ID' },
        { status: 400 }
      );
    }

    if (!toWalletId) {
      return NextResponse.json(
        { error: 'To wallet ID is required', code: 'MISSING_TO_WALLET_ID' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate wallets are different
    if (fromWalletId === toWalletId) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same wallet', code: 'SAME_WALLET_TRANSFER' },
        { status: 400 }
      );
    }

    // Fetch both wallets
    const fromWalletResult = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, parseInt(fromWalletId)))
      .limit(1);

    if (fromWalletResult.length === 0) {
      return NextResponse.json(
        { error: 'Source wallet not found', code: 'FROM_WALLET_NOT_FOUND' },
        { status: 404 }
      );
    }

    const toWalletResult = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, parseInt(toWalletId)))
      .limit(1);

    if (toWalletResult.length === 0) {
      return NextResponse.json(
        { error: 'Destination wallet not found', code: 'TO_WALLET_NOT_FOUND' },
        { status: 404 }
      );
    }

    const fromWallet = fromWalletResult[0];
    const toWallet = toWalletResult[0];

    // Check if currency types match
    if (fromWallet.currencyType !== toWallet.currencyType) {
      return NextResponse.json(
        { 
          error: 'Currency types must match for transfer', 
          code: 'CURRENCY_MISMATCH',
          details: {
            fromCurrency: fromWallet.currencyType,
            toCurrency: toWallet.currencyType
          }
        },
        { status: 409 }
      );
    }

    // Check sufficient balance
    if (fromWallet.balance < amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance', 
          code: 'INSUFFICIENT_BALANCE',
          details: {
            available: fromWallet.balance,
            required: amount
          }
        },
        { status: 409 }
      );
    }

    // Build referenceId if taskId or submissionId provided
    let referenceId = null;
    if (taskId || submissionId) {
      referenceId = JSON.stringify({
        ...(taskId && { taskId }),
        ...(submissionId && { submissionId })
      });
    }

    // Deduct from source wallet
    const updatedFromWallet = await db
      .update(wallets)
      .set({
        balance: fromWallet.balance - amount,
      })
      .where(eq(wallets.id, parseInt(fromWalletId)))
      .returning();

    // Add to destination wallet
    const updatedToWallet = await db
      .update(wallets)
      .set({
        balance: toWallet.balance + amount,
      })
      .where(eq(wallets.id, parseInt(toWalletId)))
      .returning();

    // Create transaction record for fromWallet (debit)
    const fromTransaction = await db
      .insert(walletTransactions)
      .values({
        walletId: parseInt(fromWalletId),
        transactionType: 'task_payment',
        amount: -amount,
        currencyType: fromWallet.currencyType,
        status: 'completed',
        referenceId: referenceId,
        description: 'Payment for task',
      })
      .returning();

    // Create transaction record for toWallet (credit)
    const toTransaction = await db
      .insert(walletTransactions)
      .values({
        walletId: parseInt(toWalletId),
        transactionType: 'task_payment',
        amount: amount,
        currencyType: toWallet.currencyType,
        status: 'completed',
        referenceId: referenceId,
        description: 'Received payment for task',
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        transfer: {
          amount,
          currencyType: fromWallet.currencyType,
          fromWallet: updatedFromWallet[0],
          toWallet: updatedToWallet[0],
          transactions: {
            debit: fromTransaction[0],
            credit: toTransaction[0]
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/wallets/transfer error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
