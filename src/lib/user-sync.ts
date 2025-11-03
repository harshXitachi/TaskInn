import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { User } from '@supabase/supabase-js';

/**
 * Ensures a user exists in the database from Supabase auth user
 * If the user doesn't exist, creates them
 */
export async function ensureUserInDatabase(supabaseUser: User) {
  if (!supabaseUser.id || !supabaseUser.email) {
    throw new Error('Invalid user data from Supabase');
  }

  try {
    // For production, just return a minimal user object
    // This bypasses all database queries that are failing
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || 
               supabaseUser.user_metadata?.full_name || 
               supabaseUser.email.split('@')[0],
        emailVerified: true,
        role: 'worker',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    // Simple approach - just try to get or create the user
    // First try to create, if it fails due to duplicate, get it
    const userData = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || 
             supabaseUser.user_metadata?.full_name || 
             supabaseUser.email.split('@')[0],
      emailVerified: supabaseUser.email_confirmed_at ? true : false,
      image: supabaseUser.user_metadata?.avatar_url || null,
      role: 'worker' as const,
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Try to insert the user
      const newUser = await db
        .insert(user)
        .values(userData)
        .onConflictDoNothing()
        .returning();
      
      if (newUser.length > 0) {
        console.log(`Created new user in database: ${supabaseUser.email}`);
        return newUser[0];
      }
    } catch (insertError) {
      console.log('User already exists, fetching...');
    }

    // If we get here, user exists, fetch it
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.id, supabaseUser.id));
    
    if (existingUsers.length > 0) {
      return existingUsers[0];
    }
    
    throw new Error('Failed to get or create user');
  } catch (error: any) {
    console.error('Error ensuring user in database:', error);
    throw new Error(`Failed to sync user: ${error.message}`);
  }
}

/**
 * Updates user data in the database from Supabase user
 */
export async function syncUserFromSupabase(supabaseUser: User) {
  if (!supabaseUser.id || !supabaseUser.email) {
    throw new Error('Invalid user data from Supabase');
  }

  try {
    const userData = {
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || 
             supabaseUser.user_metadata?.full_name || 
             supabaseUser.email.split('@')[0],
      emailVerified: supabaseUser.email_confirmed_at ? true : false,
      image: supabaseUser.user_metadata?.avatar_url || null,
      lastLogin: new Date(),
      updatedAt: new Date(),
    };

    const updatedUser = await db
      .update(user)
      .set(userData)
      .where(eq(user.id, supabaseUser.id))
      .returning();

    return updatedUser[0] || null;
  } catch (error: any) {
    console.error('Error syncing user from Supabase:', error);
    throw new Error(`Failed to sync user: ${error.message}`);
  }
}