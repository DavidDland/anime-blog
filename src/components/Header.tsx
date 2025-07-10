'use client';

import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export default function Header() {
  const { user, signOut } = useUser();

  return (
    <header className="bg-white/90 border-b border-gray-200/50 dark:bg-slate-800/90 dark:border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Anime Blog
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user ? (
              // Authenticated user navigation
              <>
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Welcome, <span className="font-medium">{user.email}</span>
                </span>
                <Link
                  href="/create-post"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  Create Post
                </Link>
                <Link
                  href="/my-posts"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  My Posts
                </Link>
                <button
                  onClick={signOut}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Non-authenticated user navigation
              <>
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 