import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button, PrimaryButton, SecondaryButton, GhostButton, IconButton } from '../Button'
import { ArrowRight, Settings } from 'lucide-react'
import '@testing-library/jest-dom'

describe('Button Component', () => {
  describe('Base Button', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('applies correct variant styles', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>)
      expect(screen.getByText('Primary')).toHaveClass('from-emerald-500')
      
      rerender(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByText('Secondary')).toHaveClass('bg-white/10')
      
      rerender(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByText('Ghost')).toHaveClass('text-gray-400')
      
      rerender(<Button variant="danger">Danger</Button>)
      expect(screen.getByText('Danger')).toHaveClass('bg-red-500/10')
    })

    it('applies correct size styles', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      expect(screen.getByText('Small')).toHaveClass('px-3', 'py-1.5', 'text-sm')
      
      rerender(<Button size="md">Medium</Button>)
      expect(screen.getByText('Medium')).toHaveClass('px-4', 'py-2', 'text-base')
      
      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByText('Large')).toHaveClass('px-6', 'py-3', 'text-lg')
    })

    it('renders with icon on the right', () => {
      render(<Button icon={ArrowRight}>Next</Button>)
      expect(screen.getByText('Next')).toBeInTheDocument()
      const icon = document.querySelector('.lucide-arrow-right')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('ml-2')
    })

    it('renders with icon on the left', () => {
      render(<Button icon={Settings} iconPosition="left">Settings</Button>)
      expect(screen.getByText('Settings')).toBeInTheDocument()
      const icon = document.querySelector('.lucide-settings')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('mr-2')
    })

    it('shows loading state', () => {
      render(<Button isLoading>Submit</Button>)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('is disabled when loading', () => {
      render(<Button isLoading>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('applies full width style', () => {
      render(<Button fullWidth>Full Width</Button>)
      expect(screen.getByText('Full Width')).toHaveClass('w-full')
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not fire click when disabled', () => {
      const handleClick = jest.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      fireEvent.click(screen.getByText('Disabled'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByText('Custom')).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Specialized Button Variants', () => {
    it('PrimaryButton renders with primary variant', () => {
      render(<PrimaryButton>Primary</PrimaryButton>)
      expect(screen.getByText('Primary')).toHaveClass('from-emerald-500')
    })

    it('SecondaryButton renders with secondary variant', () => {
      render(<SecondaryButton>Secondary</SecondaryButton>)
      expect(screen.getByText('Secondary')).toHaveClass('bg-white/10')
    })

    it('GhostButton renders with ghost variant', () => {
      render(<GhostButton>Ghost</GhostButton>)
      expect(screen.getByText('Ghost')).toHaveClass('text-gray-400')
    })
  })

  describe('IconButton', () => {
    it('renders with icon', () => {
      render(<IconButton icon={Settings} aria-label="Settings" />)
      const button = screen.getByLabelText('Settings')
      expect(button).toBeInTheDocument()
      expect(document.querySelector('.lucide-settings')).toBeInTheDocument()
    })

    it('applies correct size classes', () => {
      const { rerender } = render(<IconButton icon={Settings} size="sm" aria-label="Settings" />)
      expect(screen.getByLabelText('Settings')).toHaveClass('w-8', 'h-8')
      
      rerender(<IconButton icon={Settings} size="md" aria-label="Settings" />)
      expect(screen.getByLabelText('Settings')).toHaveClass('w-10', 'h-10')
      
      rerender(<IconButton icon={Settings} size="lg" aria-label="Settings" />)
      expect(screen.getByLabelText('Settings')).toHaveClass('w-12', 'h-12')
    })

    it('requires aria-label for accessibility', () => {
      render(<IconButton icon={Settings} aria-label="Open settings" />)
      expect(screen.getByLabelText('Open settings')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<IconButton icon={Settings} aria-label="Settings" onClick={handleClick} />)
      fireEvent.click(screen.getByLabelText('Settings'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('supports different button types', () => {
      const { rerender } = render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
      
      rerender(<Button type="button">Button</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
      
      rerender(<Button type="reset">Reset</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
    })

    it('has proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })

    it('IconButton has required aria-label', () => {
      render(<IconButton icon={Settings} aria-label="Settings menu" />)
      const button = screen.getByLabelText('Settings menu')
      expect(button).toHaveAttribute('aria-label', 'Settings menu')
    })
  })
})