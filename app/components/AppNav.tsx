'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Calendar,
  LayoutDashboard,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  Download
} from 'lucide-react'

interface AppNavProps {
  showAccountability?: boolean
  onAccountabilityClick?: () => void
  hasSubscription?: boolean
}

export default function AppNav({ showAccountability = false, onAccountabilityClick, hasSubscription = false }: AppNavProps) {
  const { user, profile, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate avatar initials
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  // Generate a consistent color based on email
  const getAvatarColor = () => {
    if (!user?.email) return 'bg-emerald-500'
    const colors = [
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-rose-500'
    ]
    const index = user.email.charCodeAt(0) % colors.length
    return colors[index]
  }

  const navLinks = [
    { href: '/plan', label: 'My Plan', icon: LayoutDashboard },
    { href: '/timeline', label: 'Timeline', icon: Calendar }
  ]

  // Get persona info for display
  const getPersonaDisplay = () => {
    if (!profile?.persona) return null
    return profile.persona.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/plan" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-medium hidden sm:inline">My AI Onboarding</span>
          </Link>

          {/* Center Navigation + Accountability Button */}
          <div className="flex items-center space-x-4">
            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(link => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-white/10 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Accountability Button */}
            {showAccountability && !hasSubscription && (
              <button
                onClick={onAccountabilityClick}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-sans font-semibold text-white text-sm hover:shadow-lg hover:shadow-yellow-500/25 transition flex items-center animate-pulse"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Get Accountability</span>
              </button>
            )}
          </div>

          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Account menu"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full ${getAvatarColor()} flex items-center justify-center`} role="img" aria-label="User avatar">
                <span className="text-white text-sm font-medium">{getInitials()}</span>
              </div>
              
              {/* Name/Email */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">
                  {profile?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-400">
                  {user?.email}
                </div>
              </div>
              
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-white/10 py-2"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="account-menu-button"
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {user?.email}
                      </div>
                    </div>
                    {profile?.persona && (
                      <div className="ml-2">
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                          <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                          <span className="text-xs text-emerald-300 font-medium">
                            {getPersonaDisplay()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menu Items */}
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>

                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      signOut()
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-center py-2 border-t border-white/10">
          <div className="flex items-center space-x-2">
            {navLinks.map(link => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-1 px-3 py-2 rounded-lg transition-all text-sm
                    ${isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}