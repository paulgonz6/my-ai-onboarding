-- Add field to track if user has seen their persona reveal
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS persona_revealed_at TIMESTAMPTZ;

-- Update existing users who have a persona to mark it as already revealed
-- This prevents existing users from seeing the reveal again
UPDATE profiles 
SET persona_revealed_at = updated_at
WHERE persona IS NOT NULL 
  AND persona_revealed_at IS NULL;