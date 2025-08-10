'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import AppNav from './AppNav'

interface AppLayoutProps {
  children: React.ReactNode
  showNav?: boolean
}

export default function AppLayout({ children, showNav }: AppLayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Determine if we should show navigation based on route and auth state
  const shouldShowNav = () => {
    // Never show nav on these pages
    const noNavPages = ['/', '/survey', '/signin']
    if (noNavPages.includes(pathname)) return false
    
    // Always show nav for authenticated users on app pages
    const appPages = ['/timeline', '/plan', '/profile', '/settings']
    if (user && appPages.some(page => pathname.startsWith(page))) return true
    
    // Use the showNav prop if provided
    if (showNav !== undefined) return showNav
    
    // Default to showing nav for authenticated users
    return !!user
  }
  
  const showNavigation = shouldShowNav()
  
  return (
    <>
      {showNavigation && <AppNav />}
      <div className={showNavigation ? 'pt-16' : ''}>
        {children}
      </div>
    </>
  )
}