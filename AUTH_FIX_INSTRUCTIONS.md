# Auth Flow Fix Instructions

## Problem Summary
The "new row violates row-level security policy for table profiles" error occurs because:
1. The trigger creates a minimal profile on user signup
2. The app tries to UPDATE this profile before the auth session is fully established
3. RLS policies fail because `auth.uid()` might still be NULL during the transition

## Solution Overview
We've simplified the auth flow by:
1. **Immediately signing in after signup** to establish the session
2. **Using upsert instead of update** to handle both trigger and non-trigger scenarios
3. **Simplifying RLS policies** to a single, clear policy
4. **Removing unnecessary retry logic** and complexity

## Files Changed

### 1. `/app/components/AuthModal.tsx`
- Simplified `handleSignup` function
- Added immediate sign-in after signup to establish session
- Used upsert with proper conflict handling
- Removed complex retry logic and unnecessary delays

### 2. `/supabase/fix-auth-flow.sql` (NEW)
- Simplified RLS policies into a single "manage own profile" policy
- Updated trigger to create minimal profile
- Added helper function for profile upserts
- Ensured proper permissions and indexes

## How to Apply the Fix

### Step 1: Apply the Database Changes
Run this SQL in your Supabase SQL editor:

```bash
# Option A: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/fix-auth-flow.sql`
4. Paste and run the SQL

# Option B: Via Supabase CLI (if configured)
supabase db push --file supabase/fix-auth-flow.sql
```

### Step 2: Deploy the Updated Code
The AuthModal.tsx changes are already applied. Deploy your application:

```bash
# For Vercel
git add .
git commit -m "Fix auth flow and RLS policies"
git push origin main

# For local testing
npm run dev
```

### Step 3: Test the Fix
1. Clear your browser's localStorage
2. Go to `/survey`
3. Complete the survey
4. Create a new account
5. Verify no RLS errors occur

### Optional: Run the Test Script
To verify everything works:

```bash
# Install tsx if needed
npm install -D tsx dotenv

# Run the test
npx tsx test-auth-flow.ts
```

## Key Changes Explained

### Before (Complex):
```typescript
// Wait for trigger, try update, then try insert if failed
await new Promise(resolve => setTimeout(resolve, 1000))
const { error } = await supabase.from('profiles').update(...)
if (error) {
  const { error: retryError } = await supabase.from('profiles').insert(...)
}
```

### After (Simple):
```typescript
// Sign in immediately, then upsert (works whether profile exists or not)
await supabase.auth.signInWithPassword({ email, password })
await supabase.from('profiles').upsert(profileData, { onConflict: 'id' })
```

## Why This Works Better

1. **Session Establishment**: By signing in immediately after signup, we ensure `auth.uid()` is available for RLS policies
2. **Idempotent Operations**: Upsert doesn't fail if the profile already exists
3. **Single RLS Policy**: One clear policy instead of multiple that might conflict
4. **No Race Conditions**: No arbitrary delays or retry logic needed

## Troubleshooting

If you still see RLS errors after applying the fix:

1. **Check Auth State**: Ensure the user is actually signed in before profile operations
2. **Verify SQL Applied**: Check that the new policies are active in Supabase dashboard
3. **Clear Browser State**: Clear localStorage and cookies, then try again
4. **Check Supabase Logs**: Look for any trigger errors in Supabase dashboard logs

## Next Steps

After applying this fix, consider:
1. Adding proper error handling UI for edge cases
2. Implementing a loading state while profile saves
3. Adding telemetry to track successful onboarding completions

## Support

If issues persist, check:
- Supabase service status
- Browser console for detailed errors
- Network tab for failed requests
- Supabase dashboard logs for backend errors