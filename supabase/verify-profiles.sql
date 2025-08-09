-- Verify and fix profiles table structure
-- Run this to ensure survey responses can be saved properly

-- Check current profiles structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Make sure survey_answers is JSONB and can store data
ALTER TABLE profiles 
ALTER COLUMN survey_answers TYPE JSONB USING survey_answers::JSONB;

-- Make sure all columns allow nulls except id and email
ALTER TABLE profiles 
ALTER COLUMN full_name DROP NOT NULL,
ALTER COLUMN persona DROP NOT NULL,
ALTER COLUMN work_type DROP NOT NULL,
ALTER COLUMN engagement_frequency DROP NOT NULL;

-- Verify a test insert works
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Try inserting a test profile with survey data
  INSERT INTO profiles (
    id,
    email,
    full_name,
    persona,
    work_type,
    engagement_frequency,
    survey_answers,
    onboarding_completed
  ) VALUES (
    test_user_id,
    'test@example.com',
    'Test User',
    'eager-beginner',
    'product',
    'daily',
    '{
      "work-type": "product",
      "ai-experience": "never",
      "time-wasters": ["emails", "meetings"],
      "ai-concerns": "where-to-start",
      "engagement-frequency": "daily",
      "practice-time": "morning",
      "success-metric": "save-time",
      "accountability": "just-me"
    }'::jsonb,
    true
  );
  
  -- Clean up test
  DELETE FROM profiles WHERE id = test_user_id;
  
  RAISE NOTICE 'Profile structure verified - survey data can be saved';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error with profile structure: %', SQLERRM;
END $$;

-- Check if any profiles are missing survey data
SELECT 
  id,
  email,
  persona,
  work_type,
  engagement_frequency,
  CASE 
    WHEN survey_answers IS NULL THEN 'Missing'
    WHEN survey_answers = '{}'::jsonb THEN 'Empty'
    ELSE 'Has Data'
  END as survey_status,
  onboarding_completed
FROM profiles
ORDER BY created_at DESC
LIMIT 10;