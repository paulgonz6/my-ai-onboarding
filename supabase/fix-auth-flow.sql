-- Simplified auth flow fix
-- This ensures the profile creation and update work smoothly

-- Drop existing problematic policies and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop and recreate RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simple, reliable RLS policies
-- Allow authenticated users to manage their own profile
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a simple trigger that creates minimal profile
-- The app will handle the rest via upsert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Ensure the profiles table has proper constraints
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN onboarding_completed SET DEFAULT false;

-- Add a helper function for upserting profiles (optional, for server-side use)
CREATE OR REPLACE FUNCTION upsert_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT DEFAULT NULL,
  user_persona TEXT DEFAULT NULL,
  user_work_type TEXT DEFAULT NULL,
  user_engagement_frequency TEXT DEFAULT NULL,
  user_survey_answers JSONB DEFAULT '{}'::JSONB,
  user_onboarding_completed BOOLEAN DEFAULT false
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record profiles;
BEGIN
  INSERT INTO profiles (
    id,
    email,
    full_name,
    persona,
    work_type,
    engagement_frequency,
    survey_answers,
    onboarding_completed,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_full_name,
    user_persona,
    user_work_type,
    user_engagement_frequency,
    user_survey_answers,
    user_onboarding_completed,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    persona = COALESCE(EXCLUDED.persona, profiles.persona),
    work_type = COALESCE(EXCLUDED.work_type, profiles.work_type),
    engagement_frequency = COALESCE(EXCLUDED.engagement_frequency, profiles.engagement_frequency),
    survey_answers = CASE 
      WHEN EXCLUDED.survey_answers = '{}'::JSONB THEN profiles.survey_answers
      ELSE EXCLUDED.survey_answers
    END,
    onboarding_completed = EXCLUDED.onboarding_completed OR profiles.onboarding_completed,
    updated_at = NOW()
  RETURNING * INTO profile_record;
  
  RETURN profile_record;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_profile TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);