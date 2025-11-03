import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { adminWallets, adminSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Helper function to validate admin session
async function validateAdminSession(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const sessionData = authHeader.replace('Bearer ', '');
    
    // Parse the session data (it's the admin ID stored in localStorage as bearer_token)
    const adminId = parseInt(sessionData);
    if (isNaN(adminId)) {
      return null;
    }

    const admin = await db.select()
      .from(adminSettings)
      .where(eq(adminSettings.id, adminId))
      .limit(1);

    if (admin.length === 0) {
      return null;
    }

    return admin[0];
  } catch (error) {
    console.error('Admin session validation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for admin session
    const admin = await validateAdminSession(request);
    
    if (!admin) {
      return NextResponse.json(
        { 
          error: 'Admin authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      amount, 
      currencyType, 
      paymentMethod, 
      paymentAddress, 
      bankName, 
      accountNumber, 
      notes 
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (amount < 5) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is $5' },
        { status: 400 }
      );
    }

    if (!currencyType || !['USD', 'USDT_TRC20'].includes(currencyType)) {
      return NextResponse.json(
        { error: 'Invalid currency type' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !paymentAddress) {
      return NextResponse.json(
        { error: 'Payment method and address are required' },
        { status: 400 }
      );
    }

    // Get the admin wallet for the specified currency
    const adminWalletsData = await db.select()
      .from(adminWallets)
      .where(eq(adminWallets.currencyType, currencyType))
      .limit(1);

    if (adminWalletsData.length === 0) {
      return NextResponse.json(
        { error: 'Admin wallet not found' },
        { status: 404 }
      );
    }

    const adminWallet = adminWalletsData[0];

    // Check if sufficient balance
    if (adminWallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Update wallet balance
    const newBalance = adminWallet.balance - amount;
    const newTotalWithdrawn = adminWallet.totalWithdrawn + amount;

    await db.update(adminWallets)
      .set({
        balance: newBalance,
        totalWithdrawn: newTotalWithdrawn,
        updatedAt: new Date().toISOString()
      })
      .where(eq(adminWallets.id, adminWallet.id));

    // Log withdrawal details
    console.log('Admin withdrawal processed:', {
      adminId: admin.id,
      amount,
      currencyType,
      paymentMethod,
      paymentAddress,
      bankName,
      accountNumber,
      notes,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal processed successfully',
      withdrawal: {
        amount,
        currencyType,
        newBalance,
        totalWithdrawn: newTotalWithdrawn
      }
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/admin/wallet/withdraw error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}