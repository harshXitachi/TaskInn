import { db } from '@/db';
import { adminSettings } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const passwordHash = bcrypt.hashSync('admin', 10);
    
    const defaultAdminSettings = {
        username: 'admin',
        passwordHash: passwordHash,
        commissionRate: 0.05,
        totalEarnings: 0.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(adminSettings).values(defaultAdminSettings);
    
    console.log('✅ Admin settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});