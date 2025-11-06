import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Cached connection for serverless
let cachedClient: ReturnType<typeof postgres> | null = null;
let cachedDb: ReturnType<typeof drizzle> | null = null;

// Initialize database connection (lazy)
function initDb() {
  if (cachedDb) return cachedDb;

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Configure postgres for serverless environment (Vercel/Amplify)
  cachedClient = postgres(connectionString, {
    prepare: false,
    max: 1, // Limit connections in serverless
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30, // 30 minutes
    onnotice: () => {}, // Suppress notices
  });

  cachedDb = drizzle(cachedClient, { schema });
  return cachedDb;
}

// Create a Proxy to make it work like the old export
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const connection = initDb();
    return (connection as any)[prop];
  }
});

// Export client for direct access if needed
export const client = new Proxy({} as ReturnType<typeof postgres>, {
  get(target, prop) {
    if (!cachedClient) initDb();
    return (cachedClient as any)[prop];
  }
});

export type Database = typeof db;
