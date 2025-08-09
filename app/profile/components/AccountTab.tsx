'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/app/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Mail, 
  Save,
  AlertCircle,
  Check,
  Loader2,
  Camera,
  Edit3,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import type { ProfilePreferences } from '@/types/profile'

export default function AccountTab() {
  const { user, profile, refreshProfile } = useAuth()
  const { updateProfile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
  })

  const [preferences, setPreferences] = useState<ProfilePreferences>({
    emailNotifications: profile?.preferences?.emailNotifications ?? true,
    calendarIntegration: profile?.preferences?.calendarIntegration ?? false,
    weeklyReports: profile?.preferences?.weeklyReports ?? true,
  })

  useEffect(() => {
    setFormData({
      full_name: profile?.full_name || '',
      email: user?.email || '',
    })
    if (profile?.preferences) {
      setPreferences(profile.preferences)
    }
  }, [profile, user])

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await updateProfile({
        full_name: formData.full_name,
        preferences
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-6">Profile Information</h3>
        
        {/* Avatar Section */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-2xl font-display font-semibold text-white">
                {formData.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/20 transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Profile avatar</p>
            <p className="text-xs text-gray-500">Upload a photo to personalize your profile (coming soon)</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                placeholder="Enter your full name"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">This is how you'll appear throughout the platform</p>
          </div>

          {/* Email Field (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl opacity-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed for security reasons</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2"
          >
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-400">Profile updated successfully!</span>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading || !formData.full_name}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Persona Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-4">Your AI Persona</h3>
        {profile?.persona ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
                <span className="font-semibold">{profile.persona}</span>
              </div>
            </div>
            <p className="text-gray-400">
              Your personalized AI journey has been tailored for the {profile.persona} persona. 
              This means your activities and recommendations are optimized for your specific work style and goals.
            </p>
            <button className="text-emerald-400 hover:text-emerald-300 transition text-sm flex items-center space-x-1">
              <Edit3 className="w-4 h-4" />
              <span>Retake Survey</span>
            </button>
          </div>
        ) : (
          <div className="text-gray-400">
            <p>No persona assigned yet. Complete the survey to get your personalized AI journey.</p>
            <button className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium">
              Take Survey
            </button>
          </div>
        )}
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-display font-semibold mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-400">Receive daily reminders and progress updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Calendar Integration</h4>
              <p className="text-sm text-gray-400">Add AI sessions to your calendar automatically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.calendarIntegration}
                onChange={(e) => setPreferences({ ...preferences, calendarIntegration: e.target.checked })}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Reports</h4>
              <p className="text-sm text-gray-400">Get a summary of your AI journey progress</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.weeklyReports}
                onChange={(e) => setPreferences({ ...preferences, weeklyReports: e.target.checked })}
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
}