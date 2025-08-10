# Fixing Supabase Email Confirmation Settings

## The Issue
You're getting "Email not confirmed" error when trying to sign in immediately after signup. This is because Supabase has email confirmation enabled by default.

## Two Solutions

### Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth** section, find "Enable email confirmations"
4. **Toggle it OFF** for development
5. Save changes

**Pros:**
- Immediate account access
- Better development experience
- Survey data saves immediately

**Cons:**
- Less secure (fine for development)
- Should be re-enabled for production

### Option 2: Keep Email Confirmation Enabled (Production Ready)

Our code now handles this scenario:

1. **On Signup:**
   - User account is created
   - Survey data is saved to localStorage as "pending"
   - User sees message: "Please check your email to confirm your account"

2. **After Email Confirmation:**
   - User clicks confirmation link in email
   - When they sign in, the AuthContext automatically:
     - Detects the sign-in event
     - Retrieves pending survey data from localStorage
     - Saves it to their profile
     - Clears the pending data

## Current Code Implementation

The app now handles both scenarios:

```typescript
// AuthModal.tsx
if (signInError?.message?.includes('Email not confirmed')) {
  // Save survey data for later
  localStorage.setItem('pendingSurveyData', JSON.stringify({
    userId: authData.user.id,
    answers: surveyData.answers,
    persona: surveyData.persona,
    fullName: fullName
  }));
  
  setError('Please check your email to confirm your account.');
  // User is created, but needs to confirm email
}
```

```typescript
// AuthContext.tsx
if (event === 'SIGNED_IN') {
  // Automatically save any pending survey data
  await handlePendingSurveyData(session.user.id);
}
```

## Testing the Flow

### With Email Confirmation Disabled:
1. Complete survey
2. Create account
3. Immediately logged in with survey data saved

### With Email Confirmation Enabled:
1. Complete survey
2. Create account
3. See "check email" message
4. Click confirmation link in email
5. Sign in
6. Survey data automatically saved

## Production Recommendations

For production, keep email confirmation **enabled** and:
1. Use a proper email template with your branding
2. Set up custom email domain (not @supabase.io)
3. Add a "Resend confirmation email" option
4. Show clear messaging about email confirmation

## Checking Current Settings

To see your current settings:
1. Supabase Dashboard → Authentication → Settings
2. Look for "Enable email confirmations" toggle
3. Check your email templates under "Email Templates"

## Email Template Variables

If customizing the confirmation email, you can use:
- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email
- `{{ .SiteURL }}` - Your app URL

## Quick Fix for Development

Run this SQL in Supabase SQL Editor to check email confirmation status:
```sql
-- Check if email confirmation is required
SELECT 
  raw_app_meta_data->>'provider' as provider,
  email_confirmed_at,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

Users with `email_confirmed_at = NULL` need to confirm their email before signing in.