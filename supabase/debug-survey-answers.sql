-- Debug script to diagnose survey_answers saving issues
-- Run this in Supabase SQL editor to check the current state

-- 1. Check if profiles table has the correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('id', 'email', 'survey_answers', 'persona', 'work_type', 'engagement_frequency')
ORDER BY ordinal_position;

-- 2. Check existing profiles to see if any have survey_answers
SELECT 
  id,
  email,
  CASE 
    WHEN survey_answers IS NULL THEN 'NULL'
    WHEN survey_answers::text = '{}' THEN 'EMPTY OBJECT'
    ELSE 'HAS DATA'
  END as survey_status,
  persona,
  work_type,
  engagement_frequency,
  onboarding_completed,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check RLS policies on profiles table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 4. Check if the trigger exists and its definition
SELECT 
  tgname as trigger_name,
  tgtype,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass;

-- 5. Check the trigger function definition
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 6. Test if we can manually update a profile's survey_answers
-- Replace 'YOUR_USER_ID' with an actual user ID from your database
/*
UPDATE profiles
SET 
  survey_answers = '{"test": "manual update", "work-type": "creative", "engagement-frequency": "daily"}'::jsonb,
  updated_at = NOW()
WHERE id = 'YOUR_USER_ID'
RETURNING id, survey_answers;
*/

-- 7. Check for any constraints that might be blocking updates
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- 8. Check if there are any profiles with partial data (created by trigger but not updated)
SELECT 
  COUNT(*) as total_profiles,
  SUM(CASE WHEN survey_answers IS NULL THEN 1 ELSE 0 END) as null_survey_answers,
  SUM(CASE WHEN survey_answers::text = '{}' THEN 1 ELSE 0 END) as empty_survey_answers,
  SUM(CASE WHEN survey_answers IS NOT NULL AND survey_answers::text != '{}' THEN 1 ELSE 0 END) as has_survey_data,
  SUM(CASE WHEN persona IS NULL THEN 1 ELSE 0 END) as null_persona,
  SUM(CASE WHEN onboarding_completed = true THEN 1 ELSE 0 END) as completed_onboarding
FROM profiles;

-- 9. Check recent auth.users to see if they have corresponding profiles
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  p.id as profile_id,
  p.survey_answers IS NOT NULL as has_survey_answers,
  p.persona,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- 10. Check if the helper function exists (if you've run fix-survey-answers.sql)
SELECT 
  proname as function_name,
  proargnames as argument_names,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'update_profile_survey_answers';