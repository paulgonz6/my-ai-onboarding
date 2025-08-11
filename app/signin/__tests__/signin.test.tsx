import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import SignInPage from '../page'
import { supabase } from '@/lib/supabase'
import '@testing-library/jest-dom'

// Mock the modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('SignIn Page - Routing Logic', () => {
  const mockPush = jest.fn()
  const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock
  const mockFrom = supabase.from as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })


  describe('Returning user (has completed survey)', () => {
    it('should always redirect to /timeline page for users with completed surveys', async () => {
      const mockUser = { id: 'test-user-123', email: 'test@example.com' }
      const mockProfile = {
        id: 'test-user-123',
        email: 'test@example.com',
        survey_answers: { 'work-type': 'creative' },
        persona: 'eager-beginner',
        persona_revealed_at: '2024-01-01T00:00:00Z', // Has seen persona
      }

      // Mock successful sign in
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock profile fetch
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(<SignInPage />)

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/timeline')
      })

      expect(mockPush).not.toHaveBeenCalledWith('/plan')
    })

    it('should redirect to /timeline even if persona_revealed_at is null', async () => {
      const mockUser = { id: 'test-user-123', email: 'test@example.com' }
      const mockProfile = {
        id: 'test-user-123',
        email: 'test@example.com',
        survey_answers: { 'work-type': 'creative' },
        persona: 'eager-beginner',
        persona_revealed_at: null, // Never seen persona, but still go to timeline
      }

      // Mock successful sign in
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock profile fetch
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(<SignInPage />)

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/timeline')
      })

      expect(mockPush).not.toHaveBeenCalledWith('/plan')
    })
  })

  describe('User without survey data', () => {
    it('should redirect to /survey page', async () => {
      const mockUser = { id: 'test-user-123', email: 'test@example.com' }
      const mockProfile = {
        id: 'test-user-123',
        email: 'test@example.com',
        survey_answers: null, // No survey data
        persona: null,
        persona_revealed_at: null,
      }

      // Mock successful sign in
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock profile fetch
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })

      render(<SignInPage />)

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/survey')
      })

      expect(mockPush).not.toHaveBeenCalledWith('/plan')
      expect(mockPush).not.toHaveBeenCalledWith('/timeline')
    })
  })

  describe('Authentication errors', () => {
    it('should display error message on invalid credentials', async () => {
      // Mock failed sign in
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      render(<SignInPage />)

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should display error message for unconfirmed email', async () => {
      // Mock email not confirmed error
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      })

      render(<SignInPage />)

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Please check your email and confirm your account/i)).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})