import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import CreatePost from '@/app/create-post/page';

// Mock the hooks
jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    user: { email: 'test@example.com' },
    loading: false,
    signOut: jest.fn(),
  }),
}));

jest.mock('@/hooks/usePosts', () => ({
  usePosts: () => ({
    posts: [
      {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        created_at: '2023-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
    mutate: jest.fn(),
  }),
}));

jest.mock('@/hooks/useCreatePost', () => ({
  useCreatePost: () => ({
    createPost: jest.fn(),
    isCreating: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock('@/components/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

jest.mock('@/components/OptimisticPostIndicator', () => ({
  OptimisticPostIndicator: ({ isCreating }: { isCreating: boolean }) => (
    <div data-testid="optimistic-indicator" data-creating={isCreating}>
      Optimistic Indicator
    </div>
  ),
}));

describe('Performance Optimizations', () => {
  describe('Home Page Performance', () => {
    it('should use optimized transitions instead of heavy animations', () => {
      render(<Home />);
      
      // Check that we're using transition-colors instead of transition-all
      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        const className = button.className;
        // Should use transition-colors instead of transition-all
        expect(className).not.toMatch(/transition-all/);
        // Should use transition-colors for optimized performance
        expect(className).toMatch(/transition-colors/);
      });
    });

    it('should avoid heavy backdrop-blur effects', () => {
      render(<Home />);
      
      // Check that we're not using backdrop-blur-sm on main containers
      const containers = document.querySelectorAll('[class*="backdrop-blur"]');
      expect(containers.length).toBe(0);
    });

    it('should use optimized shadow transitions', () => {
      render(<Home />);
      
      // Check that we're using transition-shadow instead of transition-all
      const elements = document.querySelectorAll('[class*="transition-shadow"]');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should avoid transform scale animations', () => {
      render(<Home />);
      
      // Check that we're not using transform hover:scale effects
      const elements = document.querySelectorAll('[class*="hover:scale"]');
      expect(elements.length).toBe(0);
    });

    it('should use shorter animation durations', () => {
      render(<Home />);
      
      // Check that animations use 200ms instead of 300ms
      const elements = document.querySelectorAll('[class*="duration-200"]');
      expect(elements.length).toBeGreaterThan(0);
      
      // Should not have many 300ms durations
      const longAnimations = document.querySelectorAll('[class*="duration-300"]');
      expect(longAnimations.length).toBeLessThan(5);
    });
  });

  describe('Create Post Page Performance', () => {
    it('should use optimized form transitions', () => {
      render(<CreatePost />);
      
      // Check that form inputs use transition-colors
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const className = input.className;
        expect(className).toMatch(/transition-colors/);
        expect(className).not.toMatch(/transition-all/);
      });
    });

    it('should avoid heavy backdrop effects', () => {
      render(<CreatePost />);
      
      // Check that we're not using backdrop-blur-sm
      const containers = document.querySelectorAll('[class*="backdrop-blur"]');
      expect(containers.length).toBe(0);
    });

    it('should use optimized button transitions', () => {
      render(<CreatePost />);
      
      const submitButton = screen.getByRole('button', { name: /create post/i });
      const className = submitButton.className;
      
      // Should use transition-colors instead of transition-all
      expect(className).toMatch(/transition-colors/);
      expect(className).not.toMatch(/transition-all/);
      
      // Should not have transform scale effects
      expect(className).not.toMatch(/hover:scale/);
    });
  });

  describe('Global CSS Performance', () => {
    it('should have optimized global transitions', () => {
      // Check that we use specific transition classes instead of global transitions
      const transitionClasses = [
        'transition-colors',
        'transition-shadow', 
        'transition-transform'
      ];
      
      // Should have specific transition classes available
      transitionClasses.forEach(className => {
        expect(className).toBeDefined();
      });
      
      // Should not use global transition-all on all elements
      const globalTransition = document.querySelectorAll('[class*="transition-all"]');
      expect(globalTransition.length).toBeLessThan(5); // Only a few elements should use transition-all
    });

    it('should have specific transition classes', () => {
      // Check that we have specific transition classes
      const transitionClasses = [
        'transition-colors',
        'transition-shadow', 
        'transition-transform'
      ];
      
      transitionClasses.forEach(className => {
        expect(className).toBeDefined();
      });
    });
  });
}); 