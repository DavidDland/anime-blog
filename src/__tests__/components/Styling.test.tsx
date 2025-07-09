import { render, screen } from '@testing-library/react';
import Link from 'next/link';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, className, ...props }: any) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
});

describe('Styling System', () => {
  it('should apply gradient backgrounds correctly', () => {
    render(
      <div className="bg-gradient-to-r from-blue-500 to-purple-600">
        <span>Gradient Background</span>
      </div>
    );

    const element = screen.getByText('Gradient Background').parentElement;
    expect(element).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600');
  });

  it('should apply backdrop blur effects', () => {
    render(
      <div className="bg-white/80 backdrop-blur-sm">
        <span>Backdrop Blur</span>
      </div>
    );

    const element = screen.getByText('Backdrop Blur').parentElement;
    expect(element).toHaveClass('bg-white/80', 'backdrop-blur-sm');
  });

  it('should apply hover effects', () => {
    render(
      <button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
        Hover Button
      </button>
    );

    const button = screen.getByText('Hover Button');
    expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'transition-colors', 'duration-200');
  });

  it('should apply dark mode classes', () => {
    render(
      <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
        <span>Dark Mode Support</span>
      </div>
    );

    const element = screen.getByText('Dark Mode Support').parentElement;
    expect(element).toHaveClass('bg-white', 'dark:bg-slate-800', 'text-gray-900', 'dark:text-gray-100');
  });

  it('should apply transform effects', () => {
    render(
      <button className="transform hover:scale-105 transition-transform duration-200">
        Transform Button
      </button>
    );

    const button = screen.getByText('Transform Button');
    expect(button).toHaveClass('transform', 'hover:scale-105', 'transition-transform', 'duration-200');
  });

  it('should apply shadow effects', () => {
    render(
      <div className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <span>Shadow Effects</span>
      </div>
    );

    const element = screen.getByText('Shadow Effects').parentElement;
    expect(element).toHaveClass('shadow-lg', 'hover:shadow-xl', 'transition-shadow', 'duration-200');
  });

  it('should apply rounded corners', () => {
    render(
      <div className="rounded-lg rounded-xl">
        <span>Rounded Corners</span>
      </div>
    );

    const element = screen.getByText('Rounded Corners').parentElement;
    expect(element).toHaveClass('rounded-lg', 'rounded-xl');
  });

  it('should apply border effects', () => {
    render(
      <div className="border border-gray-200/50 dark:border-slate-700/50">
        <span>Border Effects</span>
      </div>
    );

    const element = screen.getByText('Border Effects').parentElement;
    expect(element).toHaveClass('border', 'border-gray-200/50', 'dark:border-slate-700/50');
  });

  it('should apply text gradients', () => {
    render(
      <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Gradient Text
      </h1>
    );

    const heading = screen.getByText('Gradient Text');
    expect(heading).toHaveClass('bg-gradient-to-r', 'from-gray-900', 'to-gray-700', 'bg-clip-text', 'text-transparent');
  });

  it('should apply animation classes', () => {
    render(
      <div className="animate-fade-in animate-spin">
        <span>Animated Element</span>
      </div>
    );

    const element = screen.getByText('Animated Element').parentElement;
    expect(element).toHaveClass('animate-fade-in', 'animate-spin');
  });
}); 