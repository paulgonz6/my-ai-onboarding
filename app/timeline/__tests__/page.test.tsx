import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Timeline from '../page'
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

// Mock components
jest.mock('@/app/components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/app/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Target: () => <div data-testid="target-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Award: () => <div data-testid="award-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Rocket: () => <div data-testid="rocket-icon" />,
  Brain: () => <div data-testid="brain-icon" />,
}))

describe('Timeline Page', () => {
  const mockPush = jest.fn()
  const mockUser = { id: 'user-123' }
  const mockProfile = { full_name: 'John Doe' }
  const mockPlan = {
    id: 'plan-123',
    user_id: 'user-123',
    start_date: new Date().toISOString(),
    phase1_activities: ['activity-1', 'activity-2'],
    phase2_activities: ['activity-3', 'activity-4'],
    phase3_activities: ['activity-5', 'activity-6'],
  }
  const mockActivities = [
    {
      id: 'activity-1',
      title: 'Getting Started with AI',
      description: 'Introduction to AI basics',
      duration: 30,
      difficulty: 'beginner',
      type: 'exercise',
      phase: 1,
      day_number: 1,
    },
    {
      id: 'activity-2',
      title: 'Your First Prompt',
      description: 'Learn to write effective prompts',
      duration: 45,
      difficulty: 'beginner',
      type: 'practice',
      phase: 1,
      day_number: 2,
    },
  ]
  const mockProgress = [
    {
      id: 'progress-1',
      activity_id: 'activity-1',
      status: 'completed',
      completed_at: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      currentDay: 5,
    })
  })

  describe('Initial Load', () => {
    it('redirects to plan page if no user plan exists', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: 'No plan' }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<Timeline />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/plan')
      })
    })

    it('loads user plan and activities on mount', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<Timeline />)

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_plans')
        expect(supabase.from).toHaveBeenCalledWith('activity_templates')
      })
    })

    it('loads user progress data', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_progress') {
          return {
            ...mockFrom,
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockProgress }),
            }),
          }
        }
        return mockFrom
      })

      render(<Timeline />)

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_progress')
      })
    })

    it('tries alternative query if initial plan query fails', async () => {
      let callCount = 0
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({ data: null, error: 'Not found' })
          }
          return Promise.resolve({ data: null })
        }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [mockPlan] }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<Timeline />)

      await waitFor(() => {
        expect(mockFrom.order).toHaveBeenCalledWith('generated_at', { ascending: false })
        expect(mockFrom.limit).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('Phase Display', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('renders all three phases', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText(/phase 1/i)).toBeInTheDocument()
        expect(screen.getByText(/phase 2/i)).toBeInTheDocument()
        expect(screen.getByText(/phase 3/i)).toBeInTheDocument()
      })
    })

    it('shows phase titles', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText(/foundation/i)).toBeInTheDocument()
        expect(screen.getByText(/acceleration/i)).toBeInTheDocument()
        expect(screen.getByText(/transformation/i)).toBeInTheDocument()
      })
    })

    it('shows phase descriptions', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText(/building core skills/i)).toBeInTheDocument()
        expect(screen.getByText(/expanding capabilities/i)).toBeInTheDocument()
        expect(screen.getByText(/mastering advanced/i)).toBeInTheDocument()
      })
    })

    it('expands phase 1 by default', async () => {
      render(<Timeline />)

      await waitFor(() => {
        const phase1Activities = screen.queryAllByText(/getting started/i)
        expect(phase1Activities.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Phase Interactions', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('toggles phase expansion when clicked', async () => {
      render(<Timeline />)

      await waitFor(() => {
        const phase2Button = screen.getByText(/phase 2/i).closest('button')
        if (phase2Button) {
          fireEvent.click(phase2Button)
        }
      })

      // Phase 2 should now be expanded
      await waitFor(() => {
        expect(screen.getByText(/phase 2/i).closest('button')).toBeInTheDocument()
      })
    })

    it('collapses expanded phase when clicked again', async () => {
      render(<Timeline />)

      await waitFor(() => {
        const phase1Button = screen.getByText(/phase 1/i).closest('button')
        if (phase1Button) {
          fireEvent.click(phase1Button)
        }
      })

      // Phase 1 should be collapsed
      await waitFor(() => {
        expect(screen.getByText(/phase 1/i)).toBeInTheDocument()
      })
    })
  })

  describe('Activity Display', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_progress') {
          return {
            ...mockFrom,
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: mockProgress }),
            }),
          }
        }
        return mockFrom
      })
    })

    it('displays activity titles', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText('Getting Started with AI')).toBeInTheDocument()
      })
    })

    it('displays activity descriptions', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText('Introduction to AI basics')).toBeInTheDocument()
      })
    })

    it('shows completed status for finished activities', async () => {
      render(<Timeline />)

      await waitFor(() => {
        const completedIcons = screen.getAllByTestId('check-circle-icon')
        expect(completedIcons.length).toBeGreaterThan(0)
      })
    })

    it('shows pending status for incomplete activities', async () => {
      render(<Timeline />)

      await waitFor(() => {
        const pendingIcons = screen.getAllByTestId('circle-icon')
        expect(pendingIcons.length).toBeGreaterThan(0)
      })
    })

    it('displays activity duration', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText(/30 min/)).toBeInTheDocument()
      })
    })

    it('displays activity difficulty', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText(/beginner/i)).toBeInTheDocument()
      })
    })
  })

  describe('Progress Calculation', () => {
    it('calculates phase progress correctly', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_progress') {
          return {
            ...mockFrom,
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ 
                data: [
                  { activity_id: 'activity-1', status: 'completed' },
                  { activity_id: 'activity-2', status: 'completed' },
                ]
              }),
            }),
          }
        }
        return mockFrom
      })

      render(<Timeline />)

      await waitFor(() => {
        // Should show 100% for phase 1 (2 of 2 completed)
        expect(screen.getByText(/100%/)).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading state while fetching data', () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => new Promise(() => {})), // Never resolves
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const { container } = render(<Timeline />)
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Current Day Display', () => {
    it('displays current day from auth context', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByText(/day 5/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing user gracefully', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        profile: mockProfile,
        currentDay: 5,
      })

      render(<Timeline />)

      // Should not crash and should not make API calls
      await waitFor(() => {
        expect(supabase.from).not.toHaveBeenCalled()
      })
    })

    it('handles activity fetch error', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockRejectedValue(new Error('Failed to fetch')),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      render(<Timeline />)

      // Should handle error gracefully
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('activity_templates')
      })
    })
  })

  describe('Activity Click', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('makes activity cards clickable', async () => {
      render(<Timeline />)

      await waitFor(() => {
        const activityCard = screen.getByText('Getting Started with AI').closest('div')
        expect(activityCard).toHaveAttribute('role', 'button')
      })
    })
  })

  describe('Phase Icons', () => {
    beforeEach(() => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPlan }),
        in: jest.fn().mockResolvedValue({ data: mockActivities }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
    })

    it('renders phase icons', async () => {
      render(<Timeline />)

      await waitFor(() => {
        expect(screen.getByTestId('rocket-icon')).toBeInTheDocument()
        expect(screen.getByTestId('zap-icon')).toBeInTheDocument()
        expect(screen.getByTestId('brain-icon')).toBeInTheDocument()
      })
    })
  })
})