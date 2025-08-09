-- Complete Supabase Setup Script for My AI Onboarding
-- Run this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/ojjcmtpqkqfbpeibxwlb/sql/new

-- =====================================================
-- PART 1: DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  persona TEXT,
  work_type TEXT,
  engagement_frequency TEXT,
  survey_answers JSONB,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_templates table
CREATE TABLE activity_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  type TEXT CHECK (type IN ('exercise', 'experiment', 'reflection', 'challenge', 'share')),
  phase INTEGER CHECK (phase IN (1, 2, 3)),
  personas TEXT[] DEFAULT '{}',
  work_types TEXT[] DEFAULT '{}',
  
  -- Detailed content
  overview TEXT,
  objectives TEXT[],
  prerequisites TEXT[],
  
  -- Instructions as JSONB for flexibility
  instructions JSONB DEFAULT '[]',
  
  -- Examples and prompts
  example_prompts JSONB DEFAULT '[]',
  
  -- Success and pitfalls
  success_criteria TEXT[],
  common_pitfalls TEXT[],
  
  -- Resources
  resources JSONB DEFAULT '[]',
  
  -- Outcomes
  expected_outcomes TEXT[],
  reflection_questions TEXT[],
  
  -- Alternatives
  alternative_approaches JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_plans table
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona TEXT NOT NULL,
  
  -- Plan activities (array of activity IDs)
  phase1_activities UUID[] DEFAULT '{}',
  phase2_activities UUID[] DEFAULT '{}',
  phase3_activities UUID[] DEFAULT '{}',
  
  -- Customizations
  customizations JSONB DEFAULT '{}',
  
  -- Schedule
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  engagement_frequency TEXT,
  preferred_time TIME,
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, version)
);

-- Create user_progress table
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activity_templates(id),
  plan_id UUID NOT NULL REFERENCES user_plans(id),
  
  -- Status tracking
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER,
  
  -- Ratings
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
  notes TEXT,
  
  -- Outcomes
  outcomes_achieved TEXT[],
  reflection_answers JSONB DEFAULT '{}',
  
  -- Metrics
  metrics JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, activity_id, plan_id)
);

-- Create milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('week1', 'day30', 'day60', 'day90', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_feedback table
CREATE TABLE activity_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activity_templates(id),
  feedback_type TEXT CHECK (feedback_type IN ('suggestion', 'issue', 'praise')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activity_templates(id),
  plan_id UUID REFERENCES user_plans(id),
  
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  
  -- Reminders
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_time TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_persona ON profiles(persona);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_active ON user_plans(user_id, is_active);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(user_id, status);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Activity templates: Everyone can read
CREATE POLICY "Activity templates are viewable by everyone" ON activity_templates
  FOR SELECT USING (true);

-- User plans: Users can only see and modify their own plans
CREATE POLICY "Users can view own plans" ON user_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans" ON user_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON user_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- User progress: Users can only see and modify their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can track own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Milestones: Users can only see their own milestones
CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own milestones" ON milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity feedback: Users can see all feedback but only create their own
CREATE POLICY "Users can view all feedback" ON activity_feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can create own feedback" ON activity_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Calendar events: Users can only see and modify their own events
CREATE POLICY "Users can view own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Functions

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_templates_updated_at BEFORE UPDATE ON activity_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_plans_updated_at BEFORE UPDATE ON user_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for activity templates are created after the seed data
-- Seed data for activity_templates table with comprehensive details

-- Phase 1: Foundation Activities (Days 1-30)

INSERT INTO activity_templates (
  title,
  description,
  duration_minutes,
  difficulty,
  type,
  phase,
  personas,
  work_types,
  overview,
  objectives,
  prerequisites,
  instructions,
  example_prompts,
  success_criteria,
  common_pitfalls,
  resources,
  expected_outcomes,
  reflection_questions,
  alternative_approaches
) VALUES 
(
  'Your First AI Conversation',
  'Have a casual chat with AI about your day. No agenda, just explore.',
  10,
  'easy',
  'exercise',
  1,
  ARRAY['cautious-explorer', 'eager-beginner'],
  ARRAY['all'],
  'This is your first official interaction with AI as a colleague. Think of it like a coffee chat with a new team member - casual, exploratory, and without pressure.',
  ARRAY[
    'Overcome initial hesitation about AI interaction',
    'Understand conversational flow and response patterns',
    'Discover AI''s conversational capabilities',
    'Build comfort with natural language interaction'
  ],
  NULL,
  '[
    {
      "step": 1,
      "title": "Choose Your AI Platform",
      "description": "Open ChatGPT, Claude, or your preferred AI tool. If you don''t have an account, create a free one.",
      "time_estimate": 2,
      "tips": ["ChatGPT is great for general conversation", "Claude excels at nuanced discussion", "Start with whichever feels most approachable"]
    },
    {
      "step": 2,
      "title": "Start with a Greeting",
      "description": "Type a simple greeting like you would to a colleague. For example: ''Hi! I''m learning to work with AI. How are you today?''",
      "time_estimate": 1,
      "tips": ["Be natural - no special formatting needed", "AI will match your tone", "It''s okay to be informal"]
    },
    {
      "step": 3,
      "title": "Share Something About Your Day",
      "description": "Tell the AI about something that happened today - a meeting, a challenge, something you''re working on, or even what you had for lunch.",
      "time_estimate": 3,
      "tips": ["No topic is too small", "Practice being specific", "Notice how AI asks follow-up questions"]
    },
    {
      "step": 4,
      "title": "Ask a Question",
      "description": "Ask the AI something you''re genuinely curious about - could be work-related or personal interest.",
      "time_estimate": 3,
      "tips": ["Try ''What do you think about...''", "Ask for perspectives, not just facts", "Follow up on interesting points"]
    },
    {
      "step": 5,
      "title": "Reflect on the Experience",
      "description": "Before closing, tell the AI one thing that surprised you about this conversation.",
      "time_estimate": 1,
      "tips": ["Be honest about your experience", "Note what felt natural vs awkward", "This helps you process the interaction"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "Hi! I''m new to working with AI and wanted to start with a casual conversation. I''m a [your role] and I''m curious about how AI might help with my work. Today I [something from your day]. What''s your take on that?",
      "expected_output": "A friendly, conversational response that acknowledges your introduction, responds to your shared experience, and asks relevant follow-up questions."
    },
    {
      "tool": "Claude",
      "prompt": "Hello! This is my first real conversation with an AI assistant. I work in [your field] and I''m exploring how we might collaborate. Something interesting happened today: [brief story]. Have you helped others in similar situations?",
      "expected_output": "A thoughtful response that relates to your experience, possibly sharing relevant insights or asking clarifying questions to better understand your context."
    }
  ]'::jsonb,
  ARRAY[
    'Completed a 5-10 minute conversation',
    'Asked at least 2 questions',
    'Shared something specific about your work or day',
    'Received responses that made sense in context'
  ],
  ARRAY[
    'Trying to be too formal or technical',
    'Asking only yes/no questions',
    'Not following up on interesting responses',
    'Treating it like a search engine instead of a conversation'
  ],
  '[
    {
      "type": "article",
      "title": "The Art of AI Conversation",
      "url": "https://example.com/ai-conversation-guide",
      "description": "Tips for natural AI interaction"
    },
    {
      "type": "video",
      "title": "First Time with ChatGPT",
      "url": "https://example.com/chatgpt-intro",
      "description": "5-minute walkthrough for beginners"
    }
  ]'::jsonb,
  ARRAY[
    'Reduced anxiety about AI interaction',
    'Understanding of conversational flow',
    'Identified AI''s conversational strengths',
    'Comfort with natural language input'
  ],
  ARRAY[
    'What surprised you most about the conversation?',
    'How did it differ from your expectations?',
    'What would you want to explore in future conversations?',
    'Did any response particularly impress or disappoint you?'
  ],
  '[
    {
      "condition": "If you''re very nervous",
      "approach": "Start by asking AI to explain something you already know well, so you can gauge its accuracy and style"
    },
    {
      "condition": "If you''re more technical",
      "approach": "Try asking about a specific technical challenge you''re facing"
    }
  ]'::jsonb
),
(
  'Email Draft Assistant',
  'Use AI to draft a routine email, then edit it to match your voice.',
  15,
  'easy',
  'experiment',
  1,
  ARRAY['all'],
  ARRAY['all'],
  'Learn to use AI as a writing partner for professional communication. This exercise teaches you to provide context, review output critically, and maintain your authentic voice.',
  ARRAY[
    'Create a professional email draft in under 5 minutes',
    'Learn to provide effective context to AI',
    'Practice editing AI output to match your style',
    'Understand AI''s role as a draft creator, not final author'
  ],
  ARRAY['Basic email account', 'One real email you need to send'],
  '[
    {
      "step": 1,
      "title": "Choose Your Email Task",
      "description": "Select a real email you need to write today - meeting follow-up, project update, request for information, or thank you note.",
      "time_estimate": 2,
      "tips": ["Start with routine emails, not sensitive ones", "Avoid emails with confidential information", "Pick something you''d normally spend 10-15 minutes writing"]
    },
    {
      "step": 2,
      "title": "Provide Context to AI",
      "description": "Give AI the essential information: recipient role, purpose, key points, desired tone, and any specific requirements.",
      "time_estimate": 3,
      "tips": ["Be specific about the recipient", "List 3-5 key points to cover", "Specify formal vs casual tone", "Mention any deadlines or actions needed"]
    },
    {
      "step": 3,
      "title": "Generate Initial Draft",
      "description": "Ask AI to create the email draft based on your context. Read it through completely before making changes.",
      "time_estimate": 2,
      "tips": ["Don''t expect perfection on first try", "Look for structure and completeness", "Note what''s good and what needs work"]
    },
    {
      "step": 4,
      "title": "Personalize the Draft",
      "description": "Edit the draft to sound like you - adjust greetings, add personal touches, modify phrases to match your style.",
      "time_estimate": 5,
      "tips": ["Keep the good structure, change the voice", "Add specific details AI couldn''t know", "Remove overly formal or generic phrases", "Ensure accuracy of all facts"]
    },
    {
      "step": 5,
      "title": "Final Review and Send",
      "description": "Read the email aloud to check flow, verify all details, then send it.",
      "time_estimate": 3,
      "tips": ["Check names and dates carefully", "Ensure the call-to-action is clear", "Save the prompt for future use if it worked well"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "Help me draft a professional email:\\n\\nTo: [Manager/Colleague/Client]\\nPurpose: [Update on project X / Request for Y / Follow-up on Z]\\n\\nKey points to cover:\\n1. [First point]\\n2. [Second point]\\n3. [Third point]\\n\\nTone: [Professional but friendly / Formal / Casual]\\nLength: [Brief 2-3 paragraphs / Detailed]\\nAction needed: [Response by date / No action needed / Approval required]",
      "expected_output": "A complete email draft with subject line, greeting, organized body paragraphs covering all points, clear call-to-action, and professional closing."
    },
    {
      "tool": "Claude",
      "prompt": "I need to write an email to my [recipient role] about [topic]. Context: [brief background]. I want to: 1) [objective 1], 2) [objective 2], 3) [objective 3]. The tone should be [description] and it should be [length]. Please draft this email with a clear subject line.",
      "expected_output": "A well-structured email with appropriate subject line, context-aware content, logical flow, and tone matching your requirements."
    }
  ]'::jsonb,
  ARRAY[
    'Email drafted and sent within 15 minutes',
    'All key points included in final version',
    'Personal voice maintained',
    'Recipient requirements clearly addressed'
  ],
  ARRAY[
    'Sending AI draft without editing',
    'Including sensitive/confidential information',
    'Losing your authentic voice completely',
    'Not fact-checking AI-generated details'
  ],
  '[
    {
      "type": "template",
      "title": "Email Context Template",
      "url": "https://example.com/email-template",
      "description": "Reusable prompt template for common email types"
    },
    {
      "type": "article",
      "title": "AI Email Etiquette Guide",
      "url": "https://example.com/ai-email-guide",
      "description": "Best practices for AI-assisted communication"
    }
  ]'::jsonb,
  ARRAY[
    'Time saved on email drafting',
    'Improved email structure',
    'Consistent professional communication',
    'Reusable prompt patterns identified'
  ],
  ARRAY[
    'How much time did you save compared to writing from scratch?',
    'What did AI do well? What did it miss?',
    'How much editing was required?',
    'Will you use this approach again? Why or why not?'
  ],
  '[
    {
      "condition": "For very formal emails",
      "approach": "Generate multiple versions and combine the best elements"
    },
    {
      "condition": "For creative emails",
      "approach": "Ask AI for 3 different opening approaches and choose the best"
    }
  ]'::jsonb
),
(
  'Meeting Notes Summarizer',
  'Turn messy meeting notes into clear action items with AI.',
  10,
  'easy',
  'experiment',
  1,
  ARRAY['practical-adopter', 'efficiency-seeker'],
  ARRAY['people', 'operations'],
  'Transform scattered meeting notes into organized summaries with clear action items. This teaches you to use AI for information synthesis and structure.',
  ARRAY[
    'Convert raw notes into structured summary',
    'Extract clear action items with owners and deadlines',
    'Learn AI''s capability for information organization',
    'Create consistent meeting documentation'
  ],
  ARRAY['Recent meeting notes (can be messy/incomplete)'],
  '[
    {
      "step": 1,
      "title": "Gather Your Raw Notes",
      "description": "Find notes from a recent meeting - they can be messy, incomplete, or unorganized. Copy them into a document.",
      "time_estimate": 2,
      "tips": ["Include all fragments and partial thoughts", "Don''t worry about organization", "Include names and context where possible"]
    },
    {
      "step": 2,
      "title": "Provide Meeting Context",
      "description": "Tell AI about the meeting: purpose, attendees, main topics discussed, and what kind of summary you need.",
      "time_estimate": 2,
      "tips": ["Specify the meeting type and goal", "List key stakeholders", "Mention any critical decisions needed"]
    },
    {
      "step": 3,
      "title": "Request Structured Summary",
      "description": "Ask AI to organize your notes into sections: Key Decisions, Action Items, Discussion Points, and Next Steps.",
      "time_estimate": 2,
      "tips": ["Request specific format you prefer", "Ask for action items with owners and dates", "Request clarification on unclear points"]
    },
    {
      "step": 4,
      "title": "Review and Enhance",
      "description": "Check the summary for accuracy, add any missing context, and clarify action items.",
      "time_estimate": 3,
      "tips": ["Verify all names and dates", "Add context AI couldn''t know", "Ensure action items are specific and measurable"]
    },
    {
      "step": 5,
      "title": "Distribute and File",
      "description": "Send the summary to attendees and save it in your meeting documentation system.",
      "time_estimate": 1,
      "tips": ["Ask for confirmation on action items", "Create follow-up calendar items", "Save the format for future use"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "Please organize these meeting notes into a structured summary:\\n\\n[Paste your raw notes]\\n\\nMeeting context:\\n- Purpose: [meeting purpose]\\n- Attendees: [list names]\\n- Date: [date]\\n\\nPlease structure as:\\n1. Executive Summary (2-3 sentences)\\n2. Key Decisions Made\\n3. Action Items (with owner and deadline)\\n4. Discussion Points\\n5. Next Steps\\n6. Items for Follow-up",
      "expected_output": "A clean, organized summary with all sections populated, clear action items with assignments, and logical flow from raw notes."
    }
  ]'::jsonb,
  ARRAY[
    'Summary created in under 10 minutes',
    'All action items have clear owners',
    'Key decisions are highlighted',
    'Document is ready to share'
  ],
  ARRAY[
    'Not verifying accuracy of interpretations',
    'Missing important context in raw notes',
    'Accepting AI assumptions without checking',
    'Forgetting to add deadlines to action items'
  ],
  NULL,
  ARRAY[
    'Clear, shareable meeting summary',
    'Time saved on documentation',
    'Consistent meeting note format',
    'Better action item tracking'
  ],
  ARRAY[
    'How much clearer are your action items now?',
    'What patterns did AI identify that you missed?',
    'How will this change your note-taking approach?',
    'What meeting types would benefit most from this?'
  ],
  NULL
);

-- Phase 2: Integration Activities (Days 31-60)

INSERT INTO activity_templates (
  title,
  description,
  duration_minutes,
  difficulty,
  type,
  phase,
  personas,
  work_types,
  overview,
  objectives,
  prerequisites,
  instructions,
  example_prompts,
  success_criteria,
  common_pitfalls,
  resources,
  expected_outcomes,
  reflection_questions,
  alternative_approaches
) VALUES 
(
  'AI Code Review Partner',
  'Use AI to review your code and suggest improvements.',
  20,
  'medium',
  'experiment',
  2,
  ARRAY['tech-innovator', 'practical-adopter'],
  ARRAY['product', 'operations'],
  'Transform AI into your personal code reviewer. Learn to get actionable feedback on code quality, potential bugs, and optimization opportunities.',
  ARRAY[
    'Use AI for comprehensive code review',
    'Identify potential bugs and security issues',
    'Learn best practices and patterns',
    'Improve code maintainability'
  ],
  ARRAY['Basic coding knowledge', 'Recent code you''ve written'],
  '[
    {
      "step": 1,
      "title": "Prepare Your Code",
      "description": "Select a function, class, or module you recently wrote. Copy it including context like imports and purpose.",
      "time_estimate": 3,
      "tips": ["Include 50-200 lines for best results", "Add comments about intended behavior", "Include test cases if available"]
    },
    {
      "step": 2,
      "title": "Request Comprehensive Review",
      "description": "Ask AI to review for: bugs, performance, readability, best practices, and security concerns.",
      "time_estimate": 5,
      "tips": ["Specify your language and framework", "Mention your experience level", "Ask for severity ratings"]
    },
    {
      "step": 3,
      "title": "Analyze Feedback",
      "description": "Review each suggestion, understanding why it matters and how it improves your code.",
      "time_estimate": 7,
      "tips": ["Ask for clarification on unclear points", "Request examples of fixes", "Prioritize critical issues first"]
    },
    {
      "step": 4,
      "title": "Implement Improvements",
      "description": "Apply the most valuable suggestions to your code. Test thoroughly after changes.",
      "time_estimate": 5,
      "tips": ["Start with bug fixes", "Document why you made changes", "Run tests after each change"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "Claude",
      "prompt": "Please review this [language] code for potential issues:\\n\\n```[language]\\n[your code]\\n```\\n\\nPlease check for:\\n1. Bugs or logic errors\\n2. Performance issues\\n3. Security vulnerabilities\\n4. Code smell and readability\\n5. Best practices for [framework/language]\\n\\nRate each issue as: Critical, Major, Minor, or Suggestion",
      "expected_output": "Structured review with categorized issues, explanations, and specific fix recommendations with code examples."
    }
  ]'::jsonb,
  ARRAY[
    'Received structured code review',
    'Identified at least 3 improvement areas',
    'Implemented at least 2 suggestions',
    'Code passes tests after changes'
  ],
  ARRAY[
    'Accepting all suggestions without understanding',
    'Ignoring context-specific requirements',
    'Not testing after implementing changes',
    'Focusing only on style issues'
  ],
  '[
    {
      "type": "article",
      "title": "AI-Assisted Code Review Best Practices",
      "url": "https://example.com/ai-code-review",
      "description": "Guide to effective AI code review"
    }
  ]'::jsonb,
  ARRAY[
    'Improved code quality',
    'Learned new best practices',
    'Caught potential bugs early',
    'Consistent code style'
  ],
  ARRAY[
    'Which suggestions surprised you most?',
    'What patterns will you apply to future code?',
    'How does this compare to human code review?',
    'What would you do differently next time?'
  ],
  '[
    {
      "condition": "For legacy code",
      "approach": "Focus on incremental improvements rather than complete rewrites"
    },
    {
      "condition": "For team projects",
      "approach": "Use AI review before submitting for human review"
    }
  ]'::jsonb
),
(
  'Data Analysis Accelerator',
  'Analyze datasets and create visualizations with AI guidance.',
  30,
  'medium',
  'challenge',
  2,
  ARRAY['efficiency-seeker', 'practical-adopter'],
  ARRAY['product', 'sales', 'operations'],
  'Learn to use AI as a data analysis partner for quick insights, visualization suggestions, and statistical interpretations.',
  ARRAY[
    'Perform rapid data exploration',
    'Generate analysis code',
    'Create meaningful visualizations',
    'Interpret statistical results'
  ],
  ARRAY['Dataset to analyze', 'Basic spreadsheet knowledge'],
  '[
    {
      "step": 1,
      "title": "Prepare Your Data",
      "description": "Export your data as CSV or paste a sample. Include column headers and data types.",
      "time_estimate": 5,
      "tips": ["Start with clean data", "Include 10-100 rows for examples", "Describe what the data represents"]
    },
    {
      "step": 2,
      "title": "Request Initial Analysis",
      "description": "Ask AI to explore the data: summary statistics, patterns, anomalies, and correlations.",
      "time_estimate": 7,
      "tips": ["Share your business questions", "Ask for specific metrics", "Request interpretation of findings"]
    },
    {
      "step": 3,
      "title": "Generate Visualizations",
      "description": "Get code for charts and graphs that best represent your insights.",
      "time_estimate": 10,
      "tips": ["Specify your tools (Excel, Python, etc.)", "Ask for multiple chart options", "Request formatting suggestions"]
    },
    {
      "step": 4,
      "title": "Create Insights Report",
      "description": "Synthesize findings into actionable insights with AI help.",
      "time_estimate": 8,
      "tips": ["Focus on business impact", "Include confidence levels", "Suggest next steps"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "I have sales data with these columns: [columns]. Here''s a sample:\\n\\n[data sample]\\n\\nPlease:\\n1. Provide summary statistics\\n2. Identify key patterns or trends\\n3. Suggest relevant visualizations\\n4. Give me Python/Excel code to create the top 3 charts\\n5. What business insights can we draw?",
      "expected_output": "Statistical summary, pattern identification, visualization code, and business insights with actionable recommendations."
    }
  ]'::jsonb,
  ARRAY[
    'Completed data exploration in 30 minutes',
    'Generated at least 3 visualizations',
    'Identified actionable insights',
    'Created summary report'
  ],
  ARRAY[
    'Not validating AI calculations',
    'Using inappropriate visualizations',
    'Ignoring data quality issues',
    'Over-interpreting correlations'
  ],
  NULL,
  ARRAY[
    'Faster data analysis workflow',
    'Better visualization choices',
    'Deeper statistical understanding',
    'Actionable business insights'
  ],
  ARRAY[
    'How much time did you save?',
    'What insights would you have missed?',
    'Which visualizations were most effective?',
    'How will this change your analysis approach?'
  ],
  NULL
),
(
  'AI Writing Workshop',
  'Collaborate with AI to write and refine important documents.',
  25,
  'medium',
  'experiment',
  2,
  ARRAY['creative-professional', 'practical-adopter'],
  ARRAY['all'],
  'Master collaborative writing with AI - from initial drafts to polished documents. Learn the iterative refinement process.',
  ARRAY[
    'Create structured document outlines',
    'Generate compelling content',
    'Refine tone and style',
    'Maintain consistent voice'
  ],
  ARRAY['Document you need to write'],
  '[
    {
      "step": 1,
      "title": "Define Document Requirements",
      "description": "Clarify purpose, audience, key messages, tone, and success criteria.",
      "time_estimate": 5,
      "tips": ["Be specific about audience", "List must-have points", "Define desired outcome"]
    },
    {
      "step": 2,
      "title": "Create Structure",
      "description": "Work with AI to create a detailed outline with main points and supporting details.",
      "time_estimate": 5,
      "tips": ["Start with high-level sections", "Add bullet points for each section", "Ensure logical flow"]
    },
    {
      "step": 3,
      "title": "Generate Initial Draft",
      "description": "Have AI write each section based on your outline, reviewing as you go.",
      "time_estimate": 8,
      "tips": ["Work section by section", "Provide feedback immediately", "Keep your voice authentic"]
    },
    {
      "step": 4,
      "title": "Refine and Polish",
      "description": "Iterate with AI to improve clarity, impact, and readability.",
      "time_estimate": 7,
      "tips": ["Focus on one aspect at a time", "Read aloud to check flow", "Verify all facts and figures"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "Claude",
      "prompt": "I need to write a [document type] for [audience]. Purpose: [goal]. Key points to cover:\\n1. [point 1]\\n2. [point 2]\\n3. [point 3]\\n\\nTone: [formal/casual/persuasive]\\nLength: [word count]\\n\\nPlease create a detailed outline first, then we''ll work through each section.",
      "expected_output": "Structured outline followed by section-by-section collaborative drafting with your input."
    }
  ]'::jsonb,
  ARRAY[
    'Completed document in 25 minutes',
    'Clear structure and flow',
    'Consistent tone throughout',
    'All key points addressed'
  ],
  ARRAY[
    'Losing your unique voice',
    'Not fact-checking AI content',
    'Accepting first draft without iteration',
    'Ignoring audience needs'
  ],
  NULL,
  ARRAY[
    'Faster document creation',
    'Improved structure and clarity',
    'More persuasive writing',
    'Consistent quality'
  ],
  ARRAY[
    'How did collaboration improve the outcome?',
    'What would you do differently?',
    'Which sections benefited most from AI help?',
    'How will you apply this to future writing?'
  ],
  NULL
);

-- Phase 3: Mastery Activities (Days 61-90)

INSERT INTO activity_templates (
  title,
  description,
  duration_minutes,
  difficulty,
  type,
  phase,
  personas,
  work_types,
  overview,
  objectives,
  prerequisites,
  instructions,
  example_prompts,
  success_criteria,
  common_pitfalls,
  resources,
  expected_outcomes,
  reflection_questions,
  alternative_approaches
) VALUES 
(
  'Custom AI Workflow Builder',
  'Design and implement a complete AI-powered workflow for a real task.',
  45,
  'advanced',
  'challenge',
  3,
  ARRAY['tech-innovator', 'efficiency-seeker'],
  ARRAY['all'],
  'Create an end-to-end AI workflow that automates or enhances a significant part of your work. This is your graduation project.',
  ARRAY[
    'Identify workflow optimization opportunity',
    'Design multi-step AI integration',
    'Implement and test the workflow',
    'Measure efficiency gains'
  ],
  ARRAY['Completed Phase 2 activities', 'Repetitive task to optimize'],
  '[
    {
      "step": 1,
      "title": "Identify Workflow Opportunity",
      "description": "Choose a multi-step process you do regularly that could benefit from AI assistance.",
      "time_estimate": 10,
      "tips": ["Pick something you do weekly", "Should have 3-5 distinct steps", "Must have measurable outcomes"]
    },
    {
      "step": 2,
      "title": "Map Current Process",
      "description": "Document each step, time taken, pain points, and desired improvements.",
      "time_estimate": 10,
      "tips": ["Be specific about time per step", "Note decision points", "Identify repetitive elements"]
    },
    {
      "step": 3,
      "title": "Design AI Integration",
      "description": "Plan how AI will assist each step - automation, enhancement, or validation.",
      "time_estimate": 10,
      "tips": ["Define clear AI roles", "Create prompt templates", "Plan quality checks"]
    },
    {
      "step": 4,
      "title": "Build and Test",
      "description": "Implement your workflow with real data, refine prompts, and optimize the process.",
      "time_estimate": 10,
      "tips": ["Start with one step", "Test with edge cases", "Document what works"]
    },
    {
      "step": 5,
      "title": "Measure and Document",
      "description": "Compare before/after metrics, document the process, and share with team.",
      "time_estimate": 5,
      "tips": ["Track time saved", "Note quality improvements", "Create reusable templates"]
    }
  ]'::jsonb,
  '[
    {
      "tool": "ChatGPT",
      "prompt": "I want to create an AI workflow for [process name]. Current steps:\\n1. [step 1] - [time]\\n2. [step 2] - [time]\\n3. [step 3] - [time]\\n\\nPain points: [list]\\nDesired outcome: [goal]\\n\\nHelp me design an AI-enhanced workflow with specific prompts for each step.",
      "expected_output": "Complete workflow design with AI integration points, prompt templates, and implementation guide."
    }
  ]'::jsonb,
  ARRAY[
    'Complete workflow implemented',
    'At least 30% time reduction',
    'Quality maintained or improved',
    'Process documented for reuse'
  ],
  ARRAY[
    'Over-automating without quality checks',
    'Not testing edge cases',
    'Ignoring team adoption needs',
    'Focusing only on time savings'
  ],
  NULL,
  ARRAY[
    'Significant efficiency gain',
    'Reusable workflow template',
    'Deep AI integration skills',
    'Measurable ROI'
  ],
  ARRAY[
    'What was the biggest challenge?',
    'How will this scale to your team?',
    'What would you add with more time?',
    'What''s your next workflow target?'
  ],
  NULL
),
(
  'AI Team Trainer',
  'Teach a colleague to use AI effectively for their work.',
  30,
  'advanced',
  'share',
  3,
  ARRAY['all'],
  ARRAY['all'],
  'Share your AI expertise by training a colleague. Teaching others solidifies your own mastery and spreads AI adoption.',
  ARRAY[
    'Assess colleague''s needs and readiness',
    'Create personalized training plan',
    'Demonstrate practical applications',
    'Ensure successful first experience'
  ],
  ARRAY['Willing colleague', 'Your AI expertise from previous activities'],
  '[
    {
      "step": 1,
      "title": "Assess Their Needs",
      "description": "Interview your colleague about their work, challenges, and AI concerns.",
      "time_estimate": 7,
      "tips": ["Listen more than you talk", "Identify quick wins", "Address specific fears"]
    },
    {
      "step": 2,
      "title": "Choose First Use Case",
      "description": "Select a simple, relevant task they can complete successfully.",
      "time_estimate": 5,
      "tips": ["Pick something they do often", "Ensure clear value", "Keep it under 10 minutes"]
    },
    {
      "step": 3,
      "title": "Demonstrate and Guide",
      "description": "Show them the process, then guide them through doing it themselves.",
      "time_estimate": 10,
      "tips": ["Share your screen first", "Let them drive second", "Encourage questions"]
    },
    {
      "step": 4,
      "title": "Create Their Playbook",
      "description": "Document the process, prompts, and tips specifically for their use case.",
      "time_estimate": 5,
      "tips": ["Use their language", "Include screenshots", "Add troubleshooting tips"]
    },
    {
      "step": 5,
      "title": "Follow Up",
      "description": "Check in after a day to see how they''re doing and offer support.",
      "time_estimate": 3,
      "tips": ["Celebrate successes", "Address obstacles", "Suggest next steps"]
    }
  ]'::jsonb,
  NULL,
  ARRAY[
    'Colleague successfully uses AI independently',
    'Clear value demonstrated',
    'Playbook created and shared',
    'Follow-up support provided'
  ],
  ARRAY[
    'Being too technical',
    'Overwhelming with options',
    'Not addressing their specific needs',
    'Skipping hands-on practice'
  ],
  NULL,
  ARRAY[
    'Reinforced your own learning',
    'Spread AI adoption',
    'Built training skills',
    'Created teaching materials'
  ],
  ARRAY[
    'What did teaching reveal about your knowledge?',
    'How did their questions challenge you?',
    'What would you teach differently?',
    'Who else could benefit from training?'
  ],
  NULL
),
(
  'AI Strategy Summit',
  'Present AI opportunities and implementation plan to leadership.',
  40,
  'advanced',
  'share',
  3,
  ARRAY['tech-innovator', 'strategic-leader'],
  ARRAY['all'],
  'Synthesize your 90-day journey into strategic recommendations for broader AI adoption in your organization.',
  ARRAY[
    'Document measurable outcomes from your journey',
    'Identify organization-wide opportunities',
    'Create implementation roadmap',
    'Present compelling business case'
  ],
  ARRAY['Your 90-day journey data', 'Leadership access'],
  '[
    {
      "step": 1,
      "title": "Compile Your Results",
      "description": "Gather metrics from your AI journey - time saved, quality improvements, new capabilities.",
      "time_estimate": 10,
      "tips": ["Use specific numbers", "Include before/after examples", "Document lesson learned"]
    },
    {
      "step": 2,
      "title": "Identify Opportunities",
      "description": "Map AI potential across teams and processes based on your experience.",
      "time_estimate": 10,
      "tips": ["Focus on quick wins", "Estimate ROI", "Consider implementation complexity"]
    },
    {
      "step": 3,
      "title": "Create Presentation",
      "description": "Build a compelling deck with your story, results, and recommendations.",
      "time_estimate": 10,
      "tips": ["Lead with outcomes", "Use visuals", "Include live demo"]
    },
    {
      "step": 4,
      "title": "Present and Discuss",
      "description": "Share your insights, demonstrate value, and propose next steps.",
      "time_estimate": 10,
      "tips": ["Start with a success story", "Address concerns proactively", "Offer to lead pilot"]
    }
  ]'::jsonb,
  NULL,
  ARRAY[
    'Presentation completed',
    'Clear recommendations provided',
    'Leadership engagement achieved',
    'Next steps defined'
  ],
  ARRAY[
    'Being too technical',
    'Ignoring risks and concerns',
    'Over-promising outcomes',
    'Not having clear ask'
  ],
  NULL,
  ARRAY[
    'Leadership buy-in',
    'Clarity on AI strategy',
    'Positioned as AI champion',
    'Path to broader adoption'
  ],
  ARRAY[
    'What resonated most with leadership?',
    'What concerns need addressing?',
    'How can you support broader adoption?',
    'What''s your role going forward?'
  ],
  NULL
);

-- Note: Indexes were already created in the schema section above