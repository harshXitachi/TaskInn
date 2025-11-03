import { NextRequest, NextResponse } from 'next/server';
import { createUSDTDepositAddress } from '@/lib/coinpayments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await createUSDTDepositAddress(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      address: result.address,
      pubkey: result.pubkey,
      destTag: result.destTag,
    });
  } catch (error: any) {
    console.error('Create USDT deposit address error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
