import 'dotenv/config';
import { db } from '../src/db';
import { adminSettings } from '../src/db/schema';
import bcrypt from 'bcrypt';

async function resetAdminSettings() {
  try {
    console.log('Resetting admin settings...');
    
    // Delete existing admin settings
    await db.delete(adminSettings);
    console.log('Deleted existing admin settings');
    
    // Hash default admin password using bcrypt
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Insert new admin settings
    await db.insert(adminSettings).values({
      commissionRate: 0.05, // 5% commission
      adminUsername: 'admin',
      adminPasswordHash: hashedPassword,
      adminEmail: 'admin@taskinn.com',
      totalEarnings: 0,
    });
    
    console.log('✅ Successfully reset admin settings!');
    console.log('⚠️  Admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Please change these credentials after first login!');
  } catch (error) {
    console.error('Error resetting admin settings:', error);
    throw error;
  }
}

resetAdminSettings()
  .then(() => {
    console.log('Reset complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Reset failed:', error);
    process.exit(1);
  });
