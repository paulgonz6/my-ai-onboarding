'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'glass' | 'highlighted' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const cardStyles = {
  base: 'rounded-xl transition-all',
  variants: {
    default: 'bg-gray-900 border border-white/10',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    highlighted: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20',
    interactive: 'bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer'
  },
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hover = false, className, children, ...props }, ref) => {
    const Component = hover ? motion.div : 'div'
    
    const baseProps = {
      ref,
      className: cn(
        cardStyles.base,
        cardStyles.variants[variant],
        cardStyles.padding[padding],
        className
      ),
      ...props
    }

    if (hover && Component === motion.div) {
      return (
        <Component
          {...baseProps}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {children}
        </Component>
      )
    }

    return <Component {...baseProps}>{children}</Component>
  }
)

Card.displayName = 'Card'

// Specialized card components
export const GlassCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>((props, ref) => (
  <Card ref={ref} variant="glass" {...props} />
))
GlassCard.displayName = 'GlassCard'

export const InteractiveCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>((props, ref) => (
  <Card ref={ref} variant="interactive" hover {...props} />
))
InteractiveCard.displayName = 'InteractiveCard'

export const HighlightedCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>((props, ref) => (
  <Card ref={ref} variant="highlighted" {...props} />
))
HighlightedCard.displayName = 'HighlightedCard'

// Card header component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-start justify-between mb-4', className)} {...props}>
      <div>
        <h3 className="text-xl font-display font-bold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

// Card content component
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-4', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'