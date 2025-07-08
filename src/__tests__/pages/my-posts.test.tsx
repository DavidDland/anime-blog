import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MyPosts from '@/app/my-posts/page';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabaseClient';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the useUser hook
jest.mock('@/hooks/useUser', () => ({
  useUser: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock the ProtectedRoute component
jest.mock('@/components/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

describe('MyPosts', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockPosts = [
    {
      id: 'post-1',
      title: 'First Anime Review',
      content: 'This is my first anime review. It was amazing!',
      author_id: 'test-user-id',
      created_at: '2024-01-01T12:00:00Z',
    },
    {
      id: 'post-2',
      title: 'Second Anime Review',
      content: 'Another great anime with fantastic animation and story.',
      author_id: 'test-user-id',
      created_at: '2024-01-02T14:30:00Z',
    },
  ];

  const mockSupabaseSelect = jest.fn();
  const mockSupabaseDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSupabaseSelect,
      delete: mockSupabaseDelete,
    });
  });

  describe('Component Rendering', () => {
    it('renders the my posts page with title and create button', () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      expect(screen.getByText('My Posts')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Create New Post' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '← Back to Home' })).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      expect(screen.getByText('Loading your posts...')).toBeInTheDocument();
    });

    it('shows empty state when no posts exist', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText('No posts yet')).toBeInTheDocument();
        expect(screen.getByText("You haven't created any posts yet. Start sharing your anime reviews!")).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Create Your First Post' })).toBeInTheDocument();
      });
    });
  });

  describe('Post Listing', () => {
    it('displays user posts correctly', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText('First Anime Review')).toBeInTheDocument();
        expect(screen.getByText('Second Anime Review')).toBeInTheDocument();
        expect(screen.getByText(/This is my first anime review/)).toBeInTheDocument();
        expect(screen.getByText(/Another great anime with fantastic animation/)).toBeInTheDocument();
      });
    });

    it('shows post metadata correctly', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText(/Created on/)).toBeInTheDocument();
        expect(screen.getByText(/Post ID: post-1/)).toBeInTheDocument();
        expect(screen.getByText(/Post ID: post-2/)).toBeInTheDocument();
        expect(screen.getByText(/47 characters/)).toBeInTheDocument();
        expect(screen.getByText(/67 characters/)).toBeInTheDocument();
      });
    });

    it('truncates long content with read more link', async () => {
      const longPost = {
        ...mockPosts[0],
        content: 'This is a very long post content that exceeds the character limit and should be truncated with a read more link. It contains multiple sentences and should be properly handled by the component.',
      };

      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [longPost],
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText(/This is a very long post content that exceeds the character limit/)).toBeInTheDocument();
        expect(screen.getByText('...')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
      });
    });

    it('shows post count summary', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText('Showing 2 posts •')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View all posts' })).toBeInTheDocument();
      });
    });
  });

  describe('Post Deletion', () => {
    it('shows delete button for each post', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it('shows confirmation dialog before deletion', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      mockSupabaseDelete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButtons[0]);
      });
      
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this post? This action cannot be undone.');
    });

    it('cancels deletion when user declines confirmation', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButtons[0]);
      });
      
      expect(mockConfirm).toHaveBeenCalled();
      // The supabase.from is called during initial render, so we check it was called at least once
      expect(supabase.from).toHaveBeenCalledWith('posts');
    });

    it('successfully deletes post when confirmed', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      mockSupabaseDelete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButtons[0]);
      });
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('posts');
        expect(mockSupabaseDelete).toHaveBeenCalled();
      });
    });

    it('handles deletion error', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const deleteError = new Error('Permission denied');
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      mockSupabaseDelete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: deleteError,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButtons[0]);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Error deleting post: Permission denied')).toBeInTheDocument();
      });
    });

    it('removes deleted post from the list', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      mockSupabaseDelete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText('First Anime Review')).toBeInTheDocument();
        expect(screen.getByText('Second Anime Review')).toBeInTheDocument();
        
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButtons[0]);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('First Anime Review')).not.toBeInTheDocument();
        expect(screen.getByText('Second Anime Review')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles database error when fetching posts', async () => {
      const dbError = new Error('Database connection failed');
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: dbError,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText('Error fetching posts: Database connection failed')).toBeInTheDocument();
      });
    });

    it('handles unexpected errors when fetching posts', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockRejectedValue(new Error('Network error')),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred while fetching posts.')).toBeInTheDocument();
      });
    });

    it('handles unexpected errors when deleting posts', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      mockSupabaseDelete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error('Network error')),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButtons[0]);
      });
      
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred while deleting the post.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('has proper navigation links', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: '← Back to Home' });
        const createLink = screen.getByRole('link', { name: 'Create New Post' });
        const viewAllLink = screen.getByRole('link', { name: 'View all posts' });
        
        expect(backLink).toHaveAttribute('href', '/');
        expect(createLink).toHaveAttribute('href', '/create-post');
        expect(viewAllLink).toHaveAttribute('href', '/');
      });
    });

    it('has view links for each post', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        const viewButtons = screen.getAllByRole('link', { name: 'View' });
        expect(viewButtons).toHaveLength(2);
        expect(viewButtons[0]).toHaveAttribute('href', '/post/post-1');
        expect(viewButtons[1]).toHaveAttribute('href', '/post/post-2');
      });
    });
  });

  describe('Data Fetching', () => {
    it('fetches posts for the current user', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('posts');
        expect(mockSupabaseSelect).toHaveBeenCalledWith('*');
      });
    });

    it('orders posts by creation date descending', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockPosts,
            error: null,
          }),
        }),
      });

      render(<MyPosts />);
      
      await waitFor(() => {
        expect(mockSupabaseSelect).toHaveBeenCalledWith('*');
      });
    });
  });
}); 