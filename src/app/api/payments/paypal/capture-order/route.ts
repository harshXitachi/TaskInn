import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets, walletTransactions, adminSettings, adminWallets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { capturePayPalOrder as capturePayPalOrderDirect } from '@/lib/paypal-rest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId } = body;

    if (!orderId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Capture the PayPal order using direct REST API
    try {
      const captureResponse = await capturePayPalOrderDirect(orderId);

      if (captureResponse.amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid capture amount' },
          { status: 400 }
        );
      }

      const depositAmount = captureResponse.amount;
      const captureId = captureResponse.captureId;

      // Get commission rate
      const settings = await db.select().from(adminSettings).limit(1);
      const commissionRate = settings[0]?.commissionRate || 0.05;

      const commissionAmount = depositAmount * commissionRate;
      const netAmount = depositAmount - commissionAmount;

      // Update or create user wallet
      const existingWallet = await db.select()
        .from(wallets)
        .where(and(
          eq(wallets.userId, userId),
          eq(wallets.currencyType, 'USD')
        ))
        .limit(1);

      let walletId: number;

      if (existingWallet.length > 0) {
        const wallet = existingWallet[0];
        await db.update(wallets)
          .set({
            balance: wallet.balance + netAmount,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(wallets.id, wallet.id));
        walletId = wallet.id;
      } else {
        const newWallet = await db.insert(wallets).values({
          userId,
          currencyType: 'USD',
          balance: netAmount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).returning();
        walletId = newWallet[0].id;
      }

      // Record transaction
      await db.insert(walletTransactions).values({
        walletId,
        transactionType: 'deposit',
        amount: netAmount,
        currencyType: 'USD',
        status: 'completed',
        referenceId: captureId,
        description: `PayPal deposit - Commission: $${commissionAmount.toFixed(2)}`,
        transactionHash: captureId,
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

      // Update admin settings
      if (settings.length > 0) {
        await db.update(adminSettings)
          .set({
            totalEarnings: settings[0].totalEarnings + commissionAmount,
            updatedAt: new Date()
          })
          .where(eq(adminSettings.id, settings[0].id));
      }

      return NextResponse.json({
        success: true,
        deposit: {
          depositedAmount: depositAmount,
          commissionAmount,
          netAmount,
          captureId: captureId,
        },
      });
    } catch (paypalError) {
      console.error('PayPal capture error:', paypalError);
      return NextResponse.json(
        { success: false, error: 'Failed to capture PayPal order' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Capture PayPal order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
