import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// For serverless: Use singleton pattern with conditional initialization
declare global {
  var __db__: ReturnType<typeof drizzle> | undefined;
  var __client__: ReturnType<typeof postgres> | undefined;
}

// Reuse connection in development (hot reload)
if (!global.__client__) {
  global.__client__ = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    onnotice: () => {},
  });
}

if (!global.__db__) {
  global.__db__ = drizzle(global.__client__, { schema });
}

export const client = global.__client__;
export const db = global.__db__;

export type Database = typeof db;
