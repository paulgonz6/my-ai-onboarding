'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AppLayout from '@/app/components/AppLayout'
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard, 
  ClipboardList,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Clock,
  Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Tab components
import OverviewTab from './components/OverviewTab'
import AccountTab from './components/AccountTab'
import BillingTab from './components/BillingTab'
import SurveyTab from './components/SurveyTab'
import SecurityTab from './components/SecurityTab'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'account', label: 'Account', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'survey', label: 'Survey Responses', icon: ClipboardList },
  { id: 'security', label: 'Security', icon: Shield },
]

export default function ProfilePage() {
  const { user, profile, loading: authLoading, currentDay, journeyProgress, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Get user initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get current phase based on current day
  const getCurrentPhase = () => {
    if (currentDay <= 30) return { name: 'Foundation', color: 'from-emerald-500 to-teal-500' }
    if (currentDay <= 60) return { name: 'Integration', color: 'from-teal-500 to-cyan-500' }
    return { name: 'Mastery', color: 'from-cyan-500 to-emerald-500' }
  }

  const phase = getCurrentPhase()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="min-h-screen bg-black text-white">
          {/* Background gradient */}
          <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/10 via-black to-teal-900/10" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-3xl font-display font-semibold text-white">
                        {getInitials(profile?.full_name)}
                      </span>
                    </div>
                    {profile?.persona && (
                      <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-xs font-semibold">
                        {profile.persona}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <h1 className="text-3xl font-display font-bold mb-2">
                      {profile?.full_name || 'Welcome'}
                    </h1>
                    <p className="text-gray-400 mb-4">{user?.email}</p>
                    
                    {/* Journey Stats */}
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm">Day {currentDay} of 90</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-teal-400" />
                        <span className="text-sm">{journeyProgress}% Complete</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${phase.color}`} />
                        <span className="text-sm">{phase.name} Phase</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - journeyProgress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{journeyProgress}%</div>
                      <div className="text-xs text-gray-400">Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all
                      ${activeTab === tab.id 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'account' && <AccountTab />}
              {activeTab === 'billing' && <BillingTab />}
              {activeTab === 'survey' && <SurveyTab />}
              {activeTab === 'security' && <SecurityTab />}
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}