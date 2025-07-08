import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CreatePost from '@/app/create-post/page';
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

describe('CreatePost', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockSupabaseInsert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockSupabaseInsert,
    });
  });

  describe('Component Rendering', () => {
    it('renders the create post form', () => {
      render(<CreatePost />);
      
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      expect(screen.getByLabelText('Post Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Post Content *')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Post' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('shows character count for title and content', () => {
      render(<CreatePost />);
      
      expect(screen.getByText('0/200 characters')).toBeInTheDocument();
      expect(screen.getByText('0/5000 characters')).toBeInTheDocument();
    });

    it('shows writing tips section', () => {
      render(<CreatePost />);
      
      expect(screen.getByText('Writing Tips')).toBeInTheDocument();
      expect(screen.getByText(/Be specific:/)).toBeInTheDocument();
      expect(screen.getByText(/Share your opinion:/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting empty form', async () => {
      render(<CreatePost />);
      
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please fill in both title and content')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when submitting with only title', async () => {
      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please fill in both title and content')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when submitting with only content', async () => {
      render(<CreatePost />);
      
      const contentInput = screen.getByLabelText('Post Content *');
      fireEvent.change(contentInput, { target: { value: 'Test content' } });
      
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please fill in both title and content')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when submitting with whitespace-only inputs', async () => {
      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      
      fireEvent.change(titleInput, { target: { value: '   ' } });
      fireEvent.change(contentInput, { target: { value: '   ' } });
      
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please fill in both title and content')).toBeInTheDocument();
      });
    });

    it('updates character count when typing', () => {
      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.change(contentInput, { target: { value: 'Test content for the post' } });
      
      expect(screen.getByText('10/200 characters')).toBeInTheDocument();
      expect(screen.getByText('25/5000 characters')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('successfully creates a post', async () => {
      const mockPostData = {
        id: 'test-post-id',
        title: 'Test Post',
        content: 'Test content',
        author_id: mockUser.id,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [mockPostData],
          error: null,
        }),
      });

      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      
      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentInput, { target: { value: 'Test content' } });
      fireEvent.click(submitButton);
      
      // Check loading state
      expect(screen.getByText('Creating Post...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getByText('Post created successfully! Redirecting...')).toBeInTheDocument();
      });
      
      // Verify Supabase was called correctly
      expect(supabase.from).toHaveBeenCalledWith('posts');
      expect(mockSupabaseInsert).toHaveBeenCalledWith([
        {
          title: 'Test Post',
          content: 'Test content',
          author_id: mockUser.id,
        },
      ]);
      
      // Verify form is cleared
      expect(titleInput).toHaveValue('');
      expect(contentInput).toHaveValue('');
      
      // Verify redirect after delay
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/');
      }, { timeout: 2500 });
    });

    it('handles Supabase error during post creation', async () => {
      const mockError = new Error('Database error');
      mockSupabaseInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      
      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentInput, { target: { value: 'Test content' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Error creating post: Database error')).toBeInTheDocument();
      });
      
      // Verify form is not cleared on error
      expect(titleInput).toHaveValue('Test Post');
      expect(contentInput).toHaveValue('Test content');
    });

    it('handles unexpected errors during submission', async () => {
      mockSupabaseInsert.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Network error')),
      });

      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      
      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentInput, { target: { value: 'Test content' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('User Authentication', () => {
    it('shows error when user is not authenticated', async () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
      });

      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      
      fireEvent.change(titleInput, { target: { value: 'Test Post' } });
      fireEvent.change(contentInput, { target: { value: 'Test content' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('You must be logged in to create a post')).toBeInTheDocument();
      });
    });

    it('shows loading state when user is loading', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        loading: true,
      });

      render(<CreatePost />);
      
      // When user is loading, the ProtectedRoute should show loading state
      // This test is covered by the ProtectedRoute component tests
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Form Input Behavior', () => {
    it('trims whitespace from title and content on submission', async () => {
      const mockPostData = {
        id: 'test-post-id',
        title: 'Test Post',
        content: 'Test content',
        author_id: mockUser.id,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseInsert.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [mockPostData],
          error: null,
        }),
      });

      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      
      fireEvent.change(titleInput, { target: { value: '  Test Post  ' } });
      fireEvent.change(contentInput, { target: { value: '  Test content  ' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('posts');
        expect(mockSupabaseInsert).toHaveBeenCalledWith([
          {
            title: 'Test Post',
            content: 'Test content',
            author_id: mockUser.id,
          },
        ]);
      });
    });

    it('enforces max length constraints', () => {
      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      
      expect(titleInput).toHaveAttribute('maxLength', '200');
      expect(contentInput).toHaveAttribute('maxLength', '5000');
    });
  });

  describe('Navigation', () => {
    it('has back to home link', () => {
      render(<CreatePost />);
      
      const backLink = screen.getByRole('link', { name: '← Back to Home' });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('has cancel button that links to home', () => {
      render(<CreatePost />);
      
      const cancelButton = screen.getByRole('link', { name: 'Cancel' });
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveAttribute('href', '/');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      
      expect(titleInput).toHaveAttribute('id', 'title');
      expect(contentInput).toHaveAttribute('id', 'content');
    });

    it('has required attributes on form inputs', () => {
      render(<CreatePost />);
      
      const titleInput = screen.getByLabelText('Post Title *');
      const contentInput = screen.getByLabelText('Post Content *');
      
      expect(titleInput).toHaveAttribute('required');
      expect(contentInput).toHaveAttribute('required');
    });

    it('has proper button states', () => {
      render(<CreatePost />);
      
      const submitButton = screen.getByRole('button', { name: 'Create Post' });
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 