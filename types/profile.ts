export interface Profile {
  id: string
  email: string
  full_name: string | null
  persona: string | null
  survey_answers: Record<string, any> | null
  preferences: ProfilePreferences | null
  created_at: string
  updated_at: string
}

export interface ProfilePreferences {
  emailNotifications: boolean
  calendarIntegration: boolean
  weeklyReports: boolean
  theme?: 'light' | 'dark' | 'system'
  timezone?: string
}

export interface Subscription {
  id?: string
  user_id: string
  plan: 'explorer' | 'accelerator' | 'team'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at?: string
  updated_at?: string
}

export interface UpdateProfileRequest {
  full_name?: string
  preferences?: ProfilePreferences
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface SurveyAnswer {
  question: string
  answer: string
  category: string
}

export interface PersonaInfo {
  title: string
  description: string
  strengths: string[]
  focusAreas: string[]
}