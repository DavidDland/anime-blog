'use client';

import { useState } from 'react';
import { validateEmail, getEmailValidationMessage } from '@/lib/emailValidation';

export default function TestEmailValidation() {
  const [email, setEmail] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [realTimeMessage, setRealTimeMessage] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail) {
      const message = getEmailValidationMessage(newEmail);
      setRealTimeMessage(message);
    } else {
      setRealTimeMessage('');
    }
  };

  const handleValidate = async () => {
    if (!email) {
      setValidationResult({ isValid: false, error: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    try {
      const result = await validateEmail(email);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({ isValid: false, error: 'Validation failed' });
    } finally {
      setLoading(false);
    }
  };

  const testEmails = [
    'test@example.com',
    'fake@temp.com',
    'user@gmail.com',
    'admin@company.com',
    'user@gmial.com', // typo
    'user@10minutemail.com', // disposable
    'info@domain.com', // role-based
    'user@nonexistentdomain12345.com',
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Email Validation Test (Mailgun)
          </h1>

          <div className="space-y-6">
            {/* Manual Test */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Manual Test</h2>
              <div className="flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter email to test"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Validating...' : 'Validate'}
                </button>
              </div>
              
              {realTimeMessage && (
                <p className="mt-2 text-sm text-orange-600">
                  Real-time validation: {realTimeMessage}
                </p>
              )}

              {validationResult && (
                <div className={`mt-4 p-4 rounded-md ${
                  validationResult.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <strong>Result:</strong> {validationResult.isValid ? 'Valid' : 'Invalid'}
                  {validationResult.error && <p className="mt-1">{validationResult.error}</p>}
                </div>
              )}
            </div>

            {/* Quick Tests */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Tests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testEmails.map((testEmail) => (
                  <button
                    key={testEmail}
                    onClick={() => {
                      setEmail(testEmail);
                      setRealTimeMessage(getEmailValidationMessage(testEmail));
                    }}
                    className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <span className="font-mono text-sm">{testEmail}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Validation Features</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ <strong>Format validation:</strong> Basic email format checking</li>
                <li>✅ <strong>Fake email detection:</strong> Blocks obvious fake patterns (test@, fake@, etc.)</li>
                <li>✅ <strong>Typo detection:</strong> Suggests corrections for common domain typos</li>
                <li>✅ <strong>Disposable email blocking:</strong> Uses Mailgun API to detect disposable emails</li>
                <li>✅ <strong>Role-based email blocking:</strong> Blocks admin@, info@, etc.</li>
                <li>✅ <strong>Real-time feedback:</strong> Immediate validation as user types</li>
                <li>✅ <strong>API fallback:</strong> Falls back to client-side validation if API fails</li>
              </ul>
            </div>

            {/* API Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">API Information</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Provider:</strong> Mailgun Email Validation API
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Free Tier:</strong> 5,000 requests/month
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Features:</strong> Disposable email detection, role-based email detection, deliverability checking
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fallback:</strong> If API fails, falls back to client-side validation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 