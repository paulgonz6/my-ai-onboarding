import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthModal from '../AuthModal'
import { supabase } from '@/lib/supabase'
import { saveSurveyWithRetry, verifySurveyAnswers } from '@/lib/profile-helpers'

// Mock the profile helpers
jest.mock('@/lib/profile-helpers', () => ({
  saveSurveyWithRetry: jest.fn(),
  verifySurveyAnswers: jest.fn()
}))

describe('AuthModal - Survey Data Saving', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()
  
  const mockSurveyData = {
    answers: {
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
      'primary-goal': 'automate'
    },
    persona: 'early-adopter'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    
    // Set up localStorage with survey data
    localStorage.setItem('surveyAnswers', JSON.stringify(mockSurveyData.answers))
    localStorage.setItem('userPersona', mockSurveyData.persona)
  })

  describe('Account Creation with Survey Data', () => {
    test('successfully saves survey data when creating account', async () => {
      // Mock successful signup
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { 
          user: { 
            id: 'test-user-123', 
            email: 'test@example.com' 
          },
          session: { access_token: 'test-token' }
        },
        error: null
      })

      // Mock successful sign in
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'test-user-123', email: 'test@example.com' },
          session: { access_token: 'test-token' }
        },
        error: null
      })

      // Mock successful session check
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'test-token', user: { id: 'test-user-123' } } },
        error: null
      })

      // Mock successful profile save
      (saveSurveyWithRetry as jest.Mock).mockResolvedValue({
        id: 'test-user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        survey_answers: mockSurveyData.answers,
        persona: mockSurveyData.persona
      })

      // Mock successful verification
      (verifySurveyAnswers as jest.Mock).mockResolvedValue({
        survey_answers: mockSurveyData.answers,
        persona: mockSurveyData.persona
      })

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess}
          surveyData={mockSurveyData}
        />
      )

      // Fill in the form
      fireEvent.change(screen.getByPlaceholderText('John Doe'), {
        target: { value: 'Test User' }
      })
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'TestPassword123!' }
      })

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create account/i })
      fireEvent.click(submitButton)

      // Wait for async operations
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'TestPassword123!',
          options: {
            emailRedirectTo: undefined,
            data: {
              full_name: 'Test User',
              survey_completed: true
            }
          }
        })
      })

      // Verify sign in was called to establish session
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
      })

      // Verify survey data was saved with retry logic
      await waitFor(() => {
        expect(saveSurveyWithRetry).toHaveBeenCalledWith(
          'test-user-123',
          mockSurveyData.answers,
          mockSurveyData.persona,
          'Test User',
          3
        )
      })

      // Verify the verification step
      await waitFor(() => {
        expect(verifySurveyAnswers).toHaveBeenCalledWith('test-user-123')
      })

      // Verify success callback
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('test-user-123')
      })
    })

    test('handles survey data saving failure gracefully', async () => {
      // Mock successful signup but failed profile save
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null
      })

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-123' }, session: {} },
        error: null
      })

      // Mock profile save failure
      (saveSurveyWithRetry as jest.Mock).mockRejectedValue(
        new Error('Failed to save survey data')
      )

      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess}
          surveyData={mockSurveyData}
        />
      )

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText('John Doe'), {
        target: { value: 'Test User' }
      })
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'TestPassword123!' }
      })

      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      // Should still call success even if profile save fails
      // (user account is created, they can update profile later)
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('test-user-123')
      })
    })

    test('uses localStorage data when props are missing', async () => {
      // Render without survey data props
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess}
          surveyData={null}
        />
      )

      // Mock successful signup
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-123' } },
        error: null
      })

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: {} },
        error: null
      })

      (saveSurveyWithRetry as jest.Mock).mockResolvedValue({})

      // Submit form
      fireEvent.change(screen.getByPlaceholderText('John Doe'), {
        target: { value: 'Test User' }
      })
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'TestPassword123!' }
      })

      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      // Should use localStorage data
      await waitFor(() => {
        expect(saveSurveyWithRetry).toHaveBeenCalledWith(
          'test-user-123',
          mockSurveyData.answers, // From localStorage
          mockSurveyData.persona,  // From localStorage
          'Test User',
          3
        )
      })
    })
  })

  describe('Login Mode', () => {
    test('updates profile with survey data on login if available', async () => {
      // Switch to login mode
      render(
        <AuthModal 
          isOpen={true} 
          onClose={mockOnClose} 
          onSuccess={mockOnSuccess}
          surveyData={mockSurveyData}
        />
      )

      // Click "Sign in instead"
      fireEvent.click(screen.getByText(/sign in instead/i))

      // Mock successful login
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'existing-user-123', email: 'existing@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      })

      // Mock profile update
      const fromMock = jest.fn().mockReturnValue({
        upsert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      })
      ;(supabase.from as jest.Mock) = fromMock

      // Fill login form
      fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
        target: { value: 'existing@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), {
        target: { value: 'ExistingPassword123!' }
      })

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      // Should update profile with survey data
      await waitFor(() => {
        expect(fromMock).toHaveBeenCalledWith('profiles')
      })
    })
  })
})