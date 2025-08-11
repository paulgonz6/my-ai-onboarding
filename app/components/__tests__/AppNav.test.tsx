import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import AppNav from '../AppNav'
import { useAuth } from '@/app/contexts/AuthContext'
import { usePathname } from 'next/navigation'

// Mock dependencies
jest.mock('@/app/contexts/AuthContext')
jest.mock('next/navigation')
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  LayoutDashboard: () => <div data-testid="dashboard-icon" />,
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Download: () => <div data-testid="download-icon" />,
}))

describe('AppNav', () => {
  const mockSignOut = jest.fn()
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }
  const mockProfile = {
    full_name: 'John Doe',
    persona: 'tech-savvy',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      signOut: mockSignOut,
    })
    ;(usePathname as jest.Mock).mockReturnValue('/plan')
  })

  describe('Rendering', () => {
    it('renders navigation bar without crashing', () => {
      render(<AppNav />)
      expect(screen.getByText('My AI Onboarding')).toBeInTheDocument()
    })

    it('renders navigation links', () => {
      render(<AppNav />)
      expect(screen.getByText('My Plan')).toBeInTheDocument()
      expect(screen.getByText('Timeline')).toBeInTheDocument()
    })

    it('renders user avatar with initials', () => {
      render(<AppNav />)
      expect(screen.getByText('JD')).toBeInTheDocument() // John Doe initials
    })

    it('renders user name and email in dropdown button', () => {
      render(<AppNav />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('highlights active navigation link', () => {
      render(<AppNav />)
      const myPlanLink = screen.getByRole('link', { name: /my plan/i })
      expect(myPlanLink).toHaveClass('bg-white/10', 'text-white')
    })

    it('shows different highlight for inactive link', () => {
      (usePathname as jest.Mock).mockReturnValue('/timeline')
      render(<AppNav />)
      const myPlanLink = screen.getByRole('link', { name: /my plan/i })
      expect(myPlanLink).toHaveClass('text-gray-400')
    })
  })

  describe('Dropdown Menu', () => {
    it('initially hides dropdown menu', () => {
      render(<AppNav />)
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('shows dropdown menu when avatar is clicked', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('closes dropdown when clicking outside', async () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      // Open dropdown
      fireEvent.click(avatarButton)
      expect(screen.getByRole('menu')).toBeInTheDocument()
      
      // Click outside
      fireEvent.mouseDown(document.body)
      
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('rotates chevron icon when dropdown is open', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      const chevron = screen.getByTestId('chevron-down-icon').parentElement
      
      expect(chevron).not.toHaveClass('rotate-180')
      
      fireEvent.click(avatarButton)
      
      expect(chevron).toHaveClass('rotate-180')
    })

    it('shows persona badge in dropdown', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      
      expect(screen.getByText('Tech Savvy')).toBeInTheDocument()
    })

    it('closes dropdown when a link is clicked', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      const profileLink = screen.getByRole('link', { name: /profile/i })
      
      fireEvent.click(profileLink)
      
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('Sign Out', () => {
    it('calls signOut when sign out button is clicked', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      
      fireEvent.click(signOutButton)
      
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('closes dropdown after sign out', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      
      fireEvent.click(signOutButton)
      
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('Avatar Generation', () => {
    it('uses full name initials when available', () => {
      render(<AppNav />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('uses first letter of email when no full name', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: { ...mockProfile, full_name: null },
        signOut: mockSignOut,
      })
      
      render(<AppNav />)
      expect(screen.getByText('T')).toBeInTheDocument() // First letter of test@example.com
    })

    it('uses U when no name or email', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...mockUser, email: null },
        profile: { ...mockProfile, full_name: null },
        signOut: mockSignOut,
      })
      
      render(<AppNav />)
      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('limits initials to 2 characters', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: { ...mockProfile, full_name: 'John Jacob Jingleheimer Schmidt' },
        signOut: mockSignOut,
      })
      
      render(<AppNav />)
      expect(screen.getByText('JJ')).toBeInTheDocument()
    })

    it('generates consistent avatar color based on email', () => {
      const { container } = render(<AppNav />)
      const avatar = container.querySelector('.bg-emerald-500, .bg-teal-500, .bg-cyan-500, .bg-blue-500, .bg-indigo-500, .bg-purple-500, .bg-pink-500, .bg-rose-500')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Accountability Button', () => {
    it('hides accountability button by default', () => {
      render(<AppNav />)
      expect(screen.queryByText(/get accountability/i)).not.toBeInTheDocument()
    })

    it('shows accountability button when prop is true and no subscription', () => {
      render(<AppNav showAccountability={true} hasSubscription={false} />)
      expect(screen.getByText('Get Accountability')).toBeInTheDocument()
    })

    it('hides accountability button when user has subscription', () => {
      render(<AppNav showAccountability={true} hasSubscription={true} />)
      expect(screen.queryByText(/get accountability/i)).not.toBeInTheDocument()
    })

    it('calls onAccountabilityClick when button is clicked', () => {
      const mockClick = jest.fn()
      render(
        <AppNav 
          showAccountability={true} 
          hasSubscription={false}
          onAccountabilityClick={mockClick}
        />
      )
      
      const button = screen.getByText('Get Accountability')
      fireEvent.click(button)
      
      expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('has animate-pulse class on accountability button', () => {
      render(<AppNav showAccountability={true} hasSubscription={false} />)
      const button = screen.getByText('Get Accountability').parentElement
      expect(button).toHaveClass('animate-pulse')
    })
  })

  describe('Mobile Navigation', () => {
    it('renders mobile navigation links', () => {
      render(<AppNav />)
      // Mobile nav has duplicate links
      const myPlanLinks = screen.getAllByText('My Plan')
      const timelineLinks = screen.getAllByText('Timeline')
      
      expect(myPlanLinks.length).toBeGreaterThan(1) // Desktop and mobile
      expect(timelineLinks.length).toBeGreaterThan(1) // Desktop and mobile
    })

    it('hides "Get Accountability" text on small screens', () => {
      render(<AppNav showAccountability={true} hasSubscription={false} />)
      const button = screen.getByRole('button', { name: /accountability/i })
      const hiddenText = button.querySelector('.hidden.sm\\:inline')
      expect(hiddenText).toBeInTheDocument()
    })
  })

  describe('Links', () => {
    it('links to correct pages', () => {
      render(<AppNav />)
      
      const myPlanLinks = screen.getAllByRole('link', { name: /my plan/i })
      myPlanLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/plan')
      })
      
      const timelineLinks = screen.getAllByRole('link', { name: /timeline/i })
      timelineLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/timeline')
      })
    })

    it('links to profile and settings from dropdown', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      
      const profileLink = screen.getByRole('link', { name: /profile/i })
      expect(profileLink).toHaveAttribute('href', '/profile')
      
      const settingsLink = screen.getByRole('link', { name: /settings/i })
      expect(settingsLink).toHaveAttribute('href', '/settings')
    })

    it('links to plan page when user is logged in', () => {
      render(<AppNav />)
      const logoLink = screen.getAllByRole('link')[0] // First link is the logo
      expect(logoLink).toHaveAttribute('href', '/plan')
    })

    it('links to home page when user is not logged in', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        signOut: mockSignOut,
      })
      
      render(<AppNav />)
      const logoLink = screen.getAllByRole('link')[0] // First link is the logo
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Persona Display', () => {
    it('formats persona correctly', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      
      expect(screen.getByText('Tech Savvy')).toBeInTheDocument()
    })

    it('handles multi-word personas', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: { ...mockProfile, persona: 'ai-curious-explorer' },
        signOut: mockSignOut,
      })
      
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      
      expect(screen.getByText('Ai Curious Explorer')).toBeInTheDocument()
    })

    it('does not show persona badge when persona is null', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: { ...mockProfile, persona: null },
        signOut: mockSignOut,
      })
      
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      
      expect(screen.queryByTestId('sparkles-icon')).toBeInTheDocument() // Logo sparkles
      const personaBadge = screen.queryByText(/tech savvy/i)
      expect(personaBadge).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on dropdown button', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      expect(avatarButton).toHaveAttribute('aria-haspopup', 'true')
      expect(avatarButton).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(avatarButton)
      
      expect(avatarButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('has proper ARIA attributes on dropdown menu', () => {
      render(<AppNav />)
      const avatarButton = screen.getByRole('button', { name: /account menu/i })
      
      fireEvent.click(avatarButton)
      
      const menu = screen.getByRole('menu')
      expect(menu).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('has proper ARIA label on avatar', () => {
      render(<AppNav />)
      const avatar = screen.getByRole('img', { name: /user avatar/i })
      expect(avatar).toBeInTheDocument()
    })
  })
})