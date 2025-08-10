-- Fix survey_answers saving issue
-- This script ensures the profile table and RLS policies are properly configured
-- to save survey data during account creation

-- 1. First, ensure the trigger function doesn't interfere with survey data
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create a minimal profile entry
  -- The application will immediately update this with survey data
  INSERT INTO public.profiles (
    id, 
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- 2. Fix RLS policies to ensure users can properly update their profiles
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;

-- Create comprehensive policy for profile management
CREATE POLICY "Users can fully manage own profile" ON profiles
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Add a helper function to safely update survey answers
CREATE OR REPLACE FUNCTION update_profile_survey_answers(
  user_id UUID,
  survey_data JSONB,
  user_persona TEXT,
  user_work_type TEXT,
  user_engagement_frequency TEXT,
  user_full_name TEXT DEFAULT NULL
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_profile profiles;
BEGIN
  -- Update the profile with survey data
  UPDATE profiles
  SET 
    survey_answers = survey_data,
    persona = user_persona,
    work_type = user_work_type,
    engagement_frequency = user_engagement_frequency,
    full_name = COALESCE(user_full_name, full_name),
    onboarding_completed = true,
    updated_at = NOW()
  WHERE id = user_id
  RETURNING * INTO updated_profile;
  
  -- If no rows were updated, the profile might not exist yet
  IF updated_profile IS NULL THEN
    -- Create the profile with survey data
    INSERT INTO profiles (
      id,
      email,
      full_name,
      survey_answers,
      persona,
      work_type,
      engagement_frequency,
      onboarding_completed,
      created_at,
      updated_at
    )
    SELECT 
      user_id,
      au.email,
      user_full_name,
      survey_data,
      user_persona,
      user_work_type,
      user_engagement_frequency,
      true,
      NOW(),
      NOW()
    FROM auth.users au
    WHERE au.id = user_id
    RETURNING * INTO updated_profile;
  END IF;
  
  RETURN updated_profile;
END;
$$;

-- 4. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_survey_answers TO authenticated;

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_persona ON profiles(persona);
CREATE INDEX IF NOT EXISTS idx_profiles_survey_answers ON profiles USING gin(survey_answers);

-- 6. Verify and fix any existing profiles with missing survey data
-- This helps users who already created accounts but lost their survey data
UPDATE profiles p
SET 
  survey_answers = COALESCE(survey_answers, '{}'::jsonb),
  updated_at = NOW()
WHERE 
  survey_answers IS NULL
  AND EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = p.id
  );

-- 7. Add a check constraint to ensure survey_answers is always a valid JSONB object
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS check_survey_answers_is_object;

ALTER TABLE profiles 
  ADD CONSTRAINT check_survey_answers_is_object 
  CHECK (
    survey_answers IS NULL 
    OR jsonb_typeof(survey_answers) = 'object'
  );

-- 8. Log the current state for debugging
DO $$
BEGIN
  RAISE NOTICE 'Profile table structure:';
  RAISE NOTICE '%', (
    SELECT string_agg(
      column_name || ' ' || data_type || 
      CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
      ', '
    )
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  );
  
  RAISE NOTICE 'Active RLS policies on profiles:';
  RAISE NOTICE '%', (
    SELECT string_agg(policyname, ', ')
    FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
  );
END $$;

-- Instructions for use:
-- 1. Run this script in your Supabase SQL editor
-- 2. Test by creating a new account through the app
-- 3. Check the profiles table to verify survey_answers is populated
-- 4. If issues persist, check the browser console for detailed logs