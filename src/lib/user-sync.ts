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
    // Check if user exists in database using query API
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, supabaseUser.id),
    });

    if (existingUser) {
      // User exists, return it
      return existingUser;
    }

    // User doesn't exist, create them
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

    const newUser = await db
      .insert(user)
      .values(userData)
      .returning();

    if (newUser.length === 0) {
      throw new Error('Failed to create user in database');
    }

    console.log(`Created new user in database: ${supabaseUser.email}`);
    return newUser[0];
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