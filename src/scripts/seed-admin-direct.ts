import postgres from 'postgres';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(connectionString, { prepare: false });

  try {
    console.log('Starting admin seed...');
    
    // Check if admin already exists
    const existingAdmin = await sql`
      SELECT * FROM admin_settings LIMIT 1
    `;
    
    if (existingAdmin.length > 0) {
      console.log('Admin settings already exist:', {
        username: existingAdmin[0].admin_username,
        email: existingAdmin[0].admin_email
      });
      await sql.end();
      return;
    }
    
    // Create default admin password hash
    const defaultPassword = 'admin123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    // Insert admin settings
    const result = await sql`
      INSERT INTO admin_settings (
        admin_username, 
        admin_password_hash, 
        admin_email, 
        commission_rate, 
        total_earnings
      )
      VALUES (
        'admin',
        ${passwordHash},
        'admin@taskinn.com',
        0.1,
        0
      )
      RETURNING *
    `;
    
    console.log('Admin settings created successfully:', {
      username: result[0].admin_username,
      email: result[0].admin_email,
      commissionRate: result[0].commission_rate,
    });
    console.log('\n✅ Default admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

seedAdmin();