import { NextRequest, NextResponse } from 'next/server';

// Mock deposit route has been disabled for security
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Mock deposits are disabled. Please use PayPal or CoinPayments for deposits.' },
    { status: 403 }
  );
}
