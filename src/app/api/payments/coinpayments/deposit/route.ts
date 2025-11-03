import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { coinpaymentsClient } from '@/lib/payments/coinpayments';

// Create CoinPayments transaction for USDT deposit
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

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Create transaction with CoinPayments
    // Note: amount should be in currency1 (USD), and we receive in currency2 (USDT.TRC20)
    const transaction = await coinpaymentsClient.createTransaction(
      amount,
      user.id,
      'USDT.TRC20',
      user.email || undefined
    );

    // Return payment details including address and QR code
    return NextResponse.json({
      success: true,
      txnId: transaction.txn_id,
      address: transaction.address,
      amount: amount,
      qrcodeUrl: transaction.qrcode_url,
      statusUrl: transaction.status_url,
      checkoutUrl: `https://www.coinpayments.net/index.php?cmd=checkout&id=${transaction.txn_id}`,
      timeout: transaction.timeout,
    });
  } catch (error) {
    console.error('CoinPayments deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to process USDT deposit: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
