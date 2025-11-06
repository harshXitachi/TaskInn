import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Initialize the database connection lazily
function initDatabase() {
  if (_db) return _db;
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  _client = postgres(connectionString, {
    prepare: false,
    max: 1,
    ssl: 'require',
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    onnotice: () => {},
  });

  _db = drizzle(_client, { schema });
  return _db;
}

// Create db wrapper with explicit method definitions to avoid minification issues
export const db = {
  select: function(from?: any) {
    const database = initDatabase();
    return database.select(from);
  },
  insert: function(into: any) {
    const database = initDatabase();
    return database.insert(into);
  },
  update: function(table: any) {
    const database = initDatabase();
    return database.update(table);
  },
  delete: function(from: any) {
    const database = initDatabase();
    return database.delete(from);
  },
  transaction: async function(fn: any) {
    const database = initDatabase();
    return database.transaction(fn);
  },
  get query() {
    const database = initDatabase();
    return database.query;
  }
};

// Export getDb for raw SQL queries
export function getDb() {
  return initDatabase();
}

export type Database = ReturnType<typeof initDatabase>;
