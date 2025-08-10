'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronRight,
  User,
  Briefcase,
  Brain,
  Target,
  Calendar,
  Users,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Button, PrimaryButton, IconButton } from '@/app/components/ui/Button'
import { Card, GlassCard } from '@/app/components/ui/Card'
import { fadeInUp, scaleIn, springConfig } from '@/lib/animations'
import { gradients } from '@/lib/styles'

// Survey questions data structure
const surveyQuestions = {
  welcome: {
    id: 'welcome',
    type: 'intro',
    title: "Let's create your AI onboarding plan",
    description: "Answer 12 questions. Get a personalized 90-day journey. Takes about 5 minutes.",
    icon: Sparkles,
    next: 'work-type'
  },
  'work-type': {
    id: 'work-type',
    type: 'single-choice',
    category: 'Work Context',
    question: "What best describes your work?",
    description: "This helps us understand what AI can do for you.",
    icon: Briefcase,
    options: [
      { id: 'creative', label: 'Creative work', description: 'Writing, design, marketing' },
      { id: 'analytical', label: 'Analytical work', description: 'Data, research, finance' },
      { id: 'technical', label: 'Technical work', description: 'Coding, engineering, IT' },
      { id: 'people', label: 'People work', description: 'Management, sales, HR' },
      { id: 'operations', label: 'Operations work', description: 'Project management, admin' }
    ],
    next: 'daily-time'
  },
  'daily-time': {
    id: 'daily-time',
    type: 'single-choice',
    category: 'Work Context',
    question: "How do you spend most of your day?",
    description: "We'll match AI to your workflow.",
    icon: Clock,
    options: [
      { id: 'deep-work', label: 'Deep focused work alone' },
      { id: 'collaborative', label: 'Collaborative work with others' },
      { id: 'meetings', label: 'Meetings and communication' },
      { id: 'managing', label: 'Managing and delegating' },
      { id: 'mixed', label: 'Mix of everything' }
    ],
    next: 'time-wasters'
  },
  'time-wasters': {
    id: 'time-wasters',
    type: 'multi-choice',
    category: 'Work Context',
    question: "What takes up time you wish it didn't?",
    description: "Select all that apply. This is where AI shines.",
    icon: Target,
    options: [
      { id: 'writing', label: 'Writing and documentation' },
      { id: 'data', label: 'Data analysis and reporting' },
      { id: 'research', label: 'Research and information gathering' },
      { id: 'email', label: 'Email and communication' },
      { id: 'admin', label: 'Administrative tasks' },
      { id: 'meetings', label: 'Meeting preparation' }
    ],
    next: 'ai-experience'
  },
  'ai-experience': {
    id: 'ai-experience',
    type: 'single-choice',
    category: 'AI Readiness',
    question: "Have you used AI tools before?",
    description: "Be honest. We'll meet you where you are.",
    icon: Brain,
    options: [
      { id: 'never', label: 'Never' },
      { id: 'once-twice', label: 'Tried once or twice' },
      { id: 'occasionally', label: 'Use occasionally', description: 'Weekly' },
      { id: 'regularly', label: 'Use regularly', description: 'Daily' },
      { id: 'power-user', label: 'Power user' }
    ],
    branching: {
      'never': 'ai-concerns',
      'once-twice': 'ai-concerns',
      'occasionally': 'ai-tools',
      'regularly': 'ai-tools',
      'power-user': 'ai-tools'
    }
  },
  'ai-concerns': {
    id: 'ai-concerns',
    type: 'single-choice',
    category: 'AI Readiness',
    question: "What's your biggest concern about AI?",
    description: "We'll address this in your onboarding.",
    icon: Brain,
    options: [
      { id: 'job-replacement', label: 'It might replace my job' },
      { id: 'where-to-start', label: "I don't know where to start" },
      { id: 'privacy', label: 'Data privacy and security' },
      { id: 'quality', label: 'Quality and accuracy of output' },
      { id: 'cost', label: 'Cost and ROI' },
      { id: 'no-concerns', label: 'No concerns, excited to start' }
    ],
    next: 'learning-style'
  },
  'ai-tools': {
    id: 'ai-tools',
    type: 'multi-choice',
    category: 'AI Readiness',
    question: "Which AI tools do you currently use?",
    description: "We'll build on what you know.",
    icon: Brain,
    options: [
      { id: 'chatgpt', label: 'ChatGPT' },
      { id: 'claude', label: 'Claude' },
      { id: 'gemini', label: 'Gemini/Bard' },
      { id: 'copilot', label: 'GitHub Copilot' },
      { id: 'midjourney', label: 'Midjourney/DALL-E' },
      { id: 'other', label: 'Other tools' }
    ],
    next: 'learning-style'
  },
  'learning-style': {
    id: 'learning-style',
    type: 'single-choice',
    category: 'Learning Style',
    question: "How do you prefer to learn new tools?",
    description: "We'll customize your exercises.",
    icon: User,
    options: [
      { id: 'jump-in', label: 'Jump in and figure it out' },
      { id: 'tutorials', label: 'Follow step-by-step tutorials' },
      { id: 'watch-first', label: 'Watch someone else first' },
      { id: 'documentation', label: 'Read documentation thoroughly' },
      { id: 'with-colleague', label: 'Learn with a colleague' }
    ],
    next: 'engagement-frequency'
  },
  'engagement-frequency': {
    id: 'engagement-frequency',
    type: 'single-choice',
    category: 'Learning Style',
    question: "How often can you realistically practice?",
    description: "Be honest. We'll match your actual availability.",
    icon: Calendar,
    options: [
      { id: 'daily', label: 'Daily', description: '5-15 minutes each day', recommended: true },
      { id: 'every-other', label: 'Every other day', description: '15-20 minutes per session' },
      { id: '3-times', label: '3 times a week', description: '20-30 minutes per session' },
      { id: 'twice', label: 'Twice a week', description: '30-45 minutes per session' },
      { id: 'weekly', label: 'Once a week', description: '45-60 minutes per session' }
    ],
    next: 'practice-time'
  },
  'practice-time': {
    id: 'practice-time',
    type: 'single-choice',
    category: 'Learning Style',
    question: "When are you most likely to practice?",
    description: "We'll schedule your sessions accordingly.",
    icon: Clock,
    options: [
      { id: 'morning-first', label: 'First thing in the morning' },
      { id: 'morning-work', label: 'During morning work block' },
      { id: 'lunch', label: 'Lunch break' },
      { id: 'afternoon', label: 'Afternoon lull' },
      { id: 'end-day', label: 'End of workday' },
      { id: 'flexible', label: 'Flexible' }
    ],
    next: 'success-metric'
  },
  'success-metric': {
    id: 'success-metric',
    type: 'single-choice',
    category: 'Goals & Success',
    question: "What would make this worth your time?",
    description: "We'll track this throughout your journey.",
    icon: Target,
    options: [
      { id: 'save-time', label: 'Save 1+ hours per day' },
      { id: 'eliminate-boring', label: 'Eliminate boring tasks' },
      { id: 'improve-quality', label: 'Improve work quality' },
      { id: 'learn-capabilities', label: 'Learn new capabilities' },
      { id: 'stay-competitive', label: 'Stay competitive' },
      { id: 'help-team', label: 'Help my team adopt AI' }
    ],
    next: 'accountability'
  },
  'accountability': {
    id: 'accountability',
    type: 'single-choice',
    category: 'Goals & Success',
    question: "Who else should know about your AI journey?",
    description: "Accountability helps. Privacy is guaranteed.",
    icon: Users,
    options: [
      { id: 'just-me', label: 'Just me' },
      { id: 'manager', label: 'My manager' },
      { id: 'team', label: 'My team' },
      { id: 'organization', label: 'My organization' },
      { id: 'public', label: 'Share publicly' }
    ],
    next: 'complete'
  },
  'complete': {
    id: 'complete',
    type: 'complete',
    title: "Perfect! Your plan is ready.",
    description: "Based on your answers, we've created a personalized 90-day AI onboarding journey just for you.",
    icon: CheckCircle2
  }
}

export default function SurveyPage() {
  const [currentQuestionId, setCurrentQuestionId] = useState('welcome')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [progress, setProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const currentQuestion = surveyQuestions[currentQuestionId as keyof typeof surveyQuestions]
  const totalQuestions = Object.keys(surveyQuestions).filter(q => 
    surveyQuestions[q as keyof typeof surveyQuestions].type !== 'intro' && 
    surveyQuestions[q as keyof typeof surveyQuestions].type !== 'complete'
  ).length

  const answeredQuestions = Object.keys(answers).length

  useEffect(() => {
    setProgress((answeredQuestions / totalQuestions) * 100)
  }, [answeredQuestions, totalQuestions])

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestionId]: answer }))
    
    // Determine next question
    let nextId = currentQuestion.next
    
    // Handle branching logic
    if (currentQuestion.branching && currentQuestion.type === 'single-choice') {
      nextId = currentQuestion.branching[answer] || currentQuestion.next
    }
    
    // Animate transition
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentQuestionId(nextId)
      setIsAnimating(false)
    }, 300)
  }

  const handleBack = () => {
    // Find previous question
    const questionFlow = Object.keys(answers)
    const previousId = questionFlow[questionFlow.length - 1]
    
    if (previousId) {
      setIsAnimating(true)
      setTimeout(() => {
        // Remove the last answer
        const newAnswers = { ...answers }
        delete newAnswers[previousId]
        setAnswers(newAnswers)
        
        // Go back to previous question
        setCurrentQuestionId(previousId)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleStart = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentQuestionId('work-type')
      setIsAnimating(false)
    }, 300)
  }

  const handleComplete = () => {
    console.log('=== SURVEY COMPLETION DEBUG ===');
    console.log('All answers collected:', answers);
    console.log('Total questions answered:', Object.keys(answers).length);
    
    // Persona calculation based on answers
    const calculatePersona = () => {
      const experience = answers['ai-experience']
      const concerns = answers['ai-concerns']
      const frequency = answers['engagement-frequency']
      const goal = answers['success-metric']
      
      // Persona mapping logic:
      // Cautious Explorer: never/once + high concerns + needs support
      // Eager Beginner: never/once + low concerns + ready to learn
      // Practical Adopter: occasional + clear goals + limited time
      // Efficiency Seeker: occasional/regular + time-focused goals
      // Innovation Driver: regular/power + team goals
      // Power Optimizer: power user + self-directed
      
      if (experience === 'never' || experience === 'once-twice') {
        if (concerns === 'where-to-start' || concerns === 'job-replacement') {
          return 'cautious-explorer'
        }
        return 'eager-beginner'
      } else if (experience === 'occasionally') {
        if (goal === 'save-time' || goal === 'eliminate-boring') {
          return 'efficiency-seeker'
        }
        return 'practical-adopter'
      } else if (experience === 'regularly' || experience === 'power-user') {
        if (goal === 'help-team') {
          return 'innovation-driver'
        }
        return 'power-optimizer'
      }
      return 'practical-adopter' // default
    }
    
    const persona = calculatePersona()
    console.log('Calculated persona:', persona)
    console.log('Survey completed with data:', { answers, persona })
    
    // Store results and redirect to personalized plan
    const dataToStore = JSON.stringify(answers)
    console.log('Storing in localStorage - surveyAnswers:', dataToStore)
    console.log('Storing in localStorage - userPersona:', persona)
    
    localStorage.setItem('surveyAnswers', dataToStore)
    localStorage.setItem('userPersona', persona)
    
    // Verify storage
    const verifyStorage = localStorage.getItem('surveyAnswers')
    console.log('Verification - Data actually stored:', verifyStorage)
    console.log('Verification - Persona actually stored:', localStorage.getItem('userPersona'))
    
    console.log('Redirecting to /plan...')
    window.location.href = '/plan'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Minimal Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Progress bar */}
        {currentQuestion.type !== 'intro' && currentQuestion.type !== 'complete' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
            <motion.div
              className={`h-full bg-gradient-to-r ${gradients.primary}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between px-8 py-6">
          {/* Back button */}
          {currentQuestion.type !== 'intro' && currentQuestion.type !== 'complete' && answeredQuestions > 0 ? (
            <IconButton
              icon={ArrowLeft}
              onClick={handleBack}
              aria-label="Go back"
              variant="ghost"
              size="sm"
            />
          ) : (
            <div className="w-8 h-8" /> // Spacer
          )}
          
          {/* Center: Logo or breadcrumb */}
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            My AI Onboarding
          </Link>
          
          {/* Right side: Question counter or Exit */}
          <div className="flex items-center gap-4">
            {currentQuestion.type !== 'intro' && currentQuestion.type !== 'complete' && (
              <div className="text-sm text-gray-400">
                {answeredQuestions + 1} of {totalQuestions}
              </div>
            )}
            <Link href="/">
              <IconButton
                icon={X}
                aria-label="Exit survey"
                variant="ghost"
                size="sm"
              />
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionId}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center px-6 py-12"
        >
          <div className="max-w-2xl w-full">
            {/* Intro screen */}
            {currentQuestion.type === 'intro' && (
              <div className="text-center">
                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2, ...springConfig }}
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${gradients.primary} mb-8`}
                >
                  <currentQuestion.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                  {currentQuestion.title}
                </h1>
                
                <p className="text-xl font-sans text-gray-400 mb-12">
                  {currentQuestion.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-sans">5 minutes</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span className="font-sans">12 questions</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="font-sans">Personalized plan</span>
                  </div>
                </div>
                
                <PrimaryButton
                  onClick={handleStart}
                  icon={ArrowRight}
                  size="lg"
                  className="px-8 py-4 text-lg rounded-full"
                >
                  Start Survey
                </PrimaryButton>
              </div>
            )}

            {/* Question screens */}
            {(currentQuestion.type === 'single-choice' || currentQuestion.type === 'multi-choice') && (
              <div>
                <div className="mb-8">
                  {currentQuestion.category && (
                    <p className="text-sm font-sans text-emerald-400 mb-2">
                      {currentQuestion.category}
                    </p>
                  )}
                  
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    {currentQuestion.question}
                  </h2>
                  
                  {currentQuestion.description && (
                    <p className="text-lg font-sans text-gray-400">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (currentQuestion.type === 'single-choice') {
                          handleAnswer(option.id)
                        } else {
                          // Multi-choice logic
                          const current = answers[currentQuestionId] || []
                          const updated = current.includes(option.id)
                            ? current.filter((id: string) => id !== option.id)
                            : [...current, option.id]
                          setAnswers(prev => ({ ...prev, [currentQuestionId]: updated }))
                        }
                      }}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${
                        currentQuestion.type === 'multi-choice' && answers[currentQuestionId]?.includes(option.id)
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      } ${option.recommended ? 'ring-2 ring-emerald-500/50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-sans font-medium text-white">
                            {option.label}
                            {option.recommended && (
                              <span className="ml-2 text-xs font-sans text-emerald-400">
                                Recommended
                              </span>
                            )}
                          </p>
                          {option.description && (
                            <p className="text-sm font-sans text-gray-400 mt-1">
                              {option.description}
                            </p>
                          )}
                        </div>
                        {currentQuestion.type === 'single-choice' && (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        {currentQuestion.type === 'multi-choice' && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            answers[currentQuestionId]?.includes(option.id)
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-400'
                          }`}>
                            {answers[currentQuestionId]?.includes(option.id) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {currentQuestion.type === 'multi-choice' && (
                  <PrimaryButton
                    onClick={() => handleAnswer(answers[currentQuestionId] || [])}
                    disabled={!answers[currentQuestionId]?.length}
                    icon={ArrowRight}
                    className="mt-8 px-8 py-3 rounded-full"
                  >
                    Continue
                  </PrimaryButton>
                )}
              </div>
            )}

            {/* Complete screen */}
            {currentQuestion.type === 'complete' && (
              <div className="text-center">
                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2, ...springConfig }}
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${gradients.primary} mb-8`}
                >
                  <currentQuestion.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                  {currentQuestion.title}
                </h1>
                
                <p className="text-xl font-sans text-gray-400 mb-12">
                  {currentQuestion.description}
                </p>
                
                <GlassCard className="mb-8">
                  <h3 className="text-2xl font-display font-bold mb-6">
                    Your AI Onboarding Profile
                  </h3>
                  
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between">
                      <span className="font-sans text-gray-400">Readiness Level:</span>
                      <span className="font-sans font-medium">
                        {answers['ai-experience'] === 'never' ? 'Beginner' : 
                         answers['ai-experience'] === 'power-user' ? 'Advanced' : 'Intermediate'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-gray-400">Practice Frequency:</span>
                      <span className="font-sans font-medium capitalize">{answers['engagement-frequency']?.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-gray-400">Primary Goal:</span>
                      <span className="font-sans font-medium capitalize">{answers['success-metric']?.replace('-', ' ')}</span>
                    </div>
                  </div>
                </GlassCard>
                
                <PrimaryButton
                  onClick={handleComplete}
                  icon={ArrowRight}
                  size="lg"
                  className="px-8 py-4 text-lg rounded-full"
                >
                  View My 90-Day Plan
                </PrimaryButton>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}