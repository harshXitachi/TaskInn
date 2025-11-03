import { db } from '@/db';
import { reviews } from '@/db/schema';
import crypto from 'crypto';

async function main() {
    // Generate 50 user IDs (25 employers + 25 workers for variety)
    const employerIds = Array.from({ length: 25 }, () => `user_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`);
    const workerIds = Array.from({ length: 25 }, () => `user_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`);
    
    // Rating distribution helper
    const getRating = (index: number): number => {
        if (index < 25) return 5; // 50% rating 5
        if (index < 37) return 4; // 25% rating 4
        if (index < 45) return 3; // 15% rating 3
        if (index < 49) return 2; // 8% rating 2
        return 1; // 2% rating 1
    };
    
    // Comment templates based on rating
    const commentsByRating: Record<number, (string | null)[]> = {
        5: [
            'Excellent work, delivered on time!',
            'Outstanding quality, highly recommended!',
            'Perfect execution, will hire again',
            'Exceptional service and professionalism',
            'Above and beyond expectations',
            'Flawless delivery, fantastic communication',
            'Best experience on the platform',
            null,
            null,
        ],
        4: [
            'Good work with minor issues',
            'Solid performance, met expectations',
            'Quality work, delivered as promised',
            'Reliable and professional',
            'Very satisfied with the results',
            'Good communication throughout',
            null,
        ],
        3: [
            'Acceptable work but could improve',
            'Met basic requirements',
            'Average quality, needed some revisions',
            'Decent work, nothing special',
            'Got the job done eventually',
            null,
        ],
        2: [
            'Below expectations, multiple issues',
            'Poor communication and quality',
            'Had to request several revisions',
            'Not satisfied with the outcome',
        ],
        1: [
            'Did not complete the work',
            'Extremely poor quality',
            'Completely unsatisfactory',
        ],
    };
    
    // Get comment for rating
    const getComment = (rating: number, seed: number): string | null => {
        const options = commentsByRating[rating];
        return options[seed % options.length];
    };
    
    // Generate dates from past 2 months
    const generateDate = (daysAgo: number): string => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };
    
    // Generate 50 reviews
    const sampleReviews = Array.from({ length: 50 }, (_, index) => {
        const rating = getRating(index);
        const taskId = (index % 40) + 1; // Tasks 1-40
        const daysAgo = Math.floor((index / 50) * 60); // Spread over 60 days
        
        // Alternate between employer reviewing worker and worker reviewing employer
        const isEmployerReview = index % 2 === 0;
        const reviewerId = isEmployerReview 
            ? employerIds[index % employerIds.length]
            : workerIds[index % workerIds.length];
        const revieweeId = isEmployerReview
            ? workerIds[(index + 1) % workerIds.length]
            : employerIds[(index + 1) % employerIds.length];
        
        return {
            taskId,
            reviewerId,
            revieweeId,
            rating,
            comment: getComment(rating, index),
            createdAt: generateDate(daysAgo),
        };
    });

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully - 50 reviews generated');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});