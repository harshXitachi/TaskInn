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

    const { amount, currencyType, paymentMethod, paymentAddress } = await request.json();

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

    if (!paymentAddress) {
      const requiredField = currencyType === 'USD' ? 'PayPal email' : 'USDT TRC-20 wallet address';
      return NextResponse.json(
        { error: `${requiredField} is required` },
        { status: 400 }
      );
    }

    // Get commission rate from admin settings
    const settings = await db
      .select()
      .from(adminSettings)
      .limit(1);
    
    const commissionRate = settings.length > 0 ? settings[0].commissionRate : 0.02; // Default 2%
    const commissionAmount = amount * commissionRate;
    const netAmount = amount - commissionAmount;

    // Get user wallet for the specified currency
    const userWallet = await db
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
      return NextResponse.json(
        { error: `No ${currencyType} wallet found for user` },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (userWallet[0].balance < amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance',
          details: {
            available: userWallet[0].balance,
            requested: amount
          }
        },
        { status: 400 }
      );
    }

    // Get or create admin wallet for the specified currency
    let adminWallet = await db
      .select()
      .from(adminWallets)
      .where(eq(adminWallets.currencyType, currencyType))
      .limit(1);

    const timestamp = new Date();

    if (adminWallet.length === 0) {
      // Create admin wallet if it doesn't exist
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

    // Update user wallet balance (deduct full amount)
    const updatedUserWallet = await db
      .update(wallets)
      .set({
        balance: userWallet[0].balance - amount,
        updatedAt: timestamp
      })
      .where(eq(wallets.id, userWallet[0].id))
      .returning();

    // Update admin wallet balance (add commission)
    const updatedAdminWallet = await db
      .update(adminWallets)
      .set({
        balance: adminWallet[0].balance + commissionAmount,
        totalEarned: adminWallet[0].totalEarned + commissionAmount,
        updatedAt: timestamp
      })
      .where(eq(adminWallets.id, adminWallet[0].id))
      .returning();

    // Create transaction record for user withdrawal
    const referenceId = `WITHDRAW_${Date.now()}_${user.id.substring(0, 8)}`;
    const userTransaction = await db
      .insert(walletTransactions)
      .values({
        walletId: userWallet[0].id,
        transactionType: 'withdrawal',
        amount: -amount, // Negative for withdrawal
        currencyType: currencyType,
        status: 'completed',
        description: `Withdrawal of ${amount} ${currencyType} to ${paymentMethod || 'external wallet'} (Net: ${netAmount.toFixed(2)}, Commission: ${commissionAmount.toFixed(2)})`,
        referenceId: referenceId,
        transactionHash: paymentAddress,
        createdAt: timestamp
      })
      .returning();

    // Update admin settings total earnings
    if (settings.length > 0) {
      await db
        .update(adminSettings)
        .set({
          totalEarnings: settings[0].totalEarnings + commissionAmount,
          updatedAt: timestamp
        })
        .where(eq(adminSettings.id, settings[0].id));
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal successful',
      withdrawal: {
        amount: amount,
        commission: commissionAmount,
        netAmount: netAmount,
        commissionRate: commissionRate,
        currencyType: currencyType,
        paymentMethod: paymentMethod || (currencyType === 'USD' ? 'PayPal' : 'USDT TRC-20'),
        paymentAddress: paymentAddress,
        referenceId: referenceId,
        newBalance: updatedUserWallet[0].balance,
        adminCommission: commissionAmount
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
