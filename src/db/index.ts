import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL!;

// Configure postgres for serverless environment (Vercel)
const client = postgres(connectionString, {
  prepare: false,
  max: 1, // Limit connections in serverless
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
