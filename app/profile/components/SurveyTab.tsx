'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  ClipboardList,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  User,
  Briefcase,
  Target,
  Brain,
  Sparkles
} from 'lucide-react'

interface SurveyAnswer {
  question: string
  answer: string
  category: string
}

const personaDescriptions: Record<string, {
  title: string
  description: string
  strengths: string[]
  focusAreas: string[]
  icon: any
}> = {
  'Tech Explorer': {
    title: 'The Tech Explorer',
    description: 'You thrive on discovering new technologies and understanding how they work. Your AI journey focuses on hands-on experimentation and technical mastery.',
    strengths: ['Quick to learn new tools', 'Comfortable with technical concepts', 'Enjoys experimentation'],
    focusAreas: ['Advanced AI features', 'API integrations', 'Custom workflows', 'Technical optimization'],
    icon: Brain
  },
  'Strategic Thinker': {
    title: 'The Strategic Thinker',
    description: 'You see the big picture and focus on how AI can transform business outcomes. Your journey emphasizes strategic applications and ROI.',
    strengths: ['Business-focused mindset', 'Strategic planning skills', 'Results-oriented approach'],
    focusAreas: ['AI strategy development', 'ROI measurement', 'Team adoption', 'Process optimization'],
    icon: Target
  },
  'Creative Innovator': {
    title: 'The Creative Innovator',
    description: 'You bring creativity to everything you do. Your AI journey explores how AI can enhance creative work and unlock new possibilities.',
    strengths: ['Creative problem-solving', 'Design thinking', 'Innovative approaches'],
    focusAreas: ['Content creation with AI', 'Design assistance', 'Creative workflows', 'Ideation techniques'],
    icon: Sparkles
  },
  'Efficiency Expert': {
    title: 'The Efficiency Expert',
    description: 'You\'re driven by productivity and optimization. Your AI journey focuses on automation, time-saving, and streamlining workflows.',
    strengths: ['Process optimization', 'Time management', 'Systematic thinking'],
    focusAreas: ['Workflow automation', 'Productivity tools', 'Time-saving techniques', 'Process improvement'],
    icon: Target
  }
}

export default function SurveyTab() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer[]>([])
  const [showRetakeWarning, setShowRetakeWarning] = useState(false)

  useEffect(() => {
    // Parse survey answers from profile
    if (profile?.survey_answers) {
      const answers = Object.entries(profile.survey_answers as Record<string, any>).map(([key, value]) => {
        // Map the survey questions (simplified for demo)
        const questionMap: Record<string, { question: string; category: string }> = {
          work_type: { question: 'What best describes your work?', category: 'Background' },
          team_size: { question: 'How large is your team?', category: 'Background' },
          ai_experience: { question: 'What\'s your experience with AI tools?', category: 'Experience' },
          biggest_challenge: { question: 'What\'s your biggest work challenge?', category: 'Goals' },
          success_metrics: { question: 'How do you measure success?', category: 'Goals' },
          learning_style: { question: 'How do you prefer to learn?', category: 'Preferences' },
          time_commitment: { question: 'How much time can you dedicate daily?', category: 'Preferences' },
          primary_goal: { question: 'What\'s your primary goal with AI?', category: 'Goals' },
        }

        const mapped = questionMap[key] || { question: key, category: 'Other' }
        return {
          question: mapped.question,
          answer: String(value),
          category: mapped.category
        }
      })
      setSurveyAnswers(answers)
    }
  }, [profile])

  const handleRetakeSurvey = () => {
    if (showRetakeWarning) {
      // Proceed with retaking survey
      router.push('/survey')
    } else {
      setShowRetakeWarning(true)
    }
  }

  const handleExportData = () => {
    const data = {
      profile: {
        name: profile?.full_name,
        email: user?.email,
        persona: profile?.persona,
      },
      surveyAnswers: surveyAnswers,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-journey-survey-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const persona = profile?.persona || 'Tech Explorer'
  const personaInfo = personaDescriptions[persona] || personaDescriptions['Tech Explorer']

  return (
    <div className="space-y-6">
      {/* Persona Assignment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <personaInfo.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold mb-1">{personaInfo.title}</h3>
              <p className="text-gray-400">Your AI Journey Persona</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-500/20 rounded-xl">
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        <p className="text-gray-300 mb-6">{personaInfo.description}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Your Strengths</span>
            </h4>
            <ul className="space-y-2">
              {personaInfo.strengths.map((strength, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-sm text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <Target className="w-5 h-5 text-teal-400" />
              <span>Focus Areas</span>
            </h4>
            <ul className="space-y-2">
              {personaInfo.focusAreas.map((area, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                  <span className="text-sm text-gray-300">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Survey Responses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-semibold">Your Survey Responses</h3>
          <button
            onClick={handleExportData}
            className="text-emerald-400 hover:text-emerald-300 transition flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export Data</span>
          </button>
        </div>

        {surveyAnswers.length > 0 ? (
          <div className="space-y-6">
            {/* Group answers by category */}
            {['Background', 'Experience', 'Goals', 'Preferences', 'Other'].map((category) => {
              const categoryAnswers = surveyAnswers.filter(a => a.category === category)
              if (categoryAnswers.length === 0) return null
              
              return (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {category}
                  </h4>
                  <div className="space-y-3">
                    {categoryAnswers.map((answer, index) => (
                      <div key={index} className="p-4 bg-white/5 rounded-xl">
                        <p className="text-sm text-gray-400 mb-1">{answer.question}</p>
                        <p className="font-medium">{answer.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No survey responses found</p>
            <p className="text-sm text-gray-500 mt-1">Complete the survey to get your personalized AI journey</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/survey')}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium"
            >
              Take Survey
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Retake Survey */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-4">Update Your Journey</h3>
        
        {showRetakeWarning ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-400 mb-1">Warning: This will reset your journey</p>
                <p className="text-sm text-gray-400">
                  Retaking the survey will generate a new 90-day plan based on your updated responses. 
                  Your current progress will be archived but not lost.
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRetakeSurvey}
                className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl font-medium text-amber-400"
              >
                Yes, Retake Survey
              </motion.button>
              <button
                onClick={() => setShowRetakeWarning(false)}
                className="px-4 py-2 bg-white/10 rounded-xl font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-4">
              Your circumstances or goals changed? Retake the survey to get an updated AI journey plan 
              that matches your current needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetakeSurvey}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Survey</span>
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  )
}