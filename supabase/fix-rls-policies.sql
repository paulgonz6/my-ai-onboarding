-- Fix RLS policies for profiles table
-- This maintains security while allowing proper user operations

-- First, drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;

-- Create comprehensive policies for profiles table

-- 1. SELECT: Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. INSERT: Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. DELETE: Users cannot delete profiles (for data integrity)
-- No delete policy = no deletes allowed

-- Also ensure the service role can manage profiles
-- This is needed for the trigger function
GRANT ALL ON profiles TO service_role;

-- Fix the trigger function to use proper security context
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Ensure all existing users have profiles
INSERT INTO profiles (id, email, created_at, updated_at)
SELECT 
  id, 
  email,
  COALESCE(created_at, NOW()),
  NOW()
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Check other tables have proper policies too
-- User plans policies
DROP POLICY IF EXISTS "Users can view own plans" ON user_plans;
DROP POLICY IF EXISTS "Users can create own plans" ON user_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON user_plans;

CREATE POLICY "Users can view own plans" 
ON user_plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans" 
ON user_plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" 
ON user_plans FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can track own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

CREATE POLICY "Users can view own progress" 
ON user_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can track own progress" 
ON user_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON user_progress FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Calendar events policies
DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can create own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;

CREATE POLICY "Users can view own calendar events" 
ON calendar_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar events" 
ON calendar_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" 
ON calendar_events FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" 
ON calendar_events FOR DELETE 
USING (auth.uid() = user_id);

-- Activity templates should be readable by everyone
DROP POLICY IF EXISTS "Activity templates are viewable by everyone" ON activity_templates;
CREATE POLICY "Activity templates are viewable by everyone" 
ON activity_templates FOR SELECT 
USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Specifically for profiles table
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Test: This should return true if policies are working
-- SELECT auth.uid() IS NOT NULL AS authenticated;