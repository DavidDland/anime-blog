import { renderHook, act, waitFor } from '@testing-library/react';
import { useCreatePost } from '@/hooks/useCreatePost';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUser';
import { SWRConfig } from 'swr';
import { User, Session } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/hooks/useUser', () => ({
  useUser: jest.fn(),
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('useCreatePost', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as User;

  const mockSession = {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  } as Session;

  const mockPost = {
    id: 'post-123',
    title: 'Test Post',
    content: 'Test content',
    author_id: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: mockUser,
      session: mockSession,
      loading: false,
      signOut: jest.fn(),
    });
  });

  it('should create post successfully with optimistic update', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockPost,
        error: null,
      }),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBeNull();

    await act(async () => {
      const postResult = await result.current.createPost({
        title: 'Test Post',
        content: 'Test content',
      });

      expect(postResult).toEqual(mockPost);
    });

    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith('posts');
  });

  it('should handle validation errors', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    // Test empty title
    await act(async () => {
      const postResult = await result.current.createPost({
        title: '',
        content: 'Test content',
      });

      expect(postResult).toBeNull();
    });

    expect(result.current.error).toBe('Please fill in both title and content');

    // Test empty content
    await act(async () => {
      const postResult = await result.current.createPost({
        title: 'Test Post',
        content: '',
      });

      expect(postResult).toBeNull();
    });

    expect(result.current.error).toBe('Please fill in both title and content');
  });

  it('should handle database errors', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      const postResult = await result.current.createPost({
        title: 'Test Post',
        content: 'Test content',
      });

      expect(postResult).toBeNull();
    });

    expect(result.current.error).toBe('Error creating post: Database error');
    expect(result.current.isCreating).toBe(false);
  });

  it('should handle user not logged in', async () => {
    mockUseUser.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: jest.fn(),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await act(async () => {
      const postResult = await result.current.createPost({
        title: 'Test Post',
        content: 'Test content',
      });

      expect(postResult).toBeNull();
    });

    expect(result.current.error).toBe('You must be logged in to create a post');
  });

  it('should clear error when clearError is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    // Trigger an error
    await act(async () => {
      await result.current.createPost({
        title: '',
        content: 'Test content',
      });
    });

    expect(result.current.error).toBe('Please fill in both title and content');

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should show loading state during creation', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      single: jest.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ data: mockPost, error: null }), 100)
        )
      ),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCreatePost(), { wrapper });

    // Start creation
    act(() => {
      result.current.createPost({
        title: 'Test Post',
        content: 'Test content',
      });
    });

    // Should be loading immediately
    expect(result.current.isCreating).toBe(true);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });
  });
}); 