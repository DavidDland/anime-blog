'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

export default function TestEmail() {
  const { user } = useUser();
  const [emailStatus, setEmailStatus] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      checkEmailStatus();
    }
  }, [user]);

  const checkEmailStatus = () => {
    if (!user) return;

    const isConfirmed = user.email_confirmed_at !== null;
    const confirmedDate = user.email_confirmed_at 
      ? new Date(user.email_confirmed_at).toLocaleString()
      : null;

    setEmailStatus(
      isConfirmed 
        ? `✅ Email confirmed on ${confirmedDate}`
        : '❌ Email not confirmed yet'
    );
  };

  const testRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setError(`Registration error: ${error.message}`);
      } else {
        setMessage('✅ Test registration successful! Check your email for confirmation link.');
        setTestEmail('');
        setTestPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!user || !user.email) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        setError(`Resend error: ${error.message}`);
      } else {
        setMessage('✅ Confirmation email resent! Check your inbox.');
      }
    } catch (err) {
      setError('An unexpected error occurred while resending confirmation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Confirmation Test</h1>

        {/* Current User Status */}
        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current User Status</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email Status:</strong> {emailStatus}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
            
            {user.email_confirmed_at === null && (
              <div className="mt-4">
                <button
                  onClick={resendConfirmation}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded"
                >
                  {loading ? 'Sending...' : 'Resend Confirmation Email'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Test Registration Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Email Confirmation</h2>
          <p className="text-gray-600 mb-4">
            Use this form to test the email confirmation flow with a new email address.
          </p>
          
          <form onSubmit={testRegistration} className="space-y-4">
            <div>
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Test Email Address
              </label>
              <input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                placeholder="Enter a test email address..."
                required
              />
            </div>

            <div>
              <label htmlFor="testPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Test Password
              </label>
              <input
                id="testPassword"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                placeholder="Enter a test password..."
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded"
            >
              {loading ? 'Creating Test Account...' : 'Create Test Account'}
            </button>
          </form>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-700">{message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Email Confirmation Test Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Current User:</strong> Check if your current account's email is confirmed</li>
            <li>• <strong>Test Registration:</strong> Create a new test account to verify email flow</li>
            <li>• <strong>Check Email:</strong> Look for confirmation emails in your inbox</li>
            <li>• <strong>Resend:</strong> Use the resend button if you didn't receive the email</li>
            <li>• <strong>Confirm:</strong> Click the confirmation link in the email</li>
            <li>• <strong>Verify:</strong> Refresh this page to see updated confirmation status</li>
          </ul>
        </div>

        {/* Supabase Configuration Check */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Supabase Configuration Checklist</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✅ <strong>Email Auth Enabled:</strong> Check Authentication → Settings</li>
            <li>✅ <strong>Email Confirmation ON:</strong> Verify "Enable email confirmations" is checked</li>
            <li>✅ <strong>Site URL Set:</strong> Should be `http://localhost:3000` for development</li>
            <li>✅ <strong>Redirect URLs:</strong> Add `http://localhost:3000/auth/callback`</li>
            <li>✅ <strong>Email Templates:</strong> Customize confirmation email if desired</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 