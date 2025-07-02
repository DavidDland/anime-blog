'use client';

import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

export default function Home() {
  const { user, loading, signOut } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Anime Blog</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.email}</span>
                  <button
                    onClick={signOut}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {user ? (
          // Authenticated user content
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Anime Blog!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Share your thoughts and reviews about your favorite anime series.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/create-post"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Create New Post
                </Link>
                <Link
                  href="/my-posts"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  My Posts
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Posts
              </h3>
              <div className="text-center py-8">
                <p className="text-gray-500">No posts yet. Be the first to share!</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Protected Route Demo
              </h3>
              <p className="text-gray-600 mb-4">
                This content is only visible to authenticated users. If you were not logged in, 
                you would be redirected to the login page.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">
                  ✅ You are successfully authenticated and can access protected content!
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Non-authenticated user content
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Anime Blog
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our community to share and discover amazing anime reviews and discussions.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Get Started
              </h3>
              <p className="text-gray-600 mb-6">
                Create an account to start sharing your anime reviews and connect with other fans.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔒 Protected Content
              </h3>
              <p className="text-yellow-700">
                Some features are only available to authenticated users. Sign up or log in to access 
                the full anime blog experience!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
