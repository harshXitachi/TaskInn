import 'dotenv/config';
import postgres from 'postgres';

async function seedCategories() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(databaseUrl);

  try {
    console.log('Checking existing categories...');
    
    // Check if categories table exists and has data
    const existingCategories = await sql`
      SELECT * FROM categories ORDER BY id
    `;
    
    console.log(`Found ${existingCategories.length} existing categories`);
    
    if (existingCategories.length > 0) {
      console.log('Existing categories:', existingCategories.map(c => ({ id: c.id, name: c.name })));
      
      // Check if "microworks" category exists
      const microworksExists = existingCategories.some(
        c => c.name.toLowerCase() === 'microworks'
      );
      
      if (microworksExists) {
        console.log('✓ "microworks" category already exists');
      } else {
        console.log('Adding "microworks" category...');
        await sql`
          INSERT INTO categories (name, description, icon)
          VALUES ('Microworks', 'General micro-task category for various small jobs', '🔧')
        `;
        console.log('✓ "microworks" category added successfully');
      }
    } else {
      console.log('No categories found. Adding default categories...');
      
      // Add default categories including microworks
      const defaultCategories = [
        { name: 'Microworks', description: 'General micro-task category for various small jobs', icon: '🔧' },
        { name: 'Data Entry', description: 'Data entry and processing tasks', icon: '📝' },
        { name: 'Research', description: 'Research and information gathering tasks', icon: '🔍' },
        { name: 'Content Writing', description: 'Writing, editing, and content creation', icon: '✍️' },
        { name: 'Image Classification', description: 'Categorizing and tagging images', icon: '🖼️' },
        { name: 'Surveys', description: 'Survey participation and feedback', icon: '📊' },
      ];

      for (const category of defaultCategories) {
        await sql`
          INSERT INTO categories (name, description, icon)
          VALUES (${category.name}, ${category.description}, ${category.icon})
        `;
        console.log(`✓ Added category: ${category.name}`);
      }
      
      console.log(`✓ Added ${defaultCategories.length} categories successfully`);
    }

    // Show final state
    const finalCategories = await sql`
      SELECT * FROM categories ORDER BY id
    `;
    
    console.log('\n=== Final Categories ===');
    finalCategories.forEach(c => {
      console.log(`${c.id}. ${c.name} ${c.icon || ''}`);
    });

  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('\nDatabase connection closed');
  }
}

seedCategories();
