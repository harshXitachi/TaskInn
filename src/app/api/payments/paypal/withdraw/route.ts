import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { wallets, walletTransactions, adminWallets, adminSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ensureUserInDatabase } from '@/lib/user-sync';

// Simulate PayPal payout (withdrawal) with commission
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Ensure user exists in database
    await ensureUserInDatabase(user);

    const { amount, paypalEmail } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal email is required' },
        { status: 400 }
      );
    }

    // Get user's USD wallet
    const userWallet = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, user.id),
          eq(wallets.currencyType, 'USD')
        )
      )
      .limit(1);

    if (userWallet.length === 0) {
      return NextResponse.json(
        { error: 'USD wallet not found' },
        { status: 404 }
      );
    }

    const wallet = userWallet[0];

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get commission rate from admin settings
    const settings = await db
      .select()
      .from(adminSettings)
      .limit(1);
    
    const commissionRate = settings.length > 0 ? settings[0].commissionRate : 0.05; // Default 5%
    const commissionAmount = amount * commissionRate;
    const netAmount = amount - commissionAmount;

    // Simulate PayPal payout
    const payoutId = `PAYOUT_${Date.now()}`;
    const timestamp = new Date();

    // Deduct from wallet
    await db
      .update(wallets)
      .set({
        balance: wallet.balance - amount,
        updatedAt: timestamp,
      })
      .where(eq(wallets.id, wallet.id));

    // Get or create admin wallet for USD
    let adminWallet = await db
      .select()
      .from(adminWallets)
      .where(eq(adminWallets.currencyType, 'USD'))
      .limit(1);

    if (adminWallet.length === 0) {
      adminWallet = await db
        .insert(adminWallets)
        .values({
          currencyType: 'USD',
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();
    }

    // Update admin wallet balance (add commission)
    await db
      .update(adminWallets)
      .set({
        balance: adminWallet[0].balance + commissionAmount,
        totalEarned: adminWallet[0].totalEarned + commissionAmount,
        updatedAt: timestamp
      })
      .where(eq(adminWallets.id, adminWallet[0].id));

    // Create transaction record
    await db
      .insert(walletTransactions)
      .values({
        walletId: wallet.id,
        transactionType: 'withdrawal',
        amount: -amount,
        currencyType: 'USD',
        status: 'completed',
        referenceId: payoutId,
        transactionHash: payoutId,
        description: `PayPal withdrawal to ${paypalEmail} - Net: $${netAmount.toFixed(2)}, Commission: $${commissionAmount.toFixed(2)}`,
        createdAt: timestamp,
      });

    // Update admin settings total earnings
    if (settings.length > 0) {
      await db
        .update(adminSettings)
        .set({
          totalEarnings: settings[0].totalEarnings + commissionAmount,
          updatedAt: new Date()
        })
        .where(eq(adminSettings.id, settings[0].id));
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      payoutId: payoutId,
      amount,
      commissionAmount,
      netAmount,
      newBalance: wallet.balance - amount,
    });
  } catch (error) {
    console.error('PayPal withdrawal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
