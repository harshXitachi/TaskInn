import { db } from '@/db';
import { taskSubmissions } from '@/db/schema';

async function main() {
    const workerIds = [
        'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
        'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
        'user_03h6mzv4g0b1a5d3p9o8s7y0t6',
        'user_04h7naw5h1c2b6e4q0p9t8z1u7',
        'user_05h8obx6i2d3c7f5r1q0u9a2v8',
        'user_06h9pcy7j3e4d8g6s2r1v0b3w9',
        'user_07h0qdz8k4f5e9h7t3s2w1c4x0',
        'user_08h1rea9l5g6f0i8u4t3x2d5y1',
        'user_09h2sfb0m6h7g1j9v5u4y3e6z2',
        'user_10h3tgc1n7i8h2k0w6v5z4f7a3',
        'user_11h4uhd2o8j9i3l1x7w6a5g8b4',
        'user_12h5vie3p9k0j4m2y8x7b6h9c5',
        'user_13h6wjf4q0l1k5n3z9y8c7i0d6',
        'user_14h7xkg5r1m2l6o4a0z9d8j1e7',
        'user_15h8ylh6s2n3m7p5b1a0e9k2f8'
    ];

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const submissionTypes = [
        { files: ['data_entry_batch1.xlsx', 'data_entry_batch2.xlsx'], notes: 'Completed all 500 entries as requested with double verification' },
        { transcriptUrl: 'https://example.com/transcript_001.txt', wordCount: 3542, notes: 'Audio transcribed with 99% accuracy' },
        { taggedImages: 200, spreadsheetUrl: 'https://example.com/tags_batch1.csv', notes: 'All images tagged according to guidelines' },
        { translatedDocument: 'https://example.com/translation_en_to_es.pdf', qualityScore: 95, wordCount: 2000 },
        { surveyResponses: 150, dataFileUrl: 'https://example.com/survey_results.csv', notes: 'All responses validated and cleaned' },
        { contentWritten: true, documentUrl: 'https://example.com/article_draft.docx', wordCount: 1200, seoScore: 88 },
        { researchReport: 'https://example.com/market_research.pdf', sources: 25, pages: 15 },
        { designFiles: ['logo_v1.png', 'logo_v2.png', 'logo_v3.png'], format: 'PNG, SVG, AI' },
        { videoEditUrl: 'https://example.com/edited_video.mp4', duration: '5:30', resolution: '1080p' },
        { dataScraped: true, recordsCollected: 1000, csvUrl: 'https://example.com/scraped_data.csv' }
    ];

    const rejectionReasons = [
        'Did not meet quality requirements - multiple spelling errors found',
        'Incomplete work - only 60% of required items completed',
        'Not following instructions - used wrong format',
        'Poor quality output - below acceptable standards',
        'Missing required data fields',
        'Deadline exceeded without prior communication',
        'Work does not match project specifications'
    ];

    const revisionRequests = [
        'Please fix formatting errors in rows 50-100',
        'Need more detail in column B - descriptions too brief',
        'Recheck rows 150-200 for accuracy issues',
        'Please update the file format to match template',
        'Some entries are missing required categories',
        'Please improve quality of images 45-60',
        'Translation needs review for technical terms'
    ];

    const sampleSubmissions = [];
    
    const statusDistribution = [
        ...Array(24).fill('pending'),
        ...Array(21).fill('approved'),
        ...Array(9).fill('rejected'),
        ...Array(6).fill('revision_requested')
    ];

    for (let i = 0; i < 60; i++) {
        const taskId = (i % 40) + 1;
        const workerId = workerIds[i % workerIds.length];
        const status = statusDistribution[i];
        
        const submissionType = submissionTypes[i % submissionTypes.length];
        const submissionData = JSON.stringify(submissionType);
        
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const submittedAt = new Date(oneMonthAgo.getTime() + daysAgo * 24 * 60 * 60 * 1000 + hoursAgo * 60 * 60 * 1000);
        
        let reviewedAt = null;
        let reviewerNotes = null;
        
        if (status === 'approved') {
            const reviewHoursAfter = Math.floor(Math.random() * 48) + 1;
            reviewedAt = new Date(submittedAt.getTime() + reviewHoursAfter * 60 * 60 * 1000).toISOString();
            if (Math.random() > 0.7) {
                reviewerNotes = 'Excellent work, meets all requirements';
            }
        } else if (status === 'rejected') {
            const reviewHoursAfter = Math.floor(Math.random() * 48) + 1;
            reviewedAt = new Date(submittedAt.getTime() + reviewHoursAfter * 60 * 60 * 1000).toISOString();
            reviewerNotes = rejectionReasons[i % rejectionReasons.length];
        } else if (status === 'revision_requested') {
            const reviewHoursAfter = Math.floor(Math.random() * 24) + 1;
            reviewedAt = new Date(submittedAt.getTime() + reviewHoursAfter * 60 * 60 * 1000).toISOString();
            reviewerNotes = revisionRequests[i % revisionRequests.length];
        }

        sampleSubmissions.push({
            taskId,
            workerId,
            status,
            submissionData,
            submittedAt: submittedAt.toISOString(),
            reviewedAt,
            reviewerNotes
        });
    }

    await db.insert(taskSubmissions).values(sampleSubmissions);
    
    console.log('✅ Task submissions seeder completed successfully - 60 submissions created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});