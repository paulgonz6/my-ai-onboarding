'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  X,
  ArrowLeft,
  Grid3x3,
  List,
  User,
  Sparkles
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ActivityTemplate, UserPlan, UserProgress, CalendarEvent } from '@/lib/supabase'

interface CalendarActivity {
  id: string
  title: string
  date: Date
  time: string
  duration: number
  type: string
  difficulty: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  activityId?: string
  eventId?: string
}

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activities, setActivities] = useState<CalendarActivity[]>([])
  const [userName, setUserName] = useState('')
  const [draggedActivity, setDraggedActivity] = useState<CalendarActivity | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivity | null>(null)

  useEffect(() => {
    loadCalendarData()
  }, [currentDate, viewMode])

  const loadCalendarData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/survey')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserName(profile.full_name || 'Explorer')
      }

      // Get user plan
      const { data: plan } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!plan) {
        router.push('/plan')
        return
      }

      // Get calendar events
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString())

      // Get activity templates for the plan
      const allActivityIds = [
        ...plan.phase1_activities,
        ...plan.phase2_activities,
        ...plan.phase3_activities
      ]

      const { data: templates } = await supabase
        .from('activity_templates')
        .select('*')
        .in('id', allActivityIds)

      // Create calendar activities
      const calendarActivities: CalendarActivity[] = []

      // Add scheduled activities from plan
      if (templates) {
        const startDate = new Date(plan.start_date)
        templates.forEach((template, index) => {
          const dayOffset = Math.floor(index * 3) // Spread activities every 3 days
          const activityDate = new Date(startDate)
          activityDate.setDate(activityDate.getDate() + dayOffset)

          // Only add if in current view range
          if (activityDate >= startOfMonth && activityDate <= endOfMonth) {
            calendarActivities.push({
              id: `template-${template.id}`,
              title: template.title,
              date: activityDate,
              time: plan.preferred_time || '09:00',
              duration: template.duration_minutes,
              type: template.type,
              difficulty: template.difficulty,
              status: 'scheduled',
              activityId: template.id
            })
          }
        })
      }

      // Add calendar events
      if (events) {
        events.forEach(event => {
          calendarActivities.push({
            id: `event-${event.id}`,
            title: event.title,
            date: new Date(event.start_time),
            time: new Date(event.start_time).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            duration: Math.floor((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60)),
            type: 'custom',
            difficulty: 'easy',
            status: event.status as CalendarActivity['status'],
            eventId: event.id,
            activityId: event.activity_id || undefined
          })
        })
      }

      setActivities(calendarActivities)
      setLoading(false)
    } catch (error) {
      console.error('Error loading calendar:', error)
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty days for alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => 
      activity.date.toDateString() === date.toDateString()
    )
  }

  const handleDragStart = (activity: CalendarActivity) => {
    setDraggedActivity(activity)
  }

  const handleDragEnd = () => {
    setDraggedActivity(null)
  }

  const handleDrop = async (date: Date) => {
    if (!draggedActivity) return

    // Update the activity date
    const updatedActivity = { ...draggedActivity, date }
    
    // Update in database if it's a calendar event
    if (draggedActivity.eventId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newStartTime = new Date(date)
      newStartTime.setHours(parseInt(draggedActivity.time.split(':')[0]))
      newStartTime.setMinutes(parseInt(draggedActivity.time.split(':')[1]))

      const newEndTime = new Date(newStartTime)
      newEndTime.setMinutes(newEndTime.getMinutes() + draggedActivity.duration)

      await supabase
        .from('calendar_events')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
          status: 'rescheduled'
        })
        .eq('id', draggedActivity.eventId)

      // Update local state
      setActivities(prev => prev.map(a => 
        a.id === draggedActivity.id ? updatedActivity : a
      ))
    }

    setDraggedActivity(null)
  }

  const handleActivityClick = (activity: CalendarActivity) => {
    setSelectedActivity(activity)
    setShowActivityModal(true)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exercise': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'experiment': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'reflection': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'challenge': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'share': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      case 'cancelled': return <X className="w-3 h-3 text-red-500" />
      case 'rescheduled': return <Clock className="w-3 h-3 text-yellow-500" />
      default: return <Circle className="w-3 h-3 text-gray-400" />
    }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/timeline')}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-display font-bold">Activity Calendar</h1>
                <p className="text-sm text-gray-400 font-sans mt-1">
                  {userName} • {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* View Mode Selector */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded transition ${
                    viewMode === 'month' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded transition ${
                    viewMode === 'week' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded transition ${
                    viewMode === 'day' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-display font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-sans font-semibold text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayActivities = day ? getActivitiesForDate(day) : []
                const isToday = day && day.toDateString() === new Date().toDateString()
                const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString()

                return (
                  <motion.div
                    key={index}
                    className={`min-h-[100px] p-2 rounded-lg border transition ${
                      !day 
                        ? 'border-transparent' 
                        : isToday
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : isSelected
                        ? 'border-teal-500/50 bg-teal-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    onClick={() => day && setSelectedDate(day)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (day && draggedActivity) {
                        e.currentTarget.classList.add('bg-emerald-500/20')
                      }
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-emerald-500/20')
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('bg-emerald-500/20')
                      if (day) handleDrop(day)
                    }}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-sans mb-1">
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayActivities.slice(0, 2).map(activity => (
                            <motion.div
                              key={activity.id}
                              draggable
                              onDragStart={() => handleDragStart(activity)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleActivityClick(activity)
                              }}
                              className={`text-xs px-1.5 py-0.5 rounded border cursor-move ${getTypeColor(activity.type)}`}
                              whileHover={{ scale: 1.05 }}
                              whileDrag={{ scale: 1.1, opacity: 0.8 }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{activity.title}</span>
                                {getStatusIcon(activity.status)}
                              </div>
                            </motion.div>
                          ))}
                          {dayActivities.length > 2 && (
                            <div className="text-xs text-gray-400 text-center">
                              +{dayActivities.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            <div className="grid grid-cols-7 gap-4">
              {getWeekDays(currentDate).map(day => {
                const dayActivities = getActivitiesForDate(day)
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-4 rounded-lg border ${
                      isToday
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className="text-sm font-sans text-gray-400">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-2xl font-bold">
                        {day.getDate()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {dayActivities.map(activity => (
                        <motion.div
                          key={activity.id}
                          onClick={() => handleActivityClick(activity)}
                          className="p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/15 transition"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">{activity.time}</span>
                            {getStatusIcon(activity.status)}
                          </div>
                          <div className="text-sm font-sans font-semibold">
                            {activity.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {activity.duration} min
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-display font-bold mb-6 text-center">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-4">
                {getActivitiesForDate(currentDate).length > 0 ? (
                  getActivitiesForDate(currentDate).map(activity => (
                    <motion.div
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className="p-6 bg-white/10 rounded-xl cursor-pointer hover:bg-white/15 transition"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-display font-bold">
                              {activity.time}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(activity.type)}`}>
                              {activity.type}
                            </span>
                            {getStatusIcon(activity.status)}
                          </div>
                          <h4 className="text-xl font-sans font-semibold mb-2">
                            {activity.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {activity.duration} minutes
                            </span>
                            <span className="capitalize">
                              {activity.difficulty}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (activity.activityId) {
                              router.push(`/activity/${activity.activityId}`)
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-sans font-semibold hover:shadow-lg transition"
                        >
                          Start
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No activities scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Modal */}
        <AnimatePresence>
          {showActivityModal && selectedActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowActivityModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full bg-gray-900 rounded-2xl p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold">
                    {selectedActivity.title}
                  </h2>
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Date</span>
                    <span className="font-sans font-semibold">
                      {selectedActivity.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Time</span>
                    <span className="font-sans font-semibold">
                      {selectedActivity.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-sans font-semibold">
                      {selectedActivity.duration} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Type</span>
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(selectedActivity.type)}`}>
                      {selectedActivity.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Status</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedActivity.status)}
                      <span className="font-sans font-semibold capitalize">
                        {selectedActivity.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  {selectedActivity.activityId && (
                    <button
                      onClick={() => router.push(`/activity/${selectedActivity.activityId}`)}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-sans font-semibold hover:shadow-lg transition"
                    >
                      Start Activity
                    </button>
                  )}
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="flex-1 py-3 bg-white/10 rounded-lg font-sans font-semibold hover:bg-white/15 transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}