import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();

    // SECURITY: User ID cannot be provided in request body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { amount, paymentMethod, paymentAddress, currency, notes } = body;

    // Validate required fields
    if (!amount) {
      return NextResponse.json({ 
        error: "Amount is required",
        code: "MISSING_AMOUNT" 
      }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ 
        error: "Payment method is required",
        code: "MISSING_PAYMENT_METHOD" 
      }, { status: 400 });
    }

    if (!paymentAddress) {
      return NextResponse.json({ 
        error: "Payment address is required",
        code: "MISSING_PAYMENT_ADDRESS" 
      }, { status: 400 });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ 
        error: "Amount must be a positive number",
        code: "INVALID_AMOUNT" 
      }, { status: 400 });
    }

    if (parsedAmount < 5) {
      return NextResponse.json({ 
        error: "Minimum withdrawal amount is $5",
        code: "AMOUNT_TOO_LOW" 
      }, { status: 400 });
    }

    // Validate payment method
    const validPaymentMethods = ['bank', 'paypal', 'crypto_wallet'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ 
        error: "Invalid payment method. Must be one of: bank, paypal, crypto_wallet",
        code: "INVALID_PAYMENT_METHOD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedPaymentAddress = paymentAddress.trim();
    const sanitizedNotes = notes ? notes.trim() : null;
    const finalCurrency = currency ? currency.toUpperCase() : 'USD';

    // Create withdrawal request
    const withdrawalData = {
      userId: user.id,
      amount: parsedAmount,
      currency: finalCurrency,
      paymentType: 'withdrawal',
      status: 'pending',
      paymentMethod: paymentMethod,
      paymentAddress: sanitizedPaymentAddress,
      notes: sanitizedNotes,
      createdAt: new Date().toISOString(),
      taskSubmissionId: null,
      transactionHash: null,
      processedAt: null
    };

    const newWithdrawal = await db.insert(payments)
      .values(withdrawalData)
      .returning();

    if (newWithdrawal.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create withdrawal request' 
      }, { status: 500 });
    }

    return NextResponse.json(newWithdrawal[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
