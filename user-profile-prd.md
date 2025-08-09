# Product Requirements Document: User Profile Page
## My AI Onboarding - Profile Management Feature

**Version:** 1.0  
**Date:** January 2025  
**Status:** Ready for Implementation

---

## 1. Executive Summary

The User Profile Page is the central hub for users to manage their account, review their AI journey progress, and maintain their subscription. It provides a comprehensive view of the user's personalization data, including survey responses, assigned persona, and billing information. This page reinforces user engagement by showing their journey progress and allows them to maintain control over their account settings.

### Core Value Proposition
"Your AI journey, personalized and in your control - view your progress, manage your preferences, and celebrate your growth."

---

## 2. Business Context

### Strategic Objectives
- **User Retention**: Provide clear visibility into journey progress and value received
- **Trust Building**: Transparent display of all collected data and easy management
- **Upsell Opportunities**: Clear path to upgrade subscription tiers
- **Support Reduction**: Self-service account management reduces support tickets

### Success Metrics
- Profile completion rate > 80%
- Average time to complete profile setup < 2 minutes
- Password change success rate > 95%
- Subscription management self-service rate > 90%

---

## 3. User Stories

### Epic: Profile Management

#### US-001: View Profile Information
**As a** registered user  
**I want to** view all my profile information in one place  
**So that** I can verify my data and track my journey progress

**Acceptance Criteria:**
- Display full name, email, and profile avatar/initial
- Show assigned persona with description
- Display current journey day (e.g., Day 23 of 90)
- Show overall progress percentage
- Display current phase (Foundation/Integration/Mastery)
- Load time < 1 second
- Mobile responsive layout

#### US-002: Edit Profile Information
**As a** registered user  
**I want to** update my profile information  
**So that** my account reflects accurate information

**Acceptance Criteria:**
- Edit full name with validation (2-50 characters)
- Email displayed but not editable (greyed out with explanation)
- Changes save automatically with debounce (500ms)
- Success confirmation toast appears
- Changes persist in database
- Update reflects immediately in navigation bar

#### US-003: Change Password
**As a** registered user  
**I want to** change my password securely  
**So that** I can maintain account security

**Acceptance Criteria:**
- Require current password verification
- New password strength indicator
- Password requirements clearly displayed:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
  - At least one special character
- Confirm password field with match validation
- Success triggers email notification
- Session remains active after password change
- Error messages for all failure scenarios

#### US-004: View Survey Responses
**As a** registered user  
**I want to** review my survey answers and assigned persona  
**So that** I understand how my plan was personalized

**Acceptance Criteria:**
- Display all survey questions with user's answers
- Show persona assignment with explanation
- Display persona characteristics and benefits
- "Retake Survey" option (with warning about plan reset)
- Survey answers displayed in read-only format
- Visual indicator for adaptive questions
- Export survey data option (PDF/JSON)

#### US-005: Manage Subscription
**As a** registered user  
**I want to** view and manage my subscription  
**So that** I can control my billing and access level

**Acceptance Criteria:**
- Display current plan (Explorer/Accelerator/Team)
- Show next billing date and amount
- List included features with usage
- "Upgrade" CTA for free users
- "Change Plan" for paid users
- "Cancel Subscription" with retention flow
- Payment method management (via Stripe)
- Invoice history with download options
- Proration explanation for plan changes

#### US-006: Navigate from Global Navigation
**As a** registered user  
**I want to** easily access my profile from anywhere in the app  
**So that** I can quickly manage my account

**Acceptance Criteria:**
- Profile avatar/initial in top-right navigation
- Dropdown shows: name, email, "View Profile" option
- Single click from any page
- Keyboard accessible (Tab navigation)
- Mobile: hamburger menu includes profile link
- Visual indicator for profile completion status

#### US-007: Delete Account
**As a** registered user  
**I want to** permanently delete my account  
**So that** I can remove all my data if needed

**Acceptance Criteria:**
- Located in danger zone section
- Requires password confirmation
- Clear warning about data permanence
- 14-day grace period with recovery option
- Email confirmation sent
- All user data marked for deletion
- Subscription cancelled immediately

---

## 4. UI/UX Requirements

### Page Layout Structure

```
┌─────────────────────────────────────────┐
│          Navigation Bar                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Profile Header                  │  │
│  │   - Avatar                        │  │
│  │   - Name & Email                  │  │
│  │   - Persona Badge                 │  │
│  │   - Journey Progress              │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Tab Navigation                  │  │
│  │   [Overview][Account][Billing]    │  │
│  │        [Survey][Security]         │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Tab Content Area                │  │
│  │   (Dynamic based on selection)    │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Visual Design Requirements

#### Color Palette
- Primary: Emerald-500 (#10B981) to Teal-500 (#14B8A6) gradient
- Background: Gray-900 (#111827) to Black gradient
- Surface: White/5 with backdrop blur
- Text: White (primary), Gray-400 (secondary)
- Success: Emerald-400
- Warning: Amber-400
- Error: Red-400

#### Typography
- Headers: font-display (system display font)
- Body: font-sans (system sans-serif)
- Sizes: Responsive using Tailwind's text utilities

#### Components
- Cards: Rounded-2xl with white/5 background
- Buttons: Rounded-lg with gradient backgrounds
- Inputs: Rounded-lg with white/5 background, white/20 border
- Toggles: Custom styled checkboxes with emerald accent

### Responsive Behavior
- Desktop (>1024px): Two-column layout for some sections
- Tablet (768px-1024px): Single column, full-width cards
- Mobile (<768px): Stacked layout, bottom tab navigation

### Animations
- Page entrance: Fade in with slight upward motion
- Tab switches: Smooth content transitions
- Save actions: Success pulse animation
- Loading states: Skeleton screens with shimmer

---

## 5. Technical Requirements

### Data Model

#### Profile Table (existing)
```typescript
interface Profile {
  id: UUID // References auth.users
  email: string
  full_name: string | null
  persona: string | null
  work_type: string | null
  engagement_frequency: string | null
  survey_answers: JsonB | null
  onboarding_completed: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

#### Subscription Table (new)
```typescript
interface Subscription {
  id: UUID
  user_id: UUID // References auth.users
  stripe_customer_id: string
  stripe_subscription_id: string | null
  plan_type: 'explorer' | 'accelerator' | 'team'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: timestamp
  current_period_end: timestamp
  cancel_at_period_end: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### Profile Management
- `GET /api/profile` - Fetch user profile
- `PATCH /api/profile` - Update profile fields
- `POST /api/profile/change-password` - Update password
- `DELETE /api/profile` - Delete account

#### Subscription Management
- `GET /api/subscription` - Get subscription details
- `POST /api/subscription/change-plan` - Modify subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/invoices` - Fetch invoice history

### Database Operations

#### Supabase Queries
```typescript
// Fetch complete profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// Update profile
const { error } = await supabase
  .from('profiles')
  .update({
    full_name: newName,
    updated_at: new Date().toISOString()
  })
  .eq('id', user.id)

// Change password (via Supabase Auth)
const { error } = await supabase.auth.updateUser({
  password: newPassword
})
```

### State Management
- Use React Context (AuthContext) for user data
- Local state for form inputs with debounced saves
- Optimistic updates with rollback on error
- Cache subscription data for 5 minutes

### Performance Requirements
- Initial page load: < 2 seconds
- Tab switches: Instant (pre-loaded)
- Save operations: < 500ms
- Image uploads: < 3 seconds for 5MB file

---

## 6. Security Considerations

### Authentication & Authorization
- Require authenticated session for all operations
- Verify user ID matches profile being edited
- Rate limit password changes (3 per hour)
- Session refresh after password change

### Data Protection
- Password field never returned from API
- Survey answers sanitized before display
- XSS protection on all user inputs
- CSRF tokens for state-changing operations

### Privacy
- GDPR-compliant data export
- Clear data deletion process
- Audit log for profile changes
- Encryption for sensitive fields

### Validation Rules
- Server-side validation for all inputs
- Email format validation (though read-only)
- Password complexity enforcement
- SQL injection prevention via parameterized queries

---

## 7. Data Flow

### Profile Load Flow
```
1. User navigates to /profile
2. Check authentication status
3. If authenticated:
   a. Fetch profile from Supabase
   b. Fetch subscription from Stripe/Database
   c. Calculate journey progress
   d. Render profile page
4. If not authenticated:
   a. Redirect to login
```

### Profile Update Flow
```
1. User modifies field
2. Debounce timer starts (500ms)
3. Validation runs client-side
4. If valid:
   a. Optimistic UI update
   b. API call to update database
   c. Success: Show confirmation
   d. Error: Rollback and show error
5. Update AuthContext
6. Refresh navigation display
```

### Password Change Flow
```
1. User enters current password
2. Verify current password via Supabase Auth
3. Validate new password requirements
4. If valid:
   a. Call Supabase auth.updateUser
   b. Send confirmation email
   c. Show success message
   d. Log security event
5. If invalid:
   a. Show specific error message
```

---

## 8. Integration Points

### Navigation Component
- Update avatar/initial on name change
- Refresh persona display
- Add "Profile" link to dropdown

### Survey System
- Link to view/retake survey
- Display survey answers
- Show persona assignment logic

### Billing System (Stripe)
- Customer portal integration
- Webhook handling for subscription changes
- Invoice retrieval API

### Email Service
- Password change notifications
- Profile update confirmations
- Account deletion warnings

---

## 9. Testing Requirements

### Unit Tests
- Form validation functions
- Password strength calculator
- Date formatting utilities
- Survey data transformations

### Integration Tests
- Profile CRUD operations
- Password change flow
- Subscription management
- Navigation integration

### E2E Tests
- Complete profile setup
- Password change with email verification
- Subscription upgrade flow
- Account deletion process

### Accessibility Tests
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios

---

## 10. Migration & Rollout Plan

### Phase 1: Profile Viewing (Week 1)
- Deploy read-only profile page
- Display existing data
- Test with subset of users

### Phase 2: Profile Editing (Week 2)
- Enable name editing
- Add password change
- Monitor error rates

### Phase 3: Survey Integration (Week 3)
- Display survey responses
- Add persona explanation
- Enable retake option

### Phase 4: Billing Integration (Week 4)
- Connect Stripe customer portal
- Add subscription management
- Test payment flows

### Rollback Strategy
- Feature flags for each component
- Database migrations reversible
- Previous version maintained for 30 days

---

## 11. Future Enhancements

### Version 1.1
- Profile photo upload
- Timezone preferences
- Language selection
- Export data as CSV

### Version 1.2
- Two-factor authentication
- Login history
- Device management
- API token generation

### Version 1.3
- Team profile management
- Bulk user operations
- Admin override capabilities
- Audit log viewing

---

## 12. Acceptance Criteria Checklist

### Must Have (P0)
- [ ] View profile information
- [ ] Edit full name
- [ ] Change password
- [ ] View survey responses
- [ ] View persona assignment
- [ ] Access from navigation
- [ ] Mobile responsive
- [ ] Database persistence

### Should Have (P1)
- [ ] Subscription management
- [ ] Invoice history
- [ ] Retake survey option
- [ ] Export profile data
- [ ] Email notifications

### Nice to Have (P2)
- [ ] Profile photo
- [ ] Account deletion
- [ ] Activity history
- [ ] Timezone settings
- [ ] Language preferences

---

## 13. Metrics & Success Criteria

### Launch Metrics
- 80% of users access profile within first week
- < 2% error rate on profile updates
- Average session time on profile: 2-3 minutes
- 90% successful password changes

### Long-term Success
- 60% profile completion rate
- 30% of free users view upgrade options
- < 5% account deletion rate
- 95% user satisfaction score

---

## Appendix A: Error Messages

### Validation Errors
- "Name must be between 2 and 50 characters"
- "Current password is incorrect"
- "New password must be at least 8 characters"
- "Passwords do not match"
- "Please complete all required fields"

### System Errors
- "Unable to update profile. Please try again."
- "Network error. Check your connection."
- "Session expired. Please sign in again."
- "This feature is temporarily unavailable."

### Success Messages
- "Profile updated successfully"
- "Password changed successfully"
- "Subscription updated"
- "Survey responses saved"

---

## Appendix B: Component Structure

```typescript
/app/profile/
├── page.tsx                 // Main profile page
├── components/
│   ├── ProfileHeader.tsx    // User info and progress
│   ├── ProfileTabs.tsx      // Tab navigation
│   ├── OverviewTab.tsx      // Journey statistics
│   ├── AccountTab.tsx       // Profile editing
│   ├── BillingTab.tsx       // Subscription management
│   ├── SurveyTab.tsx        // Survey responses
│   └── SecurityTab.tsx      // Password & privacy
├── hooks/
│   ├── useProfile.ts        // Profile data fetching
│   ├── useSubscription.ts   // Billing integration
│   └── useProfileUpdate.ts  // Optimistic updates
└── utils/
    ├── validation.ts        // Form validation
    ├── formatters.ts        // Data formatting
    └── constants.ts         // Configuration
```

---

**Document Status**: Approved for Implementation  
**Product Owner**: Product Team  
**Technical Lead**: Engineering Team  
**Last Updated**: January 2025