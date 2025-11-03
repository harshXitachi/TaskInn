import { db } from '@/db';
import { wallets, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Query actual users from database
    const employers = await db.select().from(user).where(eq(user.role, 'employer')).limit(5);
    const workers = await db.select().from(user).where(eq(user.role, 'worker')).limit(10);

    const walletsData = [];
    const currentTimestamp = new Date().toISOString();

    // Create wallets for employers
    for (const employer of employers) {
        // USD wallet
        walletsData.push({
            userId: employer.id,
            currencyType: 'USD',
            balance: 1000.0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });

        // USDT_TRC20 wallet
        walletsData.push({
            userId: employer.id,
            currencyType: 'USDT_TRC20',
            balance: 500.0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });
    }

    // Create wallets for workers
    for (const worker of workers) {
        // USD wallet
        walletsData.push({
            userId: worker.id,
            currencyType: 'USD',
            balance: 50.0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });

        // USDT_TRC20 wallet
        walletsData.push({
            userId: worker.id,
            currencyType: 'USDT_TRC20',
            balance: 25.0,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });
    }

    if (walletsData.length === 0) {
        console.log('⚠️ No users found to create wallets for. Please seed users first.');
        return;
    }

    await db.insert(wallets).values(walletsData);
    
    console.log(`✅ Wallets seeder completed successfully. Created ${walletsData.length} wallets for ${employers.length} employers and ${workers.length} workers.`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});