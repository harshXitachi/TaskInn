import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Simulate PayPal order creation
    const orderId = `MOCK_ORDER_${Date.now()}`;
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/paypal/approve?order=${orderId}&amount=${amount}`;

    return NextResponse.json({
      success: true,
      orderId: orderId,
      approvalUrl: approvalUrl,
    });
  } catch (error: any) {
    console.error('Create PayPal order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
