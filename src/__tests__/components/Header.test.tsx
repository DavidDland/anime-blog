import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/Header';

// Mock the useUser hook
jest.mock('@/hooks/useUser', () => ({
  useUser: jest.fn(),
}));

const mockUseUser = require('@/hooks/useUser').useUser;

describe('Header Component', () => {
  beforeEach(() => {
    mockUseUser.mockClear();
  });

  it('renders logo and brand name', () => {
    mockUseUser.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    render(<Header />);

    expect(screen.getByText('Anime Blog')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument(); // Logo text
  });

  it('renders sign in and sign up links when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    render(<Header />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  it('renders user welcome message and sign out button when user is authenticated', () => {
    mockUseUser.mockReturnValue({
      user: { email: 'test@example.com' },
      signOut: jest.fn(),
    });

    render(<Header />);

    expect(screen.getByText('Welcome,')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.getByText('Create Post')).toBeInTheDocument();
    expect(screen.getByText('My Posts')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  it('applies correct styling classes to header', () => {
    mockUseUser.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass(
      'bg-white/90',
      'border-b',
      'border-gray-200/50',
      'dark:bg-slate-800/90',
      'dark:border-slate-700/50',
      'sticky',
      'top-0',
      'z-50'
    );
  });

  it('logo links to home page', () => {
    mockUseUser.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    render(<Header />);

    const logoLink = screen.getByText('Anime Blog').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('navigation links have correct hrefs', () => {
    mockUseUser.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    render(<Header />);

    const signInLink = screen.getByText('Sign In');
    const signUpLink = screen.getByText('Sign Up');

    expect(signInLink).toHaveAttribute('href', '/login');
    expect(signUpLink).toHaveAttribute('href', '/register');
  });

  it('authenticated user navigation links have correct hrefs', () => {
    mockUseUser.mockReturnValue({
      user: { email: 'test@example.com' },
      signOut: jest.fn(),
    });

    render(<Header />);

    const createPostLink = screen.getByText('Create Post');
    const myPostsLink = screen.getByText('My Posts');

    expect(createPostLink).toHaveAttribute('href', '/create-post');
    expect(myPostsLink).toHaveAttribute('href', '/my-posts');
  });

  it('sign out button calls signOut function when clicked', () => {
    const mockSignOut = jest.fn();
    mockUseUser.mockReturnValue({
      user: { email: 'test@example.com' },
      signOut: mockSignOut,
    });

    render(<Header />);

    const signOutButton = screen.getByText('Sign Out');
    signOutButton.click();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('applies correct styling to sign out button', () => {
    mockUseUser.mockReturnValue({
      user: { email: 'test@example.com' },
      signOut: jest.fn(),
    });

    render(<Header />);

    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toHaveClass(
      'bg-red-500',
      'hover:bg-red-600',
      'text-white',
      'font-medium',
      'py-2',
      'px-4',
      'rounded-lg',
      'transition-colors',
      'duration-200',
      'shadow-sm',
      'hover:shadow-md'
    );
  });

  it('applies correct styling to sign up button', () => {
    mockUseUser.mockReturnValue({
      user: null,
      signOut: jest.fn(),
    });

    render(<Header />);

    const signUpButton = screen.getByText('Sign Up');
    expect(signUpButton).toHaveClass(
      'bg-blue-600',
      'hover:bg-blue-700',
      'text-white',
      'font-medium',
      'py-2',
      'px-4',
      'rounded-lg',
      'transition-colors',
      'duration-200',
      'shadow-sm',
      'hover:shadow-md'
    );
  });
}); 