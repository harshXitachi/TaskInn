-- Seed categories for TaskInn
-- Run this in Supabase SQL Editor

-- First, check existing categories
DO $$
BEGIN
  -- Only insert if Microworks doesn't exist
  IF NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = 'microworks') THEN
    INSERT INTO categories (name, description, icon) 
    VALUES ('Microworks', 'General micro-task category for various small jobs', '🔧');
    RAISE NOTICE 'Added Microworks category';
  ELSE
    RAISE NOTICE 'Microworks category already exists';
  END IF;
  
  -- Add other categories if table is empty
  IF (SELECT COUNT(*) FROM categories) = 0 THEN
    INSERT INTO categories (name, description, icon) VALUES
      ('Data Entry', 'Data entry and processing tasks', '📝'),
      ('Image Classification', 'Categorizing and tagging images', '🖼️'),
      ('Content Moderation', 'Content review and moderation tasks', '🛡️'),
      ('Transcription', 'Audio and video transcription tasks', '🎧'),
      ('Surveys & Research', 'Survey participation and research tasks', '📊'),
      ('Social Media', 'Social media engagement tasks', '📱'),
      ('Web Research', 'Web research and data gathering', '🔍'),
      ('Testing & QA', 'Testing and quality assurance tasks', '🧪'),
      ('Writing & Editing', 'Writing, editing, and content creation', '✍️'),
      ('Other', 'Miscellaneous tasks', '📦');
    RAISE NOTICE 'Added all default categories';
  END IF;
END $$;

-- Show final result
SELECT id, name, icon, created_at FROM categories ORDER BY id;
