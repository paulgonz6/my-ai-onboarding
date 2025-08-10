'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before signing in.')
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else {
          setError(signInError.message)
        }
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // Check if user has completed survey
        const { data: profile } = await supabase
          .from('profiles')
          .select('survey_answers, persona, persona_revealed_at')
          .eq('id', data.user.id)
          .single()

        if (profile?.survey_answers && profile?.persona) {
          // User has completed onboarding
          // If they've already seen the persona reveal, go to timeline
          // Otherwise, go to plan to see the persona reveal once
          if (profile.persona_revealed_at) {
            router.push('/timeline')
          } else {
            router.push('/plan')
          }
        } else {
          // User needs to complete survey
          router.push('/survey')
        }
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold">My AI Onboarding</span>
            </div>
          </Link>

          {/* Sign In Form */}
          <div className="bg-gray-900 rounded-2xl p-8">
            <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
            <p className="text-gray-400 mb-8">Sign in to continue your AI journey</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSignIn} aria-label="Sign in form">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-sans font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-emerald-500 focus:outline-none transition"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    aria-required="true"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-sans font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-emerald-500 focus:outline-none transition"
                    placeholder="••••••••"
                    aria-label="Password"
                    aria-required="true"
                    aria-describedby="password-requirements"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <span id="password-requirements" className="sr-only">Password must be at least 6 characters</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm font-sans text-gray-400">
                  Don't have an account?
                </p>
                <Link
                  href="/survey"
                  className="text-emerald-400 hover:text-emerald-300 font-sans font-medium mt-1 transition inline-block"
                >
                  Start your journey
                </Link>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-white font-sans transition"
                >
                  ← Back to home
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}