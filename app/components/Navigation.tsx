'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  Home,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  Target,
  Rocket,
  Brain,
  ArrowRight,
  Clock
} from 'lucide-react'
import { clsx } from 'clsx'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  requiresAuth: boolean
  showDuringOnboarding?: boolean
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home, requiresAuth: false },
  { name: 'Timeline', href: '/timeline', icon: BarChart3, requiresAuth: true },
  { name: 'Calendar', href: '/calendar', icon: Calendar, requiresAuth: true },
]

export default function Navigation() {
  const { user, profile, loading, signOut, currentDay, journeyProgress } = useAuth()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Determine navigation state
  const isOnboarding = pathname === '/survey' || pathname === '/plan'
  const isAuthenticated = !!user && !loading
  const showProgress = isAuthenticated && !isOnboarding

  // Get phase info based on current day
  const getPhaseInfo = () => {
    if (currentDay <= 30) {
      return { phase: 1, name: 'Foundation', icon: Sparkles, color: 'from-emerald-500 to-teal-500' }
    } else if (currentDay <= 60) {
      return { phase: 2, name: 'Integration', icon: Rocket, color: 'from-blue-500 to-purple-500' }
    } else {
      return { phase: 3, name: 'Mastery', icon: Brain, color: 'from-orange-500 to-red-500' }
    }
  }

  const phaseInfo = getPhaseInfo()

  // Filter nav items based on auth state
  const visibleNavItems = navItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false
    if (isOnboarding && !item.showDuringOnboarding) {
      return item.href === '/'
    }
    return true
  })

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false)
    await signOut()
  }

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="w-32 h-8 bg-white/10 rounded animate-pulse" />
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-gray-900/95 backdrop-blur-lg shadow-xl' : 'bg-gray-900/80 backdrop-blur-md',
        'border-b border-white/10'
      )}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <motion.button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg hidden sm:block">
                  AI Journey
                </span>
              </motion.button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {visibleNavItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <motion.button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={clsx(
                        'px-4 py-2 rounded-lg font-sans font-medium transition-all duration-200 flex items-center space-x-2',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      )}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </motion.button>
                  )
                })}
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Progress Indicator (Desktop) */}
              {showProgress && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden lg:flex items-center space-x-4 px-4 py-2 bg-white/5 rounded-xl"
                >
                  {/* Phase Badge */}
                  <div className="flex items-center space-x-2">
                    <div className={clsx(
                      'p-1.5 rounded-lg bg-gradient-to-r',
                      phaseInfo.color
                    )}>
                      <phaseInfo.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-gray-400">Phase {phaseInfo.phase}</div>
                      <div className="font-semibold">{phaseInfo.name}</div>
                    </div>
                  </div>

                  {/* Day Counter */}
                  <div className="h-8 w-px bg-white/20" />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="text-sm">
                      <div className="text-xs text-gray-400">Day</div>
                      <div className="font-semibold">{currentDay}/90</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-8 w-px bg-white/20" />
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <div className="text-sm">
                      <div className="text-xs text-gray-400">Progress</div>
                      <div className="font-semibold text-emerald-400">{journeyProgress}%</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="relative" ref={accountMenuRef}>
                  <motion.button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      {profile?.full_name ? (
                        <span className="text-white text-sm font-semibold">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold">
                        {profile?.full_name || 'Explorer'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {profile?.persona || 'AI Learner'}
                      </div>
                    </div>
                    <ChevronDown className={clsx(
                      'w-4 h-4 text-gray-400 transition-transform',
                      isAccountMenuOpen && 'rotate-180'
                    )} />
                  </motion.button>

                  {/* Account Dropdown Menu */}
                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                              {profile?.full_name ? (
                                <span className="text-white font-semibold">
                                  {profile.full_name.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">{profile?.full_name || 'Explorer'}</div>
                              <div className="text-xs text-gray-400">{profile?.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Journey Stats */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Journey Progress</span>
                              <span className="text-sm font-semibold text-emerald-400">{journeyProgress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${journeyProgress}%` }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Day {currentDay} of 90</span>
                              <span className="text-gray-500">{phaseInfo.name} Phase</span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              router.push('/profile')
                              setIsAccountMenuOpen(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center space-x-3"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push('/settings')
                              setIsAccountMenuOpen(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center space-x-3"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center space-x-3 text-red-400"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : isOnboarding ? (
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-lg">
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={clsx(
                          'w-2 h-2 rounded-full transition-colors',
                          pathname === '/survey' && step === 1
                            ? 'bg-emerald-400'
                            : pathname === '/plan' && step === 2
                            ? 'bg-emerald-400'
                            : step < (pathname === '/plan' ? 2 : 1)
                            ? 'bg-emerald-400/50'
                            : 'bg-white/20'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Setting up...</span>
                </div>
              ) : (
                <motion.button
                  onClick={() => router.push('/survey')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-sans font-semibold hover:shadow-lg transition flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Journey
                  <ArrowRight className="ml-2 w-4 h-4" />
                </motion.button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={clsx(
                    'p-1 rounded bg-gradient-to-r',
                    phaseInfo.color
                  )}>
                    <phaseInfo.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold">
                    {phaseInfo.name} • Day {currentDay}
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">
                  {journeyProgress}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${journeyProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-lg"
            >
              <div className="px-6 py-4 space-y-2">
                {visibleNavItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={clsx(
                        'w-full px-4 py-3 rounded-lg font-sans font-medium transition-all duration-200 flex items-center space-x-3',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  )
                })}

                {/* Mobile Auth Section */}
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-white/10 my-2" />
                    <button
                      onClick={() => router.push('/profile')}
                      className="w-full px-4 py-3 rounded-lg font-sans font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center space-x-3"
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => router.push('/settings')}
                      className="w-full px-4 py-3 rounded-lg font-sans font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center space-x-3"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 rounded-lg font-sans font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 flex items-center space-x-3"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16" />
    </>
  )
}