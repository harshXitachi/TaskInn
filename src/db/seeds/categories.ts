import { db } from '@/db';
import { categories } from '@/db/schema';

async function main() {
    // Delete all existing categories first to ensure a clean state
    await db.delete(categories);

    const sampleCategories = [
        {
            name: 'Data Entry',
            description: 'Enter and organize data from various sources into structured formats',
            icon: 'FileText',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Image Tagging',
            description: 'Tag and label images with relevant keywords and categories',
            icon: 'Image',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Content Moderation',
            description: 'Review and moderate user-generated content for policy compliance',
            icon: 'Shield',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Survey Completion',
            description: 'Complete surveys and questionnaires on various topics',
            icon: 'ClipboardList',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Audio Transcription',
            description: 'Transcribe audio files into accurate written text',
            icon: 'Mic',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Product Categorization',
            description: 'Categorize and organize products into appropriate classifications',
            icon: 'Package',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Web Research',
            description: 'Research and gather information from online sources',
            icon: 'Search',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Social Media Tasks',
            description: 'Perform various tasks on social media platforms',
            icon: 'Share2',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Video Review',
            description: 'Watch and review video content for quality and compliance',
            icon: 'Video',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Data Validation',
            description: 'Verify and validate data accuracy and completeness',
            icon: 'CheckCircle',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(categories).values(sampleCategories);
    
    console.log('✅ Categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});