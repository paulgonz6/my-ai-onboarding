'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'purple' | 'pink' | 'blue' | 'orange' | 'custom'
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
  gradient?: string // For custom gradients
}

const gradientVariants = {
  emerald: 'from-emerald-400 to-teal-400',
  purple: 'from-purple-400 to-pink-400',
  pink: 'from-pink-400 to-rose-400',
  blue: 'from-blue-400 to-cyan-400',
  orange: 'from-orange-400 to-red-400',
  custom: ''
}

export const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ variant = 'emerald', as: Component = 'span', gradient, className, children, ...props }, ref) => {
    const gradientClass = variant === 'custom' && gradient 
      ? gradient 
      : gradientVariants[variant]

    return (
      <Component
        ref={ref as any}
        className={cn(
          'bg-gradient-to-r bg-clip-text text-transparent',
          gradientClass,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

GradientText.displayName = 'GradientText'