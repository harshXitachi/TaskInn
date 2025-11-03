import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletTransactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletId = searchParams.get('walletId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate walletId is provided
    if (!walletId) {
      return NextResponse.json(
        { 
          error: 'Wallet ID is required',
          code: 'MISSING_WALLET_ID' 
        },
        { status: 400 }
      );
    }

    // Validate walletId is a valid integer
    const parsedWalletId = parseInt(walletId);
    if (isNaN(parsedWalletId)) {
      return NextResponse.json(
        { 
          error: 'Valid wallet ID is required',
          code: 'INVALID_WALLET_ID' 
        },
        { status: 400 }
      );
    }

    // Query wallet transactions filtered by walletId, sorted by createdAt DESC
    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, parsedWalletId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('GET wallet transactions error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}