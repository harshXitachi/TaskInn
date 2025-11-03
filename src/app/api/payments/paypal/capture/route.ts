import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { wallets, walletTransactions, adminWallets, adminSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ensureUserInDatabase } from '@/lib/user-sync';

// Simulate PayPal payment capture and credit wallet with commission
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

    const { orderId, amount: requestAmount } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Simulate capturing the order - use provided amount or default
    const amount = requestAmount || 100;

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
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

    // Get or create user's USD wallet
    let userWallet = await db
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
      const timestamp = new Date().toISOString();
      userWallet = await db
        .insert(wallets)
        .values({
          userId: user.id,
          currencyType: 'USD',
          balance: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .returning();
    }

    const wallet = userWallet[0];
    const timestamp = new Date().toISOString();

    // Update wallet balance with net amount (after commission)
    await db
      .update(wallets)
      .set({
        balance: wallet.balance + netAmount,
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
        transactionType: 'deposit',
        amount: netAmount,
        currencyType: 'USD',
        status: 'completed',
        referenceId: orderId,
        transactionHash: `CAPTURE_${orderId}`,
        description: `PayPal deposit of ${amount} USD (Commission: ${commissionAmount.toFixed(2)} USD)`,
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
      message: 'Deposit successful',
      originalAmount: amount,
      commissionAmount: commissionAmount,
      netAmount: netAmount,
      newBalance: wallet.balance + netAmount,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
