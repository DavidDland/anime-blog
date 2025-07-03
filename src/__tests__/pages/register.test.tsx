import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '@/app/register/page'
import { supabase } from '@/lib/supabaseClient'

// Mock the supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}))

// Mock the email validation
jest.mock('@/lib/emailValidation', () => ({
  validateEmail: jest.fn(),
  getEmailValidationMessage: jest.fn(),
}))

describe('Register Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render registration form', () => {
    render(<Register />)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should show link to login page', () => {
    render(<Register />)
    
    const loginLink = screen.getByText(/sign in to your existing account/i)
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('should handle form submission with valid data', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    const { validateEmail } = require('@/lib/emailValidation')
    validateEmail.mockResolvedValue({ isValid: true })

    render(<Register />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    const headings = screen.getAllByText(/check your email/i)
    expect(headings.some(h => h.tagName === 'H2')).toBe(true)
  })

  it('should show error for invalid email', async () => {
    const { validateEmail } = require('@/lib/emailValidation')
    validateEmail.mockResolvedValue({ 
      isValid: false, 
      error: 'Please use a real email address' 
    })

    render(<Register />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please use a real email address')).toBeInTheDocument()
    })
  })

  it('should show error for signup failure', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already registered' },
    })

    const { validateEmail } = require('@/lib/emailValidation')
    validateEmail.mockResolvedValue({ isValid: true })

    render(<Register />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    const { validateEmail } = require('@/lib/emailValidation')
    validateEmail.mockResolvedValue({ isValid: true })

    render(<Register />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText('Creating account...')).toBeInTheDocument()
  })

  it('should show real-time email validation', async () => {
    const { getEmailValidationMessage } = require('@/lib/emailValidation')
    getEmailValidationMessage.mockReturnValue('Please use a real email address')

    render(<Register />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    await user.type(emailInput, 'test@example.com')

    expect(screen.getByText('Please use a real email address')).toBeInTheDocument()
  })

  it('should allow returning to registration form from success screen', async () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    })

    const { validateEmail } = require('@/lib/emailValidation')
    validateEmail.mockResolvedValue({ isValid: true })

    render(<Register />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      const headings = screen.getAllByText(/check your email/i)
      expect(headings.some(h => h.tagName === 'H2')).toBe(true)
    })

    const registerAgainButton = screen.getByText(/register with different email/i)
    await user.click(registerAgainButton)

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toHaveValue('')
  })
}) 