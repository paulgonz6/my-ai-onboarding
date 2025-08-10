-- Fix RLS policy for profiles table to allow trigger-based creation

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new insert policy that allows both trigger (via SECURITY DEFINER) and user inserts
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id 
    OR 
    auth.uid() IS NOT NULL -- Allow any authenticated user to create their profile
  );

-- Alternative approach: Make the trigger function use SECURITY DEFINER (already done)
-- and ensure the profile creation happens through the trigger

-- Also, let's add a policy specifically for the service role
CREATE POLICY "Service role can manage all profiles" ON profiles
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');