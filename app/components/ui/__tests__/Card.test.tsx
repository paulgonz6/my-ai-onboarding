import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, GlassCard, InteractiveCard, HighlightedCard, CardHeader, CardContent } from '../Card'
import '@testing-library/jest-dom'

describe('Card Component', () => {
  describe('Base Card', () => {
    it('renders with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies correct variant styles', () => {
      const { rerender } = render(<Card variant="default">Default</Card>)
      expect(screen.getByText('Default')).toHaveClass('bg-gray-900', 'border-white/10')
      
      rerender(<Card variant="glass">Glass</Card>)
      expect(screen.getByText('Glass')).toHaveClass('bg-white/5', 'backdrop-blur-xl')
      
      rerender(<Card variant="highlighted">Highlighted</Card>)
      expect(screen.getByText('Highlighted')).toHaveClass('from-emerald-500/10', 'to-teal-500/10')
      
      rerender(<Card variant="interactive">Interactive</Card>)
      expect(screen.getByText('Interactive')).toHaveClass('cursor-pointer', 'hover:border-white/20')
    })

    it('applies correct padding', () => {
      const { rerender } = render(<Card padding="none">No padding</Card>)
      expect(screen.getByText('No padding')).not.toHaveClass('p-4', 'p-6', 'p-8')
      
      rerender(<Card padding="sm">Small padding</Card>)
      expect(screen.getByText('Small padding')).toHaveClass('p-4')
      
      rerender(<Card padding="md">Medium padding</Card>)
      expect(screen.getByText('Medium padding')).toHaveClass('p-6')
      
      rerender(<Card padding="lg">Large padding</Card>)
      expect(screen.getByText('Large padding')).toHaveClass('p-8')
    })

    it('accepts custom className', () => {
      render(<Card className="custom-class">Custom</Card>)
      expect(screen.getByText('Custom')).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Specialized Card Variants', () => {
    it('GlassCard renders with glass variant', () => {
      render(<GlassCard>Glass Card</GlassCard>)
      expect(screen.getByText('Glass Card')).toHaveClass('bg-white/5', 'backdrop-blur-xl')
    })

    it('InteractiveCard renders with interactive variant and hover', () => {
      render(<InteractiveCard>Interactive Card</InteractiveCard>)
      const card = screen.getByText('Interactive Card')
      expect(card).toHaveClass('cursor-pointer', 'hover:border-white/20')
    })

    it('HighlightedCard renders with highlighted variant', () => {
      render(<HighlightedCard>Highlighted Card</HighlightedCard>)
      expect(screen.getByText('Highlighted Card')).toHaveClass('from-emerald-500/10', 'to-teal-500/10')
    })
  })

  describe('CardHeader', () => {
    it('renders title', () => {
      render(<CardHeader title="Card Title" />)
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('renders title and subtitle', () => {
      render(<CardHeader title="Card Title" subtitle="Card subtitle" />)
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card subtitle')).toBeInTheDocument()
    })

    it('renders action element', () => {
      render(
        <CardHeader 
          title="Card Title" 
          action={<button>Action</button>}
        />
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('accepts custom className', () => {
      render(<CardHeader title="Title" className="custom-header" />)
      const header = screen.getByText('Title').closest('div')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardContent', () => {
    it('renders children', () => {
      render(
        <CardContent>
          <p>Content paragraph</p>
        </CardContent>
      )
      expect(screen.getByText('Content paragraph')).toBeInTheDocument()
    })

    it('applies spacing by default', () => {
      render(
        <CardContent>
          <div>Content</div>
        </CardContent>
      )
      expect(screen.getByText('Content').parentElement).toHaveClass('space-y-4')
    })

    it('accepts custom className', () => {
      render(
        <CardContent className="custom-content">
          <div>Content</div>
        </CardContent>
      )
      expect(screen.getByText('Content').parentElement).toHaveClass('custom-content')
    })
  })

  describe('Composition', () => {
    it('works with CardHeader and CardContent together', () => {
      render(
        <Card>
          <CardHeader title="Header" subtitle="Subtitle" />
          <CardContent>
            <p>Card body content</p>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Subtitle')).toBeInTheDocument()
      expect(screen.getByText('Card body content')).toBeInTheDocument()
    })
  })
})