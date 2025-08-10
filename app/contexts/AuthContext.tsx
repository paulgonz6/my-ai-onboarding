'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { handlePendingSurveyData } from '@/lib/handle-pending-survey'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  currentDay: number
  journeyProgress: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState(0)
  const [journeyProgress, setJourneyProgress] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
          await calculateProgress(session.user.id)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Check for pending survey data on sign in (especially after email confirmation)
        if (event === 'SIGNED_IN') {
          console.log('User signed in, checking for pending survey data...');
          await handlePendingSurveyData(session.user.id);
        }
        
        await loadProfile(session.user.id)
        await calculateProgress(session.user.id)
      } else {
        setProfile(null)
        setCurrentDay(0)
        setJourneyProgress(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const calculateProgress = async (userId: string) => {
    try {
      // Get user plan
      let { data: plan } = await supabase
        .from('user_plans')
        .select('start_date, phase1_activities, phase2_activities, phase3_activities')
        .eq('user_id', userId)
        .single()

      // If no plan found, try getting the most recent one
      if (!plan) {
        const { data: plans } = await supabase
          .from('user_plans')
          .select('start_date, phase1_activities, phase2_activities, phase3_activities')
          .eq('user_id', userId)
          .order('generated_at', { ascending: false })
          .limit(1)
        
        plan = plans?.[0] || null
      }

      if (plan) {
        // Calculate current day
        const startDate = new Date(plan.start_date)
        const today = new Date()
        const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const currentDayNum = Math.max(1, Math.min(90, daysPassed + 1))
        setCurrentDay(currentDayNum)

        // Get progress data
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('status')
          .eq('user_id', userId)
          .eq('status', 'completed')

        // Calculate overall progress
        const totalActivities = plan.phase1_activities.length + 
                              plan.phase2_activities.length + 
                              plan.phase3_activities.length
        const completedActivities = progressData?.length || 0
        const progress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0
        setJourneyProgress(Math.round(progress))
      }
    } catch (error) {
      console.error('Error calculating progress:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
      await calculateProgress(user.id)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      setCurrentDay(0)
      setJourneyProgress(0)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signOut,
      refreshProfile,
      currentDay,
      journeyProgress
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}