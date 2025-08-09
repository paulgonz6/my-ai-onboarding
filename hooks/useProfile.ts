import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { profileService } from '@/lib/profile-service'
import type { Profile, UpdateProfileRequest, UpdatePasswordRequest, Subscription } from '@/types/profile'

export function useProfile() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = async (updates: UpdateProfileRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedProfile = await profileService.updateProfile(updates)
      await refreshProfile() // Refresh the auth context
      return updatedProfile
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (passwords: UpdatePasswordRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      await profileService.updatePassword(passwords)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    profile: authProfile,
    loading,
    error,
    updateProfile,
    updatePassword,
  }
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const sub = await profileService.getSubscription()
      setSubscription(sub)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load subscription'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const upgradeSubscription = async (planId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await profileService.upgradeSubscription(planId)
      // In production, this would redirect to Stripe checkout
      window.open(result.checkoutUrl, '_blank')
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upgrade subscription'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await profileService.cancelSubscription()
      await loadSubscription() // Reload to get updated status
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    subscription,
    loading,
    error,
    upgradeSubscription,
    cancelSubscription,
    refresh: loadSubscription,
  }
}