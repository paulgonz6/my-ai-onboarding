// Mock Next.js modules first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      body: JSON.stringify(body),
      status: init?.status || 200,
      headers: init?.headers,
    })),
  },
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: jest.fn(),
}))

// Import after mocks are set up
import { NextResponse } from 'next/server'
import { 
  createAuthenticatedClient,
  handleApiError,
  successResponse,
  validateRequired,
  parseRequestBody,
  checkRateLimit,
  ApiResponse
} from '../api-utils'

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('api-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear rate limit map
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('createAuthenticatedClient', () => {
    it('returns authenticated client and user when user is logged in', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      }

      const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs')
      createServerComponentClient.mockReturnValue(mockSupabase)

      const result = await createAuthenticatedClient()

      expect(result).toEqual({
        supabase: mockSupabase,
        user: mockUser,
      })
      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1)
    })

    it('throws error when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      }

      const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs')
      createServerComponentClient.mockReturnValue(mockSupabase)

      await expect(createAuthenticatedClient()).rejects.toThrow('Unauthorized')
    })

    it('throws error when auth check fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Auth error'),
          }),
        },
      }

      const { createServerComponentClient } = require('@supabase/auth-helpers-nextjs')
      createServerComponentClient.mockReturnValue(mockSupabase)

      await expect(createAuthenticatedClient()).rejects.toThrow('Unauthorized')
    })
  })

  describe('handleApiError', () => {
    it('returns 401 for Unauthorized errors', () => {
      const error = new Error('Unauthorized')
      const response = handleApiError(error)
      
      const body = JSON.parse(response.body as string)
      expect(body).toEqual({ error: 'Unauthorized' })
      expect(response.status).toBe(401)
    })

    it('returns custom status code with error message', () => {
      const error = new Error('Custom error')
      const response = handleApiError(error, 400)
      
      const body = JSON.parse(response.body as string)
      expect(body).toEqual({ error: 'Custom error' })
      expect(response.status).toBe(400)
    })

    it('handles non-Error objects', () => {
      const response = handleApiError('string error')
      
      const body = JSON.parse(response.body as string)
      expect(body).toEqual({ error: 'An unexpected error occurred' })
      expect(response.status).toBe(500)
    })

    it('logs errors to console', () => {
      const error = new Error('Test error')
      handleApiError(error)
      
      expect(console.error).toHaveBeenCalledWith('API Error:', error)
    })

    it('uses default status code 500', () => {
      const error = new Error('Server error')
      const response = handleApiError(error)
      
      expect(response.status).toBe(500)
    })
  })

  describe('successResponse', () => {
    it('returns success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = successResponse(data)
      
      const body = JSON.parse(response.body as string)
      expect(body).toEqual({ data })
    })

    it('includes optional message', () => {
      const data = { success: true }
      const message = 'Operation completed'
      const response = successResponse(data, message)
      
      const body = JSON.parse(response.body as string)
      expect(body).toEqual({ data, message })
    })

    it('handles different data types', () => {
      // Array
      const arrayData = [1, 2, 3]
      const arrayResponse = successResponse(arrayData)
      expect(JSON.parse(arrayResponse.body as string).data).toEqual(arrayData)
      
      // String
      const stringData = 'success'
      const stringResponse = successResponse(stringData)
      expect(JSON.parse(stringResponse.body as string).data).toEqual(stringData)
      
      // Number
      const numberData = 42
      const numberResponse = successResponse(numberData)
      expect(JSON.parse(numberResponse.body as string).data).toEqual(numberData)
      
      // Null
      const nullResponse = successResponse(null)
      expect(JSON.parse(nullResponse.body as string).data).toBeNull()
    })
  })

  describe('validateRequired', () => {
    it('returns null when all required fields are present', () => {
      const fields = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      }
      const required = ['name', 'email']
      
      const result = validateRequired(fields, required)
      expect(result).toBeNull()
    })

    it('returns error message for missing field', () => {
      const fields = {
        name: 'John',
        age: 30,
      }
      const required = ['name', 'email']
      
      const result = validateRequired(fields, required)
      expect(result).toBe('Missing required field: email')
    })

    it('returns error for first missing field when multiple are missing', () => {
      const fields = {
        age: 30,
      }
      const required = ['name', 'email', 'age']
      
      const result = validateRequired(fields, required)
      expect(result).toBe('Missing required field: name')
    })

    it('handles empty strings as missing', () => {
      const fields = {
        name: '',
        email: 'test@example.com',
      }
      const required = ['name', 'email']
      
      const result = validateRequired(fields, required)
      expect(result).toBe('Missing required field: name')
    })

    it('handles null and undefined as missing', () => {
      const fields = {
        name: null,
        email: undefined,
        age: 30,
      }
      const required = ['name', 'email']
      
      const result = validateRequired(fields, required)
      expect(result).toBe('Missing required field: name')
    })

    it('handles zero as present', () => {
      const fields = {
        count: 0,
        name: 'Test',
      }
      const required = ['count', 'name']
      
      const result = validateRequired(fields, required)
      expect(result).toBeNull()
    })

    it('handles false as present', () => {
      const fields = {
        active: false,
        name: 'Test',
      }
      const required = ['active', 'name']
      
      const result = validateRequired(fields, required)
      expect(result).toBeNull()
    })
  })

  describe('parseRequestBody', () => {
    it('successfully parses valid JSON', async () => {
      const data = { test: 'data', number: 123 }
      const request = {
        json: jest.fn().mockResolvedValue(data),
      } as any

      const result = await parseRequestBody(request)
      expect(result).toEqual(data)
      expect(request.json).toHaveBeenCalledTimes(1)
    })

    it('throws error for invalid JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any

      await expect(parseRequestBody(request)).rejects.toThrow('Invalid request body')
    })

    it('preserves type information', async () => {
      interface TestData {
        id: number
        name: string
      }
      
      const data: TestData = { id: 1, name: 'Test' }
      const request = {
        json: jest.fn().mockResolvedValue(data),
      } as any

      const result = await parseRequestBody<TestData>(request)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Test')
    })
  })

  describe('checkRateLimit', () => {
    it('allows first request', () => {
      const result = checkRateLimit('user-123')
      expect(result).toBe(true)
    })

    it('allows requests within limit', () => {
      const identifier = 'user-456'
      
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(identifier)
        expect(result).toBe(true)
      }
    })

    it('blocks requests exceeding limit', () => {
      const identifier = 'user-789'
      
      // Make max requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier)
      }
      
      // Next request should be blocked
      const result = checkRateLimit(identifier)
      expect(result).toBe(false)
    })

    it('respects custom max requests', () => {
      const identifier = 'user-custom'
      const maxRequests = 5
      
      for (let i = 0; i < maxRequests; i++) {
        const result = checkRateLimit(identifier, maxRequests)
        expect(result).toBe(true)
      }
      
      const blocked = checkRateLimit(identifier, maxRequests)
      expect(blocked).toBe(false)
    })

    it('resets after time window', () => {
      const identifier = 'user-reset'
      const windowMs = 1000
      
      // Max out requests
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier, 10, windowMs)
      }
      
      // Should be blocked
      expect(checkRateLimit(identifier, 10, windowMs)).toBe(false)
      
      // Advance time past window
      jest.advanceTimersByTime(windowMs + 1)
      
      // Should be allowed again
      expect(checkRateLimit(identifier, 10, windowMs)).toBe(true)
    })

    it('tracks different identifiers separately', () => {
      const user1 = 'user-1'
      const user2 = 'user-2'
      
      // Max out user1
      for (let i = 0; i < 10; i++) {
        checkRateLimit(user1)
      }
      
      // user1 should be blocked
      expect(checkRateLimit(user1)).toBe(false)
      
      // user2 should still be allowed
      expect(checkRateLimit(user2)).toBe(true)
    })

    it('cleans up old entries periodically', () => {
      const identifier = 'cleanup-test'
      
      // Create an entry
      checkRateLimit(identifier, 10, 1000)
      
      // Advance time to trigger cleanup (every 60 seconds)
      jest.advanceTimersByTime(61000)
      
      // The old entry should be cleaned up and new request allowed
      expect(checkRateLimit(identifier, 10, 1000)).toBe(true)
    })
  })

  describe('Rate limit cleanup interval', () => {
    it('automatically cleans up expired entries', () => {
      // Create multiple entries with short windows
      checkRateLimit('temp-1', 10, 1000)
      checkRateLimit('temp-2', 10, 2000)
      checkRateLimit('temp-3', 10, 3000)
      
      // Advance time to expire all entries
      jest.advanceTimersByTime(65000) // Past cleanup interval
      
      // All should be fresh entries now
      expect(checkRateLimit('temp-1')).toBe(true)
      expect(checkRateLimit('temp-2')).toBe(true)
      expect(checkRateLimit('temp-3')).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('handles concurrent rate limit checks', () => {
      const identifier = 'concurrent-test'
      
      const results = []
      for (let i = 0; i < 15; i++) {
        results.push(checkRateLimit(identifier))
      }
      
      // First 10 should be true, rest false
      expect(results.slice(0, 10).every(r => r === true)).toBe(true)
      expect(results.slice(10).every(r => r === false)).toBe(true)
    })

    it('handles rate limit with zero max requests', () => {
      const result = checkRateLimit('zero-test', 0)
      expect(result).toBe(false)
    })

    it('handles negative window time gracefully', () => {
      const result = checkRateLimit('negative-test', 10, -1000)
      expect(result).toBe(true)
    })
  })
})