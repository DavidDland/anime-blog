import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/lib/supabaseClient';
import { SWRConfig } from 'swr';

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('usePosts', () => {
  const mockPosts = [
    {
      id: '1',
      title: 'Test Post 1',
      content: 'Test content 1',
      author_id: 'user1',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Post 2',
      content: 'Test content 2',
      author_id: 'user2',
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch posts successfully', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({
        data: mockPosts,
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => usePosts(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.error).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith('posts');
  });

  it('should handle errors gracefully', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBe('Database error');
  });

  it('should provide mutate function for manual revalidation', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({
        data: mockPosts,
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => usePosts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.mutate).toBe('function');
  });
}); 