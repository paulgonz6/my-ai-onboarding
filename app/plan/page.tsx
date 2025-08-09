'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Sparkles,
  Calendar,
  Clock,
  Target,
  ChevronRight,
  Edit2,
  Download,
  Share2,
  CheckCircle2,
  Brain,
  Zap,
  Users,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react'
import { generate90DayPlan, Activity } from '../../lib/activities'
import { supabase } from '@/lib/supabase'
import AuthModal from '../components/AuthModal'
import AccountabilityModal from '../components/AccountabilityModal'

// Persona definitions with icons and descriptions
const personaDefinitions = {
  'cautious-explorer': {
    title: 'The Cautious Explorer',
    tagline: 'Thoughtful and thorough in your approach',
    description: 'You prefer to understand before you act. Your AI journey will start with simple, low-risk experiments that build confidence gradually.',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500'
  },
  'eager-beginner': {
    title: 'The Eager Beginner',
    tagline: 'Excited to dive in and explore',
    description: 'Your enthusiasm is your superpower. We\'ll channel that energy into quick wins and varied experiments to keep you engaged.',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500'
  },
  'practical-adopter': {
    title: 'The Practical Adopter',
    tagline: 'Real-world focused and results-driven',
    description: 'You want AI that works for your actual job. Your plan focuses on practical applications with immediate value.',
    icon: Target,
    color: 'from-purple-500 to-pink-500'
  },
  'efficiency-seeker': {
    title: 'The Efficiency Seeker',
    tagline: 'Maximizing output and saving time',
    description: 'Time is your most valuable resource. Your journey emphasizes automation and time-saving techniques from day one.',
    icon: Zap,
    color: 'from-orange-500 to-red-500'
  },
  'innovation-driver': {
    title: 'The Innovation Driver',
    tagline: 'Leading transformation for your team',
    description: 'You\'re not just adopting AI—you\'re bringing others along. Your plan includes leadership and knowledge-sharing elements.',
    icon: Users,
    color: 'from-indigo-500 to-purple-500'
  },
  'power-optimizer': {
    title: 'The Power Optimizer',
    tagline: 'Pushing boundaries and maximizing potential',
    description: 'You\'re ready for advanced techniques. Your journey focuses on cutting-edge applications and workflow optimization.',
    icon: TrendingUp,
    color: 'from-pink-500 to-rose-500'
  }
}

type ViewMode = 'timeline' | 'calendar' | 'list'

export default function PlanPage() {
  const router = useRouter()
  const [stage, setStage] = useState<'loading' | 'persona' | 'plan'>('loading')
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your responses...')
  const [persona, setPersona] = useState<string>('')
  const [plan, setPlan] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [selectedPhase, setSelectedPhase] = useState(1)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [surveyData, setSurveyData] = useState<any>(null)
  const [showAccountabilityModal, setShowAccountabilityModal] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    console.log('=== PLAN PAGE AUTH CHECK DEBUG ===');
    
    // Get survey data from localStorage first
    const rawSurveyAnswers = localStorage.getItem('surveyAnswers')
    const rawPersona = localStorage.getItem('userPersona')
    
    console.log('Raw localStorage surveyAnswers:', rawSurveyAnswers)
    console.log('Raw localStorage persona:', rawPersona)
    
    const surveyAnswers = JSON.parse(rawSurveyAnswers || '{}')
    const userPersona = rawPersona || 'practical-adopter'
    
    console.log('Parsed surveyAnswers:', surveyAnswers)
    console.log('Final persona:', userPersona)
    
    // Check if we have survey data
    if (Object.keys(surveyAnswers).length === 0) {
      console.log('No survey data found, redirecting to survey')
      // No survey data, redirect to survey
      router.push('/survey')
      return
    }
    
    // Set survey data for use in auth modal
    const dataForModal = { answers: surveyAnswers, persona: userPersona }
    console.log('Setting surveyData state for AuthModal:', dataForModal)
    setSurveyData(dataForModal)
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setIsAuthenticated(true)
      // User is logged in, generate plan with their data
      generateLocalPlan(surveyAnswers, userPersona)
    } else {
      // Not authenticated, generate plan and show auth modal
      console.log('User not authenticated, will show auth modal after plan generation')
      generateLocalPlan(surveyAnswers, userPersona)
    }
  }

  const loadUserPlan = async () => {
    // TODO: Load plan from database
    const surveyAnswers = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
    const userPersona = localStorage.getItem('userPersona') || 'practical-adopter'
    generateLocalPlan(surveyAnswers, userPersona)
  }

  const generateLocalPlan = (surveyAnswers: any, userPersona: string) => {
    
    // Simulate plan generation with progressive messages
    const messages = [
      'Analyzing your responses...',
      'Understanding your work style...',
      'Mapping your learning preferences...',
      'Selecting personalized activities...',
      'Designing your 90-day journey...',
      'Finalizing your plan...'
    ]
    
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length - 1) {
        messageIndex++
        setLoadingMessage(messages[messageIndex])
      }
    }, 500)

    // Generate the plan
    setTimeout(() => {
      clearInterval(messageInterval)
      setPersona(userPersona)
      
      // Generate personalized plan
      const generatedPlan = generate90DayPlan(
        userPersona,
        surveyAnswers['work-type'] || 'operations',
        surveyAnswers['engagement-frequency'] || '3-times',
        surveyAnswers['time-wasters'] || [],
        surveyAnswers['success-metric'] || 'save-time'
      )
      
      setPlan(generatedPlan)
      setStage('persona')
      
      // Show auth modal after plan is generated if not authenticated
      setTimeout(() => {
        if (!isAuthenticated) {
          // Get fresh data from localStorage to ensure it's available
          const freshAnswers = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
          const freshPersona = localStorage.getItem('userPersona') || userPersona
          const modalData = { answers: freshAnswers, persona: freshPersona }
          
          console.log('Showing auth modal with fresh surveyData:', modalData)
          setSurveyData(modalData) // Update state with fresh data
          setShowAuthModal(true)
        }
      }, 500)
    }, 3000)
  }
  
  const handleAuthSuccess = async (userId: string) => {
    setShowAuthModal(false)
    setIsAuthenticated(true)
    
    // Force a re-check of auth state to update navigation
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('User authenticated successfully:', user.id)
      // The auth context will automatically update via onAuthStateChange
    }
    
    // Stay on plan page to see the generated plan
    // User can navigate to timeline when ready
  }

  const handleContinueToPlan = () => {
    setStage('plan')
  }

  const handleExportCalendar = () => {
    if (!hasSubscription) {
      setShowAccountabilityModal(true)
      return
    }
    // Generate ICS file content
    const icsContent = generateICSContent(plan)
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-ai-onboarding-plan.ics'
    a.click()
  }
  
  const handleSubscribe = () => {
    // TODO: Implement Stripe checkout
    console.log('Subscribe to Accountability Premium')
    setHasSubscription(true)
    setShowAccountabilityModal(false)
  }

  const generateICSContent = (plan: any) => {
    // Simple ICS generation (would be more robust in production)
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//My AI Onboarding//EN\n'
    
    const startDate = new Date()
    let currentDate = new Date(startDate)
    
    Object.values(plan).forEach((phase: any, phaseIndex) => {
      phase.activities.forEach((activity: Activity, index: number) => {
        const eventDate = new Date(currentDate)
        eventDate.setDate(eventDate.getDate() + (phaseIndex * 30) + (index * 3))
        
        ics += 'BEGIN:VEVENT\n'
        ics += `DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`
        ics += `DTEND:${new Date(eventDate.getTime() + activity.duration * 60000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`
        ics += `SUMMARY:AI Practice: ${activity.title}\n`
        ics += `DESCRIPTION:${activity.description}\\n\\nDuration: ${activity.duration} minutes\\n\\nOutcomes: ${activity.outcomes.join(', ')}\n`
        ics += 'END:VEVENT\n'
      })
    })
    
    ics += 'END:VCALENDAR'
    return ics
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatePresence mode="wait">
        {/* Loading Stage */}
        {stage === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-8"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h2
                key={loadingMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-display font-bold mb-4"
              >
                {loadingMessage}
              </motion.h2>
              
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Persona Reveal Stage */}
        {stage === 'persona' && persona && (
          <motion.div
            key="persona"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-6"
          >
            <div className="max-w-2xl w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${personaDefinitions[persona as keyof typeof personaDefinitions].color} mb-8`}
              >
                {(() => {
                  const Icon = personaDefinitions[persona as keyof typeof personaDefinitions].icon
                  return <Icon className="w-12 h-12 text-white" />
                })()}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-sm font-sans text-emerald-400 mb-2">Your AI Collaboration Persona</p>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                  {personaDefinitions[persona as keyof typeof personaDefinitions].title}
                </h1>
                <p className="text-xl font-sans text-gray-400 mb-6">
                  {personaDefinitions[persona as keyof typeof personaDefinitions].tagline}
                </p>
                <p className="text-lg font-sans text-gray-300 mb-12 max-w-xl mx-auto">
                  {personaDefinitions[persona as keyof typeof personaDefinitions].description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 rounded-2xl p-8 mb-8"
              >
                <h3 className="text-2xl font-display font-bold mb-6">
                  Your 90-Day Plan Highlights
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
                      <span className="font-sans font-medium">Days 1-30</span>
                    </div>
                    <p className="text-sm font-sans text-gray-400">
                      Foundation building with {plan?.phase1.activities.length || 8} carefully selected activities
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Target className="w-5 h-5 mr-2 text-teal-400" />
                      <span className="font-sans font-medium">Days 31-60</span>
                    </div>
                    <p className="text-sm font-sans text-gray-400">
                      Real work integration with {plan?.phase2.activities.length || 8} practical experiments
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Award className="w-5 h-5 mr-2 text-cyan-400" />
                      <span className="font-sans font-medium">Days 61-90</span>
                    </div>
                    <p className="text-sm font-sans text-gray-400">
                      Mastery and automation with {plan?.phase3.activities.length || 8} advanced challenges
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinueToPlan}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-sans font-semibold text-lg inline-flex items-center"
              >
                View My Full Plan
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Plan Display Stage */}
        {stage === 'plan' && plan && (
          <motion.div
            key="plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${personaDefinitions[persona as keyof typeof personaDefinitions].color}`}>
                      {(() => {
                        const Icon = personaDefinitions[persona as keyof typeof personaDefinitions].icon
                        return <Icon className="w-5 h-5 text-white" />
                      })()}
                    </div>
                    <div>
                      <h1 className="text-xl font-display font-bold">Your 90-Day AI Journey</h1>
                      <p className="text-sm font-sans text-gray-400">
                        {personaDefinitions[persona as keyof typeof personaDefinitions].title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Prominent Accountability Button */}
                    {!hasSubscription && (
                      <button
                        onClick={() => setShowAccountabilityModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-sans font-semibold text-white hover:shadow-lg hover:shadow-yellow-500/25 transition flex items-center animate-pulse"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Get Accountability
                      </button>
                    )}
                    
                    {hasSubscription && (
                      <button
                        onClick={handleExportCalendar}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-sans font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition flex items-center"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Export Calendar
                      </button>
                    )}
                    
                    {isAuthenticated && (
                      <button
                        onClick={() => router.push('/timeline')}
                        className="px-4 py-2 bg-white/10 rounded-lg font-sans font-semibold hover:bg-white/20 transition flex items-center"
                      >
                        View Timeline
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    
                    <button className="p-2 rounded-lg hover:bg-white/10 transition">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* View Mode Tabs */}
                <div className="flex space-x-1 mt-4">
                  {(['timeline', 'calendar', 'list'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-4 py-2 rounded-lg font-sans text-sm capitalize transition ${
                        viewMode === mode 
                          ? 'bg-white/10 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase Selector */}
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((phase) => {
                  const phaseData = phase === 1 ? plan.phase1 : phase === 2 ? plan.phase2 : plan.phase3
                  return (
                    <motion.button
                      key={phase}
                      onClick={() => setSelectedPhase(phase)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-xl border transition-all text-left ${
                        selectedPhase === phase
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-sans text-emerald-400">
                          Days {phase === 1 ? '1-30' : phase === 2 ? '31-60' : '61-90'}
                        </span>
                        {selectedPhase === phase && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-display font-bold mb-1">
                        {phaseData.title.split(':')[0]}
                      </h3>
                      <p className="text-sm font-sans text-gray-400">
                        {phaseData.subtitle}
                      </p>
                      <div className="mt-4 text-xs font-sans text-gray-500">
                        {phaseData.activities.length} activities planned
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Activities Display */}
              <div className="space-y-4">
                {(() => {
                  const phaseData = selectedPhase === 1 ? plan.phase1 : selectedPhase === 2 ? plan.phase2 : plan.phase3
                  return phaseData.activities.map((activity: Activity, index: number) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition cursor-pointer"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-sans ${
                              activity.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                              activity.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {activity.difficulty}
                            </span>
                            <span className="ml-2 px-2 py-1 rounded bg-white/10 text-xs font-sans text-gray-400">
                              {activity.type}
                            </span>
                            <span className="ml-2 text-xs font-sans text-gray-500">
                              {activity.duration} min
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-display font-semibold mb-2">
                            {activity.title}
                          </h4>
                          
                          <p className="text-sm font-sans text-gray-400 mb-3">
                            {activity.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {activity.outcomes.map((outcome, i) => (
                              <span key={i} className="text-xs font-sans text-emerald-400">
                                • {outcome}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </motion.div>
                  ))
                })()}
              </div>
            </div>

            {/* Activity Detail Modal */}
            <AnimatePresence>
              {selectedActivity && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm"
                  onClick={() => setSelectedActivity(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="max-w-2xl w-full bg-gray-900 rounded-2xl p-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-2xl font-display font-bold mb-4">
                      {selectedActivity.title}
                    </h3>
                    
                    <p className="text-lg font-sans text-gray-300 mb-6">
                      {selectedActivity.description}
                    </p>
                    
                    {selectedActivity.instructions && (
                      <div className="mb-6">
                        <h4 className="font-sans font-semibold mb-3">How to complete:</h4>
                        <ol className="space-y-2">
                          {selectedActivity.instructions.map((instruction, i) => (
                            <li key={i} className="flex items-start">
                              <span className="font-sans text-emerald-400 mr-3">{i + 1}.</span>
                              <span className="font-sans text-gray-300">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm font-sans text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedActivity.duration} minutes
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          selectedActivity.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          selectedActivity.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedActivity.difficulty}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setSelectedActivity(null)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-sans font-medium transition"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        surveyData={surveyData}
      />
      
      {/* Accountability Modal */}
      <AccountabilityModal
        isOpen={showAccountabilityModal}
        onClose={() => setShowAccountabilityModal(false)}
        onSubscribe={handleSubscribe}
        plan={plan}
      />
    </div>
  )
}