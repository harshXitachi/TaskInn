import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, walletTransactions, adminWallets, adminSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { ensureUserInDatabase } from '@/lib/user-sync';

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

    const { amount, currencyType } = await request.json();

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!currencyType || (currencyType !== 'USD' && currencyType !== 'USDT_TRC20')) {
      return NextResponse.json(
        { error: 'Valid currency type is required (USD or USDT_TRC20)' },
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

    // Get or create user wallet for the specified currency
    let userWallet = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, user.id),
          eq(wallets.currencyType, currencyType)
        )
      )
      .limit(1);

    if (userWallet.length === 0) {
      // Create wallet if it doesn't exist
      const timestamp = new Date().toISOString();
      userWallet = await db
        .insert(wallets)
        .values({
          userId: user.id,
          currencyType: currencyType,
          balance: 0,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();
    }

    // Get or create admin wallet for the specified currency
    let adminWallet = await db
      .select()
      .from(adminWallets)
      .where(eq(adminWallets.currencyType, currencyType))
      .limit(1);

    if (adminWallet.length === 0) {
      // Create admin wallet if it doesn't exist
      const timestamp = new Date().toISOString();
      adminWallet = await db
        .insert(adminWallets)
        .values({
          currencyType: currencyType,
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();
    }

    // Update user wallet balance (add net amount after commission)
    const updatedUserWallet = await db
      .update(wallets)
      .set({
        balance: userWallet[0].balance + netAmount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(wallets.id, userWallet[0].id))
      .returning();

    // Update admin wallet balance (add commission)
    const updatedAdminWallet = await db
      .update(adminWallets)
      .set({
        balance: adminWallet[0].balance + commissionAmount,
        totalEarned: adminWallet[0].totalEarned + commissionAmount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(adminWallets.id, adminWallet[0].id))
      .returning();

    // Create transaction record for user deposit
    const userTransaction = await db
      .insert(walletTransactions)
      .values({
        walletId: userWallet[0].id,
        transactionType: 'deposit',
        amount: netAmount,
        currencyType: currencyType,
        status: 'completed',
        description: `Mock deposit of ${amount} ${currencyType} (Commission: ${commissionAmount.toFixed(2)} ${currencyType})`,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Create transaction record for admin commission
    const adminTransaction = await db
      .insert(walletTransactions)
      .values({
        walletId: userWallet[0].id, // Reference user wallet for tracking
        transactionType: 'deposit',
        amount: commissionAmount,
        currencyType: currencyType,
        status: 'completed',
        referenceId: `commission_${userTransaction[0].id}`,
        description: `Commission from deposit by user ${user.email}`,
        createdAt: new Date().toISOString()
      })
      .returning();

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
      data: {
        originalAmount: amount,
        commissionAmount: commissionAmount,
        netAmount: netAmount,
        commissionRate: commissionRate,
        wallet: updatedUserWallet[0],
        transaction: userTransaction[0],
        currencySymbol: currencyType === 'USD' ? '$' : '₮'
      }
    });
  } catch (error) {
    console.error('Mock deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to process deposit: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}