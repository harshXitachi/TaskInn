import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Security: Users can only access their own stats
    if (userId !== user.id) {
      return NextResponse.json(
        { 
          error: 'Access denied',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) {
      // Return default stats object if no record exists
      return NextResponse.json({
        userId: userId,
        tasksCompleted: 0,
        tasksPosted: 0,
        totalEarned: 0,
        totalSpent: 0,
        averageRating: 0,
        successRate: 0,
        updatedAt: new Date().toISOString()
      }, { status: 200 });
    }

    return NextResponse.json(stats[0], { status: 200 });
  } catch (error) {
    console.error('GET user stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}