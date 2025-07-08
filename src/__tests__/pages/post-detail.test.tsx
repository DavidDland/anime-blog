import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import PostDetail from '@/app/post/[id]/page';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabaseClient';

// Mock Next.js router and params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
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

describe('PostDetail', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockPost = {
    id: 'test-post-id',
    title: 'Test Anime Review',
    content: 'This is a great anime with amazing characters and story.',
    author_id: 'test-user-id',
    created_at: '2024-01-01T12:00:00Z',
  };

  const mockSupabaseSelect = jest.fn();
  const mockSupabaseDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'test-post-id' });
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
    it('renders loading state initially', () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      expect(screen.getByText('Loading post...')).toBeInTheDocument();
    });

    it('renders post details when loaded', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Anime Review')).toBeInTheDocument();
        expect(screen.getByText(/This is a great anime with amazing characters and story./)).toBeInTheDocument();
      });
    });

    it('shows post metadata correctly', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText(/Posted on/)).toBeInTheDocument();
        expect(screen.getByText(/Post ID: test-post-id/)).toBeInTheDocument();
        expect(screen.getByText(/67 characters/)).toBeInTheDocument();
      });
    });
  });

  describe('Post Fetching', () => {
    it('fetches post data on component mount', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('posts');
        expect(mockSupabaseSelect).toHaveBeenCalledWith('*');
      });
    });

    it('handles post not found error', async () => {
      const notFoundError = new Error('Post not found') as Error & { code: string };
      notFoundError.code = 'PGRST116';
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: notFoundError,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Post Not Found')).toBeInTheDocument();
        expect(screen.getByText('Post not found')).toBeInTheDocument();
      });
    });

    it('handles database error', async () => {
      const dbError = new Error('Database connection failed');
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: dbError,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Post Not Found')).toBeInTheDocument();
        expect(screen.getByText('Error fetching post: Database connection failed')).toBeInTheDocument();
      });
    });

    it('handles unexpected errors', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(new Error('Network error')),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Post Not Found')).toBeInTheDocument();
        expect(screen.getByText('An unexpected error occurred while fetching the post.')).toBeInTheDocument();
      });
    });
  });

  describe('Post Deletion', () => {
    it('shows delete button for post author', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
      });
    });

    it('does not show delete button for non-author', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      (useUser as jest.Mock).mockReturnValue({
        user: otherUser,
        loading: false,
      });

      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
      });
    });

    it('shows confirmation dialog before deletion', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
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

      render(<PostDetail />);
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButton);
      });
      
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this post? This action cannot be undone.');
    });

    it('cancels deletion when user declines confirmation', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButton);
      });
      
      expect(mockConfirm).toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalledWith('posts');
    });

    it('successfully deletes post when confirmed', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
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

      render(<PostDetail />);
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButton);
      });
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('posts');
        expect(mockSupabaseDelete).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith('/');
      });
    });

    it('handles deletion error', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const deleteError = new Error('Permission denied');
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
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

      render(<PostDetail />);
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Error deleting post: Permission denied')).toBeInTheDocument();
      });
    });

    it('shows loading state during deletion', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      // Mock a delayed response to test loading state
      mockSupabaseDelete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
          ),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteButton);
      });
      
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
    });
  });

  describe('Navigation and Links', () => {
    it('has back to home link', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: '← Back to Home' });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/');
      });
    });

    it('shows navigation links for authenticated users', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'View All Posts' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'My Posts' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Create New Post' })).toBeInTheDocument();
      });
    });

    it('shows appropriate links for non-authenticated users', async () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
      });

      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'View All Posts' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'My Posts' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Create New Post' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Content Display', () => {
    it('displays post content with proper formatting', async () => {
      const postWithLongContent = {
        ...mockPost,
        content: 'This is a very long post content that should be displayed properly with line breaks and formatting. It contains multiple sentences and should be rendered correctly in the UI.',
      };

      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: postWithLongContent,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText(/This is a very long post content/)).toBeInTheDocument();
      });
    });

    it('shows author information correctly', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('You are the author of this post')).toBeInTheDocument();
      });
    });

    it('shows community member message for non-author', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      (useUser as jest.Mock).mockReturnValue({
        user: otherUser,
        loading: false,
      });

      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPost,
            error: null,
          }),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Posted by a community member')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing post ID', () => {
      (useParams as jest.Mock).mockReturnValue({ id: undefined });

      render(<PostDetail />);
      
      // Should not attempt to fetch without ID
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('handles network errors gracefully', async () => {
      mockSupabaseSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(new Error('Network timeout')),
        }),
      });

      render(<PostDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred while fetching the post.')).toBeInTheDocument();
      });
    });
  });
}); 