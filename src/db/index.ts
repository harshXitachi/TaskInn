import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Global cached connection for serverless
let globalClient: ReturnType<typeof postgres> | undefined;
let globalDb: ReturnType<typeof drizzle> | undefined;

// Initialize database connection (lazy, only when needed)
function getConnection() {
  if (globalDb && globalClient) {
    return { db: globalDb, client: globalClient };
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Configure postgres for serverless environment (Vercel/Amplify)
  globalClient = postgres(connectionString, {
    prepare: false,
    max: 1, // Limit connections in serverless
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30, // 30 minutes
    onnotice: () => {}, // Suppress notices
  });

  globalDb = drizzle(globalClient, { schema });
  
  return { db: globalDb, client: globalClient };
}

// Export getters that initialize on first use
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (_, prop) => {
    const { db } = getConnection();
    const value = (db as any)[prop];
    return typeof value === 'function' ? value.bind(db) : value;
  }
});

export const client = new Proxy({} as ReturnType<typeof postgres>, {
  get: (_, prop) => {
    const { client } = getConnection();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export type Database = typeof db;
