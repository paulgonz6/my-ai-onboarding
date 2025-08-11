import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import LandingPage from '../page'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  useScroll: () => ({ scrollY: { current: 0 } }),
  useTransform: () => 1,
}))

// Mock Lottie
jest.mock('lottie-react', () => ({
  __esModule: true,
  default: ({ animationData }: any) => <div data-testid="lottie-animation">{JSON.stringify(animationData.nm)}</div>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Users: () => <div data-testid="users-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  Brain: () => <div data-testid="brain-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
}))

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the landing page without crashing', () => {
      render(<LandingPage />)
      expect(screen.getByText('My AI Onboarding')).toBeInTheDocument()
    })

    it('renders the main headline', () => {
      render(<LandingPage />)
      expect(screen.getByText("AI isn't a tool.")).toBeInTheDocument()
      expect(screen.getByText("It's your newest colleague.")).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
      render(<LandingPage />)
      expect(screen.getByText(/You wouldn't throw a new hire into deep work/)).toBeInTheDocument()
    })

    it('renders the navigation menu', () => {
      render(<LandingPage />)
      expect(screen.getByText('Features')).toBeInTheDocument()
      expect(screen.getByText('How it Works')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
      expect(screen.getByText('Testimonials')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('renders call-to-action buttons', () => {
      render(<LandingPage />)
      expect(screen.getByText('Get Your Onboarding Plan')).toBeInTheDocument()
      expect(screen.getByText('See a Sample Plan')).toBeInTheDocument()
    })

    it('renders feature cards', () => {
      render(<LandingPage />)
      expect(screen.getByText('Start Where You Are')).toBeInTheDocument()
      expect(screen.getByText('Small Daily Wins')).toBeInTheDocument()
      expect(screen.getByText("Know It's Working")).toBeInTheDocument()
      expect(screen.getByText('Find Your Match')).toBeInTheDocument()
      expect(screen.getByText('Learn by Doing')).toBeInTheDocument()
      expect(screen.getByText('Prove the Value')).toBeInTheDocument()
    })
  })

  describe('Mobile Menu Interaction', () => {
    it('toggles mobile menu when menu button is clicked', () => {
      render(<LandingPage />)
      
      // Find the menu button (it's hidden on desktop)
      const menuButtons = screen.getAllByRole('button')
      const mobileMenuButton = menuButtons.find(btn => btn.querySelector('[data-testid="menu-icon"]'))
      
      expect(mobileMenuButton).toBeInTheDocument()
      
      // Click to open menu
      fireEvent.click(mobileMenuButton!)
      
      // Should show X icon instead of Menu icon
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
      
      // Click again to close
      fireEvent.click(mobileMenuButton!)
      
      // Should show Menu icon again
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })
  })

  describe('Pricing Section', () => {
    it('renders all pricing tiers', () => {
      render(<LandingPage />)
      
      // Check for pricing tier names
      expect(screen.getByText('Explorer')).toBeInTheDocument()
      expect(screen.getByText('Collaborator')).toBeInTheDocument()
      expect(screen.getByText('Innovator')).toBeInTheDocument()
      
      // Check for prices
      expect(screen.getByText('$0')).toBeInTheDocument()
      expect(screen.getByText('$19')).toBeInTheDocument()
      expect(screen.getByText('$49')).toBeInTheDocument()
    })

    it('highlights the popular plan', () => {
      render(<LandingPage />)
      expect(screen.getByText('Most Popular')).toBeInTheDocument()
    })

    it('renders pricing CTAs', () => {
      render(<LandingPage />)
      expect(screen.getByText('Start Free')).toBeInTheDocument()
      expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
      expect(screen.getByText('Contact Sales')).toBeInTheDocument()
    })
  })

  describe('Testimonials Section', () => {
    it('renders all testimonials', () => {
      render(<LandingPage />)
      
      // Check for testimonial authors
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument()
      expect(screen.getByText('Jessica Park')).toBeInTheDocument()
      
      // Check for roles
      expect(screen.getByText(/Marketing Manager/)).toBeInTheDocument()
      expect(screen.getByText(/Software Developer/)).toBeInTheDocument()
      expect(screen.getByText(/VP of Operations/)).toBeInTheDocument()
    })

    it('renders testimonial quotes', () => {
      render(<LandingPage />)
      expect(screen.getByText(/Week 1: Skeptical/)).toBeInTheDocument()
      expect(screen.getByText(/I finally understand WHEN to use AI/)).toBeInTheDocument()
      expect(screen.getByText(/My team went from 'AI will replace us'/)).toBeInTheDocument()
    })

    it('renders star ratings for testimonials', () => {
      render(<LandingPage />)
      const stars = screen.getAllByTestId('star-icon')
      expect(stars.length).toBeGreaterThan(0)
    })
  })

  describe('How It Works Section', () => {
    it('renders all onboarding phases', () => {
      render(<LandingPage />)
      
      // Phase titles
      expect(screen.getByText('The Coffee Chat Phase')).toBeInTheDocument()
      expect(screen.getByText('The Partnership Phase')).toBeInTheDocument()
      expect(screen.getByText('The Trust Phase')).toBeInTheDocument()
      
      // Phase periods
      expect(screen.getByText('Days 1-30')).toBeInTheDocument()
      expect(screen.getByText('Days 31-60')).toBeInTheDocument()
      expect(screen.getByText('Days 61-90')).toBeInTheDocument()
    })

    it('renders phase descriptions', () => {
      render(<LandingPage />)
      expect(screen.getByText('Get to know your new AI colleague')).toBeInTheDocument()
      expect(screen.getByText('Start working on real projects together')).toBeInTheDocument()
      expect(screen.getByText("They're part of your team now")).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('renders footer sections', () => {
      render(<LandingPage />)
      
      // Footer headings
      expect(screen.getByText('Product')).toBeInTheDocument()
      expect(screen.getByText('Company')).toBeInTheDocument()
      expect(screen.getByText('Legal')).toBeInTheDocument()
      
      // Copyright
      expect(screen.getByText(/© 2025 My AI Onboarding/)).toBeInTheDocument()
    })

    it('renders social links', () => {
      render(<LandingPage />)
      expect(screen.getByText('Twitter')).toBeInTheDocument()
      expect(screen.getByText('LinkedIn')).toBeInTheDocument()
      expect(screen.getByText('GitHub')).toBeInTheDocument()
    })
  })

  describe('CTA Section', () => {
    it('renders the final call-to-action', () => {
      render(<LandingPage />)
      expect(screen.getByText(/Stop reading about AI/)).toBeInTheDocument()
      expect(screen.getByText('Get My 90-Day Plan')).toBeInTheDocument()
    })

    it('renders CTA supporting text', () => {
      render(<LandingPage />)
      expect(screen.getByText(/Free to start • 5-minute survey/)).toBeInTheDocument()
    })
  })

  describe('Animation and Scroll Effects', () => {
    it('renders animated background elements', () => {
      const { container } = render(<LandingPage />)
      // Check for animated dots (50 star positions)
      const animatedDots = container.querySelectorAll('.absolute.w-1.h-1')
      expect(animatedDots.length).toBe(50)
    })

    it('renders Lottie animation', () => {
      render(<LandingPage />)
      expect(screen.getAllByTestId('lottie-animation')).toHaveLength(3) // One for each phase
    })
  })

  describe('Links and Navigation', () => {
    it('renders correct href attributes for navigation links', () => {
      render(<LandingPage />)
      
      const surveyLinks = screen.getAllByRole('link', { name: /onboarding plan/i })
      surveyLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/survey')
      })
      
      const signInLink = screen.getByRole('link', { name: /sign in/i })
      expect(signInLink).toHaveAttribute('href', '/signin')
    })

    it('renders anchor links for page sections', () => {
      render(<LandingPage />)
      
      const featuresLink = screen.getByRole('link', { name: /features/i })
      expect(featuresLink).toHaveAttribute('href', '#features')
      
      const howItWorksLink = screen.getByRole('link', { name: /how it works/i })
      expect(howItWorksLink).toHaveAttribute('href', '#how-it-works')
      
      const pricingLink = screen.getByRole('link', { name: /pricing/i })
      expect(pricingLink).toHaveAttribute('href', '#pricing')
    })
  })

  describe('Button Interactions', () => {
    it('renders sample plan button', () => {
      render(<LandingPage />)
      const sampleButton = screen.getByRole('button', { name: /see a sample plan/i })
      expect(sampleButton).toBeInTheDocument()
    })

    it('renders pricing tier buttons', () => {
      render(<LandingPage />)
      
      const startFreeButtons = screen.getAllByRole('button', { name: /start free/i })
      expect(startFreeButtons.length).toBeGreaterThan(0)
      
      const trialButton = screen.getByRole('button', { name: /start free trial/i })
      expect(trialButton).toBeInTheDocument()
      
      const salesButton = screen.getByRole('button', { name: /contact sales/i })
      expect(salesButton).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('renders gradient text elements', () => {
      const { container } = render(<LandingPage />)
      const gradientTexts = container.querySelectorAll('.gradient-text')
      expect(gradientTexts.length).toBeGreaterThan(0)
    })

    it('renders icons in feature cards', () => {
      render(<LandingPage />)
      expect(screen.getByTestId('brain-icon')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
      expect(screen.getByTestId('target-icon')).toBeInTheDocument()
      expect(screen.getByTestId('users-icon')).toBeInTheDocument()
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
    })

    it('renders checkmarks in lists', () => {
      render(<LandingPage />)
      const checkmarks = screen.getAllByTestId('check-circle-icon')
      expect(checkmarks.length).toBeGreaterThan(0)
    })
  })
})