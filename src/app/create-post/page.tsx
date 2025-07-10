'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OptimisticPostIndicator } from '@/components/OptimisticPostIndicator';
import Layout from '@/components/Layout';

export default function CreatePost() {
  const { user } = useUser();
  const router = useRouter();
  const { createPost, isCreating, error, clearError } = useCreatePost();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    clearError();

    const result = await createPost({ title, content });

    if (result) {
      setSuccess('Post created successfully! Redirecting...');
      // Clear form
      setTitle('');
      setContent('');
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <OptimisticPostIndicator 
          isCreating={isCreating}
          title={title}
          content={content}
        />
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200/50 dark:bg-slate-800/90 dark:border-slate-700/50 p-8 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Create New Post
              </h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-slate-700 transition-colors duration-200"
                  placeholder="Enter your post title..."
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                  <span>{title.length}/200 characters</span>
                  <span className={`${title.length > 180 ? 'text-red-500' : title.length > 150 ? 'text-yellow-500' : ''}`}>
                    {title.length > 180 ? 'Almost full!' : title.length > 150 ? 'Getting long' : ''}
                  </span>
                </p>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Content *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-slate-700 transition-colors duration-200"
                  placeholder="Share your thoughts about the anime... What did you like? What didn't you like? Would you recommend it?"
                  required
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                  <span>{content.length}/5000 characters</span>
                  <span className={`${content.length > 4500 ? 'text-red-500' : content.length > 4000 ? 'text-yellow-500' : ''}`}>
                    {content.length > 4500 ? 'Almost full!' : content.length > 4000 ? 'Getting long' : ''}
                  </span>
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Post...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Post</span>
                    </>
                  )}
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </Link>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-6 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Writing Tips</h3>
            </div>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                <span><strong>Be specific:</strong> Mention character names, plot points, and themes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                <span><strong>Share your opinion:</strong> What made this anime special to you?</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                <span><strong>Consider the audience:</strong> Who would enjoy this anime?</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                <span><strong>Be respectful:</strong> Constructive criticism is welcome</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                <span><strong>Include spoiler warnings:</strong> If discussing major plot points</span>
              </li>
            </ul>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 