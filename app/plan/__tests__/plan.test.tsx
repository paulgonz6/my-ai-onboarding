import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PlanPage from '../page'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/contexts/AuthContext'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/plan'),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}))

// Mock AuthContext
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock AppNav to avoid navigation issues in tests
jest.mock('@/app/components/AppNav', () => {
  return function MockAppNav() {
    return <div data-testid="app-nav">Mock Navigation</div>
  }
})

// Mock modals
jest.mock('@/app/components/AuthModal', () => {
  return function MockAuthModal() {
    return null
  }
})

jest.mock('@/app/components/AccountabilityModal', () => {
  return function MockAccountabilityModal() {
    return null
  }
})

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Plan Page - Persona Reveal', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockProfile = {
    id: 'test-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    persona: 'cautious-explorer',
    survey_answers: {
      'work-type': 'creative',
      'engagement-frequency': 'daily',
      'time-wasters': ['meetings'],
      'success-metric': 'efficiency',
    },
    persona_revealed_at: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-123', email: 'test@example.com' },
      profile: null,
      loading: false,
    })
    localStorage.clear()
  })

  describe('First-time user (persona not revealed)', () => {
    it('should show persona reveal for authenticated user on first visit', async () => {
      // Mock authenticated user with no persona_revealed_at
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null,
      })

      const selectMock = jest.fn().mockReturnThis()
      const eqMock = jest.fn().mockReturnThis()
      const singleMock = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      })
      const updateMock = jest.fn().mockReturnThis()
      const updateEqMock = jest.fn().mockResolvedValue({
        data: { ...mockProfile, persona_revealed_at: new Date().toISOString() },
        error: null,
      })

      ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: selectMock,
            eq: eqMock,
            single: singleMock,
            update: updateMock,
          }
        }
        return {}
      })

      selectMock.mockReturnValue({ eq: eqMock })
      eqMock.mockReturnValue({ single: singleMock })
      updateMock.mockReturnValue({ eq: updateEqMock })

      render(<PlanPage />)

      // Wait for the persona reveal to appear
      await waitFor(() => {
        expect(screen.getByText('The Cautious Explorer')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Check that persona_revealed_at was updated
      await waitFor(() => {
        expect(updateMock).toHaveBeenCalledWith({
          persona_revealed_at: expect.any(String),
        })
      })

      // Click continue to plan
      const continueButton = screen.getByText('View My Full Plan')
      fireEvent.click(continueButton)

      // Should now show the plan
      await waitFor(() => {
        expect(screen.getByText('Your 90-Day AI Journey')).toBeInTheDocument()
      })
    })
  })

  describe('Returning user (persona already revealed)', () => {
    it('should skip persona reveal and go directly to plan', async () => {
      // Mock authenticated user with persona_revealed_at set
      const profileWithReveal = {
        ...mockProfile,
        persona_revealed_at: '2024-01-01T00:00:00Z',
      }

      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null,
      })

      const selectMock = jest.fn().mockReturnThis()
      const eqMock = jest.fn().mockReturnThis()
      const singleMock = jest.fn().mockResolvedValue({
        data: profileWithReveal,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: selectMock,
            eq: eqMock,
            single: singleMock,
          }
        }
        return {}
      })

      selectMock.mockReturnValue({ eq: eqMock })
      eqMock.mockReturnValue({ single: singleMock })

      render(<PlanPage />)

      // Should NOT show persona reveal
      await waitFor(() => {
        expect(screen.queryByText('The Cautious Explorer')).not.toBeInTheDocument()
      })

      // Should show plan directly
      await waitFor(() => {
        expect(screen.getByText('Your 90-Day AI Journey')).toBeInTheDocument()
      }, { timeout: 5000 })
    })
  })

  describe('New user completing survey (not authenticated)', () => {
    it('should show loading animation and persona reveal for new users', async () => {
      // Mock unauthenticated user with localStorage data
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      })

      localStorage.setItem('surveyAnswers', JSON.stringify({
        'work-type': 'creative',
        'engagement-frequency': 'daily',
      }))
      localStorage.setItem('userPersona', 'eager-beginner')

      render(<PlanPage />)

      // Should show loading animation
      await waitFor(() => {
        expect(screen.getByText(/Analyzing your responses/i)).toBeInTheDocument()
      })

      // Should eventually show persona reveal
      await waitFor(() => {
        expect(screen.getByText('The Eager Beginner')).toBeInTheDocument()
      }, { timeout: 5000 })
    })
  })

  describe('Survey data persistence', () => {
    it('should preserve survey data when saving to profile', async () => {
      const surveyData = {
        'work-type': 'creative',
        'daily-time': 'meetings',
        'ai-experience': 'none',
        'biggest-challenge': 'time',
        'ai-tools': 'chatgpt',
        'learning-style': 'doing',
        'success-metric': 'efficiency',
        'time-commitment': '30min',
        'engagement-frequency': 'daily',
        'team-size': 'small',
        'industry': 'technology',
        'primary-goal': 'automate',
      }

      // Set up initial localStorage data
      localStorage.setItem('surveyAnswers', JSON.stringify(surveyData))
      localStorage.setItem('userPersona', 'practical-adopter')

      // Mock unauthenticated initially
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      })

      render(<PlanPage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/Analyzing your responses/i)).toBeInTheDocument()
      })

      // Verify localStorage wasn't cleared prematurely
      expect(localStorage.getItem('surveyAnswers')).toBeTruthy()
      expect(localStorage.getItem('userPersona')).toBeTruthy()
    })

    it('should clear localStorage after loading from profile', async () => {
      // Set some localStorage data
      localStorage.setItem('surveyAnswers', JSON.stringify({ test: 'data' }))
      localStorage.setItem('userPersona', 'test-persona')

      // Mock authenticated user with profile data
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null,
      })

      const selectMock = jest.fn().mockReturnThis()
      const eqMock = jest.fn().mockReturnThis()
      const singleMock = jest.fn().mockResolvedValue({
        data: {
          ...mockProfile,
          persona_revealed_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      })

      ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: selectMock,
            eq: eqMock,
            single: singleMock,
          }
        }
        return {}
      })

      selectMock.mockReturnValue({ eq: eqMock })
      eqMock.mockReturnValue({ single: singleMock })

      render(<PlanPage />)

      // Wait for profile to load
      await waitFor(() => {
        expect(screen.getByText('Your 90-Day AI Journey')).toBeInTheDocument()
      })

      // localStorage should be cleared
      expect(localStorage.getItem('surveyAnswers')).toBeNull()
      expect(localStorage.getItem('userPersona')).toBeNull()
    })
  })
})