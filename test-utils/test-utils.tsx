import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/app/contexts/AuthContext'

// Mock Supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: require('./supabase-mock').createMockSupabaseClient(),
  Profile: {},
}))

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authProviderProps?: any
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
  }
}

// Survey test helpers
export const mockSurveyData = {
  answers: {
    'work-type': 'technical',
    'daily-time': 'deep-work',
    'time-wasters': ['writing', 'data'],
    'ai-experience': 'occasionally',
    'ai-tools': ['chatgpt'],
    'learning-style': 'visual',
    'time-commitment': '30-60',
    'biggest-challenge': 'prompting',
    'success-metrics': ['productivity'],
    'accountability': 'weekly',
    'start-date': 'immediately',
  },
  currentQuestion: 'work-type',
  visitedQuestions: ['welcome', 'work-type'],
}

export const fillSurveyQuestion = async (
  getByRole: any,
  getByText: any,
  questionId: string,
  answer: string | string[]
) => {
  // Implementation will vary based on question type
  if (Array.isArray(answer)) {
    // Multi-choice question
    for (const option of answer) {
      const checkbox = getByRole('checkbox', { name: new RegExp(option, 'i') })
      checkbox.click()
    }
  } else {
    // Single-choice question
    const radio = getByRole('radio', { name: new RegExp(answer, 'i') })
    radio.click()
  }
}

// Authentication test helpers
export const fillSignUpForm = (getByLabelText: any, userData: any) => {
  const emailInput = getByLabelText(/email/i)
  const passwordInput = getByLabelText(/password/i)
  const nameInput = getByLabelText(/full name/i)
  
  emailInput.value = userData.email
  passwordInput.value = userData.password
  if (nameInput) nameInput.value = userData.fullName
}

export const fillSignInForm = (getByLabelText: any, credentials: any) => {
  const emailInput = getByLabelText(/email/i)
  const passwordInput = getByLabelText(/password/i)
  
  emailInput.value = credentials.email
  passwordInput.value = credentials.password
}

// Profile test helpers
export const mockProfileData = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  company: 'Test Company',
  job_title: 'Software Engineer',
  department: 'Engineering',
  team_size: '10-50',
  industry: 'Technology',
  onboarding_completed: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Timeline test helpers
export const mockTimelineData = {
  currentPhase: 1,
  currentDay: 15,
  progress: 16.67,
  activities: [
    {
      id: '1',
      title: 'Set up AI workspace',
      description: 'Configure your first AI tool',
      completed: true,
      phase: 1,
      day: 1,
    },
    {
      id: '2',
      title: 'Learn basic prompting',
      description: 'Master the fundamentals of AI prompting',
      completed: true,
      phase: 1,
      day: 5,
    },
    {
      id: '3',
      title: 'Build your first automation',
      description: 'Create a simple AI-powered workflow',
      completed: false,
      phase: 1,
      day: 15,
    },
  ],
}

// Error simulation helpers
export const simulateNetworkError = () => {
  return new Error('Network request failed')
}

export const simulateRLSError = () => {
  return {
    message: 'new row violates row-level security policy',
    code: '42501',
    details: 'Failing row contains...',
  }
}

export const simulateAuthError = () => {
  return {
    message: 'Invalid login credentials',
    status: 400,
  }
}