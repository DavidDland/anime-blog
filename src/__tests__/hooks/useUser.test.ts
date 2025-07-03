import { renderHook, waitFor } from '@testing-library/react'
import { useUser } from '@/hooks/useUser'

jest.mock('@/lib/supabaseClient', () => {
  const getSessionMock = jest.fn(() => Promise.resolve({ data: { session: null }, error: null }))
  const onAuthStateChangeMock = jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } }
  }))
  
  return {
    supabase: {
      auth: {
        getSession: getSessionMock,
        onAuthStateChange: onAuthStateChangeMock,
      },
    },
    getSessionMock,
    onAuthStateChangeMock,
  }
})

import { supabase } from '@/lib/supabaseClient'

// Get the mock functions from the mocked module
const { getSessionMock, onAuthStateChangeMock } = require('@/lib/supabaseClient')

describe('useUser', () => {
  beforeEach(() => {
    getSessionMock.mockClear()
    onAuthStateChangeMock.mockClear()
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null })
  })

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useUser())
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('should return user data when session exists', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    }

    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
    }

    getSessionMock.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('should return null user when no session exists', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('should handle session errors gracefully', async () => {
    const mockError = new Error('Session error')
    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: mockError,
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('should set up auth state change listener', () => {
    onAuthStateChangeMock.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })

    renderHook(() => useUser())

    expect(onAuthStateChangeMock).toHaveBeenCalledWith(
      expect.any(Function)
    )
  })
}) 