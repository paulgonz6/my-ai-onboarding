# Comprehensive Test Suite Implementation Guide

## ✅ Current Status

### Database Fix Applied
The critical survey data saving issue has been fixed with:
1. **Race condition resolved**: Added proper session establishment delay
2. **Retry logic implemented**: Multiple save strategies with exponential backoff
3. **Verification added**: Confirms data is actually saved

**To apply the database fix:**
```sql
-- Run in Supabase SQL editor:
-- Copy contents of /supabase/fix-survey-answers.sql
```

### Test Infrastructure Set Up
- Jest configured with Next.js
- React Testing Library installed
- Coverage thresholds set (80% lines, 70% branches)
- Test scripts added to package.json

## 📋 Test Files to Create

### 1. Survey Flow Test
**File:** `app/survey/__tests__/SurveyPage.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SurveyPage from '../page'

describe('Survey Flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('completes full survey flow and saves answers', async () => {
    render(<SurveyPage />)
    
    // Test welcome screen
    expect(screen.getByText(/Let's create your AI onboarding plan/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Get Started'))
    
    // Test question navigation
    expect(screen.getByText(/What best describes your work?/)).toBeInTheDocument()
    
    // Select an answer
    fireEvent.click(screen.getByText('Creative work'))
    fireEvent.click(screen.getByText('Continue'))
    
    // Verify localStorage saves answers
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
      expect(saved['work-type']).toBe('creative')
    })
  })

  test('handles back navigation correctly', () => {
    // Test going back preserves answers
  })

  test('calculates persona correctly', () => {
    // Test persona calculation logic
  })
})
```

### 2. Authentication & Profile Saving Test
**File:** `app/components/__tests__/AuthModal.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthModal from '../AuthModal'
import { supabase } from '@/lib/supabase'

describe('Authentication with Survey Data', () => {
  const mockSurveyData = {
    answers: {
      'work-type': 'creative',
      'daily-time': 'meetings',
      'engagement-frequency': 'daily'
    },
    persona: 'early-adopter'
  }

  test('saves survey data during account creation', async () => {
    // Set up localStorage with survey data
    localStorage.setItem('surveyAnswers', JSON.stringify(mockSurveyData.answers))
    localStorage.setItem('userPersona', mockSurveyData.persona)
    
    // Mock successful signup
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    })
    
    render(<AuthModal isOpen={true} onClose={() => {}} onSuccess={() => {}} surveyData={mockSurveyData} />)
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Full Name/), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByPlaceholderText(/Email/), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Password/), { target: { value: 'password123' } })
    
    // Submit
    fireEvent.click(screen.getByText('Create Account'))
    
    // Verify profile update was called with survey data
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      // Verify survey_answers field is populated
    })
  })
})
```

### 3. Profile Helpers Test
**File:** `lib/__tests__/profile-helpers.test.ts`

```typescript
import { saveSurveyWithRetry, verifySurveyAnswers } from '../profile-helpers'
import { supabase } from '../supabase'

describe('Profile Helpers', () => {
  test('retries on failure with exponential backoff', async () => {
    // Mock first two attempts fail, third succeeds
    const updateMock = jest.fn()
      .mockRejectedValueOnce(new Error('RLS policy violation'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { id: 'user-id' }, error: null })
    
    (supabase.from as jest.Mock).mockReturnValue({
      update: updateMock,
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis()
    })
    
    const result = await saveSurveyWithRetry(
      'user-id',
      { 'work-type': 'creative' },
      'early-adopter',
      'Test User',
      3
    )
    
    expect(updateMock).toHaveBeenCalledTimes(3)
    expect(result).toBeDefined()
  })

  test('verifies survey answers are saved', async () => {
    // Test verification function
  })
})
```

### 4. Navigation Tests
**File:** `app/components/__tests__/AppNav.test.tsx`

```typescript
describe('AppNav', () => {
  test('shows user info in dropdown', () => {
    // Test avatar initials, email display
  })
  
  test('handles sign out', () => {
    // Test sign out flow
  })
})
```

## 🚀 Running Tests

```bash
# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm test

# Run tests before pushing (CI mode)
npm run test:ci
```

## 🎯 Coverage Goals

- **Lines:** 80%+
- **Branches:** 70%+
- **Functions:** 70%+
- **Statements:** 80%+

## 🔄 Pre-Push Hook

Add to `.husky/pre-push`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test:all
```

## 🧪 E2E Tests (Optional)

For comprehensive E2E testing, add Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

Create `tests/e2e/survey-to-account.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test('complete survey and create account', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Get Started')
  
  // Complete survey
  await page.click('text=Creative work')
  await page.click('text=Continue')
  // ... complete all questions
  
  // Create account
  await page.fill('[placeholder="Full Name"]', 'Test User')
  await page.fill('[placeholder="Email"]', 'test@example.com')
  await page.fill('[placeholder="Password"]', 'TestPassword123!')
  await page.click('text=Create Account')
  
  // Verify success
  await expect(page).toHaveURL('/timeline')
})
```

## ⚠️ Critical Tests for Known Issues

1. **Survey data persists through account creation**
2. **RLS policies allow profile updates**
3. **Session is established before profile operations**
4. **Retry logic works on transient failures**
5. **Survey answers JSONB field is properly populated**

## 📊 Test Execution Order

1. Unit tests (components, helpers)
2. Integration tests (auth flow, data saving)
3. E2E tests (full user journey)

Run `npm run test:all` before any push to ensure everything passes!