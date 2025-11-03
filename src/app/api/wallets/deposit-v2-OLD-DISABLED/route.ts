import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { amount, currencyType, transactionHash, notes } = body;

    // Validation: amount is required and must be positive
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          error: 'Amount is required and must be a positive number',
          code: 'INVALID_AMOUNT'
        },
        { status: 400 }
      );
    }

    // Validation: minimum deposit is $5
    if (amount < 5) {
      return NextResponse.json(
        {
          error: 'Minimum deposit amount is $5',
          code: 'AMOUNT_TOO_LOW'
        },
        { status: 400 }
      );
    }

    // Validation: currencyType is required
    if (!currencyType) {
      return NextResponse.json(
        {
          error: 'Currency type is required',
          code: 'MISSING_CURRENCY_TYPE'
        },
        { status: 400 }
      );
    }

    // Validation: currencyType must be USD or USDT_TRC20
    if (currencyType !== 'USD' && currencyType !== 'USDT_TRC20') {
      return NextResponse.json(
        {
          error: 'Currency type must be "USD" or "USDT_TRC20"',
          code: 'INVALID_CURRENCY_TYPE'
        },
        { status: 400 }
      );
    }

    // Get commission rate from admin settings
    const settingsResult = await sql`SELECT * FROM admin_settings LIMIT 1`;
    
    if (settingsResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Admin settings not found',
          code: 'ADMIN_SETTINGS_NOT_FOUND'
        },
        { status: 500 }
      );
    }

    const commissionRate = settingsResult[0].commission_rate;

    // Calculate commission and net amount
    const commissionAmount = amount * commissionRate;
    const netAmount = amount - commissionAmount;

    // Get or create user wallet for the currency type
    let userWallet = await sql`
      SELECT * FROM wallets 
      WHERE user_id = ${user.id} AND currency_type = ${currencyType}
      LIMIT 1
    `;

    if (userWallet.length === 0) {
      // Create new wallet if it doesn't exist
      userWallet = await sql`
        INSERT INTO wallets (user_id, currency_type, balance)
        VALUES (${user.id}, ${currencyType}, 0)
        RETURNING *
      `;
    }

    const wallet = userWallet[0];

    // Calculate new balance with netAmount (not full amount)
    const newBalance = wallet.balance + netAmount;

    // Update wallet balance
    const updatedWallet = await sql`
      UPDATE wallets 
      SET balance = ${newBalance}, updated_at = NOW()
      WHERE id = ${wallet.id}
      RETURNING *
    `;

    if (updatedWallet.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update wallet balance',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Create wallet transaction record for user (netAmount)
    const referenceId = `deposit_${Date.now()}`;
    const description = notes
      ? `Deposit to wallet - ${notes} (Commission: ${commissionAmount.toFixed(2)} ${currencyType})`
      : `Deposit to wallet (Commission: ${commissionAmount.toFixed(2)} ${currencyType})`;

    const transaction = await sql`
      INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, currency_type, status, reference_id, description, transaction_hash)
      VALUES (${wallet.id}, 'deposit', ${netAmount}, ${currencyType}, 'completed', ${referenceId}, ${description}, ${transactionHash || null})
      RETURNING *
    `;

    if (transaction.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to create transaction record',
          code: 'TRANSACTION_FAILED'
        },
        { status: 500 }
      );
    }

    // Get or create admin wallet for this currency
    let adminWallet = await sql`
      SELECT * FROM admin_wallets 
      WHERE currency_type = ${currencyType}
      LIMIT 1
    `;

    if (adminWallet.length === 0) {
      // Create admin wallet if doesn't exist
      adminWallet = await sql`
        INSERT INTO admin_wallets (currency_type, balance, total_earned, total_withdrawn)
        VALUES (${currencyType}, ${commissionAmount}, ${commissionAmount}, 0)
        RETURNING *
      `;
    } else {
      // Update existing admin wallet
      adminWallet = await sql`
        UPDATE admin_wallets 
        SET 
          balance = ${adminWallet[0].balance + commissionAmount},
          total_earned = ${adminWallet[0].total_earned + commissionAmount},
          updated_at = NOW()
        WHERE id = ${adminWallet[0].id}
        RETURNING *
      `;
    }

    // Return success response with breakdown
    return NextResponse.json(
      {
        success: true,
        deposit: {
          transactionId: transaction[0].id,
          depositedAmount: amount,
          commissionRate: commissionRate,
          commissionAmount: Number(commissionAmount.toFixed(2)),
          netAmount: Number(netAmount.toFixed(2)),
          currencyType: currencyType,
          newBalance: updatedWallet[0].balance,
          createdAt: transaction[0].created_at,
          transactionHash: transaction[0].transaction_hash || undefined
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/wallets/deposit-v2 error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
