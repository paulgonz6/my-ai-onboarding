# Product Requirements Document: Supabase Integration for My AI Onboarding

## Executive Summary

This PRD outlines the integration of Supabase as the backend infrastructure for the My AI Onboarding application, transforming it from a client-side only application to a full-stack platform with authentication, persistent data storage, and enhanced user engagement features.

### Product Vision
Enable users to create personalized accounts, save their AI onboarding journeys, track progress over time, and access their plans across devices while maintaining data privacy and security.

### Success Metrics
- User account creation rate: >80% of survey completers
- Daily active users: 40% of registered users
- Activity completion rate: >60% of assigned activities
- User retention: 70% active after 30 days
- Plan customization rate: >30% of users modify their plans

---

## 1. Authentication Flow

### 1.1 User Stories

#### Story 1: Account Creation After Survey
**As a** new user who just completed the survey  
**I want** to create an account to save my personalized plan  
**So that** I can access it anytime and track my progress

**Acceptance Criteria:**
- Survey responses are temporarily stored in session storage
- After survey completion, user sees account creation prompt
- Email/password fields are validated in real-time
- Social auth options (Google, GitHub) are prominently displayed
- Account creation takes <3 seconds
- Survey data is automatically associated with new account
- User lands on their personalized plan page after signup
- No email confirmation required for initial access

#### Story 2: Social Authentication
**As a** user who prefers quick signup  
**I want** to use my existing Google or GitHub account  
**So that** I can avoid creating another password

**Acceptance Criteria:**
- OAuth flow completes in <5 seconds
- User profile auto-populates from social provider
- Survey data correctly links to social auth account
- Subsequent logins recognize returning social auth users
- Fallback to email/password if social auth fails

#### Story 3: Guest to Registered User Conversion
**As a** user exploring the platform  
**I want** to save my progress without losing data  
**So that** I can decide to commit after trying the experience

**Acceptance Criteria:**
- Guest users can complete survey and see plan preview
- Clear value proposition shown for creating account
- One-click account creation preserves all guest data
- No data loss during guest-to-registered conversion
- Progress tracking begins immediately after registration

---

## 2. Database Schema Design

### 2.1 Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  persona_type TEXT, -- cautious-explorer, eager-beginner, etc.
  work_type TEXT,
  engagement_frequency TEXT,
  practice_time TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey responses storage
CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master activity library
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  activity_type TEXT CHECK (activity_type IN ('exercise', 'experiment', 'reflection', 'challenge', 'share')),
  phase INTEGER CHECK (phase IN (1, 2, 3)),
  suitable_personas TEXT[], -- Array of persona types
  suitable_work_types TEXT[], -- Array of work types
  outcomes TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detailed activity templates
CREATE TABLE public.activity_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  instructions JSONB, -- Step-by-step instructions
  example_prompts TEXT[], -- Sample AI prompts
  expected_outcomes JSONB, -- Detailed success criteria
  common_pitfalls TEXT[], -- What to avoid
  video_url TEXT,
  resource_links JSONB,
  alternative_approaches JSONB, -- For different tools
  success_metrics JSONB,
  reflection_questions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's personalized plans
CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  phase1_activities UUID[], -- Array of activity IDs
  phase2_activities UUID[],
  phase3_activities UUID[],
  customizations JSONB, -- User modifications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_version)
);

-- Progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id),
  plan_id UUID REFERENCES public.user_plans(id),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped', 'rescheduled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER,
  notes TEXT,
  reflection TEXT,
  outcome_rating INTEGER CHECK (outcome_rating >= 1 AND outcome_rating <= 5),
  scheduled_date DATE,
  actual_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback on activities
CREATE TABLE public.activity_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id),
  progress_id UUID REFERENCES public.user_progress(id),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  would_recommend BOOLEAN,
  feedback_text TEXT,
  improvement_suggestions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan modification history
CREATE TABLE public.plan_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES public.user_plans(id),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  modification_type TEXT, -- add, remove, reorder, reschedule
  activity_id UUID REFERENCES public.activities(id),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_status ON public.user_progress(status);
CREATE INDEX idx_user_progress_scheduled_date ON public.user_progress(scheduled_date);
CREATE INDEX idx_activities_personas ON public.activities USING GIN(suitable_personas);
CREATE INDEX idx_activities_work_types ON public.activities USING GIN(suitable_work_types);
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Survey responses are private to user
CREATE POLICY "Users can view own survey responses" ON public.survey_responses
  FOR ALL USING (auth.uid() = user_id);

-- User plans are private
CREATE POLICY "Users can manage own plans" ON public.user_plans
  FOR ALL USING (auth.uid() = user_id);

-- Progress tracking is private
CREATE POLICY "Users can manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Activities are public read
CREATE POLICY "Anyone can view activities" ON public.activities
  FOR SELECT USING (is_active = true);
```

---

## 3. API Endpoints

### 3.1 Authentication Endpoints

```typescript
// Supabase Auth API (built-in)
POST   /auth/signup          // Email/password signup
POST   /auth/signin          // Email/password signin
POST   /auth/signout         // Sign out
GET    /auth/user            // Get current user
POST   /auth/recover         // Password recovery
GET    /auth/callback        // OAuth callback
```

### 3.2 Custom API Endpoints (Supabase Edge Functions)

```typescript
// User Management
GET    /api/users/profile           // Get user profile with persona
PUT    /api/users/profile           // Update user profile
POST   /api/users/complete-onboarding // Mark onboarding complete

// Survey & Persona
POST   /api/survey/submit           // Submit survey and calculate persona
GET    /api/survey/responses        // Get user's survey responses

// Plan Management  
POST   /api/plans/generate          // Generate personalized plan
GET    /api/plans/current           // Get active plan
PUT    /api/plans/{id}              // Update plan (customizations)
POST   /api/plans/{id}/duplicate    // Create new version of plan
GET    /api/plans/history           // Get all plan versions

// Activities
GET    /api/activities              // Get all activities (filtered)
GET    /api/activities/{id}         // Get activity details with template
POST   /api/activities/recommend    // Get AI-recommended activities

// Progress Tracking
POST   /api/progress/start          // Start an activity
POST   /api/progress/complete       // Complete an activity
POST   /api/progress/skip           // Skip an activity
PUT    /api/progress/{id}/reschedule // Reschedule an activity
GET    /api/progress/summary        // Get progress summary
GET    /api/progress/streak         // Get current streak

// Feedback
POST   /api/feedback/activity       // Submit activity feedback
GET    /api/feedback/insights       // Get personalized insights

// Calendar Integration
GET    /api/calendar/export         // Export plan as ICS
POST   /api/calendar/sync           // Sync with external calendar
```

---

## 4. Activity Content Structure

### 4.1 Enhanced Activity Schema

Each activity will include:

```typescript
interface EnhancedActivity {
  // Basic Information
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'easy' | 'medium' | 'advanced';
  type: 'exercise' | 'experiment' | 'reflection' | 'challenge' | 'share';
  
  // Detailed Instructions
  instructions: {
    overview: string;
    steps: Array<{
      order: number;
      title: string;
      description: string;
      timeEstimate: number;
      tips?: string[];
    }>;
    prerequisites?: string[];
  };
  
  // Example Prompts
  examplePrompts: Array<{
    tool: 'ChatGPT' | 'Claude' | 'Gemini' | 'Any';
    scenario: string;
    prompt: string;
    expectedOutput: string;
    variations?: string[];
  }>;
  
  // Expected Outcomes
  outcomes: {
    immediate: string[];      // What happens right after
    shortTerm: string[];      // Within a week
    longTerm: string[];       // After consistent practice
    metrics: Array<{
      name: string;
      measurement: string;
      target: string;
    }>;
  };
  
  // Common Pitfalls
  pitfalls: Array<{
    issue: string;
    why: string;
    solution: string;
  }>;
  
  // Resources
  resources: {
    videos?: Array<{
      title: string;
      url: string;
      duration: number;
      description: string;
    }>;
    articles?: Array<{
      title: string;
      url: string;
      readTime: number;
    }>;
    tools?: Array<{
      name: string;
      url: string;
      purpose: string;
    }>;
  };
  
  // Alternative Approaches
  alternatives: Array<{
    tool: string;
    approach: string;
    prosAndCons: {
      pros: string[];
      cons: string[];
    };
  }>;
  
  // Success Metrics
  successMetrics: {
    quantitative: Array<{
      metric: string;
      howToMeasure: string;
      goodBenchmark: string;
    }>;
    qualitative: Array<{
      indicator: string;
      howToAssess: string;
    }>;
  };
  
  // Reflection Questions
  reflectionQuestions: Array<{
    question: string;
    purpose: string;
    followUp?: string;
  }>;
}
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Basic authentication and data persistence

**User Stories:**
- Account creation with email/password
- Survey data persistence
- Basic plan generation and storage
- View saved plan after login

**Technical Tasks:**
- Set up Supabase project
- Implement authentication flow
- Create base database schema
- Add RLS policies
- Update React components for auth state

### Phase 2: Core Features (Week 3-4)
**Goal:** Progress tracking and plan customization

**User Stories:**
- Mark activities as complete
- Add notes to completed activities
- Reschedule activities
- View progress dashboard
- Modify plan activities

**Technical Tasks:**
- Build progress tracking API
- Create activity completion UI
- Implement plan modification logic
- Add progress visualization components
- Create activity detail modals

### Phase 3: Enhanced Content (Week 5-6)
**Goal:** Rich activity content and templates

**User Stories:**
- View detailed activity instructions
- Access example prompts
- Watch tutorial videos
- See alternative approaches
- Track success metrics

**Technical Tasks:**
- Migrate activity content to database
- Create activity template system
- Build rich content viewer
- Add media handling
- Implement content versioning

### Phase 4: Calendar & Scheduling (Week 7-8)
**Goal:** Timeline and calendar integration

**User Stories:**
- View plan in calendar format
- Drag-and-drop rescheduling
- Export to external calendar
- Set activity reminders
- See upcoming activities

**Technical Tasks:**
- Build calendar components
- Implement ICS export
- Add reminder system
- Create timeline visualization
- Build notification service

### Phase 5: Social & Insights (Week 9-10)
**Goal:** Feedback and personalization

**User Stories:**
- Rate completed activities
- Get personalized recommendations
- View progress insights
- Share achievements
- Access community features

**Technical Tasks:**
- Build feedback system
- Create recommendation engine
- Implement analytics dashboard
- Add sharing capabilities
- Build insight generation

---

## 6. Security Considerations

### 6.1 Authentication Security
- Implement rate limiting on auth endpoints
- Use secure session management
- Enable MFA option for users
- Implement password strength requirements
- Add suspicious activity detection

### 6.2 Data Protection
- Enable RLS on all user tables
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement field-level encryption for PII
- Regular security audits

### 6.3 API Security
- Implement API rate limiting
- Use API keys for external integrations
- Validate all input data
- Implement CORS properly
- Add request signing for sensitive operations

### 6.4 Privacy Compliance
- GDPR compliance features:
  - Data export functionality
  - Right to deletion
  - Consent management
  - Privacy policy acceptance
- CCPA compliance
- Cookie consent management
- Audit logging for data access

---

## 7. User Stories - Detailed

### 7.1 Plan Generation & Storage

#### Story: Generate Personalized Plan
**As a** new user who completed the survey  
**I want** to receive a personalized 90-day plan  
**So that** I have a structured path for AI adoption

**Acceptance Criteria:**
- Plan generates within 3 seconds of survey completion
- Plan includes 20-30 activities based on frequency preference
- Activities match persona and work type
- Each phase has clear learning objectives
- Plan is immediately viewable and editable
- Plan includes estimated time commitments

#### Story: Customize Generated Plan
**As a** user with specific needs  
**I want** to modify my generated plan  
**So that** it better fits my schedule and interests

**Acceptance Criteria:**
- Can add/remove activities from any phase
- Can reorder activities within phases
- Can change activity scheduled dates
- Changes are saved automatically
- Can revert to original plan
- Modification history is tracked

### 7.2 Progress Tracking

#### Story: Complete Daily Activity
**As a** user following my plan  
**I want** to mark activities as complete  
**So that** I can track my progress

**Acceptance Criteria:**
- One-click completion from plan view
- Optional notes and reflection
- Time tracking (automatic or manual)
- Outcome rating (1-5 stars)
- Completion updates progress metrics
- Streak counter updates

#### Story: Track Learning Metrics
**As a** user progressing through the program  
**I want** to see my learning metrics  
**So that** I can measure my improvement

**Acceptance Criteria:**
- Activities completed count
- Time invested tracker
- Streak calendar view
- Skill progression indicators
- Phase completion percentage
- Projected completion date

### 7.3 Calendar Integration

#### Story: Visual Timeline View
**As a** visual learner  
**I want** to see my plan as a timeline  
**So that** I can understand the journey progression

**Acceptance Criteria:**
- Timeline shows all 90 days
- Activities positioned by scheduled date
- Visual indicators for difficulty
- Progress markers for completed items
- Milestone celebrations at phase boundaries
- Zoom in/out functionality

#### Story: Calendar Sync
**As a** busy professional  
**I want** to sync activities with my calendar  
**So that** I can manage my time effectively

**Acceptance Criteria:**
- Export to ICS format
- Google Calendar integration
- Outlook Calendar integration
- Customizable reminder times
- Recurring schedule options
- Updates sync bidirectionally

---

## 8. Technical Requirements

### 8.1 Frontend Updates
- Implement Supabase client SDK
- Add authentication state management
- Create protected route components
- Build real-time subscription handlers
- Implement optimistic UI updates
- Add offline capability with sync

### 8.2 Backend Requirements
- Supabase project configuration
- Database migrations system
- Edge function deployment
- Background job processing
- Email notification service
- File storage for resources

### 8.3 Performance Requirements
- Page load time <2 seconds
- API response time <500ms
- Database query optimization
- Implement caching strategy
- CDN for static assets
- Image optimization

### 8.4 Monitoring & Analytics
- Error tracking (Sentry)
- Performance monitoring
- User analytics (privacy-compliant)
- Database performance metrics
- API usage tracking
- User behavior analytics

---

## 9. Success Metrics & KPIs

### 9.1 User Engagement
- **Daily Active Users (DAU):** Target 40% of registered users
- **Weekly Active Users (WAU):** Target 70% of registered users
- **Average Session Duration:** Target >10 minutes
- **Activities per Week:** Target 3-5 based on plan

### 9.2 Progress Metrics
- **Activity Completion Rate:** Target >60%
- **Plan Completion Rate (90 days):** Target >30%
- **Average Streak Length:** Target >7 days
- **User Retention (30-day):** Target >70%

### 9.3 Content Effectiveness
- **Activity Rating Average:** Target >4.0/5.0
- **Recommendation Acceptance:** Target >50%
- **Time Saved (self-reported):** Target >5 hours/week
- **Skill Improvement (self-assessed):** Target >70% report improvement

### 9.4 Technical Performance
- **API Uptime:** Target 99.9%
- **Average Response Time:** Target <500ms
- **Error Rate:** Target <0.1%
- **Database Query Time:** Target <100ms p95

---

## 10. Risk Mitigation

### 10.1 Technical Risks
- **Risk:** Supabase service outage
  - **Mitigation:** Implement fallback to cached data, show offline mode
  
- **Risk:** Data migration failures
  - **Mitigation:** Incremental migrations, rollback procedures, data validation

- **Risk:** Performance degradation with scale
  - **Mitigation:** Database indexing, query optimization, caching layer

### 10.2 User Experience Risks
- **Risk:** Complex onboarding deters users
  - **Mitigation:** Progressive disclosure, guest mode, simplified signup

- **Risk:** Plan feels too rigid
  - **Mitigation:** Flexible scheduling, skip options, plan customization

- **Risk:** Lost progress frustrates users
  - **Mitigation:** Auto-save, sync indicators, data recovery options

### 10.3 Security Risks
- **Risk:** Data breach exposing user information
  - **Mitigation:** Encryption, RLS policies, regular security audits

- **Risk:** Account takeover
  - **Mitigation:** MFA options, suspicious activity detection, session management

---

## 11. Future Enhancements

### 11.1 Advanced Features (Post-MVP)
- AI-powered activity recommendations
- Team/organization accounts
- Peer learning and collaboration
- Custom activity creation
- Integration with AI tools APIs
- Mobile application
- Gamification elements
- Certificate/badge system

### 11.2 Enterprise Features
- SSO/SAML authentication
- Team progress dashboards
- Custom branding
- Advanced analytics
- API access for integrations
- Compliance reporting
- Role-based access control
- Bulk user management

### 11.3 Content Expansion
- Industry-specific tracks
- Advanced specialization paths
- Guest expert content
- Community-contributed activities
- Localization/internationalization
- Video tutorials library
- Interactive workshops
- Live coaching sessions

---

## Appendix A: Database Seed Data

Sample activities for initial launch:

```javascript
const sampleActivities = [
  {
    title: "Your First AI Conversation",
    description: "Start with a casual chat to understand AI interaction",
    duration_minutes: 10,
    difficulty: "easy",
    activity_type: "exercise",
    phase: 1,
    suitable_personas: ["cautious-explorer", "eager-beginner"],
    suitable_work_types: ["all"],
    outcomes: ["Overcome hesitation", "Understand AI conversation flow"],
    // Template data
    instructions: {
      overview: "Have your first meaningful conversation with AI",
      steps: [
        {
          order: 1,
          title: "Choose your AI tool",
          description: "Open ChatGPT, Claude, or Gemini",
          timeEstimate: 1,
          tips: ["Free versions work perfectly for this exercise"]
        },
        {
          order: 2,
          title: "Start with a greeting",
          description: "Say hello and introduce yourself briefly",
          timeEstimate: 2,
          tips: ["Be natural, like talking to a colleague"]
        },
        {
          order: 3,
          title: "Ask about its capabilities",
          description: "Ask what it can help you with",
          timeEstimate: 3,
          tips: ["Try: 'What kinds of things can you help me with?'"]
        },
        {
          order: 4,
          title: "Share a challenge",
          description: "Describe a small work challenge you're facing",
          timeEstimate: 4,
          tips: ["Keep it simple for your first interaction"]
        }
      ]
    },
    examplePrompts: [
      {
        tool: "Any",
        scenario: "Introduction",
        prompt: "Hi! I'm new to using AI assistants. I work in marketing and I'm curious about how you might be able to help me with my daily tasks. What are some things you're particularly good at?",
        expectedOutput: "A friendly response explaining capabilities",
        variations: [
          "Replace 'marketing' with your actual role",
          "Add specific tasks you're curious about"
        ]
      }
    ],
    pitfalls: [
      {
        issue: "Being too formal or technical",
        why: "Creates barrier to natural interaction",
        solution: "Write like you're messaging a helpful colleague"
      },
      {
        issue: "Asking for too much at once",
        why: "Can overwhelm and reduce quality",
        solution: "Start with one simple request"
      }
    ],
    successMetrics: {
      quantitative: [
        {
          metric: "Conversation length",
          howToMeasure: "Number of back-and-forth exchanges",
          goodBenchmark: "At least 5 exchanges"
        }
      ],
      qualitative: [
        {
          indicator: "Comfort level",
          howToAssess: "Do you feel less intimidated by AI?"
        }
      ]
    },
    reflectionQuestions: [
      {
        question: "What surprised you about the interaction?",
        purpose: "Identify preconceptions",
        followUp: "How was it different from what you expected?"
      },
      {
        question: "What would you ask next time?",
        purpose: "Encourage continued exploration"
      }
    ]
  }
  // ... more activities
];
```

---

## Appendix B: API Response Examples

### Plan Generation Response
```json
{
  "success": true,
  "data": {
    "planId": "uuid",
    "userId": "uuid",
    "persona": "practical-adopter",
    "phases": {
      "phase1": {
        "title": "Foundation: Small Wins, Big Confidence",
        "activities": [
          {
            "id": "uuid",
            "title": "Your First AI Conversation",
            "scheduledDate": "2024-12-15",
            "duration": 10,
            "difficulty": "easy"
          }
        ]
      }
    },
    "metadata": {
      "totalActivities": 24,
      "estimatedCompletionDate": "2025-03-15",
      "weeklyTimeCommitment": 90
    }
  }
}
```

### Progress Summary Response
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "summary": {
      "activitiesCompleted": 12,
      "totalActivities": 24,
      "currentStreak": 5,
      "longestStreak": 8,
      "totalTimeInvested": 245,
      "currentPhase": 1,
      "percentComplete": 50,
      "projectedCompletion": "2025-03-10",
      "lastActivity": {
        "title": "Email Draft Assistant",
        "completedAt": "2024-12-14T10:30:00Z",
        "rating": 4
      }
    },
    "achievements": [
      {
        "type": "streak",
        "title": "7-Day Streak",
        "earnedAt": "2024-12-12T00:00:00Z"
      }
    ]
  }
}
```

---

## Document Version History

- **v1.0** (2024-12-13): Initial PRD creation with comprehensive Supabase integration requirements
- Features include: Authentication, database schema, API design, activity content structure, implementation phases, and success metrics