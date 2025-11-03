import { db } from '@/db';
import { adminWallets } from '@/db/schema';

async function main() {
    const sampleAdminWallets = [
        {
            currencyType: 'USD',
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            currencyType: 'USDT_TRC20',
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(adminWallets).values(sampleAdminWallets);
    
    console.log('✅ Admin wallets seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});