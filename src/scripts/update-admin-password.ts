import postgres from 'postgres';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function updateAdminPassword() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(connectionString, { prepare: false });

  try {
    // Create new password hash for admin123
    const newPassword = 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update admin password
    const result = await sql`
      UPDATE admin_settings 
      SET admin_password_hash = ${passwordHash}
      WHERE admin_username = 'admin'
      RETURNING admin_username, admin_email
    `;
    
    if (result.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('   Username:', result[0].admin_username);
      console.log('   Email:', result[0].admin_email);
      console.log('   New Password: admin123');
    } else {
      console.log('No admin user found with username "admin"');
    }
    
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

updateAdminPassword();