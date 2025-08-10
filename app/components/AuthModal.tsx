'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { saveSurveyWithRetry, verifySurveyAnswers } from '@/lib/profile-helpers'
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
    
    // Get survey data from localStorage (most reliable source)
    const localAnswers = localStorage.getItem('surveyAnswers');
    const localPersona = localStorage.getItem('userPersona');
    
    console.log('=== SIGNUP PROCESS STARTING ===');
    console.log('Raw localStorage data:');
    console.log('- surveyAnswers:', localAnswers);
    console.log('- userPersona:', localPersona);
    
    const effectiveSurveyData = {
      answers: localAnswers ? JSON.parse(localAnswers) : {},
      persona: localPersona || 'practical-adopter'
    };
    
    console.log('Parsed survey data:');
    console.log('- answers:', effectiveSurveyData.answers);
    console.log('- persona:', effectiveSurveyData.persona);

    try {
      // Step 1: Create the user account
      console.log('Step 1: Creating user account...');
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

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }
      
      console.log('User created successfully:', authData.user.id);

      // Step 2: Check if we already have a session from signup
      // Some Supabase configs auto-sign-in on signup, others require email confirmation
      let session = authData.session;
      
      if (!session) {
        console.log('No session from signup, attempting sign-in...');
        
        // Try to sign in - this might fail if email confirmation is required
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          console.warn('Sign-in after signup failed:', signInError);
          
          // If email confirmation is required, we need to save data differently
          if (signInError.message?.includes('Email not confirmed')) {
            console.log('Email confirmation required - saving survey data for later...');
            
            // Save survey data to localStorage for when user confirms email
            localStorage.setItem('pendingSurveyData', JSON.stringify({
              userId: authData.user.id,
              answers: effectiveSurveyData.answers,
              persona: effectiveSurveyData.persona,
              fullName: fullName
            }));
            
            setSuccess(true);
            setError('Please check your email to confirm your account. Your survey data has been saved.');
            
            // Still call success but inform user about email confirmation
            setTimeout(() => {
              if (authData.user) {
                onSuccess(authData.user.id);
              }
            }, 2000);
            
            return; // Exit early - user needs to confirm email
          }
        } else if (signInData?.session) {
          session = signInData.session;
          console.log('Sign-in successful, session established');
        }
      }
      
      // Step 2.5: Wait a moment for the session to fully establish
      // This helps ensure RLS policies work correctly
      if (session) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('Current session:', session ? 'Active' : 'Not active');

      // Step 3: Update the profile with survey data using our helper function
      console.log('Step 3: Updating profile with survey data...');
      
      try {
        // Use the helper function with retry logic
        const savedProfile = await saveSurveyWithRetry(
          authData.user.id,
          effectiveSurveyData.answers,
          effectiveSurveyData.persona,
          fullName,
          3 // max retries
        );
        
        console.log('Profile saved successfully with survey data:', savedProfile);
        
        // Double-check verification
        const verified = await verifySurveyAnswers(authData.user.id);
        if (!verified || !verified.survey_answers || Object.keys(verified.survey_answers).length === 0) {
          console.error('⚠️ WARNING: Survey answers verification failed!');
          console.error('This is a critical error - survey data may not have been saved');
          // Don't throw here - user account is created, we can try to recover later
        } else {
          console.log('✅ Survey answers verified and saved correctly');
        }
      } catch (profileError) {
        console.error('Failed to save survey data to profile:', profileError);
        // Don't fail the entire signup - the user account exists
        // We can attempt to save the survey data again later
        setError('Account created but survey data may not have been saved. Please contact support if your personalized plan is missing.');
      }

      // Step 4: Generate and save user plan
      console.log('Step 4: Generating user plan...');
      await generateUserPlan(authData.user.id, effectiveSurveyData);

      console.log('=== SIGNUP COMPLETE ===');
      setSuccess(true);
      setTimeout(() => {
        if (authData.user) {
          onSuccess(authData.user.id);
        }
      }, 1500);
      
    } catch (error: any) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Error details:', error);
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Get survey data from localStorage
    const localAnswers = localStorage.getItem('surveyAnswers');
    const localPersona = localStorage.getItem('userPersona');
    
    console.log('=== LOGIN PROCESS STARTING ===');
    console.log('Survey data from localStorage:', { localAnswers, localPersona });
    
    const effectiveSurveyData = {
      answers: localAnswers ? JSON.parse(localAnswers) : {},
      persona: localPersona || 'practical-adopter'
    };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        
        // Update profile with survey data if they just completed it
        if (Object.keys(effectiveSurveyData.answers).length > 0) {
          console.log('Updating profile with survey data...');
          
          try {
            // Use the helper function with retry logic
            const savedProfile = await saveSurveyWithRetry(
              data.user.id,
              effectiveSurveyData.answers,
              effectiveSurveyData.persona,
              undefined, // fullName not provided on login
              3 // max retries
            );
            
            console.log('Profile updated successfully with survey data:', savedProfile);
            
            // Verify the save
            const verified = await verifySurveyAnswers(data.user.id);
            if (!verified || !verified.survey_answers || Object.keys(verified.survey_answers).length === 0) {
              console.error('⚠️ WARNING: Survey answers verification failed after login!');
            } else {
              console.log('✅ Survey answers verified and saved correctly');
            }
            
            // Generate plan for existing user with new survey data
            await generateUserPlan(data.user.id, effectiveSurveyData);
          } catch (profileError) {
            console.error('Failed to update profile with survey data:', profileError);
            // Don't fail the login - user can still access their account
          }
        }

        setSuccess(true)
        setTimeout(() => {
          onSuccess(data.user.id)
        }, 1500)
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
                  
                  {mode === 'signup' && (
                    <div className="mt-4">
                      <Link 
                        href="/signin"
                        className="text-sm text-gray-400 hover:text-white transition"
                      >
                        Or go to sign in page →
                      </Link>
                    </div>
                  )}
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