import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { wallets, walletTransactions, adminWallets, adminSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ensureUserInDatabase } from '@/lib/user-sync';
import { createPayPalOrder as createPayPalOrderDirect } from '@/lib/paypal-rest';

// Create PayPal order for deposit
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

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Create PayPal order using direct REST API
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/employer/paypal-return`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/employer/payments?payment=cancelled`;

    try {
      console.log('[PayPal] Creating order with amount:', amount);
      console.log('[PayPal] Mode:', process.env.PAYPAL_MODE);
      console.log('[PayPal] Return URL:', returnUrl);
      
      const order = await createPayPalOrderDirect(amount, returnUrl, cancelUrl);
      console.log('[PayPal] Order created successfully:', order.id);
      
      return NextResponse.json({
        success: true,
        orderId: order.id,
        approvalUrl: order.approvalUrl,
        amount: amount,
      });
    } catch (paypalError: any) {
      console.error('[PayPal] Order creation error:', paypalError);
      console.error('[PayPal] Error message:', paypalError.message);
      console.error('[PayPal] Error details:', JSON.stringify(paypalError?.details || paypalError, null, 2));
      console.error('[PayPal] Error stack:', paypalError?.stack);
      
      const errorMessage = paypalError?.body?.message || paypalError?.message || 'Failed to create PayPal order';
      const errorDetails = paypalError?.body?.details || paypalError?.details || [];
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          debug: process.env.NODE_ENV === 'development' ? paypalError?.toString() : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PayPal deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to process PayPal deposit: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
