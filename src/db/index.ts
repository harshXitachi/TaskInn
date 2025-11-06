import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Singleton cache
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function initDb() {
  if (_db) return _db;

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
  return _db;
}

function initClient() {
  if (_client) return _client;
  initDb(); // This will init both
  return _client!;
}

// Create a wrapper that looks like drizzle but initializes lazily
const dbProxy = {} as ReturnType<typeof drizzle>;
const methods = ['select', 'insert', 'update', 'delete', 'transaction', '$with'] as const;

methods.forEach((method) => {
  Object.defineProperty(dbProxy, method, {
    get() {
      const instance = initDb();
      return instance[method].bind(instance);
    },
  });
});

// Add query property
Object.defineProperty(dbProxy, 'query', {
  get() {
    return initDb().query;
  },
});

export const db = dbProxy;
export const client = { get: initClient } as any;
export type Database = ReturnType<typeof initDb>;
