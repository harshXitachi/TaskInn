import { NextRequest, NextResponse } from 'next/server';
import { verifyIPNSignature } from '@/lib/coinpayments';
import { db } from '@/db';
import { wallets, walletTransactions, adminSettings, adminWallets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmac = request.headers.get('hmac') || '';

    // Verify IPN signature
    if (!verifyIPNSignature(body, hmac)) {
      console.error('Invalid IPN signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const params = new URLSearchParams(body);
    const ipnData = Object.fromEntries(params.entries());

    console.log('CoinPayments IPN received:', ipnData);

    // Extract deposit info
    const {
      txn_id,
      address,
      status,
      status_text,
      currency,
      amount,
      fee,
      label,
    } = ipnData;

    // Status >= 100 means payment is complete
    const statusCode = parseInt(status);
    if (statusCode < 100) {
      // Payment not yet complete, ignore
      return NextResponse.json({ success: true, message: 'Payment pending' });
    }

    // Extract user ID from label (format: TaskInn-userId)
    const userId = label?.replace('TaskInn-', '');
    if (!userId) {
      console.error('Invalid IPN label format');
      return NextResponse.json({ success: true, message: 'Invalid label' });
    }

    const depositAmount = parseFloat(amount);
    const feeAmount = parseFloat(fee || '0');

    // Get commission rate
    const settings = await db.select().from(adminSettings).limit(1);
    const commissionRate = settings[0]?.commissionRate || 0.05;

    const commissionAmount = depositAmount * commissionRate;
    const netAmount = depositAmount - commissionAmount - feeAmount;

    // Update or create user wallet
    const existingWallet = await db.select()
      .from(wallets)
      .where(and(
        eq(wallets.userId, userId),
        eq(wallets.currencyType, 'USDT_TRC20')
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
        currencyType: 'USDT_TRC20',
        balance: netAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      walletId = newWallet[0].id;
    }

    // Check if transaction already exists
    const existingTx = await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.transactionHash, txn_id))
      .limit(1);

    if (existingTx.length === 0) {
      // Record transaction
      await db.insert(walletTransactions).values({
        walletId,
        transactionType: 'deposit',
        amount: netAmount,
        currencyType: 'USDT_TRC20',
        status: 'completed',
        referenceId: txn_id,
        description: `USDT TRC20 deposit - Commission: ${commissionAmount.toFixed(2)} USDT`,
        transactionHash: txn_id,
        createdAt: new Date().toISOString(),
      });

      // Update admin wallet with commission
      const adminWalletRecord = await db.select()
        .from(adminWallets)
        .where(eq(adminWallets.currencyType, 'USDT_TRC20'))
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
          currencyType: 'USDT_TRC20',
          balance: commissionAmount,
          totalEarned: commissionAmount,
          totalWithdrawn: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, message: 'IPN processed' });
  } catch (error: any) {
    console.error('CoinPayments IPN error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
