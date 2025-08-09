import type { 
  Profile, 
  UpdateProfileRequest, 
  UpdatePasswordRequest,
  Subscription 
} from '@/types/profile'

class ProfileService {
  private baseUrl = '/api/profile'

  async getProfile(): Promise<Profile> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    const data = await response.json()
    return data.profile
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<Profile> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const data = await response.json()
    return data.profile
  }

  async updatePassword(passwords: UpdatePasswordRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwords),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update password')
    }
  }

  async getSubscription(): Promise<Subscription> {
    const response = await fetch(`${this.baseUrl}/subscription`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch subscription')
    }

    const data = await response.json()
    return data.subscription
  }

  async upgradeSubscription(planId: string): Promise<{ checkoutUrl: string }> {
    const response = await fetch(`${this.baseUrl}/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'upgrade', planId }),
    })

    if (!response.ok) {
      throw new Error('Failed to upgrade subscription')
    }

    return response.json()
  }

  async cancelSubscription(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'cancel' }),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }
  }

  async deleteAccount(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete account')
    }
  }
}

export const profileService = new ProfileService()