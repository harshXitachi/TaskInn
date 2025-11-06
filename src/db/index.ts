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
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    onnotice: () => {},
  });

  _db = drizzle(_client, { schema });
  return _db;
}

// Export a getter function that returns the db
export function getDb() {
  return initDatabase();
}

// For backward compatibility, create a db object that calls getDb() for each method
export const db = {
  select: (...args: any[]) => getDb().select(...args),
  insert: (...args: any[]) => getDb().insert(...args),
  update: (...args: any[]) => getDb().update(...args),
  delete: (...args: any[]) => getDb().delete(...args),
  transaction: (...args: any[]) => getDb().transaction(...args),
  get query() { return getDb().query; }
};

export type Database = ReturnType<typeof initDatabase>;
