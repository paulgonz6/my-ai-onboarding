import { User, Session } from '@supabase/supabase-js'

// Mock user data
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  confirmed_at: '2024-01-01T00:00:00.000Z',
  last_sign_in_at: '2024-01-01T00:00:00.000Z',
  role: 'authenticated',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  phone: null,
  phone_confirmed_at: null,
}

// Mock session data
export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
}

// Mock profile data
export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  company: 'Test Company',
  job_title: 'Test Title',
  onboarding_completed: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

// Mock survey answers
export const mockSurveyAnswers = {
  'work-type': 'technical',
  'daily-time': 'deep-work',
  'time-wasters': ['writing', 'data'],
  'ai-experience': 'occasionally',
  'ai-tools': ['chatgpt'],
  'learning-style': 'visual',
  'time-commitment': '30-60',
  'biggest-challenge': 'prompting',
  'success-metrics': ['productivity'],
  'accountability': 'weekly',
  'start-date': 'immediately',
}

// Create mock Supabase client
export const createMockSupabaseClient = () => {
  const mockSelect = jest.fn()
  const mockInsert = jest.fn()
  const mockUpdate = jest.fn()
  const mockDelete = jest.fn()
  const mockEq = jest.fn()
  const mockSingle = jest.fn()
  const mockOrder = jest.fn()
  const mockLimit = jest.fn()
  const mockIn = jest.fn()
  const mockGte = jest.fn()
  const mockLte = jest.fn()
  const mockRpc = jest.fn()
  
  const chainableMethods = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
    limit: mockLimit,
    in: mockIn,
    gte: mockGte,
    lte: mockLte,
  }
  
  // Make methods chainable
  Object.values(chainableMethods).forEach(method => {
    method.mockReturnValue(chainableMethods)
  })
  
  // Mock final execution
  mockSingle.mockResolvedValue({ data: null, error: null })
  mockSelect.mockImplementation(() => ({
    ...chainableMethods,
    then: (resolve) => resolve({ data: null, error: null }),
  }))
  
  const mockAuth = {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
    updateUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ data: null, error: null }),
  }
  
  const mockFrom = jest.fn((table: string) => chainableMethods)
  const mockRpcMethod = jest.fn().mockResolvedValue({ data: null, error: null })
  
  return {
    auth: mockAuth,
    from: mockFrom,
    rpc: mockRpcMethod,
    // Expose individual mocks for assertions
    mocks: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      limit: mockLimit,
      in: mockIn,
      gte: mockGte,
      lte: mockLte,
      auth: mockAuth,
      from: mockFrom,
      rpc: mockRpcMethod,
    },
  }
}

// Helper to set up authenticated state
export const setupAuthenticatedState = (supabaseMock: ReturnType<typeof createMockSupabaseClient>) => {
  supabaseMock.mocks.auth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  })
  
  supabaseMock.mocks.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  })
  
  // Mock profile fetch
  supabaseMock.mocks.single.mockResolvedValue({
    data: mockProfile,
    error: null,
  })
}

// Helper to set up unauthenticated state
export const setupUnauthenticatedState = (supabaseMock: ReturnType<typeof createMockSupabaseClient>) => {
  supabaseMock.mocks.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  })
  
  supabaseMock.mocks.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  })
}

// Helper to simulate auth error
export const setupAuthError = (supabaseMock: ReturnType<typeof createMockSupabaseClient>, errorMessage: string) => {
  const error = { message: errorMessage, status: 400 }
  
  supabaseMock.mocks.auth.getSession.mockResolvedValue({
    data: { session: null },
    error,
  })
  
  supabaseMock.mocks.auth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error,
  })
  
  supabaseMock.mocks.auth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error,
  })
}