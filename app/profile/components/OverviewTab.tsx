'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  Activity,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Stats {
  totalActivities: number
  completedActivities: number
  currentStreak: number
  timeSpent: number
  weeklyProgress: number[]
}

export default function OverviewTab() {
  const { user, profile, currentDay, journeyProgress } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    completedActivities: 0,
    currentStreak: 0,
    timeSpent: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [user])

  const loadStats = async () => {
    if (!user) return
    
    try {
      // Get user plan activities
      const { data: plan } = await supabase
        .from('user_plans')
        .select('phase1_activities, phase2_activities, phase3_activities')
        .eq('user_id', user.id)
        .single()

      if (plan) {
        const total = plan.phase1_activities.length + 
                     plan.phase2_activities.length + 
                     plan.phase3_activities.length

        // Get progress data
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)

        const completed = progress?.filter(p => p.status === 'completed').length || 0

        // Calculate streak (simplified for demo)
        const today = new Date()
        const streak = progress?.filter(p => {
          const completedDate = new Date(p.completed_at)
          const daysDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff <= 7
        }).length || 0

        setStats({
          totalActivities: total,
          completedActivities: completed,
          currentStreak: Math.min(streak, 7),
          timeSpent: completed * 15, // Assuming 15 min per activity
          weeklyProgress: [65, 72, 68, 81, 74, 89, 92] // Mock data for demo
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Complete your first activity', earned: true, icon: Award },
    { id: 2, name: 'Week Warrior', description: '7-day streak', earned: stats.currentStreak >= 7, icon: Zap },
    { id: 3, name: 'Phase Master', description: 'Complete a phase', earned: currentDay > 30, icon: Target },
    { id: 4, name: 'AI Partner', description: 'Complete 50% of journey', earned: journeyProgress >= 50, icon: Users },
  ]

  const upcomingMilestones = [
    { day: 30, title: 'Complete Foundation Phase', description: 'Master the basics of AI collaboration' },
    { day: 60, title: 'Integration Checkpoint', description: 'AI becomes part of your workflow' },
    { day: 90, title: 'Journey Complete', description: 'You\'re now an AI power user' },
  ].filter(m => m.day > currentDay)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold">{stats.completedActivities}/{stats.totalActivities}</span>
          </div>
          <h3 className="font-semibold mb-1">Activities Completed</h3>
          <p className="text-sm text-gray-400">Keep up the great work!</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-teal-400" />
            <span className="text-2xl font-bold">{stats.currentStreak}</span>
          </div>
          <h3 className="font-semibold mb-1">Day Streak</h3>
          <p className="text-sm text-gray-400">Consistency is key</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold">{stats.timeSpent}</span>
          </div>
          <h3 className="font-semibold mb-1">Minutes Invested</h3>
          <p className="text-sm text-gray-400">Time well spent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold">Day {currentDay}</span>
          </div>
          <h3 className="font-semibold mb-1">Current Day</h3>
          <p className="text-sm text-gray-400">Of your 90-day journey</p>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-4">Weekly Activity</h3>
        <div className="flex items-end justify-between h-32 mb-2">
          {stats.weeklyProgress.map((value, index) => (
            <div key={index} className="flex-1 mx-1">
              <div 
                className="bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${value}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day} className="flex-1 text-center">{day}</span>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-4">Achievements</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                flex items-center space-x-4 p-4 rounded-xl border transition-all
                ${achievement.earned 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30' 
                  : 'bg-white/5 border-white/10 opacity-50'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${achievement.earned 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-white/10'
                }
              `}>
                <achievement.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{achievement.name}</h4>
                <p className="text-sm text-gray-400">{achievement.description}</p>
              </div>
              {achievement.earned && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-4">Upcoming Milestones</h3>
        <div className="space-y-4">
          {upcomingMilestones.map((milestone, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <span className="text-lg font-bold">Day {milestone.day}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{milestone.title}</h4>
                <p className="text-sm text-gray-400">{milestone.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}