import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Lazy initialization without proxies to avoid minification issues
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    _client = postgres(connectionString, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      max_lifetime: 60 * 30,
      onnotice: () => {},
    });

    _db = drizzle(_client, { schema });
  }
  return _db;
}

function getClient() {
  if (!_client) {
    getDb(); // This will init both
  }
  return _client!;
}

// Export functions that return initialized instances
export const db = {
  get select() {
    return getDb().select.bind(getDb());
  },
  get insert() {
    return getDb().insert.bind(getDb());
  },
  get update() {
    return getDb().update.bind(getDb());
  },
  get delete() {
    return getDb().delete.bind(getDb());
  },
  get transaction() {
    return getDb().transaction.bind(getDb());
  },
  get query() {
    return getDb().query;
  },
};

export const sql = getClient;
export type Database = ReturnType<typeof getDb>;
