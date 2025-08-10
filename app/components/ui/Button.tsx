'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation variants
const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

interface BaseButtonProps extends Omit<HTMLMotionProps<"button">, 'type'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  isLoading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const buttonStyles = {
  base: 'inline-flex items-center justify-center font-sans font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/10',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
  },
  sizes: {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl'
  }
}

export const Button = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'right',
    isLoading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || isLoading

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          fullWidth && 'w-full',
          className
        )}
        whileHover={!isDisabled ? buttonVariants.hover : undefined}
        whileTap={!isDisabled ? buttonVariants.tap : undefined}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className={cn('w-4 h-4', children && 'mr-2')} />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className={cn('w-4 h-4', children && 'ml-2')} />
            )}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

// Specialized button variants for common use cases
export const PrimaryButton = forwardRef<HTMLButtonElement, BaseButtonProps>((props, ref) => (
  <Button ref={ref} variant="primary" {...props} />
))
PrimaryButton.displayName = 'PrimaryButton'

export const SecondaryButton = forwardRef<HTMLButtonElement, BaseButtonProps>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
))
SecondaryButton.displayName = 'SecondaryButton'

export const GhostButton = forwardRef<HTMLButtonElement, BaseButtonProps>((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
))
GhostButton.displayName = 'GhostButton'

// Round icon button variant
interface IconButtonProps extends Omit<BaseButtonProps, 'icon' | 'iconPosition'> {
  icon: LucideIcon
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'rounded-full flex items-center justify-center',
          'bg-white/10 hover:bg-white/20 transition-colors',
          sizeClasses[size],
          className
        )}
        whileHover={buttonVariants.hover}
        whileTap={buttonVariants.tap}
        {...props}
      >
        <Icon className="w-5 h-5" />
      </motion.button>
    )
  }
)
IconButton.displayName = 'IconButton'