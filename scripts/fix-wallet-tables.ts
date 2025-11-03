import 'dotenv/config';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function fixWalletTables() {
  try {
    console.log('Dropping and recreating wallet tables...');
    
    // Drop tables in correct order (child tables first)
    await sql`DROP TABLE IF EXISTS wallet_transactions CASCADE`;
    console.log('✓ Dropped wallet_transactions');
    
    await sql`DROP TABLE IF EXISTS wallets CASCADE`;
    console.log('✓ Dropped wallets');
    
    await sql`DROP TABLE IF EXISTS admin_wallets CASCADE`;
    console.log('✓ Dropped admin_wallets');
    
    // Recreate wallets table
    await sql`
      CREATE TABLE wallets (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES "user"(id),
        currency_type TEXT NOT NULL,
        balance DOUBLE PRECISION NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Created wallets table');
    
    // Recreate wallet_transactions table
    await sql`
      CREATE TABLE wallet_transactions (
        id SERIAL PRIMARY KEY,
        wallet_id INTEGER NOT NULL REFERENCES wallets(id),
        transaction_type TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        currency_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reference_id TEXT,
        description TEXT,
        transaction_hash TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Created wallet_transactions table');
    
    // Recreate admin_wallets table
    await sql`
      CREATE TABLE admin_wallets (
        id SERIAL PRIMARY KEY,
        currency_type TEXT NOT NULL,
        balance DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_earned DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_withdrawn DOUBLE PRECISION NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Created admin_wallets table');
    
    console.log('\n✅ Successfully fixed wallet tables!');
  } catch (error) {
    console.error('Error fixing wallet tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixWalletTables()
  .then(() => {
    console.log('Fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fix failed:', error);
    process.exit(1);
  });
