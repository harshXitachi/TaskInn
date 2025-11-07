import { NextRequest, NextResponse } from 'next/server';

// Mock withdraw route has been disabled for security
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Mock withdrawals are disabled. Please use PayPal or CoinPayments for withdrawals.' },
    { status: 403 }
  );
}
