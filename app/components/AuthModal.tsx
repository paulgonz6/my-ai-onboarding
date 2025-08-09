'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userId: string) => void
  surveyData: any
}

export default function AuthModal({ isOpen, onClose, onSuccess, surveyData }: AuthModalProps) {
  console.log('=== AUTH MODAL INITIALIZED ===')
  console.log('Props received:')
  console.log('- isOpen:', isOpen)
  console.log('- surveyData:', JSON.stringify(surveyData, null, 2))
  // Log whenever props change
  useEffect(() => {
    console.log('=== AUTH MODAL PROPS UPDATED ===');
    console.log('isOpen:', isOpen);
    console.log('surveyData received:', surveyData);
    console.log('surveyData.answers:', surveyData?.answers);
    console.log('surveyData.persona:', surveyData?.persona);
  }, [isOpen, surveyData]);
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log('=== SIGNUP PROCESS STARTING ===');
    console.log('Email:', email);
    console.log('Full Name:', fullName);
    console.log('Survey Data from props:', surveyData);
    
    // Always check localStorage as primary source since that's where survey saves it
    const localAnswers = localStorage.getItem('surveyAnswers');
    const localPersona = localStorage.getItem('userPersona');
    
    let effectiveSurveyData = surveyData;
    
    // Use localStorage data if available (most reliable source)
    if (localAnswers && localPersona) {
      effectiveSurveyData = {
        answers: JSON.parse(localAnswers),
        persona: localPersona
      };
      console.log('Using survey data from localStorage:', effectiveSurveyData);
    } else if (surveyData && surveyData.answers && surveyData.persona) {
      // Use props data if localStorage is empty
      effectiveSurveyData = surveyData;
      console.log('Using survey data from props:', effectiveSurveyData);
    } else {
      console.error('ERROR: No survey data available from localStorage or props!');
      effectiveSurveyData = { answers: {}, persona: null };
    }
    
    console.log('Final Survey Data to use:', effectiveSurveyData);
    console.log('Survey Answers:', effectiveSurveyData?.answers);
    console.log('Persona:', effectiveSurveyData?.persona);

    try {
      // Create user account (no email confirmation required)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            full_name: fullName,
            survey_completed: true
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        console.log('=== USER CREATED SUCCESSFULLY ===');
        console.log('User ID:', authData.user.id);
        console.log('User Email:', authData.user.email);
        console.log('Survey data to save:', surveyData);
        console.log('surveyData.answers detail:', JSON.stringify(surveyData?.answers, null, 2));
        console.log('surveyData.persona:', surveyData?.persona);
        
        // Wait a moment for the trigger to create the profile
        console.log('Waiting for trigger to create initial profile...');
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Check if profile exists first
        console.log('Checking if profile exists...');
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        console.log('Existing profile check result:', existingProfile);
        console.log('Existing profile check error:', checkError);
        
        // Upsert profile with survey data to ensure it's saved
        // Note: Don't include timestamps as they're handled by the database
        // CRITICAL: Use effectiveSurveyData, not surveyData!
        const profileData = {
          id: authData.user.id,
          email: email,
          full_name: fullName,
          persona: effectiveSurveyData?.persona || null,
          work_type: effectiveSurveyData?.answers?.['work-type'] || null,
          engagement_frequency: effectiveSurveyData?.answers?.['engagement-frequency'] || null,
          survey_answers: effectiveSurveyData?.answers || {},
          onboarding_completed: true
        }
        
        console.log('=== ATTEMPTING PROFILE UPSERT ===');
        console.log('Profile data to save:', JSON.stringify(profileData, null, 2));
        
        // Log the actual SQL operation being attempted
        console.log('Attempting upsert to profiles table with ID:', profileData.id);
        console.log('Survey answers being saved:', JSON.stringify(profileData.survey_answers, null, 2));
        console.log('Persona being saved:', profileData.persona);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'id'  // Explicitly specify conflict resolution
          })
          .select()
          .single()

        if (profileError) {
          console.warn('Initial profile upsert failed, attempting retry...');
          console.warn('Error details:', profileError);
          
          // Try without timestamps
          const retryData = {
            id: authData.user.id,
            email: email,
            full_name: fullName,
            persona: effectiveSurveyData?.persona || null,
            work_type: effectiveSurveyData?.answers?.['work-type'] || null,
            engagement_frequency: effectiveSurveyData?.answers?.['engagement-frequency'] || null,
            survey_answers: effectiveSurveyData?.answers || {},
            onboarding_completed: true
          }
          
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .upsert(retryData)
            .select()
            .single()
          
          if (retryError) {
            console.error('=== PROFILE UPSERT FAILED ===');
            console.error('Both attempts failed. Error:', retryError);
            throw new Error(`Failed to create profile: ${retryError.message}`);
          } else {
            console.log('=== PROFILE SAVED ON RETRY ===');
            console.log('Profile saved:', retryProfile);
          }
        } else {
          console.log('=== PROFILE SAVED SUCCESSFULLY ===');
          console.log('Saved profile data:', profile);
        }
        
        // Verify the save by fetching the profile again
        console.log('Verifying profile save...');
        const { data: verifyProfile, error: verifyError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        console.log('=== PROFILE VERIFICATION ===');
        console.log('Verified profile:', verifyProfile);
        console.log('Verification error:', verifyError);
        console.log('Survey answers in DB:', verifyProfile?.survey_answers);
        console.log('Persona in DB:', verifyProfile?.persona);

        // Generate and save user plan
        await generateUserPlan(authData.user.id, effectiveSurveyData)

        setSuccess(true)
        setTimeout(() => {
          onSuccess(authData.user.id)
        }, 1500)
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Get survey data from localStorage (same as signup)
    const localAnswers = localStorage.getItem('surveyAnswers');
    const localPersona = localStorage.getItem('userPersona');
    
    let effectiveSurveyData = surveyData;
    
    if (localAnswers && localPersona) {
      effectiveSurveyData = {
        answers: JSON.parse(localAnswers),
        persona: localPersona
      };
    } else if (surveyData && surveyData.answers && surveyData.persona) {
      effectiveSurveyData = surveyData;
    } else {
      effectiveSurveyData = { answers: {}, persona: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        // Upsert profile with new survey data
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            persona: effectiveSurveyData?.persona || null,
            work_type: effectiveSurveyData?.answers?.['work-type'] || null,
            engagement_frequency: effectiveSurveyData?.answers?.['engagement-frequency'] || null,
            survey_answers: effectiveSurveyData?.answers || {}
          })

        if (profileError) {
          console.error('Profile upsert error:', profileError)
        }

        setSuccess(true)
        setTimeout(() => {
          onSuccess(data.user.id)
        }, 1500)
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const generateUserPlan = async (userId: string, surveyData: any) => {
    try {
      // Fetch activity templates from database
      const { data: activities, error } = await supabase
        .from('activity_templates')
        .select('*')
        .order('phase', { ascending: true })

      if (error) throw error

      // Filter activities for each phase based on persona and work type
      const phase1Activities = activities
        .filter(a => a.phase === 1 && 
          (a.personas.includes(surveyData.persona) || a.personas.includes('all')))
        .slice(0, 8)
        .map(a => a.id)

      const phase2Activities = activities
        .filter(a => a.phase === 2 && 
          (a.personas.includes(surveyData.persona) || a.personas.includes('all')))
        .slice(0, 8)
        .map(a => a.id)

      const phase3Activities = activities
        .filter(a => a.phase === 3 && 
          (a.personas.includes(surveyData.persona) || a.personas.includes('all')))
        .slice(0, 8)
        .map(a => a.id)

      // Create user plan
      const { error: planError } = await supabase
        .from('user_plans')
        .insert({
          user_id: userId,
          persona: surveyData.persona,
          phase1_activities: phase1Activities,
          phase2_activities: phase2Activities,
          phase3_activities: phase3Activities,
          engagement_frequency: surveyData.answers['engagement-frequency'],
          preferred_time: surveyData.answers['practice-time']
        })

      if (planError) {
        console.error('Plan creation error:', planError)
      }
    } catch (error) {
      console.error('Error generating plan:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-md w-full bg-gray-900 rounded-2xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {!success ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold">
                    {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-sm font-sans text-gray-400 mt-1">
                    {mode === 'signup' 
                      ? 'Save your personalized plan' 
                      : 'Continue your AI journey'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={mode === 'signup' ? handleSignup : handleLogin}>
                {mode === 'signup' && (
                  <div className="mb-4">
                    <label className="block text-sm font-sans font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-emerald-500 focus:outline-none transition"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-sans font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-emerald-500 focus:outline-none transition"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-sans font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-emerald-500 focus:outline-none transition"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
                    </div>
                  ) : (
                    <>
                      {mode === 'signup' ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </motion.button>

                <div className="mt-6 text-center">
                  <p className="text-sm font-sans text-gray-400">
                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                    className="text-emerald-400 hover:text-emerald-300 font-sans font-medium mt-1 transition"
                  >
                    {mode === 'signup' ? 'Sign In' : 'Create Account'}
                  </button>
                </div>

              </form>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-display font-bold mb-2">
                Welcome Aboard!
              </h3>
              <p className="text-gray-400 font-sans">
                Your personalized plan is being prepared...
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}