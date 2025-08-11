import { 
  saveSurveyToProfile, 
  verifySurveyAnswers, 
  saveSurveyWithRetry 
} from '../profile-helpers'
import { supabase } from '../supabase'

// Mock supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}))

// Mock console methods to reduce noise
const originalConsole = { ...console }
beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.log = originalConsole.log
  console.error = originalConsole.error
  console.warn = originalConsole.warn
})

describe('profile-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveSurveyToProfile', () => {
    const mockUserId = 'user-123'
    const mockSurveyAnswers = {
      'work-type': 'developer',
      'engagement-frequency': 'daily',
      'experience': 'intermediate',
      'goals': 'productivity',
    }
    const mockPersona = 'tech-savvy'
    const mockFullName = 'John Doe'

    it('successfully updates existing profile', async () => {
      const mockProfile = {
        id: mockUserId,
        full_name: mockFullName,
        persona: mockPersona,
        survey_answers: mockSurveyAnswers,
      }

      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const result = await saveSurveyToProfile(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName
      )

      expect(result).toEqual(mockProfile)
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: mockFullName,
          persona: mockPersona,
          work_type: 'developer',
          engagement_frequency: 'daily',
          survey_answers: mockSurveyAnswers,
          onboarding_completed: true,
        })
      )
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockUserId)
    })

    it('falls back to upsert when update fails', async () => {
      const mockProfile = {
        id: mockUserId,
        full_name: mockFullName,
        persona: mockPersona,
        survey_answers: mockSurveyAnswers,
      }

      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: null, error: new Error('Update failed') })
          .mockResolvedValueOnce({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const result = await saveSurveyToProfile(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName
      )

      expect(result).toEqual(mockProfile)
      expect(mockFrom.update).toHaveBeenCalled()
      expect(mockFrom.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          email: '',
          full_name: mockFullName,
          persona: mockPersona,
        }),
        expect.objectContaining({
          onConflict: 'id',
          ignoreDuplicates: false,
        })
      )
    })

    it('falls back to RPC function when both update and upsert fail', async () => {
      const mockProfile = {
        id: mockUserId,
        full_name: mockFullName,
        persona: mockPersona,
        survey_answers: mockSurveyAnswers,
      }

      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: null, error: new Error('Update failed') })
          .mockResolvedValueOnce({ data: null, error: new Error('Upsert failed') }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      ;(supabase.rpc as jest.Mock).mockResolvedValue({ 
        data: mockProfile, 
        error: null 
      })

      const result = await saveSurveyToProfile(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName
      )

      expect(result).toEqual(mockProfile)
      expect(supabase.rpc).toHaveBeenCalledWith('update_profile_survey_answers', {
        user_id: mockUserId,
        survey_data: mockSurveyAnswers,
        user_persona: mockPersona,
        user_work_type: 'developer',
        user_engagement_frequency: 'daily',
        user_full_name: mockFullName,
      })
    })

    it('throws error when all save attempts fail', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValue({ data: null, error: new Error('Failed') }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      ;(supabase.rpc as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: new Error('RPC failed') 
      })

      await expect(
        saveSurveyToProfile(mockUserId, mockSurveyAnswers, mockPersona, mockFullName)
      ).rejects.toThrow('Failed to save survey data to profile')
    })

    it('throws error for invalid user ID', async () => {
      await expect(
        saveSurveyToProfile('', mockSurveyAnswers, mockPersona, mockFullName)
      ).rejects.toThrow('Invalid survey data')
    })

    it('throws error for empty survey answers', async () => {
      await expect(
        saveSurveyToProfile(mockUserId, {}, mockPersona, mockFullName)
      ).rejects.toThrow('Invalid survey data')
    })

    it('handles missing work-type and engagement-frequency', async () => {
      const minimalAnswers = {
        'experience': 'beginner',
        'goals': 'learning',
      }

      const mockProfile = {
        id: mockUserId,
        survey_answers: minimalAnswers,
      }

      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const result = await saveSurveyToProfile(
        mockUserId,
        minimalAnswers,
        mockPersona
      )

      expect(result).toEqual(mockProfile)
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          work_type: null,
          engagement_frequency: null,
        })
      )
    })

    it('includes updated_at timestamp', async () => {
      const mockProfile = { id: mockUserId }
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      await saveSurveyToProfile(mockUserId, mockSurveyAnswers, mockPersona)

      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      )
    })
  })

  describe('verifySurveyAnswers', () => {
    const mockUserId = 'user-123'

    it('returns profile data when survey answers exist', async () => {
      const mockProfile = {
        id: mockUserId,
        survey_answers: { 'work-type': 'developer' },
        persona: 'tech-savvy',
        work_type: 'developer',
        engagement_frequency: 'daily',
        onboarding_completed: true,
      }

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const result = await verifySurveyAnswers(mockUserId)

      expect(result).toEqual(mockProfile)
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockUserId)
    })

    it('returns null when profile fetch fails', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Not found') 
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const result = await verifySurveyAnswers(mockUserId)

      expect(result).toBeNull()
    })

    it('returns null when survey answers are missing', async () => {
      const mockProfile = {
        id: mockUserId,
        survey_answers: null,
        persona: 'tech-savvy',
      }

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const result = await verifySurveyAnswers(mockUserId)

      expect(result).toBeNull()
    })

    it('returns null when survey answers are empty', async () => {
      const mockProfile = {
        id: mockUserId,
        survey_answers: {},
        persona: 'tech-savvy',
      }

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const result = await verifySurveyAnswers(mockUserId)

      expect(result).toBeNull()
    })

    it('logs appropriate messages during verification', async () => {
      const mockProfile = {
        id: mockUserId,
        survey_answers: { test: 'data' },
      }

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      await verifySurveyAnswers(mockUserId)

      expect(console.log).toHaveBeenCalledWith('=== VERIFYING SURVEY ANSWERS ===')
      expect(console.log).toHaveBeenCalledWith('✅ Survey answers verified successfully')
    })
  })

  describe('saveSurveyWithRetry', () => {
    const mockUserId = 'user-123'
    const mockSurveyAnswers = {
      'work-type': 'developer',
      'engagement-frequency': 'daily',
    }
    const mockPersona = 'tech-savvy'
    const mockFullName = 'John Doe'

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('succeeds on first attempt', async () => {
      const mockProfile = {
        id: mockUserId,
        survey_answers: mockSurveyAnswers,
      }

      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const resultPromise = saveSurveyWithRetry(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName
      )

      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(result).toEqual(mockProfile)
      expect(supabase.from).toHaveBeenCalledTimes(2) // Once for save, once for verify
    })

    it('retries on failure and succeeds', async () => {
      const mockProfile = {
        id: mockUserId,
        survey_answers: mockSurveyAnswers,
      }

      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: null, error: new Error('First fail') })
          .mockResolvedValueOnce({ data: null, error: new Error('Second fail') })
          .mockResolvedValueOnce({ data: null, error: new Error('Verify fail') })
          .mockResolvedValueOnce({ data: mockProfile, error: null })
          .mockResolvedValueOnce({ data: mockProfile, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      ;(supabase.rpc as jest.Mock)
        .mockResolvedValueOnce({ data: null, error: new Error('RPC fail') })
        .mockResolvedValueOnce({ data: mockProfile, error: null })

      const resultPromise = saveSurveyWithRetry(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName,
        2
      )

      // Run through retry delays
      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(result).toEqual(mockProfile)
    })

    it('throws error after max retries', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Always fails') 
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      ;(supabase.rpc as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: new Error('RPC fails') 
      })

      const resultPromise = saveSurveyWithRetry(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName,
        2
      )

      await jest.runAllTimersAsync()

      await expect(resultPromise).rejects.toThrow('Failed to save survey data')
    })

    it('uses exponential backoff for retries', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Fail') 
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      ;(supabase.rpc as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: new Error('RPC fail') 
      })

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')

      const resultPromise = saveSurveyWithRetry(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName,
        3
      )

      await jest.runAllTimersAsync()

      try {
        await resultPromise
      } catch {
        // Expected to fail
      }

      // Check that setTimeout was called with exponential backoff delays
      const calls = setTimeoutSpy.mock.calls
      const delays = calls.map(call => call[1])
      
      expect(delays).toContain(2000) // 2^1 * 1000
      expect(delays).toContain(4000) // 2^2 * 1000
    })

    it('caps retry delay at 5000ms', async () => {
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Fail') 
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)
      ;(supabase.rpc as jest.Mock).mockResolvedValue({ 
        data: null, 
        error: new Error('RPC fail') 
      })

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')

      const resultPromise = saveSurveyWithRetry(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName,
        5 // More retries to test the cap
      )

      await jest.runAllTimersAsync()

      try {
        await resultPromise
      } catch {
        // Expected to fail
      }

      const calls = setTimeoutSpy.mock.calls
      const delays = calls.map(call => call[1])
      
      // Check that no delay exceeds 5000ms
      delays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(5000)
      })
    })

    it('throws verification error even after successful save', async () => {
      const mockProfile = {
        id: mockUserId,
        survey_answers: mockSurveyAnswers,
      }

      let callCount = 0
      const mockFrom = {
        update: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            // Save succeeds
            return Promise.resolve({ data: mockProfile, error: null })
          } else {
            // Verification fails (returns empty survey)
            return Promise.resolve({ 
              data: { ...mockProfile, survey_answers: {} }, 
              error: null 
            })
          }
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockFrom)

      const resultPromise = saveSurveyWithRetry(
        mockUserId,
        mockSurveyAnswers,
        mockPersona,
        mockFullName,
        1
      )

      await jest.runAllTimersAsync()

      await expect(resultPromise).rejects.toThrow()
    })
  })
})