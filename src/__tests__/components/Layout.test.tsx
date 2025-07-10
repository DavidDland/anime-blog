import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '@/components/Layout';

// Mock the Header component
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header Component</div>;
  };
});

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default styling classes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const mainElement = screen.getByText('Test Content').closest('main');
    const layoutContainer = mainElement?.parentElement;
    expect(layoutContainer).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-slate-900');
  });

  it('applies custom className when provided', () => {
    render(
      <Layout className="custom-class">
        <div>Test Content</div>
      </Layout>
    );

    const mainElement = screen.getByText('Test Content').closest('main');
    const layoutContainer = mainElement?.parentElement;
    expect(layoutContainer).toHaveClass('custom-class');
  });

  it('renders main content with proper styling', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const mainElement = screen.getByText('Test Content').closest('main');
    expect(mainElement).toHaveClass(
      'max-w-7xl',
      'mx-auto',
      'py-12',
      'px-4',
      'sm:px-6',
      'lg:px-8'
    );
  });

  it('renders header component', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('maintains proper structure with nested content', () => {
    render(
      <Layout>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
        </div>
      </Layout>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });
}); 