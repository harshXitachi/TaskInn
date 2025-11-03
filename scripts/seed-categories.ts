import 'dotenv/config';
import { db } from '../src/db';
import { categories } from '../src/db/schema';

const defaultCategories = [
  {
    name: 'Data Entry',
    description: 'Simple data input and organization tasks',
    icon: '📝',
  },
  {
    name: 'Image Classification',
    description: 'Categorize and label images',
    icon: '🖼️',
  },
  {
    name: 'Content Moderation',
    description: 'Review and moderate user-generated content',
    icon: '🛡️',
  },
  {
    name: 'Transcription',
    description: 'Convert audio or video to text',
    icon: '🎧',
  },
  {
    name: 'Surveys & Research',
    description: 'Complete surveys and research tasks',
    icon: '📊',
  },
  {
    name: 'Social Media',
    description: 'Social media engagement tasks',
    icon: '📱',
  },
  {
    name: 'Web Research',
    description: 'Find and collect information online',
    icon: '🔍',
  },
  {
    name: 'Testing & QA',
    description: 'Test websites, apps, or products',
    icon: '🧪',
  },
  {
    name: 'Writing & Editing',
    description: 'Content creation and proofreading',
    icon: '✍️',
  },
  {
    name: 'Other',
    description: 'Miscellaneous micro tasks',
    icon: '📦',
  },
];

async function seedCategories() {
  try {
    console.log('Seeding categories...');
    
    // Check if categories already exist
    const existing = await db.select().from(categories).limit(1);
    
    if (existing.length > 0) {
      console.log('Categories already exist. Skipping...');
      return;
    }
    
    // Insert categories
    await db.insert(categories).values(defaultCategories);
    
    console.log(`✅ Successfully seeded ${defaultCategories.length} categories!`);
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}

seedCategories()
  .then(() => {
    console.log('Seed complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
