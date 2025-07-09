import { render, screen } from '@testing-library/react';
import { OptimisticPostIndicator } from '@/components/OptimisticPostIndicator';

describe('OptimisticPostIndicator', () => {
  it('should not render when not creating', () => {
    render(
      <OptimisticPostIndicator
        isCreating={false}
        title="Test Post"
        content="Test content"
      />
    );

    expect(screen.queryByText('Creating post...')).not.toBeInTheDocument();
  });

  it('should render when creating', () => {
    render(
      <OptimisticPostIndicator
        isCreating={true}
        title="Test Post"
        content="Test content"
      />
    );

    expect(screen.getByText('Creating post...')).toBeInTheDocument();
    expect(screen.getByText('"Test Post"')).toBeInTheDocument();
    expect(screen.getByText('Optimistic Update')).toBeInTheDocument();
    expect(screen.getByText('Your post will appear immediately!')).toBeInTheDocument();
  });

  it('should show truncated title for long titles', () => {
    const longTitle = 'This is a very long post title that should be truncated in the indicator';
    
    render(
      <OptimisticPostIndicator
        isCreating={true}
        title={longTitle}
        content="Test content"
      />
    );

    expect(screen.getByText('Creating post...')).toBeInTheDocument();
    // The title should be truncated due to the truncate class
    expect(screen.getByText(`"${longTitle}"`)).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    render(
      <OptimisticPostIndicator
        isCreating={true}
        title="Test Post"
        content="Test content"
      />
    );

    // Find the main container by looking for the fixed positioning
    const container = screen.getByText('Creating post...').closest('.fixed');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('bg-blue-600', 'text-white', 'rounded-lg', 'shadow-lg', 'animate-pulse');
  });

  it('should show loading spinner', () => {
    render(
      <OptimisticPostIndicator
        isCreating={true}
        title="Test Post"
        content="Test content"
      />
    );

    // Find the spinner by its animation class
    const spinner = screen.getByText('Creating post...').closest('.fixed')?.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'h-5', 'w-5', 'border-b-2', 'border-white');
  });
}); 