import 'dotenv/config';
import { db } from '../db';
import { adminSettings } from '../db/schema';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  try {
    console.log('Starting admin seed...');
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(adminSettings).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('Admin settings already exist, skipping seed');
      return;
    }
    
    // Create default admin password hash
    const defaultPassword = 'admin123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    // Insert admin settings
    const result = await db.insert(adminSettings).values({
      adminUsername: 'admin',
      adminPasswordHash: passwordHash,
      adminEmail: 'admin@taskinn.com',
      commissionRate: 0.1,
      totalEarnings: 0,
    }).returning();
    
    console.log('Admin settings created successfully:', {
      username: result[0].adminUsername,
      email: result[0].adminEmail,
      commissionRate: result[0].commissionRate,
    });
    console.log('Default admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedAdmin();