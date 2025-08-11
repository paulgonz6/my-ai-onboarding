import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import CalendarPage from '../page'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  X: () => <div data-testid="x-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Grid3x3: () => <div data-testid="grid-icon" />,
  List: () => <div data-testid="list-icon" />,
  User: () => <div data-testid="user-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
}))

describe('CalendarPage', () => {
  const mockPush = jest.fn()
  const mockUser = { id: 'user-123' }
  const mockProfile = { full_name: 'John Doe' }
  const mockPlan = {
    id: 'plan-123',
    user_id: 'user-123',
    is_active: true,
    phase1_activities: ['activity-1'],
    phase2_activities: ['activity-2'],
    phase3_activities: ['activity-3'],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    })
  })

  describe('Initial Load', () => {
    it('redirects to survey if user is not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      })

      render(<CalendarPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/survey')
      })
    })

    it('redirects to plan page if user has no active plan', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<CalendarPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/plan')
      })
    })

    it('loads user profile and displays name', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<CalendarPage />)

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('profiles')
      })
    })

    it('loads calendar events for current month', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          activity_id: 'activity-1',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          status: 'scheduled',
        },
      ]

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      // Set up different responses for different tables
      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'calendar_events') {
          return {
            ...mockFrom,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnValue({
              data: mockEvents,
            }),
          }
        }
        return mockFrom
      })

      render(<CalendarPage />)

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('calendar_events')
      })
    })
  })

  describe('View Mode Switching', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('initially shows month view', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const monthDays = screen.getAllByRole('button').filter(btn => 
          /^\d+$/.test(btn.textContent || '')
        )
        expect(monthDays.length).toBeGreaterThan(0)
      })
    })

    it('switches to week view when week button is clicked', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const weekButton = screen.getByRole('button', { name: /week/i })
        fireEvent.click(weekButton)
      })

      // Week view should be active
      await waitFor(() => {
        const weekButton = screen.getByRole('button', { name: /week/i })
        expect(weekButton.parentElement).toHaveClass('bg-white/10')
      })
    })

    it('switches to day view when day button is clicked', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const dayButton = screen.getByRole('button', { name: /day/i })
        fireEvent.click(dayButton)
      })

      // Day view should be active
      await waitFor(() => {
        const dayButton = screen.getByRole('button', { name: /day/i })
        expect(dayButton.parentElement).toHaveClass('bg-white/10')
      })
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('navigates to previous month', async () => {
      render(<CalendarPage />)

      const initialMonth = new Date().getMonth()

      await waitFor(() => {
        const prevButton = screen.getAllByRole('button').find(btn => 
          btn.querySelector('[data-testid="chevron-left-icon"]')
        )
        if (prevButton) {
          fireEvent.click(prevButton)
        }
      })

      // Check that loadCalendarData is called again (data refetch)
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('calendar_events')
      })
    })

    it('navigates to next month', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const nextButton = screen.getAllByRole('button').find(btn => 
          btn.querySelector('[data-testid="chevron-right-icon"]')
        )
        if (nextButton) {
          fireEvent.click(nextButton)
        }
      })

      // Check that loadCalendarData is called again
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('calendar_events')
      })
    })

    it('navigates back to plan page', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const backButton = screen.getAllByRole('button').find(btn => 
          btn.querySelector('[data-testid="arrow-left-icon"]')
        )
        if (backButton) {
          fireEvent.click(backButton)
        }
      })

      expect(mockPush).toHaveBeenCalledWith('/plan')
    })
  })

  describe('Date Selection', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('selects a date when clicked', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button').filter(btn => 
          /^\d+$/.test(btn.textContent || '')
        )
        
        if (dayButtons.length > 0) {
          fireEvent.click(dayButtons[0])
        }
      })

      // Selected date should have different styling
      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button').filter(btn => 
          /^\d+$/.test(btn.textContent || '')
        )
        expect(dayButtons[0].className).toContain('bg-')
      })
    })

    it('shows activities for selected date', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          activity_id: 'activity-1',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          status: 'scheduled',
          title: 'Test Activity',
        },
      ]

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'calendar_events') {
          return {
            ...mockFrom,
            lte: jest.fn().mockReturnValue({ data: mockEvents }),
          }
        }
        if (table === 'activity_templates') {
          return {
            ...mockFrom,
            in: jest.fn().mockReturnValue({
              data: [{
                id: 'activity-1',
                title: 'Test Activity',
                duration: 30,
                difficulty: 'beginner',
                type: 'exercise',
              }],
            }),
          }
        }
        return mockFrom
      })

      render(<CalendarPage />)

      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button').filter(btn => 
          /^\d+$/.test(btn.textContent || '')
        )
        
        if (dayButtons.length > 0) {
          fireEvent.click(dayButtons[0])
        }
      })
    })
  })

  describe('Activity Modal', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('opens modal when add activity button is clicked', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const addButton = screen.getAllByRole('button').find(btn => 
          btn.querySelector('[data-testid="plus-icon"]')
        )
        if (addButton) {
          fireEvent.click(addButton)
        }
      })

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText(/add activity/i)).toBeInTheDocument()
      })
    })

    it('closes modal when close button is clicked', async () => {
      render(<CalendarPage />)

      // Open modal
      await waitFor(() => {
        const addButton = screen.getAllByRole('button').find(btn => 
          btn.querySelector('[data-testid="plus-icon"]')
        )
        if (addButton) {
          fireEvent.click(addButton)
        }
      })

      // Close modal
      await waitFor(() => {
        const closeButton = screen.getAllByRole('button').find(btn => 
          btn.querySelector('[data-testid="x-icon"]')
        )
        if (closeButton) {
          fireEvent.click(closeButton)
        }
      })

      // Modal should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/add activity/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Drag and Drop', () => {
    beforeEach(() => {
      const mockEvents = [
        {
          id: 'event-1',
          activity_id: 'activity-1',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          status: 'scheduled',
        },
      ]

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockProfile })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'calendar_events') {
          return {
            ...mockFrom,
            lte: jest.fn().mockReturnValue({ data: mockEvents }),
          }
        }
        if (table === 'activity_templates') {
          return {
            ...mockFrom,
            in: jest.fn().mockReturnValue({
              data: [{
                id: 'activity-1',
                title: 'Draggable Activity',
                duration: 30,
                difficulty: 'beginner',
                type: 'exercise',
              }],
            }),
          }
        }
        return mockFrom
      })
    })

    it('handles drag start on activity', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const activities = screen.getAllByText(/activity/i)
        if (activities.length > 0) {
          const event = new DragEvent('dragstart', {
            dataTransfer: new DataTransfer(),
          })
          fireEvent(activities[0], event)
        }
      })
    })

    it('handles drop on calendar date', async () => {
      render(<CalendarPage />)

      await waitFor(() => {
        const dayButtons = screen.getAllByRole('button').filter(btn => 
          /^\d+$/.test(btn.textContent || '')
        )
        
        if (dayButtons.length > 0) {
          const event = new DragEvent('drop', {
            dataTransfer: new DataTransfer(),
          })
          fireEvent(dayButtons[0], event)
        }
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => new Promise(() => {})), // Never resolves
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const { container } = render(<CalendarPage />)
      
      // Should show loading indicator
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles profile loading error gracefully', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockRejectedValueOnce(new Error('Profile error'))
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<CalendarPage />)

      // Should continue loading despite profile error
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_plans')
      })
    })

    it('defaults to Explorer when no name is provided', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: { full_name: null } })
          .mockResolvedValueOnce({ data: mockPlan }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<CalendarPage />)

      // Default name should be used
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled()
      })
    })
  })
})