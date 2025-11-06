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
  get select() {
    const connection = initConnection();
    return connection.db.select.bind(connection.db);
  },
  get insert() {
    const connection = initConnection();
    return connection.db.insert.bind(connection.db);
  },
  get update() {
    const connection = initConnection();
    return connection.db.update.bind(connection.db);
  },
  get delete() {
    const connection = initConnection();
    return connection.db.delete.bind(connection.db);
  },
  get query() {
    const connection = initConnection();
    return connection.db.query;
  },
  get transaction() {
    const connection = initConnection();
    return connection.db.transaction.bind(connection.db);
  },
  get $with() {
    const connection = initConnection();
    return connection.db.$with.bind(connection.db);
  },
};

const clientHandler = {
  get end() {
    const connection = initConnection();
    return connection.client.end.bind(connection.client);
  },
  get unsafe() {
    const connection = initConnection();
    return connection.client.unsafe.bind(connection.client);
  },
};

export const db = dbHandler as any;
export const client = clientHandler as any;

export type Database = ReturnType<typeof initConnection>['db'];
