import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Check if we're in a build environment (no DATABASE_URL needed during build)
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

let client: ReturnType<typeof postgres> | undefined;
let db: ReturnType<typeof drizzle> | undefined;

if (!isBuild) {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  client = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    onnotice: () => {},
  });

  db = drizzle(client, { schema });
}

// Export with runtime check
export { db as db, client as client };

export type Database = typeof db;
