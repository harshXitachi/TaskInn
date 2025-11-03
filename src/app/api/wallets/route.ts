import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wallets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { ensureUserInDatabase } from '@/lib/user-sync';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Ensure user exists in database (auto-sync from Supabase)
    try {
      await ensureUserInDatabase(user);
    } catch (syncError) {
      console.error('Failed to sync user:', syncError);
      return NextResponse.json(
        { 
          error: 'Failed to sync user account. Please try again.', 
          code: 'USER_SYNC_FAILED',
          details: syncError instanceof Error ? syncError.message : 'Unknown sync error'
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Security: User can only access their own wallets
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only access your own wallets', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));

    return NextResponse.json(userWallets, { status: 200 });
  } catch (error) {
    console.error('GET wallets error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Ensure user exists in database (auto-sync from Supabase)
    try {
      await ensureUserInDatabase(user);
    } catch (syncError) {
      console.error('Failed to sync user:', syncError);
      return NextResponse.json(
        { 
          error: 'Failed to sync user account. Please try again.', 
          code: 'USER_SYNC_FAILED',
          details: syncError instanceof Error ? syncError.message : 'Unknown sync error'
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED'
        },
        { status: 400 }
      );
    }

    const { currencyType } = body;

    // Validate required fields
    if (!currencyType) {
      return NextResponse.json(
        { error: 'currencyType is required', code: 'MISSING_CURRENCY_TYPE' },
        { status: 400 }
      );
    }

    // Validate currencyType
    if (currencyType !== 'USD' && currencyType !== 'USDT_TRC20') {
      return NextResponse.json(
        {
          error: 'currencyType must be either "USD" or "USDT_TRC20"',
          code: 'INVALID_CURRENCY_TYPE'
        },
        { status: 400 }
      );
    }

    // Check if wallet already exists for this user and currency
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(
        and(
          eq(wallets.userId, user.id),
          eq(wallets.currencyType, currencyType)
        )
      )
      .limit(1);

    if (existingWallet.length > 0) {
      return NextResponse.json(
        {
          error: `Wallet for ${currencyType} already exists for this user`,
          code: 'WALLET_ALREADY_EXISTS'
        },
        { status: 409 }
      );
    }

    // Create new wallet
    const timestamp = new Date().toISOString();
    const newWallet = await db
      .insert(wallets)
      .values({
        userId: user.id,
        currencyType: currencyType,
        balance: 0,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .returning();

    return NextResponse.json(newWallet[0], { status: 201 });
  } catch (error) {
    console.error('POST wallets error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
