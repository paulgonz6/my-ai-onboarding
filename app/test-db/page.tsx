'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDBPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (label: string, data: any) => {
    setResults(prev => [...prev, { label, data, timestamp: new Date().toISOString() }])
  }

  const testConnection = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // Test 1: Check connection
      addResult('Testing Supabase connection...', 'Starting')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        addResult('Auth check error', userError)
      } else if (user) {
        addResult('Current user', { id: user.id, email: user.email })
      } else {
        addResult('Auth status', 'Not authenticated')
      }

      // Test 2: Try to read profiles table
      addResult('Testing profiles table access...', 'Starting')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, persona, survey_answers')
        .limit(5)
      
      if (profilesError) {
        addResult('Profiles read error', profilesError)
      } else {
        addResult('Profiles found', profiles?.length || 0)
        if (profiles && profiles.length > 0) {
          addResult('Sample profile', profiles[0])
        }
      }

      // Test 3: Check if current user has a profile
      if (user) {
        const { data: myProfile, error: myProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (myProfileError) {
          addResult('My profile error', myProfileError)
        } else {
          addResult('My profile', myProfile)
        }
      }

      // Test 4: Test localStorage data
      const surveyAnswers = localStorage.getItem('surveyAnswers')
      const userPersona = localStorage.getItem('userPersona')
      
      addResult('LocalStorage surveyAnswers', surveyAnswers ? JSON.parse(surveyAnswers) : null)
      addResult('LocalStorage userPersona', userPersona)

    } catch (error) {
      addResult('Unexpected error', error)
    } finally {
      setLoading(false)
    }
  }

  const testProfileUpdate = async () => {
    setLoading(true)
    setResults([])
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        addResult('Error', 'Not authenticated. Please sign in first.')
        return
      }

      // Get survey data from localStorage
      const surveyAnswers = localStorage.getItem('surveyAnswers')
      const userPersona = localStorage.getItem('userPersona')
      
      if (!surveyAnswers || !userPersona) {
        addResult('Error', 'No survey data in localStorage. Complete survey first.')
        return
      }

      const parsedAnswers = JSON.parse(surveyAnswers)
      
      // Prepare profile data
      const profileData = {
        id: user.id,
        email: user.email,
        persona: userPersona,
        work_type: parsedAnswers['work-type'],
        engagement_frequency: parsedAnswers['engagement-frequency'],
        survey_answers: parsedAnswers,
        onboarding_completed: true
      }
      
      addResult('Profile data to save', profileData)

      // Try to update profile
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single()
      
      if (updateError) {
        addResult('Update error', {
          message: updateError.message,
          code: updateError.code,
          hint: updateError.hint,
          details: updateError.details
        })
      } else {
        addResult('Update successful', updateResult)
      }

      // Verify the update
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (verifyError) {
        addResult('Verification error', verifyError)
      } else {
        addResult('Verified profile', verifyProfile)
        addResult('Survey answers in DB', verifyProfile.survey_answers)
        addResult('Persona in DB', verifyProfile.persona)
      }

    } catch (error) {
      addResult('Unexpected error', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Test Page</h1>
        
        <div className="space-x-4 mb-8">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            Test Connection
          </button>
          
          <button
            onClick={testProfileUpdate}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
          >
            Test Profile Update
          </button>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="p-4 bg-yellow-900/50 rounded-lg">
              <p>Testing...</p>
            </div>
          )}
          
          {results.map((result, index) => (
            <div key={index} className="p-4 bg-gray-900 rounded-lg">
              <h3 className="font-bold text-yellow-400 mb-2">{result.label}</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                {typeof result.data === 'object' 
                  ? JSON.stringify(result.data, null, 2)
                  : result.data}
              </pre>
              <p className="text-xs text-gray-500 mt-2">{result.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}