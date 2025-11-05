import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure postgres for serverless environment (Vercel)
export const client = postgres(connectionString, {
  prepare: false,
  max: 1, // Limit connections in serverless
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30, // 30 minutes
  onnotice: () => {}, // Suppress notices
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
