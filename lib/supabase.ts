import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  persona?: string
  work_type?: string
  engagement_frequency?: string
  survey_answers?: any
  persona_revealed_at?: string
  created_at: string
  updated_at: string
}

export interface ActivityTemplate {
  id: string
  title: string
  description: string
  duration_minutes: number
  difficulty: 'easy' | 'medium' | 'advanced'
  type: 'exercise' | 'experiment' | 'reflection' | 'challenge' | 'share'
  phase: 1 | 2 | 3
  personas: string[]
  work_types: string[]
  
  // Detailed content
  overview: string
  objectives: string[]
  prerequisites?: string[]
  
  // Step-by-step instructions
  instructions: {
    step: number
    title: string
    description: string
    time_estimate: number
    tips?: string[]
  }[]
  
  // AI prompts and examples
  example_prompts?: {
    tool: string
    prompt: string
    expected_output: string
  }[]
  
  // Success metrics
  success_criteria: string[]
  common_pitfalls: string[]
  
  // Resources
  resources?: {
    type: 'video' | 'article' | 'template' | 'tool'
    title: string
    url: string
    description?: string
  }[]
  
  // Outcomes and reflection
  expected_outcomes: string[]
  reflection_questions: string[]
  
  // Alternatives
  alternative_approaches?: {
    condition: string
    approach: string
  }[]
  
  created_at: string
  updated_at: string
}

export interface UserPlan {
  id: string
  user_id: string
  persona: string
  
  // Plan structure
  phase1_activities: string[] // Activity IDs
  phase2_activities: string[]
  phase3_activities: string[]
  
  // Customizations
  customizations?: {
    activity_id: string
    changes: any
  }[]
  
  // Schedule
  start_date: string
  engagement_frequency: string
  preferred_time?: string
  
  // Metadata
  generated_at: string
  last_modified: string
  version: number
}

export interface UserProgress {
  id: string
  user_id: string
  activity_id: string
  plan_id: string
  
  // Completion data
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  started_at?: string
  completed_at?: string
  time_spent_minutes?: number
  
  // User feedback
  difficulty_rating?: 1 | 2 | 3 | 4 | 5
  usefulness_rating?: 1 | 2 | 3 | 4 | 5
  notes?: string
  
  // Outcomes
  outcomes_achieved?: string[]
  reflection_answers?: { question: string; answer: string }[]
  
  // Metrics
  metrics?: {
    time_saved_minutes?: number
    quality_improvement?: string
    confidence_boost?: number
  }
  
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  user_id: string
  type: 'week1' | 'day30' | 'day60' | 'day90' | 'custom'
  title: string
  description: string
  achieved_at: string
  metrics?: any
}

export interface CalendarEvent {
  id: string
  user_id: string
  activity_id?: string
  plan_id?: string
  title: string
  description?: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  reminder_sent?: boolean
  reminder_time?: string
  created_at: string
  updated_at: string
}