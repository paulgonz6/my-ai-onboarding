'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [localStorage, setLocalStorage] = useState<any>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadDebugData()
  }, [isOpen])

  const loadDebugData = async () => {
    // Get localStorage data
    const localData = {
      surveyAnswers: window.localStorage.getItem('surveyAnswers'),
      userPersona: window.localStorage.getItem('userPersona'),
      parsedAnswers: null as any,
    }
    
    try {
      if (localData.surveyAnswers) {
        localData.parsedAnswers = JSON.parse(localData.surveyAnswers)
      }
    } catch (e) {
      console.error('Failed to parse survey answers:', e)
    }
    
    setLocalStorage(localData)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    // Get profile if user exists
    if (user) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Profile fetch error:', error)
      }
      setProfile(profileData)
    }
  }

  const clearLocalStorage = () => {
    window.localStorage.removeItem('surveyAnswers')
    window.localStorage.removeItem('userPersona')
    loadDebugData()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition"
      >
        Debug Panel
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] bg-gray-900 text-white rounded-lg shadow-xl border border-purple-500">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-purple-400">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 space-y-4 overflow-y-auto max-h-[500px]">
        {/* LocalStorage Section */}
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">LocalStorage Data:</h4>
          <div className="bg-gray-800 p-2 rounded text-xs">
            <div className="mb-2">
              <span className="text-gray-400">surveyAnswers (raw):</span>
              <pre className="text-green-400 mt-1">{localStorage.surveyAnswers || 'null'}</pre>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">userPersona:</span>
              <pre className="text-green-400 mt-1">{localStorage.userPersona || 'null'}</pre>
            </div>
            <div>
              <span className="text-gray-400">Parsed Answers:</span>
              <pre className="text-green-400 mt-1 whitespace-pre-wrap">
                {localStorage.parsedAnswers ? JSON.stringify(localStorage.parsedAnswers, null, 2) : 'null'}
              </pre>
            </div>
          </div>
          <button
            onClick={clearLocalStorage}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Clear LocalStorage
          </button>
        </div>

        {/* Auth Section */}
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">Auth Status:</h4>
          <div className="bg-gray-800 p-2 rounded text-xs">
            {currentUser ? (
              <>
                <div>User ID: <span className="text-green-400">{currentUser.id}</span></div>
                <div>Email: <span className="text-green-400">{currentUser.email}</span></div>
              </>
            ) : (
              <div className="text-red-400">Not authenticated</div>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div>
          <h4 className="font-bold text-yellow-400 mb-2">Profile Data (from DB):</h4>
          <div className="bg-gray-800 p-2 rounded text-xs">
            {profile ? (
              <pre className="text-green-400 whitespace-pre-wrap">
                {JSON.stringify(profile, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-400">No profile data</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-700">
          <button
            onClick={loadDebugData}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs mr-2"
          >
            Refresh Data
          </button>
          <button
            onClick={() => window.location.href = '/survey'}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
          >
            Go to Survey
          </button>
        </div>
      </div>
    </div>
  )
}