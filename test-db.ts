import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/db/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1,
});

const db = drizzle(client, { schema });

// Test what Drizzle generates
const testData = {
  title: 'Test Task',
  description: 'Test Description',
  categoryId: 1,
  employerId: 'test-user',
  price: 1.0,
  currency: 'USD',
  slots: 1,
  slotsFilled: 0,
  timeEstimate: 10,
  requirements: null,
  expiresAt: null,
  status: 'open'
};

async function test() {
  try {
    console.log('Testing insert with data:', testData);
    
    // Try to build the query
    const query = db.insert(schema.tasks).values(testData);
    console.log('Query SQL:', query.toSQL());
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

test();
