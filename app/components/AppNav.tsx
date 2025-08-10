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
  ChevronDown
} from 'lucide-react'

export default function AppNav() {
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
    { href: '/timeline', label: 'Timeline', icon: Calendar },
    { href: '/plan', label: 'My Plan', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: User }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/timeline" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-white font-medium">My AI Onboarding</span>
          </Link>

          {/* Center Navigation */}
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

          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full ${getAvatarColor()} flex items-center justify-center`}>
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
              
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-lg shadow-xl border border-white/10 py-2">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="text-sm font-medium text-white">
                    {profile?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {user?.email}
                  </div>
                  {profile?.persona && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-xs text-emerald-300">
                        {profile.persona.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Menu Items */}
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  View Profile
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
        <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10">
          {navLinks.map(link => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all
                  ${isActive 
                    ? 'text-emerald-400' 
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}