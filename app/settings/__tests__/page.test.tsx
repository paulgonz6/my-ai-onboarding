import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import Settings from '../page'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Mock dependencies
jest.mock('@/app/contexts/AuthContext')
jest.mock('next/navigation')
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock ProtectedRoute to render children directly
jest.mock('@/app/components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Save: () => <div data-testid="save-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}))

describe('Settings Page', () => {
  const mockBack = jest.fn()
  const mockRefreshProfile = jest.fn()
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockProfile = {
    full_name: 'John Doe',
    email: 'test@example.com',
    engagement_frequency: 'daily',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ back: mockBack })
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      refreshProfile: mockRefreshProfile,
    })
  })

  describe('Rendering', () => {
    it('renders settings page without crashing', () => {
      render(<Settings />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Manage your account and preferences')).toBeInTheDocument()
    })

    it('renders back button', () => {
      render(<Settings />)
      const backButton = screen.getByRole('button', { name: /back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('renders profile section', () => {
      render(<Settings />)
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('renders engagement preferences section', () => {
      render(<Settings />)
      expect(screen.getByText('Engagement Preferences')).toBeInTheDocument()
      expect(screen.getByLabelText(/engagement frequency/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/preferred time/i)).toBeInTheDocument()
    })

    it('renders notifications section', () => {
      render(<Settings />)
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/progress reminders/i)).toBeInTheDocument()
    })

    it('renders save button', () => {
      render(<Settings />)
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Form Pre-filling', () => {
    it('pre-fills form with profile data', () => {
      render(<Settings />)
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
      const frequencySelect = screen.getByLabelText(/engagement frequency/i) as HTMLSelectElement
      
      expect(nameInput.value).toBe('John Doe')
      expect(emailInput.value).toBe('test@example.com')
      expect(frequencySelect.value).toBe('daily')
    })

    it('uses user email when profile email is not available', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: { ...mockProfile, email: null },
        refreshProfile: mockRefreshProfile,
      })
      
      render(<Settings />)
      
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
      expect(emailInput.value).toBe('test@example.com')
    })

    it('handles missing profile data', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: null,
        refreshProfile: mockRefreshProfile,
      })
      
      render(<Settings />)
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
      
      expect(nameInput.value).toBe('')
      expect(emailInput.value).toBe('test@example.com')
    })
  })

  describe('Form Interactions', () => {
    it('updates full name when typed', () => {
      render(<Settings />)
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })
      
      expect(nameInput.value).toBe('Jane Smith')
    })

    it('updates email when typed', () => {
      render(<Settings />)
      
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
      
      expect(emailInput.value).toBe('new@example.com')
    })

    it('updates engagement frequency when selected', () => {
      render(<Settings />)
      
      const frequencySelect = screen.getByLabelText(/engagement frequency/i) as HTMLSelectElement
      fireEvent.change(frequencySelect, { target: { value: 'weekly' } })
      
      expect(frequencySelect.value).toBe('weekly')
    })

    it('updates preferred time when selected', () => {
      render(<Settings />)
      
      const timeSelect = screen.getByLabelText(/preferred time/i) as HTMLSelectElement
      fireEvent.change(timeSelect, { target: { value: 'morning' } })
      
      expect(timeSelect.value).toBe('morning')
    })

    it('toggles email notifications checkbox', () => {
      render(<Settings />)
      
      const emailCheckbox = screen.getByLabelText(/email notifications/i) as HTMLInputElement
      expect(emailCheckbox.checked).toBe(true)
      
      fireEvent.click(emailCheckbox)
      expect(emailCheckbox.checked).toBe(false)
      
      fireEvent.click(emailCheckbox)
      expect(emailCheckbox.checked).toBe(true)
    })

    it('toggles progress reminders checkbox', () => {
      render(<Settings />)
      
      const remindersCheckbox = screen.getByLabelText(/progress reminders/i) as HTMLInputElement
      expect(remindersCheckbox.checked).toBe(true)
      
      fireEvent.click(remindersCheckbox)
      expect(remindersCheckbox.checked).toBe(false)
    })
  })

  describe('Save Functionality', () => {
    it('saves settings when save button is clicked', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
      
      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('profiles')
        expect(mockFrom.update).toHaveBeenCalledWith({
          full_name: 'John Doe',
          engagement_frequency: 'daily',
        })
        expect(mockFrom.eq).toHaveBeenCalledWith('id', 'user-123')
      })
    })

    it('shows loading state while saving', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))),
      }
      
      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      expect(screen.getByText(/saving/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText(/saving/i)).not.toBeInTheDocument()
      })
    })

    it('shows success message after saving', async () => {
      jest.useFakeTimers()
      
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
      
      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument()
      })
      
      // Success message should disappear after 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      
      await waitFor(() => {
        expect(screen.queryByText(/saved/i)).not.toBeInTheDocument()
      })
      
      jest.useRealTimers()
    })

    it('refreshes profile after successful save', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
      
      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockRefreshProfile).toHaveBeenCalled()
      })
    })

    it('handles save error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation()
      
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: new Error('Save failed') }),
      }
      
      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(screen.queryByText(/saved/i)).not.toBeInTheDocument()
        expect(consoleError).toHaveBeenCalledWith('Error saving settings:', expect.any(Error))
      })
      
      consoleError.mockRestore()
    })

    it('does not save when user is not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        profile: mockProfile,
        refreshProfile: mockRefreshProfile,
      })
      
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(supabase.from).not.toHaveBeenCalled()
      })
    })

    it('saves with updated form data', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }
      
      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      
      render(<Settings />)
      
      // Update form fields
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      const frequencySelect = screen.getByLabelText(/engagement frequency/i) as HTMLSelectElement
      
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
      fireEvent.change(frequencySelect, { target: { value: 'weekly' } })
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)
      
      await waitFor(() => {
        expect(mockFrom.update).toHaveBeenCalledWith({
          full_name: 'Updated Name',
          engagement_frequency: 'weekly',
        })
      })
    })
  })

  describe('Navigation', () => {
    it('navigates back when back button is clicked', () => {
      render(<Settings />)
      
      const backButton = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backButton)
      
      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('Engagement Frequency Options', () => {
    it('renders all frequency options', () => {
      render(<Settings />)
      
      const frequencySelect = screen.getByLabelText(/engagement frequency/i) as HTMLSelectElement
      const options = Array.from(frequencySelect.options).map(option => option.value)
      
      expect(options).toContain('daily')
      expect(options).toContain('weekly')
      expect(options).toContain('biweekly')
      expect(options).toContain('monthly')
    })
  })

  describe('Preferred Time Options', () => {
    it('renders all time options', () => {
      render(<Settings />)
      
      const timeSelect = screen.getByLabelText(/preferred time/i) as HTMLSelectElement
      const options = Array.from(timeSelect.options).map(option => option.value)
      
      expect(options).toContain('')
      expect(options).toContain('morning')
      expect(options).toContain('afternoon')
      expect(options).toContain('evening')
    })
  })

  describe('Email Field', () => {
    it('disables email field', () => {
      render(<Settings />)
      
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
      expect(emailInput).toBeDisabled()
    })
  })

  describe('Visual Elements', () => {
    it('renders section icons', () => {
      render(<Settings />)
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
    })

    it('renders save icon in button', () => {
      render(<Settings />)
      
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton.querySelector('[data-testid="save-icon"]')).toBeInTheDocument()
    })
  })
})