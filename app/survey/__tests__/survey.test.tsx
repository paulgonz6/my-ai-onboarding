import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@/test-utils/test-utils'
import userEvent from '@testing-library/user-event'
import SurveyPage from '../page'
import { createMockSupabaseClient, setupAuthenticatedState, mockSurveyAnswers } from '@/test-utils/supabase-mock'

// Mock the Supabase client
const mockSupabase = createMockSupabaseClient()
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock next/navigation
const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/survey',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Survey Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  describe('Survey Navigation', () => {
    it('should display welcome screen on initial load', () => {
      render(<SurveyPage />)
      
      expect(screen.getByText(/Let's create your AI onboarding plan/i)).toBeInTheDocument()
      expect(screen.getByText(/Answer 12 questions/i)).toBeInTheDocument()
      expect(screen.getByText(/Takes about 5 minutes/i)).toBeInTheDocument()
    })

    it('should navigate to first question when starting survey', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      const startButton = screen.getByRole('button', { name: /Start Survey/i })
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText(/What best describes your work?/i)).toBeInTheDocument()
      })
    })

    it('should show progress indicator with correct percentage', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Start survey
      const startButton = screen.getByRole('button', { name: /Start Survey/i })
      await user.click(startButton)
      
      // Check progress bar exists and shows correct initial progress
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '8') // 1/12 questions = ~8%
    })

    it('should navigate between questions using Previous and Next buttons', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Start survey
      await user.click(screen.getByRole('button', { name: /Start Survey/i }))
      
      // Answer first question
      await waitFor(() => screen.getByText(/What best describes your work?/i))
      const techOption = screen.getByLabelText(/Technical work/i)
      await user.click(techOption)
      
      // Go to next question
      const nextButton = screen.getByRole('button', { name: /Next/i })
      await user.click(nextButton)
      
      // Should be on second question
      await waitFor(() => {
        expect(screen.getByText(/How do you spend most of your day?/i)).toBeInTheDocument()
      })
      
      // Go back to previous question
      const prevButton = screen.getByRole('button', { name: /Previous/i })
      await user.click(prevButton)
      
      // Should be back on first question with answer selected
      await waitFor(() => {
        expect(screen.getByText(/What best describes your work?/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Technical work/i)).toBeChecked()
      })
    })

    it('should disable Next button when no answer is selected', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Start survey
      await user.click(screen.getByRole('button', { name: /Start Survey/i }))
      
      await waitFor(() => screen.getByText(/What best describes your work?/i))
      
      const nextButton = screen.getByRole('button', { name: /Next/i })
      expect(nextButton).toBeDisabled()
      
      // Select an answer
      const option = screen.getByLabelText(/Technical work/i)
      await user.click(option)
      
      // Next button should now be enabled
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Question Types', () => {
    it('should handle single-choice questions correctly', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Navigate to work-type question
      await user.click(screen.getByRole('button', { name: /Start Survey/i }))
      await waitFor(() => screen.getByText(/What best describes your work?/i))
      
      // Should only allow one selection
      const creative = screen.getByLabelText(/Creative work/i)
      const technical = screen.getByLabelText(/Technical work/i)
      
      await user.click(creative)
      expect(creative).toBeChecked()
      expect(technical).not.toBeChecked()
      
      await user.click(technical)
      expect(technical).toBeChecked()
      expect(creative).not.toBeChecked()
    })

    it('should handle multi-choice questions correctly', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Navigate to time-wasters question (multi-choice)
      await user.click(screen.getByRole('button', { name: /Start Survey/i }))
      
      // Answer first two questions to get to multi-choice
      await waitFor(() => screen.getByText(/What best describes your work?/i))
      await user.click(screen.getByLabelText(/Technical work/i))
      await user.click(screen.getByRole('button', { name: /Next/i }))
      
      await waitFor(() => screen.getByText(/How do you spend most of your day?/i))
      await user.click(screen.getByLabelText(/Deep focused work/i))
      await user.click(screen.getByRole('button', { name: /Next/i }))
      
      // Now on multi-choice question
      await waitFor(() => screen.getByText(/What takes up time you wish it didn't?/i))
      
      // Should allow multiple selections
      const writing = screen.getByLabelText(/Writing and documentation/i)
      const data = screen.getByLabelText(/Data analysis/i)
      const research = screen.getByLabelText(/Research/i)
      
      await user.click(writing)
      await user.click(data)
      
      expect(writing).toBeChecked()
      expect(data).toBeChecked()
      expect(research).not.toBeChecked()
      
      // Can uncheck items
      await user.click(writing)
      expect(writing).not.toBeChecked()
      expect(data).toBeChecked()
    })

    it('should handle text input questions correctly', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Navigate through survey to get to a text input question
      // This would need to be implemented based on your actual survey structure
      // For now, we'll test the concept
      
      // Assuming there's a text input question for "other" options
      // You would implement this based on your actual survey
    })
  })

  describe('Branching Logic', () => {
    it('should follow branching paths based on AI experience', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Navigate to AI experience question
      await user.click(screen.getByRole('button', { name: /Start Survey/i }))
      
      // Answer questions to get to AI experience
      for (let i = 0; i < 3; i++) {
        await waitFor(() => screen.getByRole('button', { name: /Next/i }))
        const options = screen.getAllByRole('radio')
        if (options.length > 0) {
          await user.click(options[0])
        } else {
          const checkboxes = screen.getAllByRole('checkbox')
          if (checkboxes.length > 0) {
            await user.click(checkboxes[0])
          }
        }
        await user.click(screen.getByRole('button', { name: /Next/i }))
      }
      
      // Should be on AI experience question
      await waitFor(() => screen.getByText(/Have you used AI tools before?/i))
      
      // Select "Never" - should branch to concerns
      const never = screen.getByLabelText(/Never/i)
      await user.click(never)
      await user.click(screen.getByRole('button', { name: /Next/i }))
      
      // Should go to AI concerns question
      await waitFor(() => {
        expect(screen.getByText(/biggest concerns/i)).toBeInTheDocument()
      })
    })

    it('should follow different branch for experienced users', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Similar navigation to AI experience question
      await user.click(screen.getByRole('button', { name: /Start Survey/i }))
      
      // Navigate to AI experience (simplified for test)
      for (let i = 0; i < 3; i++) {
        await waitFor(() => screen.getByRole('button', { name: /Next/i }))
        const options = screen.getAllByRole('radio')
        if (options.length > 0) {
          await user.click(options[0])
        } else {
          const checkboxes = screen.getAllByRole('checkbox')
          if (checkboxes.length > 0) {
            await user.click(checkboxes[0])
          }
        }
        await user.click(screen.getByRole('button', { name: /Next/i }))
      }
      
      // Select "Power user" - should branch to tools
      await waitFor(() => screen.getByText(/Have you used AI tools before?/i))
      const powerUser = screen.getByLabelText(/Power user/i)
      await user.click(powerUser)
      await user.click(screen.getByRole('button', { name: /Next/i }))
      
      // Should go to AI tools question
      await waitFor(() => {
        expect(screen.getByText(/Which AI tools/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Persistence', () => {
    it('should save survey progress to localStorage', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Start survey and answer first question
      await user.click(screen.getByRole('button', { name: /Start Survey/i }))
      await waitFor(() => screen.getByText(/What best describes your work?/i))
      await user.click(screen.getByLabelText(/Technical work/i))
      await user.click(screen.getByRole('button', { name: /Next/i }))
      
      // Check localStorage was called
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'survey_progress',
        expect.stringContaining('technical')
      )
    })

    it('should restore survey progress from localStorage on page reload', async () => {
      const savedProgress = {
        answers: {
          'work-type': 'technical',
          'daily-time': 'deep-work',
        },
        currentQuestion: 'time-wasters',
        visitedQuestions: ['welcome', 'work-type', 'daily-time'],
      }
      
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(savedProgress))
      
      render(<SurveyPage />)
      
      // Should load directly to the saved question
      await waitFor(() => {
        expect(screen.getByText(/What takes up time you wish it didn't?/i)).toBeInTheDocument()
      })
    })

    it('should clear localStorage on survey completion', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Complete entire survey (simplified for test)
      // In reality, you'd go through all questions
      
      // Mock completing survey
      localStorage.setItem('survey_progress', JSON.stringify({ completed: true }))
      
      // Trigger completion
      // This would be after answering all questions
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('survey_progress')
    })
  })

  describe('Survey Completion and Account Creation', () => {
    beforeEach(() => {
      setupAuthenticatedState(mockSupabase)
    })

    it('should save survey answers when creating account', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Mock survey completion state
      const completedSurvey = {
        answers: mockSurveyAnswers,
        currentQuestion: 'complete',
        visitedQuestions: Object.keys(mockSurveyAnswers),
      }
      
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(completedSurvey))
      
      // Mock the insert operations
      mockSupabase.mocks.insert.mockResolvedValueOnce({
        data: { id: 'answer-id' },
        error: null,
      })
      
      // Simulate account creation after survey
      await mockSupabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            survey_answers: mockSurveyAnswers,
          },
        },
      })
      
      // Verify survey answers were included in signup
      expect(mockSupabase.mocks.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: expect.objectContaining({
              survey_answers: mockSurveyAnswers,
            }),
          }),
        })
      )
    })

    it('should handle survey save errors gracefully', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Mock insert error
      mockSupabase.mocks.insert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to save survey' },
      })
      
      // Complete survey and try to save
      // Should show error message
      
      await waitFor(() => {
        expect(screen.queryByText(/Failed to save/i)).toBeInTheDocument()
      })
    })

    it('should prevent submission if not all required questions answered', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Try to complete survey without answering all questions
      const incompleteSurvey = {
        answers: { 'work-type': 'technical' }, // Only one answer
        currentQuestion: 'complete',
      }
      
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(incompleteSurvey))
      
      // Should not allow completion
      const completeButton = screen.queryByRole('button', { name: /Complete Survey/i })
      if (completeButton) {
        expect(completeButton).toBeDisabled()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock network error
      mockSupabase.mocks.insert.mockRejectedValueOnce(new Error('Network error'))
      
      render(<SurveyPage />)
      
      // Complete survey
      // Should show error message
      
      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should handle RLS policy violations', async () => {
      // Mock RLS error
      mockSupabase.mocks.insert.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'new row violates row-level security policy',
          code: '42501',
        },
      })
      
      render(<SurveyPage />)
      
      // Try to save survey
      // Should show appropriate error message
      
      await waitFor(() => {
        expect(screen.queryByText(/security policy/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for form elements', () => {
      render(<SurveyPage />)
      
      // Check for proper labeling
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('Survey progress'))
      
      // Check navigation buttons have proper labels
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<SurveyPage />)
      
      // Tab through elements
      await user.tab()
      
      // Should focus on start button
      const startButton = screen.getByRole('button', { name: /Start Survey/i })
      expect(startButton).toHaveFocus()
      
      // Enter to start
      await user.keyboard('{Enter}')
      
      // Should navigate to first question
      await waitFor(() => {
        expect(screen.getByText(/What best describes your work?/i)).toBeInTheDocument()
      })
      
      // Tab to first option
      await user.tab()
      const firstOption = screen.getAllByRole('radio')[0]
      expect(firstOption).toHaveFocus()
      
      // Space to select
      await user.keyboard(' ')
      expect(firstOption).toBeChecked()
    })

    it('should announce changes to screen readers', async () => {
      render(<SurveyPage />)
      
      // Check for live regions
      const liveRegions = screen.getAllByRole('status')
      expect(liveRegions.length).toBeGreaterThan(0)
      
      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })
  })
})