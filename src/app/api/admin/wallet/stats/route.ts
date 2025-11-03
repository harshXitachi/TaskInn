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
    // For admin, we'll validate by checking if the admin exists
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

export async function GET(request: NextRequest) {
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

    // Get admin wallets for both currencies
    const adminWalletsData = await db.select().from(adminWallets);

    // Find USD and USDT wallets
    const usdWallet = adminWalletsData.find(w => w.currencyType === 'USD');
    const usdtWallet = adminWalletsData.find(w => w.currencyType === 'USDT_TRC20');

    // Return admin wallet statistics
    return NextResponse.json({
      success: true,
      stats: {
        usd: {
          balance: usdWallet?.balance || 0,
          totalEarned: usdWallet?.totalEarned || 0,
          totalWithdrawn: usdWallet?.totalWithdrawn || 0,
          pendingCommissions: 0,
          createdAt: usdWallet?.createdAt || null,
          updatedAt: usdWallet?.updatedAt || null,
        },
        usdt: {
          balance: usdtWallet?.balance || 0,
          totalEarned: usdtWallet?.totalEarned || 0,
          totalWithdrawn: usdtWallet?.totalWithdrawn || 0,
          pendingCommissions: 0,
          createdAt: usdtWallet?.createdAt || null,
          updatedAt: usdtWallet?.updatedAt || null,
        },
        combined: {
          totalCommissionsUSD: usdWallet?.totalEarned || 0,
          totalCommissionsUSDT: usdtWallet?.totalEarned || 0,
          currentBalanceUSD: usdWallet?.balance || 0,
          currentBalanceUSDT: usdtWallet?.balance || 0,
          totalWithdrawalsUSD: usdWallet?.totalWithdrawn || 0,
          totalWithdrawalsUSDT: usdtWallet?.totalWithdrawn || 0,
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/admin/wallet/stats error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}