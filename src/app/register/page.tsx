'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { validateEmail, getEmailValidationMessage } from '@/lib/emailValidation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailValidationMessage, setEmailValidationMessage] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Real-time email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail) {
      const validationMessage = getEmailValidationMessage(newEmail);
      setEmailValidationMessage(validationMessage);
    } else {
      setEmailValidationMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Validate email with Mailgun
      const emailValidation = await validateEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || 'Invalid email address');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log('Signup response:', data);
        setRegistrationSuccess(true);
        setMessage('Registration successful! Please check your email to confirm your account.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {registrationSuccess ? (
        // Email confirmation success view
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Check your email!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a confirmation link to <strong>{email}</strong>
              </p>
              <div className="mt-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-800">What's next?</h3>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the confirmation link in the email</li>
                    <li>• Come back here to sign in</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-yellow-800">Didn't receive the email?</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Check your spam folder or try registering again with a different email address.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setRegistrationSuccess(false);
                      setEmail('');
                      setPassword('');
                      setMessage('');
                    }}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Register with different email
                  </button>
                  <Link
                    href="/login"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 text-center"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Registration form view
        <>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                sign in to your existing account
              </Link>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black ${
                        emailValidationMessage ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {emailValidationMessage && (
                      <p className="mt-1 text-sm text-red-600">{emailValidationMessage}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                {message && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{message}</div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 