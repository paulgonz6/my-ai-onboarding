'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle2,
  Circle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Rocket,
  Brain
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ActivityTemplate, UserPlan, UserProgress } from '@/lib/supabase'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/app/contexts/AuthContext'
import AppLayout from '@/app/components/AppLayout'

interface TimelineActivity extends ActivityTemplate {
  progress?: UserProgress
  scheduledDate?: Date
  phaseNumber: number
}

function TimelineContent() {
  const router = useRouter()
  const { user, profile, currentDay: authCurrentDay } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [activities, setActivities] = useState<TimelineActivity[]>([])
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1)

  useEffect(() => {
    if (user) {
      loadTimelineData()
    }
  }, [user])

  const loadTimelineData = async () => {
    try {
      if (!user) return

      // Get user plan (try with is_active first, fallback to without)
      let { data: plan, error: planError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // If no plan found with basic query, try other approaches
      if (planError || !plan) {
        // Try getting the most recent plan
        const { data: plans } = await supabase
          .from('user_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
        
        plan = plans?.[0] || null
      }

      if (!plan) {
        router.push('/plan')
        return
      }

      setUserPlan(plan)

      // Get all activity IDs from the plan
      const allActivityIds = [
        ...plan.phase1_activities,
        ...plan.phase2_activities,
        ...plan.phase3_activities
      ]

      // Fetch activity templates
      const { data: templates } = await supabase
        .from('activity_templates')
        .select('*')
        .in('id', allActivityIds)

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_id', plan.id)

      // Calculate current day based on start date
      const startDate = new Date(plan.start_date)

      // Organize activities by phase with progress
      if (templates) {
        const activitiesWithProgress: TimelineActivity[] = templates.map(activity => {
          const progress = progressData?.find(p => p.activity_id === activity.id)
          const phaseNumber = activity.phase
          
          // Calculate scheduled date based on phase and position
          const phaseStartDay = phaseNumber === 1 ? 1 : phaseNumber === 2 ? 31 : 61
          const activityIndex = phaseNumber === 1 
            ? plan.phase1_activities.indexOf(activity.id)
            : phaseNumber === 2
            ? plan.phase2_activities.indexOf(activity.id)
            : plan.phase3_activities.indexOf(activity.id)
          
          const scheduledDay = phaseStartDay + (activityIndex * 3) // Spread activities across phase
          const scheduledDate = new Date(startDate)
          scheduledDate.setDate(scheduledDate.getDate() + scheduledDay - 1)

          return {
            ...activity,
            progress,
            scheduledDate,
            phaseNumber
          }
        })

        // Sort by scheduled date
        activitiesWithProgress.sort((a, b) => 
          (a.scheduledDate?.getTime() || 0) - (b.scheduledDate?.getTime() || 0)
        )

        setActivities(activitiesWithProgress)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading timeline:', error)
      setLoading(false)
    }
  }

  const getPhaseIcon = (phase: number) => {
    switch (phase) {
      case 1: return <Sparkles className="w-5 h-5" />
      case 2: return <Rocket className="w-5 h-5" />
      case 3: return <Brain className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getPhaseTitle = (phase: number) => {
    switch (phase) {
      case 1: return 'Foundation (Days 1-30)'
      case 2: return 'Integration (Days 31-60)'
      case 3: return 'Mastery (Days 61-90)'
      default: return `Phase ${phase}`
    }
  }

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1: return 'Build comfort and establish habits with AI'
      case 2: return 'Integrate AI into your daily workflow'
      case 3: return 'Become an AI champion in your organization'
      default: return ''
    }
  }

  const getActivityStatus = (activity: TimelineActivity) => {
    if (activity.progress?.status === 'completed') return 'completed'
    if (activity.progress?.status === 'in_progress') return 'in_progress'
    
    const activityDay = Math.floor(
      ((activity.scheduledDate?.getTime() || 0) - new Date(userPlan?.start_date || '').getTime()) 
      / (1000 * 60 * 60 * 24)
    ) + 1
    
    if (activityDay <= authCurrentDay) return 'available'
    return 'locked'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'in_progress': return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
      case 'available': return <Circle className="w-5 h-5 text-teal-400" />
      default: return <Circle className="w-5 h-5 text-gray-600" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'advanced': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exercise': return '💪'
      case 'experiment': return '🧪'
      case 'reflection': return '🤔'
      case 'challenge': return '🎯'
      case 'share': return '🤝'
      default: return '📝'
    }
  }

  const calculatePhaseProgress = (phase: number) => {
    const phaseActivities = activities.filter(a => a.phaseNumber === phase)
    const completed = phaseActivities.filter(a => a.progress?.status === 'completed').length
    return phaseActivities.length > 0 ? (completed / phaseActivities.length) * 100 : 0
  }

  const calculateOverallProgress = () => {
    const completed = activities.filter(a => a.progress?.status === 'completed').length
    return activities.length > 0 ? (completed / activities.length) * 100 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-emerald-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Content */}
        <div className="pt-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Your AI Journey</h1>
          <p className="text-gray-400">Track your progress through the 90-day transformation</p>
        </motion.div>
      </div>

      {/* Progress Overview */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">Overall Progress</h2>
            <span className="text-2xl font-bold text-emerald-400">
              {Math.round(calculateOverallProgress())}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateOverallProgress()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map(phase => (
              <div key={phase} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getPhaseIcon(phase)}
                  <span className="ml-2 text-sm font-sans">Phase {phase}</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(calculatePhaseProgress(phase))}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {[1, 2, 3].map(phase => {
            const phaseActivities = activities.filter(a => a.phaseNumber === phase)
            const isExpanded = expandedPhase === phase

            return (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: phase * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                {/* Phase Header */}
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : phase)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${
                      phase === 1 ? 'from-emerald-500/20 to-teal-500/20' :
                      phase === 2 ? 'from-blue-500/20 to-purple-500/20' :
                      'from-orange-500/20 to-red-500/20'
                    }`}>
                      {getPhaseIcon(phase)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-display font-bold">
                        {getPhaseTitle(phase)}
                      </h3>
                      <p className="text-sm text-gray-400 font-sans mt-1">
                        {getPhaseDescription(phase)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400 font-sans">
                        {phaseActivities.filter(a => a.progress?.status === 'completed').length} of {phaseActivities.length} completed
                      </div>
                      <div className="w-32 bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${calculatePhaseProgress(phase)}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Phase Activities */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    className="border-t border-white/10"
                  >
                    <div className="p-6 space-y-4">
                      {phaseActivities.map((activity, index) => {
                        const status = getActivityStatus(activity)
                        const isLocked = status === 'locked'

                        return (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative flex items-start space-x-4 p-4 rounded-xl transition ${
                              isLocked 
                                ? 'bg-white/5 opacity-50' 
                                : 'bg-white/10 hover:bg-white/15 cursor-pointer'
                            }`}
                            onClick={() => !isLocked && router.push(`/activity/${activity.id}`)}
                          >
                            {/* Timeline connector */}
                            {index < phaseActivities.length - 1 && (
                              <div className="absolute left-9 top-12 bottom-0 w-0.5 bg-white/20" />
                            )}

                            {/* Status icon */}
                            <div className="flex-shrink-0 mt-1">
                              {getStatusIcon(status)}
                            </div>

                            {/* Activity content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-sans font-semibold flex items-center">
                                    <span className="mr-2">{getTypeIcon(activity.type)}</span>
                                    {activity.title}
                                    {status === 'in_progress' && (
                                      <span className="ml-2 text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                                        In Progress
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {activity.description}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {activity.duration_minutes} min
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(activity.difficulty)}`}>
                                      {activity.difficulty}
                                    </span>
                                    {activity.scheduledDate && (
                                      <span className="text-xs text-gray-500">
                                        Day {Math.floor(
                                          ((activity.scheduledDate.getTime()) - new Date(userPlan?.start_date || '').getTime()) 
                                          / (1000 * 60 * 60 * 24)
                                        ) + 1}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {!isLocked && (
                                  <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Milestones */}
        <div className="mt-12">
          <h2 className="text-xl font-display font-bold mb-6">Key Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { day: 7, title: 'First Week', icon: <Zap />, achieved: currentDay >= 7 },
              { day: 30, title: 'Foundation Complete', icon: <Target />, achieved: currentDay >= 30 },
              { day: 60, title: 'Integration Master', icon: <TrendingUp />, achieved: currentDay >= 60 },
              { day: 90, title: 'AI Champion', icon: <Award />, achieved: currentDay >= 90 }
            ].map((milestone, index) => (
              <motion.div
                key={milestone.day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl text-center transition ${
                  milestone.achieved
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                  milestone.achieved
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-white/10'
                }`}>
                  {React.cloneElement(milestone.icon, {
                    className: `w-6 h-6 ${milestone.achieved ? 'text-white' : 'text-gray-400'}`
                  })}
                </div>
                <h3 className="font-sans font-semibold mb-1">
                  {milestone.title}
                </h3>
                <p className="text-sm text-gray-400">
                  Day {milestone.day}
                </p>
                {milestone.achieved && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
        </div>
        </div>{/* End of pt-8 wrapper */}
      </div>
    </AppLayout>
  )
}

export default function TimelinePage() {
  return (
    <ProtectedRoute>
      <TimelineContent />
    </ProtectedRoute>
  )
}