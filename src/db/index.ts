import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Cached instances
let cachedClient: ReturnType<typeof postgres> | null = null;
let cachedDb: ReturnType<typeof drizzle> | null = null;

// Initialize database connection lazily
function initConnection() {
  if (cachedDb && cachedClient) {
    return { db: cachedDb, client: cachedClient };
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  cachedClient = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    onnotice: () => {},
  });

  cachedDb = drizzle(cachedClient, { schema });
  
  return { db: cachedDb, client: cachedClient };
}

// Export getter functions wrapped to look like the actual objects
const dbHandler = {
  get select() { return initConnection().db.select; },
  get insert() { return initConnection().db.insert; },
  get update() { return initConnection().db.update; },
  get delete() { return initConnection().db.delete; },
  get query() { return initConnection().db.query; },
  get transaction() { return initConnection().db.transaction; },
  get $with() { return initConnection().db.$with; },
};

const clientHandler = {
  get end() { return initConnection().client.end; },
  get unsafe() { return initConnection().client.unsafe; },
};

export const db = dbHandler as any;
export const client = clientHandler as any;

export type Database = ReturnType<typeof initConnection>['db'];
