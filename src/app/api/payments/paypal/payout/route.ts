import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, walletTransactions, adminSettings, adminWallets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, paypalEmail } = body;

    if (!userId || !amount || !paypalEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get commission rate
    const settings = await db.select().from(adminSettings).limit(1);
    const commissionRate = settings[0]?.commissionRate || 0.05;

    const commissionAmount = amount * commissionRate;
    const netAmount = amount - commissionAmount;

    // Check user wallet balance
    const userWallet = await db.select()
      .from(wallets)
      .where(and(
        eq(wallets.userId, userId),
        eq(wallets.currencyType, 'USD')
      ))
      .limit(1);

    if (userWallet.length === 0 || userWallet[0].balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    const wallet = userWallet[0];

    // Simulate PayPal payout
    const payoutResult = {
      success: true,
      batchId: `PAYOUT_${Date.now()}`,
      status: 'SUCCESS'
    };

    // Deduct full amount from user wallet
    await db.update(wallets)
      .set({
        balance: wallet.balance - amount,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(wallets.id, wallet.id));

    // Record withdrawal transaction
    await db.insert(walletTransactions).values({
      walletId: wallet.id,
      transactionType: 'withdrawal',
      amount: -amount,
      currencyType: 'USD',
      status: payoutResult.status === 'SUCCESS' ? 'completed' : 'pending',
      referenceId: payoutResult.batchId,
      description: `PayPal withdrawal to ${paypalEmail} - Commission: $${commissionAmount.toFixed(2)}`,
      transactionHash: payoutResult.batchId,
      createdAt: new Date().toISOString(),
    });

    // Update admin wallet with commission
    const adminWalletRecord = await db.select()
      .from(adminWallets)
      .where(eq(adminWallets.currencyType, 'USD'))
      .limit(1);

    if (adminWalletRecord.length > 0) {
      const admin = adminWalletRecord[0];
      await db.update(adminWallets)
        .set({
          balance: admin.balance + commissionAmount,
          totalEarned: admin.totalEarned + commissionAmount,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(adminWallets.id, admin.id));
    } else {
      await db.insert(adminWallets).values({
        currencyType: 'USD',
        balance: commissionAmount,
        totalEarned: commissionAmount,
        totalWithdrawn: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      withdrawal: {
        amount,
        commission: commissionAmount,
        netAmount,
        batchId: payoutResult.batchId,
        status: payoutResult.status,
      },
    });
  } catch (error: any) {
    console.error('PayPal payout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
